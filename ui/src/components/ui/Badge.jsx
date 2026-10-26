const ETIQUETAS = { CONFIRMADA: 'Confirmada', CANCELADA: 'Cancelada' }

// Tolerante: si `estado` viene vacío o undefined, muestra un badge neutro en vez de romper la pantalla.
export default function Badge({ estado }) {
  const clave = String(estado ?? '').toLowerCase()

  if (!clave) {
    return <span className="insignia insignia-desconocida">Sin estado</span>
  }

  return <span className={`insignia insignia-${clave}`}>{ETIQUETAS[clave.toUpperCase()] ?? String(estado)}</span>
}
