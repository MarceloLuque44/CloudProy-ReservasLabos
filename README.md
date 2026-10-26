# Sistema de Reservas de Laboratorios

Proyecto full-stack basado en el tutorial de Full Stack React CRUD, adaptado con el
código del proyecto *CloudProyectoFunciones* (sistema de reservas de laboratorios
universitarios).

Estructura:

- `ui/` — Frontend en React (Vite). Envía solicitudes al API real o usa datos simulados.
- `api/` — API Express envuelta con `serverless-http` (se despliega como Lambda detrás de API Gateway).

## Datos del dominio

- Tabla DynamoDB: `ReservasLaboratorio` (clave compuesta `PK: LAB#...#fecha`, `SK: SLOT#...`,
  e índice `GSI1_Codigo` sobre `GSI1PK`). Modelo completo en `ui/docs/MODELO_DYNAMODB.md`.
- Contrato de la API: `ui/docs/CONTRATO_API.md`.

## Cómo correr en local

1. API: `cd api` → `npm install` → `npm run dev` (queda en `http://localhost:3001`).
2. Frontend: `cd ui` → `npm install` → `npm run dev` (queda en `http://localhost:5173`).
3. En `ui/.env` copia `.env.example`: con `VITE_USE_MOCK=true` no necesitas backend;
   con `VITE_USE_MOCK=false` define `VITE_API_URL` (en desarrollo:
   `http://localhost:3001`).

## Endpoints de la API

| Acción | Método y ruta |
|---|---|
| Horarios de un laboratorio y fecha | `GET /horarios?fecha=...&laboratorio=...` |
| Crear reserva | `POST /reservas` |
| Consultar una reserva | `GET /reservas/{codigo}` |
| Cancelar una reserva | `DELETE /reservas/{codigo}` |
| Listar todas | `GET /reservas` |

## Despliegue en AWS

- La carpeta `api/` se empaqueta como Lambda (exporta `handler`). Configura la variable
  de entorno `TABLA_RESERVAS` si tu tabla no se llama `ReservasLaboratorio`.
- El frontend se despliega en Amplify con `npm run build` (directorio `dist`).
- Habilita CORS en API Gateway para tu dominio de Amplify y `http://localhost:5173`,
  y coloca la URL en `VITE_API_URL`.
