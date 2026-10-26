import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react'

const ICONOS = { info: Info, exito: CircleCheck, error: CircleAlert, aviso: TriangleAlert }

// tipo: 'info' | 'exito' | 'error' | 'aviso'
export default function Alert({ tipo = 'info', titulo, children }) {
  const Icono = ICONOS[tipo]
  return (
    <div className={`alerta alerta-${tipo}`} role={tipo === 'error' ? 'alert' : 'status'}>
      <Icono size={20} aria-hidden="true" />
      <div>
        {titulo && <strong>{titulo}</strong>}
        {children && <div>{children}</div>}
      </div>
    </div>
  )
}
