import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { CircleAlert, CircleCheck, Info } from 'lucide-react'

const ToastContext = createContext(null)
const ICONOS = { exito: CircleCheck, error: CircleAlert, info: Info }

// Avisos flotantes. Uso:  const toast = useToast();  toast.exito('Reserva confirmada')
export function ToastProvider({ children }) {
  const [avisos, setAvisos] = useState([])

  const quitar = useCallback((id) => setAvisos((lista) => lista.filter((a) => a.id !== id)), [])

  const mostrar = useCallback(
    (mensaje, tipo) => {
      const id = `${Date.now()}-${Math.random()}`
      setAvisos((lista) => [...lista, { id, mensaje, tipo }])
      setTimeout(() => quitar(id), 5000)
    },
    [quitar],
  )

  const toast = useMemo(
    () => ({
      exito: (m) => mostrar(m, 'exito'),
      error: (m) => mostrar(m, 'error'),
      info: (m) => mostrar(m, 'info'),
    }),
    [mostrar],
  )

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="avisos" role="status" aria-live="polite">
        {avisos.map(({ id, mensaje, tipo }) => {
          const Icono = ICONOS[tipo]
          return (
            <div key={id} className={`aviso aviso-${tipo}`}>
              <Icono size={18} aria-hidden="true" />
              <span>{mensaje}</span>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const contexto = useContext(ToastContext)
  if (!contexto) throw new Error('useToast debe usarse dentro de <ToastProvider>')
  return contexto
}
