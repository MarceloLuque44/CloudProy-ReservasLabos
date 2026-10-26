# Modelo de Datos en Amazon DynamoDB
## Sistema de Reservas de Laboratorios Universitarios

**Proyecto:** Sistema web de reservas de laboratorios  
**Base de datos propuesta:** Amazon DynamoDB  
**Versión:** 1.0  
**Estado:** Diseño preliminar para revisión del equipo

---

## 1. Objetivo

Definir la estructura de almacenamiento de las reservas de laboratorios universitarios en Amazon DynamoDB, estableciendo cómo se guardarán los datos, cómo se consultará la disponibilidad de horarios y cómo se evitarán reservas duplicadas.

Este documento servirá como referencia para el desarrollo de la API mediante AWS Lambda y Amazon API Gateway.

La implementación real de la base de datos queda pendiente hasta que el equipo disponga de un entorno AWS autorizado.

## 2. Servicio propuesto

Se propone utilizar **Amazon DynamoDB**, una base de datos NoSQL administrada que almacena información en elementos con atributos.

Se selecciona inicialmente por las siguientes razones:

- Permite consultar las reservas por laboratorio y fecha.
- Facilita la verificación de disponibilidad de los horarios.
- Admite operaciones condicionales para evitar reservas duplicadas.
- Se integra con AWS Lambda mediante el SDK de AWS.
- No requiere administrar servidores de base de datos.

## 3. Estructura general de la tabla

**Nombre propuesto de la tabla:** `ReservasLaboratorio`

Se propone una tabla con una clave primaria compuesta:

| Atributo | Tipo | Descripción |
|---|---|---|
| `PK` | String | Identifica el laboratorio y la fecha. |
| `SK` | String | Identifica el horario dentro de ese laboratorio y fecha. |

Ejemplo de claves para una reserva:

- `PK`: `LAB#P3_LABORATORIO_1#2026-10-30`
- `SK`: `SLOT#10:00`

La combinación de ambas claves identifica un horario concreto de un laboratorio en una fecha determinada.

Los nombres de laboratorio se normalizarán para construir las claves. Por ejemplo, `P3 Laboratorio 1` se representará como `P3_LABORATORIO_1`.

## 4. Atributos de una reserva

Cada elemento que representa un horario reservado podrá contener los siguientes atributos:

| Atributo | Tipo | Descripción |
|---|---|---|
| `PK` | String | Laboratorio y fecha. |
| `SK` | String | Horario reservado. |
| `codigo` | String | Código único de la reserva. |
| `nombre` | String | Nombre del solicitante. |
| `tipoSolicitante` | String | Estudiante, docente o auxiliar de docencia. |
| `sigla` | String | Sigla de la materia, cuando corresponda. |
| `materia` | String | Nombre de la materia. |
| `paralelo` | String | Paralelo correspondiente, cuando aplique. |
| `actividad` | String | Tipo de actividad solicitada. |
| `laboratorio` | String | Nombre del laboratorio. |
| `fecha` | String | Fecha en formato `YYYY-MM-DD`. |
| `horario` | String | Intervalo completo, por ejemplo `10:00 - 12:00`. |
| `estado` | String | Estado de la reserva. |
| `GSI1PK` | String | Clave de consulta por código de reserva. |
| `GSI1SK` | String | Clave de ordenamiento del índice secundario. |

Los campos opcionales podrán omitirse cuando no correspondan a la solicitud.

### Ejemplo de elemento

```json
{
  "PK": "LAB#P3_LABORATORIO_1#2026-10-30",
  "SK": "SLOT#10:00",
  "codigo": "RES-001",
  "nombre": "Juan Pérez",
  "tipoSolicitante": "Estudiante",
  "sigla": "INF101",
  "materia": "Programación",
  "paralelo": "A",
  "actividad": "Práctica / laboratorio",
  "laboratorio": "P3 Laboratorio 1",
  "fecha": "2026-10-30",
  "horario": "10:00 - 12:00",
  "estado": "CONFIRMADA",
  "GSI1PK": "CODIGO#RES-001",
  "GSI1SK": "RESERVA"
}
```

Este ejemplo es ilustrativo y no representa una reserva real.

## 5. Horarios y disponibilidad

Los horarios iniciales definidos para el sistema son:

- 08:00 - 10:00
- 10:00 - 12:00
- 12:00 - 14:00
- 14:00 - 16:00
- 16:00 - 18:00
- 18:00 - 20:00

La disponibilidad se determinará consultando los elementos del laboratorio y fecha seleccionados.

Reglas:

1. Si no existe una reserva para un horario, este se considera disponible.
2. Si existe una reserva con estado `CONFIRMADA`, el horario se considera ocupado.
3. Si una reserva tiene estado `CANCELADA`, el horario podrá volver a utilizarse.
4. La disponibilidad mostrada en la interfaz es informativa; la API deberá comprobar nuevamente el horario al registrar la reserva.

