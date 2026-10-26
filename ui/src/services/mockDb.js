// Backend SIMULADO para desarrollar sin AWS. Guarda todo en localStorage.
// Respeta el contrato de docs/CONTRATO_API.md, así que cambiar al backend real no exige tocar las pantallas.
import { ApiError } from './api'
import { ESTADOS, HORARIOS, LABORATORIOS } from '../config/constantes'
import { hoyISO, sumarDias } from '../utils/fechas'

const CLAVE = 'reservas-lab-mock'
const ESPERA_MS = 450 // simula la latencia de la red

const esperar = () => new Promise((resolver) => setTimeout(resolver, ESPERA_MS))
const codigoNuevo = () => `RES-${Math.random().toString(36).slice(2, 8).toUpperCase().padEnd(6, 'X')}`

function datosIniciales() {
  const manana = sumarDias(hoyISO(), 1)
  const base = { tipoSolicitante: 'Docente', actividad: 'Práctica / laboratorio', paralelo: 'A' }
  return [
    { ...base, codigo: 'RES-DEMO01', nombre: 'Ana Quispe', sigla: 'INF-312', materia: 'Base de Datos', laboratorio: LABORATORIOS[0], fecha: manana, horario: HORARIOS[1] },
    { ...base, codigo: 'RES-DEMO02', nombre: 'Luis Mamani', sigla: 'INF-322', materia: 'Redes', laboratorio: LABORATORIOS[0], fecha: manana, horario: HORARIOS[4] },
    { ...base, codigo: 'RES-DEMO03', nombre: 'Rosa Condori', sigla: 'INF-342', materia: 'Computación en la Nube', laboratorio: LABORATORIOS[1], fecha: manana, horario: HORARIOS[0] },
  ].map((r) => ({ ...r, estado: ESTADOS.CONFIRMADA, creadaEn: new Date().toISOString() }))
}

function guardar(lista) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(lista))
  } catch {
    /* sin almacenamiento disponible: los datos solo duran esta sesión */
  }
}

function leer() {
  try {
    const guardado = localStorage.getItem(CLAVE)
    if (guardado) return JSON.parse(guardado)
  } catch {
    /* si el almacenamiento falla, se parte de los datos iniciales */
  }
  const iniciales = datosIniciales()
  guardar(iniciales)
  return iniciales
}

export async function obtenerHorarios({ fecha, laboratorio }) {
  await esperar()
  if (!fecha || !laboratorio) throw new ApiError('Indica la fecha y el laboratorio', 400)
  const ocupados = leer()
    .filter((r) => r.estado === ESTADOS.CONFIRMADA && r.fecha === fecha && r.laboratorio === laboratorio)
    .map((r) => r.horario)
  return {
    fecha,
    laboratorio,
    horarios: HORARIOS.map((horario) => ({ horario, disponible: !ocupados.includes(horario) })),
  }
}

export async function crearReserva(datos) {
  await esperar()
  const obligatorios = ['nombre', 'tipoSolicitante', 'sigla', 'materia', 'actividad', 'laboratorio', 'fecha', 'horario']
  const faltan = obligatorios.filter((campo) => !String(datos[campo] ?? '').trim())
  if (faltan.length) throw new ApiError(`Faltan datos obligatorios: ${faltan.join(', ')}`, 400)
  if (datos.fecha < hoyISO()) throw new ApiError('No se puede reservar una fecha pasada', 400)
  if (!HORARIOS.includes(datos.horario)) throw new ApiError('El horario indicado no existe', 400)

  const lista = leer()
  const ocupado = lista.some(
    (r) => r.estado === ESTADOS.CONFIRMADA && r.fecha === datos.fecha && r.laboratorio === datos.laboratorio && r.horario === datos.horario,
  )
  if (ocupado) throw new ApiError('Ese laboratorio ya está reservado en esa fecha y horario', 409)

  const reserva = { ...datos, codigo: codigoNuevo(), estado: ESTADOS.CONFIRMADA, creadaEn: new Date().toISOString() }
  guardar([...lista, reserva])
  return reserva
}

export async function obtenerReserva(codigo) {
  await esperar()
  const reserva = leer().find((r) => r.codigo === String(codigo).trim().toUpperCase())
  if (!reserva) throw new ApiError('No existe una reserva con ese código', 404)
  return reserva
}

export async function cancelarReserva(codigo) {
  await esperar()
  const lista = leer()
  const clave = String(codigo).trim().toUpperCase()
  const indice = lista.findIndex((r) => r.codigo === clave)
  if (indice === -1) throw new ApiError('No existe una reserva con ese código', 404)
  if (lista[indice].estado === ESTADOS.CANCELADA) throw new ApiError('Esa reserva ya estaba cancelada', 409)
  lista[indice] = { ...lista[indice], estado: ESTADOS.CANCELADA, canceladaEn: new Date().toISOString() }
  guardar(lista)
  return lista[indice]
}

export async function listarReservas() {
  await esperar()
  const reservas = [...leer()].sort((a, b) => `${a.fecha} ${a.horario}`.localeCompare(`${b.fecha} ${b.horario}`))
  return { reservas }
}
