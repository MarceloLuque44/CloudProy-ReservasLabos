const ETIQUETAS = { CONFIRMADA: 'Confirmada', CANCELADA: 'Cancelada' }

export default function Badge({ estado }) {
  return <span className={`insignia insignia-${estado.toLowerCase()}`}>{ETIQUETAS[estado] ?? estado}</span>
}
