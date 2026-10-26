// Envuelve un input/select con su etiqueta, ayuda y mensaje de error.
//   <Campo id="nombre" etiqueta="Nombre completo" error={errores.nombre}>
//     <input id="nombre" ... />
//   </Campo>
export default function Campo({ id, etiqueta, error, ayuda, children }) {
  return (
    <div className="campo">
      <label htmlFor={id}>{etiqueta}</label>
      {children}
      {ayuda && !error && <small className="campo-ayuda">{ayuda}</small>}
      {error && (
        <small className="campo-error" role="alert">
          {error}
        </small>
      )}
    </div>
  )
}