La consulta de disponibilidad no debe depender únicamente de lo que muestra React, ya que dos usuarios podrían intentar reservar el mismo horario simultáneamente.

## 6. Prevención de reservas duplicadas

Al crear una reserva, AWS Lambda deberá comprobar la disponibilidad directamente en DynamoDB.

La operación de escritura utilizará una condición que impida crear una reserva sobre un horario ya ocupado.

Para el primer registro de un horario, se podrá utilizar una escritura condicional que compruebe que el elemento no existe. Si ya existe una reserva cancelada, deberá aplicarse una operación condicional específica que permita reutilizar el horario únicamente si su estado continúa siendo `CANCELADA`.

Si otro usuario reserva el horario antes de que finalice la operación, la segunda solicitud deberá rechazarse y la API informará que el horario ya no está disponible.

**Importante:** la verificación y el registro deben protegerse mediante operaciones condicionales de DynamoDB; no basta con consultar primero y escribir después sin control de concurrencia.

## 7. Consulta por código de reserva

Para buscar una reserva mediante su código se crea un índice secundario global, denominado `GSI1_Codigo` (índice ya creado en la tabla real de AWS), con esta configuración:

- Clave de partición: `GSI1PK`.
- Clave de ordenamiento: `GSI1SK`.

Para la reserva `RES-001`, los atributos serán:

- `GSI1PK`: `CODIGO#RES-001`
- `GSI1SK`: `RESERVA`

Así, la API podrá buscar una reserva por su código sin recorrer todos los elementos de la tabla.

El código deberá generarse de forma única y no deberá reutilizarse para otra reserva.

## 8. Cancelación de reservas

La cancelación cambiará el estado de la reserva a `CANCELADA`.

La operación deberá comprobar que la reserva existe y que se encuentra en un estado que permita cancelarla.

Una reserva cancelada no deberá aparecer como ocupación activa en la consulta de disponibilidad.

Para permitir que otro usuario utilice el horario, la operación de cancelación y la posterior reutilización deberán diseñarse para evitar conflictos entre solicitudes simultáneas.

La estrategia de actualización o eliminación del elemento deberá ser acordada con el responsable de AWS Lambda antes de implementar la operación definitiva.

## 9. Relación con la API

El modelo deberá ser compatible con los endpoints definidos en `docs/CONTRATO_API.md`.

| Endpoint | Operación prevista |
|---|---|
| `GET /horarios?fecha=...&laboratorio=...` | Consultar los horarios y determinar su disponibilidad. |
| `POST /reservas` | Registrar una reserva si el horario está disponible. |
| `GET /reservas/{codigo}` | Buscar una reserva por código mediante `GSI1_Codigo`. |
| `DELETE /reservas/{codigo}` | Cancelar una reserva y liberar el horario. |
| `GET /reservas` | Listar reservas para la vista administrativa o de consulta. |

Para un prototipo académico pequeño, el listado general podría implementarse mediante una exploración de tabla (`Scan`). Si el volumen aumenta, deberá definirse un índice o patrón de consulta más eficiente.

## 10. Seguridad y permisos

La aplicación no deberá conectarse directamente a DynamoDB desde el navegador.

El acceso a la base de datos se realizará desde AWS Lambda utilizando un rol de IAM con los permisos estrictamente necesarios.

No se almacenarán contraseñas, claves de acceso ni credenciales de AWS dentro del repositorio.

## 11. Pruebas previstas

Antes de considerar terminada la integración se deberán verificar los siguientes casos:

1. Consultar un laboratorio y fecha sin reservas.
2. Consultar un horario ocupado.
3. Registrar una reserva en un horario disponible.
4. Intentar registrar dos reservas en el mismo laboratorio, fecha y horario.
5. Consultar una reserva mediante su código.
6. Cancelar una reserva existente.
7. Verificar que un horario cancelado vuelva a estar disponible.
8. Comprobar que dos solicitudes simultáneas no produzcan reservas duplicadas.

## 12. Decisiones pendientes

Antes de crear la tabla en AWS, el equipo deberá confirmar:

- La estructura definitiva de los atributos.
- El índice secundario para consultar por código.
- La estrategia de cancelación y reutilización de horarios.
- El comportamiento del endpoint `GET /reservas`.
- La implementación de las operaciones condicionales en Lambda.
- La disponibilidad de una cuenta AWS educativa y de un entorno que no genere gastos.

---

**Estado final:** documento de diseño preliminar. La tabla `ReservasLaboratorio` todavía no ha sido creada en AWS. Cualquier cambio de estructura deberá coordinarse con el responsable del backend para mantener la compatibilidad entre la interfaz, la API y la base de datos.
