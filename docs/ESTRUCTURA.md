# Estructura del Proyecto — Sistema de Reservas de Laboratorios

**Repositorio:** `CloudPractica`
**Descripción:** Sistema web full-stack para reservar laboratorios universitarios, desplegado en AWS.
**Origen:** el código de dominio proviene del proyecto `CloudProyectoFunciones`, adaptado a la base ya desplegada (`api/` como Lambda vía `serverless-http`, `ui/` en Amplify).

---

## 1. Vista general

```
CloudPractica/
├── api/                       # Backend: API Express desplegada como AWS Lambda
│   ├── index.js               # Servidor Express + handler serverless-http
│   ├── reservas.js            # Lógica de dominio (consultas a DynamoDB)
│   ├── package.json           # Dependencias (SDK v3 de AWS, express, cors…)
│   └── package-lock.json
│
├── ui/                        # Frontend: SPA React (Vite) desplegada en Amplify
│   ├── index.html             # Punto de entrada HTML
│   ├── vite.config.js         # Configuración de Vite (plugin React)
│   ├── .env.example           # Variables de entorno de ejemplo (VITE_*)
│   ├── .oxlintrc.json         # Reglas del linter
│   ├── package.json / package-lock.json
│   ├── docs/                  # Documentación del dominio
│   │   ├── CONTRATO_API.md    # Contrato Frontend ↔ API Gateway ↔ Lambda
│   │   └── MODELO_DYNAMODB.md # Diseño de la tabla y su índice
│   ├── public/                # Estáticos servidos tal cual (favicon, iconos)
│   ├── src/
│   │   ├── main.jsx           # Bootstrap de React + Router
│   │   ├── App.jsx            # Definición de rutas
│   │   ├── App.css / index.css
│   │   ├── assets/            # Imágenes (hero.png, logos)
│   │   ├── components/        # Layout, Navbar, ErrorBoundary
│   │   │   └── ui/            # Sistema de componentes reutilizables
│   │   │       ├── Alert.jsx      # Avisos (info/exito/error/aviso)
│   │   │       ├── Badge.jsx      # Insignia de estado de reserva
│   │   │       ├── Button.jsx     # Botón (variantes, estado cargando)
│   │   │       ├── Campo.jsx      # Campo de formulario con etiqueta/error/ayuda
│   │   │       ├── Card.jsx       # Tarjeta contenedora
│   │   │       ├── Cargando.jsx   # Pantalla de carga
│   │   │       ├── Modal.jsx      # Diálogo nativo <dialog>
│   │   │       ├── PageHeader.jsx # Título + descripción de página
│   │   │       ├── Pendiente.jsx  # Placeholder para tareas pendientes
│   │   │       ├── Vacio.jsx      # Estado vacío
│   │   │       └── index.js       # Barrel de exportación
│   │   ├── config/
│   │   │   ├── constantes.js  # Laboratorios, HORARIOS, actividades, tipos, estados
│   │   │   └── entorno.js     # USAR_MOCK y API_URL (VITE_*)
│   │   ├── context/
│   │   │   └── ToastContext.jsx   # Notificaciones (toast.exito / toast.error)
│   │   ├── hooks/
│   │   │   └── useAsync.js    # Manejo de promesas con estado (cargando/error)
│   │   ├── pages/             # Una por ruta
│   │   │   ├── InicioPage.jsx      # /
│   │   │   ├── HorariosPage.jsx    # /horarios
│   │   │   ├── ReservaPage.jsx     # /reservar
│   │   │   ├── CancelarPage.jsx    # /cancelar
│   │   │   ├── AdminPage.jsx       # /admin
│   │   │   └── NoEncontradaPage.jsx# * (404)
│   │   ├── services/          # Única puerta de entrada a los datos
│   │   │   ├── api.js             # fetch con ApiError y timeout de 15 s
│   │   │   ├── reservasService.js # mock ⇄ API real según VITE_USE_MOCK
│   │   │   └── mockDb.js          # Backend simulado en localStorage
│   │   └── utils/
│   │       ├── fechas.js      # hoyISO(), sumarDias()
│   │       └── validaciones.js # validarReserva()
│   └── dist/                  # Salida del build (generada, no versionada)
│
├── CloudProyectoFunciones/    # Proyecto de origen (referencia histórica)
├── docs/                      # ← Esta documentación
│   └── ESTRUCTURA.md          # Este documento
├── api-lambda.zip             # Empaquetado listo para subir a Lambda
├── README.md                  # Guía rápida de arranque y despliegue
└── .gitignore
```

---

## 2. Arquitectura de despliegue en AWS

```
Navegador
   │  (Amplify Hosting — build de ui/ con npm run build → dist/)
   ▼
React SPA  ──fetch──▶  Amazon API Gateway  ──proxy integración──▶  AWS Lambda (api/)
                                                                        │
                                                                        ▼
                                                              Amazon DynamoDB (us-west-1)
                                                              Tabla: ReservasLaboratorio
```

- **Amplify** sirve el frontend (`ui/`) usando `npm run build`; el directorio publicado es `dist/`.
- **API Gateway** expone los endpoints declarados en `api/`; cada ruta se delega a la Lambda.
- **Lambda** ejecuta el Express de `api/index.js` envuelto con `serverless-http` (exporta `handler`).
- **DynamoDB** almacena las reservas; la disponibilidad se verifica por consulta y la unicidad por escritura condicional.

