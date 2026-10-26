// true = datos simulados en el navegador (no necesita backend)
export const USAR_MOCK = import.meta.env.VITE_USE_MOCK === 'false'
export const API_URL = (import.meta.env.VITE_API_URL || 'https://iqmne6sutfw7mnkbxcb3h2oo5m0fsqzh.lambda-url.us-east-2.on.aws/').replace(/\/$/, '')
