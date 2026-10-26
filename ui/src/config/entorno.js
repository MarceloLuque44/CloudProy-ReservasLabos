// true = datos simulados en el navegador (no necesita backend)
export const USAR_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
export const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
