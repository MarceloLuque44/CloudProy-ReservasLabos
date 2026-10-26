// Estado vacío: explica qué pasa y qué hacer. `accion` es opcional (un botón o enlace).
export default function Vacio({ titulo, children, accion }) {
  return (
    <div className="vacio">
      <strong>{titulo}</strong>
      {children && <p>{children}</p>}
      {accion}
    </div>
  )
}
