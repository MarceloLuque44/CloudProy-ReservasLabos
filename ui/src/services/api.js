import { API_URL } from '../config/entorno'

export class ApiError extends Error {
  constructor(mensaje, estado = 0) {
    super(mensaje)
    this.name = 'ApiError'
    this.estado = estado // 0 = sin conexión, 408 = tiempo agotado, 400/404/409... = del servidor
  }
}

const TIEMPO_MAXIMO_MS = 15000

async function peticion(ruta, opciones = {}) {
  const controlador = new AbortController()
  const temporizador = setTimeout(() => controlador.abort(), TIEMPO_MAXIMO_MS)
  try {
    const respuesta = await fetch(`${API_URL}${ruta}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: controlador.signal,
      ...opciones,
    })
    const datos = await respuesta.json().catch(() => ({}))
    if (!respuesta.ok) {
      throw new ApiError(datos.mensaje || datos.message || `Error ${respuesta.status}`, respuesta.status)
    }
    return datos
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (error.name === 'AbortError') throw new ApiError('El servidor tardó demasiado en responder', 408)
    throw new ApiError('No se pudo conectar con el servidor. Revisa tu conexión.', 0)
  } finally {
    clearTimeout(temporizador)
  }
}

export const api = {
  get: (ruta) => peticion(ruta),
  post: (ruta, cuerpo) => peticion(ruta, { method: 'POST', body: JSON.stringify(cuerpo) }),
  delete: (ruta) => peticion(ruta, { method: 'DELETE' }),
}