| Recurso AWS | Nombre | Notas |
|---|---|---|
| Tabla DynamoDB | `ReservasLaboratorio` | Región `us-west-1`; clave `PK` (String) + `SK` (String) |
| Índice global | `GSI1_Codigo` | `GSI1PK` (String) + `GSI1SK` (String). Necesario para consultar por código |
| Variable de entorno Lambda | `TABLA_RESERVAS` | Opcional; si no se define se usa `ReservasLaboratorio` |
| Variables de build Amplify | `VITE_USE_MOCK=false`, `VITE_API_URL` | URL base de API Gateway sin `/` final |

---

## 3. Modelo de datos (DynamoDB)

Detalle completo en `ui/docs/MODELO_DYNAMODB.md`. Resumen:

- `PK = LAB#<LABORATORIO>#<fecha>` y `SK = SLOT#<horario>` → un bloque de un laboratorio en una fecha. La unicidad la garantiza `ConditionExpression: attribute_not_exists(PK)` al crear el ítem. Si la condición falla la API responde **409**.
- `GSI1PK = CODIGO#<codigo>`, `GSI1SK = "RESERVA"` → búsqueda por código a través de `GSI1_Codigo`.
- `estado`: `CONFIRMADA` o `CANCELADA`. Al cancelar se elimina el ítem y el bloque vuelve a estar disponible (aún así se responde la reserva con `estado: CANCELADA` + `canceladaEn`).
- Los horarios fijos (6 bloques de 08:00 a 20:00) son configuración, no datos: viven en `ui/src/config/constantes.js` y en `api/reservas.js`. No se requiere tabla extra de horarios.

---

## 4. Contrato de la API

Detalle en `ui/docs/CONTRATO_API.md`. Resumen de rutas (todas con CORS):

| Acción | Método y ruta | Éxito | Errores |
|---|---|---|---|
| Horarios y disponibilidad | `GET /horarios?fecha=…&laboratorio=…` | 200 | 400 |
| Crear reserva | `POST /reservas` | 201 | 400, 409 (horario ocupado) |
| Consultar por código | `GET /reservas/{codigo}` | 200 | 404 |
| Cancelar reserva | `DELETE /reservas/{codigo}` | 200 | 404, 409 (ya cancelada) |
| Listar todas | `GET /reservas` | 200 | — |

Formato de error uniforme: `{ "mensaje": "texto legible para el usuario" }`.

---

## 5. Backend (`api/`)

- `index.js`: app Express con todas las rutas y manejo de errores. En desarrollo (`DEVELOPMENT=true`, `npm run dev`) escucha en `http://localhost:3001`; como Lambda exporta `handler = serverless(app)`. El CORS está activo en modo desarrollo; en producción lo debe habilitar API Gateway (incluido OPTIONS con `DELETE` si entra en el flujo de `Cancelación`).
- `reservas.js`: capa de dominio con el SDK v3 (`@aws-sdk/lib-dynamodb`):
  - `obtenerHorarios({fecha, laboratorio})` — `Query` por `PK`, devuelve la grilla completa con `disponible: true/false`.
  - `crearReserva(datos)` — valida campos obligatorios, formato y fecha pasada; intenta `Put` con condición; genera código `RES-XXXXXX` aleatorio.
  - `obtenerReserva(codigo)` — `Query` sobre `GSI1_Codigo` → 404 si no existe.
  - `cancelarReserva(codigo)` — consulta y `Delete`; devuelve la reserva con estado `CANCELADA`.
  - `listarReservas()` — `Scan` (válido para volúmenes académicos pequeños), ordenado por fecha+horario.

## 6. Frontend (`ui/`)

- Flujo de datos en una sola dirección: **Páginas → `reservasService` → `api.js` o `mockDb`**. Ninguna página llama a `fetch` por su cuenta; si cambia el backend, solo cambia `services/`.
- `config/entorno.js` decide el modo:
  - `VITE_USE_MOCK=true` → datos simulados en el navegador (`mockDb.js`, localStorage).
  - `VITE_USE_MOCK=false` → API real (`VITE_API_URL`), es el modo del despliegue.
- Páginas actuales:
  - `InicioPage`, `HorariosPage` (consulta de disponibilidad), `ReservaPage`
    (`GET /horarios` + `POST /reservas`; muestra el código `RES-…` al confirmar y
    enlaza a Cancelar), `CancelarPage` (`GET /reservas/{codigo}` +
    confirmación en Modal + `DELETE`) y `AdminPage` (listado).

---

## 7. Desarrollo y despliegue

**Local:**
```bash
cd api && npm install && npm run dev   # API en :3001
cd ui  && npm install && npm run dev   # SPA en :5173 (con .env de ui/.env.example)
```

**Despliegue:**
1. Empaquetar `api/` (`api-lambda.zip`) y subirlo a la Lambda; verificar `TABLA_RESERVAS` y el rol IAM (permisos `Query`, `Scan`, `PutItem`, `DeleteItem`).
2. Crear/actualizar API Gateway con las 5 rutas y CORS (métodos `OPTIONS, GET, POST, DELETE`).
3. En Amplify, configurar el build con `VITE_USE_MOCK=false` y `VITE_API_URL` apuntando a la API.

**Verificación rápida** (lista de casos de `ui/docs/MODELO_DYNAMODB.md` §11): laboratorio sin reservas, horario ocupado, doble reserva simultánea (409), consulta por código, cancelar y volver a reservar el mismo bloque.
