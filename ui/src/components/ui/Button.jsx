// variante: 'primario' | 'secundario' | 'peligro' | 'fantasma'
// cargando: muestra un spinner y bloquea el botón (evita doble envío)
export default function Button({
  variante = 'primario',
  cargando = false,
  icono: Icono,
  children,
  type = 'button',
  disabled,
  ...resto
}) {
  return (
    <button type={type} className={`btn btn-${variante}`} disabled={disabled || cargando} {...resto}>
      {cargando ? (
        <span className="spinner spinner-chico" aria-hidden="true" />
      ) : (
        Icono && <Icono size={18} aria-hidden="true" />
      )}
      {children}
    </button>
  )
}
