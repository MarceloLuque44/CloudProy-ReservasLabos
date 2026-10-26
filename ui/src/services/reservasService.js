// ÚNICA puerta de entrada a los datos. Las pantallas solo importan esto.
//   VITE_USE_MOCK=true  -> datos simulados en el navegador
//   VITE_USE_MOCK=false -> API Gateway real (VITE_API_URL)
import { api } from './api'
import * as mock from './mockDb'
import { USAR_MOCK } from '../config/entorno'

const real = {
  obtenerHorarios: ({ fecha, laboratorio }) =>
    api.get(`/horarios?fecha=${encodeURIComponent(fecha)}&laboratorio=${encodeURIComponent(laboratorio)}`),
  crearReserva: (datos) => api.post('/reservas', datos),
  obtenerReserva: (codigo) => api.get(`/reservas/${encodeURIComponent(codigo)}`),
  cancelarReserva: (codigo) => api.delete(`/reservas/${encodeURIComponent(codigo)}`),
  listarReservas: () => api.get('/reservas'),
}

export const reservasService = USAR_MOCK ? mock : real
