export const LABORATORIOS = [
  'P3 Laboratorio 1',
  'P3 Laboratorio 2',
  'P3 Laboratorio 3',
  'P3 Laboratorio 4',
  'P4 Laboratorio 1',
  'LASIN 1',
  'LASIN 2',
  'LASIN 3',
]

export const HORARIOS = [
  '08:00 - 10:00',
  '10:00 - 12:00',
  '12:00 - 14:00',
  '14:00 - 16:00',
  '16:00 - 18:00',
  '18:00 - 20:00',
]

export const ACTIVIDADES = [
  'Clase teórica',
  'Práctica / laboratorio',
  'Examen',
  'Taller / seminario',
  'Reunión',
  'Otro',
]

export const TIPOS_SOLICITANTE = ['Estudiante', 'Docente', 'Auxiliar de docencia']

export function hoyISO() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

export function esFechaValida(iso) {
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) && !isNaN(new Date(iso).getTime())
}

export function esFechaPasada(iso) {
  return iso < hoyISO()
}

export function validarCampo(valor, reglas) {
  const errores = []

  for (const regla of reglas) {
    if (regla.requerido && (valor === undefined || valor === null || String(valor).trim() === '')) {
      errores.push(regla.mensajeRequerido || 'Este campo es obligatorio.')
      continue
    }

    if (valor === undefined || valor === null || String(valor).trim() === '') {
      continue
    }

    if (regla.enumerado && !regla.enumerado.includes(valor)) {
      errores.push(regla.mensajeEnumerado || 'Opción no válida.')
    }

    if (regla.fecha && !esFechaValida(valor)) {
      errores.push(regla.mensajeFecha || 'Fecha no válida.')
    }

    if (regla.noPasada && esFechaValida(valor) && esFechaPasada(valor)) {
      errores.push(regla.mensajeNoPasada || 'No se permite una fecha pasada.')
    }
  }

  return errores
}

export function validarReserva(datos) {
  const errores = {}

  const reglasNombre = [{ requerido: true }]
  const eNombre = validarCampo(datos.nombre, reglasNombre)
  if (eNombre.length) errores.nombre = eNombre[0]

  const reglasTipo = [{ requerido: true, enumerado: TIPOS_SOLICITANTE }]
  const eTipo = validarCampo(datos.tipoSolicitante, reglasTipo)
  if (eTipo.length) errores.tipoSolicitante = eTipo[0]


  const actividadesConMateria = [
    'Clase teórica',
    'Práctica / laboratorio',
    'Examen',
  ]

  const requiereMateria = actividadesConMateria.includes(datos.actividad)

  const reglasSigla = [{ requerido: requiereMateria }]
  const eSigla = validarCampo(datos.sigla, reglasSigla)
  if (eSigla.length) errores.sigla = eSigla[0]

  const reglasMateria = [{ requerido: requiereMateria }]
  const eMateria = validarCampo(datos.materia, reglasMateria)
  if (eMateria.length) errores.materia = eMateria[0]

  const reglasActividad = [{ requerido: true, enumerado: ACTIVIDADES }]
  const eActividad = validarCampo(datos.actividad, reglasActividad)
  if (eActividad.length) errores.actividad = eActividad[0]

  const reglasLaboratorio = [{ requerido: true, enumerado: LABORATORIOS }]
  const eLaboratorio = validarCampo(datos.laboratorio, reglasLaboratorio)
  if (eLaboratorio.length) errores.laboratorio = eLaboratorio[0]

  const reglasFecha = [{ requerido: true, fecha: true, noPasada: true }]
  const eFecha = validarCampo(datos.fecha, reglasFecha)
  if (eFecha.length) errores.fecha = eFecha[0]

  const reglasHorario = [{ requerido: true, enumerado: HORARIOS }]
  const eHorario = validarCampo(datos.horario, reglasHorario)
  if (eHorario.length) errores.horario = eHorario[0]

  return {
    valido: Object.keys(errores).length === 0,
    errores,
  }
}
