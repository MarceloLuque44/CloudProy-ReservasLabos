export default function Card({ titulo, children, className = '' }) {
  return (
    <section className={`tarjeta ${className}`}>
      {titulo && <h2 className="tarjeta-titulo">{titulo}</h2>}
      {children}
    </section>
  )
}
