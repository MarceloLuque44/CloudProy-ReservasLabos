// Todas las fechas viajan como texto "YYYY-MM-DD" (el mismo formato de <input type="date">)

export function hoyISO() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

function aFecha(iso) {
  const [a, m, d] = iso.split('-').map(Number)
  return new Date(a, m - 1, d)
}

export function sumarDias(iso, dias) {
  const f = aFecha(iso)
  f.setDate(f.getDate() + dias)
  const mm = String(f.getMonth() + 1).padStart(2, '0')
  const dd = String(f.getDate()).padStart(2, '0')
  return `${f.getFullYear()}-${mm}-${dd}`
}

export function formatearFecha(iso) {
  return aFecha(iso).toLocaleDateString('es-BO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function esFechaPasada(iso) {
  return iso < hoyISO()
}
