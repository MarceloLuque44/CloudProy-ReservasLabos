# Contrato de la API (acuerdo entre Frontend, Lambda y API Gateway)

Si algo cambia aquí, se avisa a todo el equipo. El frontend ya lo cumple con datos simulados
(`VITE_USE_MOCK=true`), así que el backend real debe devolver exactamente estas formas.

Formato de errores (todos): `{ "mensaje": "texto legible para el usuario" }` con el código HTTP indicado.
Fechas: `YYYY-MM-DD`. Habilitar CORS en API Gateway para el dominio de Amplify y `http://localhost:5173`.

| Acción | Método y ruta | Éxito | Errores |
|---|---|---|---|
| Horarios de un laboratorio y fecha | `GET /horarios?fecha=2026-10-30&laboratorio=P3 P3 Laboratorio 1` | 200 | 400 |
| Crear reserva | `POST /reservas` | 201 | 400 datos inválidos, 409 horario ocupado |
| Consultar una reserva | `GET /reservas/{codigo}` | 200 | 404 |
| Cancelar una reserva | `DELETE /reservas/{codigo}` | 200 | 404, 409 ya cancelada |
| Listar todas | `GET /reservas` | 200 | |

## GET /horarios
```json
{ "fecha": "2026-10-30", "laboratorio": "P3 Laboratorio 1",
  "horarios": [ { "horario": "08:00 - 10:00", "disponible": true },
                { "horario": "10:00 - 12:00", "disponible": false } ] }
```

## POST /reservas (cuerpo)
```json
{ "nombre": "Juan Pérez", "tipoSolicitante": "Estudiante", "sigla": "INF-312",
  "materia": "Base de Datos", "paralelo": "A", "actividad": "Práctica / laboratorio",
  "laboratorio": "P3 Laboratorio 1", "fecha": "2026-10-30", "horario": "08:00 - 10:00" }
```
Obligatorios: todos menos `paralelo`. Respuesta: la misma reserva más
`"codigo": "RES-AB12CD"`, `"estado": "CONFIRMADA"`, `"creadaEn": "<ISO>"`.

## DELETE /reservas/{codigo}
Devuelve la reserva con `"estado": "CANCELADA"` y `"canceladaEn"`. El bloque vuelve a figurar como disponible.

## GET /reservas
```json
{ "reservas": [ { "codigo": "RES-AB12CD", "estado": "CONFIRMADA", "...": "campos de arriba" } ] }
```

## Para DynamoDB (Integrante 4)
Unicidad por **laboratorio + fecha + horario** con escritura condicional (`attribute_not_exists`).
Si la condición falla, responder 409 con el mensaje "Ese laboratorio ya está reservado en esa fecha y horario".
