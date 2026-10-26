import { useEffect, useRef } from 'react'

// Diálogo nativo <dialog>: accesible, se cierra con Esc y atrapa el foco.
export default function Modal({ abierto, titulo, onCerrar, children }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialogo = ref.current
    if (abierto && !dialogo.open) dialogo.showModal()
    if (!abierto && dialogo.open) dialogo.close()
  }, [abierto])

  return (
    <dialog
      ref={ref}
      className="modal"
      onClose={onCerrar}
      onClick={(e) => e.target === ref.current && onCerrar()}
    >
      <div className="modal-cuerpo">
        <h3>{titulo}</h3>
        {children}
      </div>
    </dialog>
  )
}
