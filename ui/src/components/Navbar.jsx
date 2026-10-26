import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { CalendarDays, CalendarPlus, CircleX, ClipboardList, House, Menu, Monitor, X } from 'lucide-react'

const ENLACES = [
  { a: '/', texto: 'Inicio', icono: House, exacto: true },
  { a: '/horarios', texto: 'Horarios', icono: CalendarDays },
  { a: '/reservar', texto: 'Reservar', icono: CalendarPlus },
  { a: '/cancelar', texto: 'Cancelar', icono: CircleX },
  { a: '/reservas', texto: 'Reservas', icono: ClipboardList },
]

export default function Navbar() {
  const [abierto, setAbierto] = useState(false)

  return (
    <header className="cabecera">
      <div className="cabecera-interno">
        <NavLink to="/" className="marca" onClick={() => setAbierto(false)}>
          <span className="marca-icono">
            <Monitor size={20} aria-hidden="true" />
          </span>
          <span>
            Reservas de Laboratorio
            <small>Carrera de Informática, UMSA</small>
          </span>
        </NavLink>

        <button
          type="button"
          className="menu-boton"
          aria-expanded={abierto}
          aria-controls="menu-principal"
          aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setAbierto((v) => !v)}
        >
          {abierto ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav id="menu-principal" className={`nav ${abierto ? 'abierto' : ''}`} aria-label="Principal">
          {ENLACES.map(({ a, texto, icono: Icono, exacto }) => (
            <NavLink
              key={a}
              to={a}
              end={exacto}
              className={({ isActive }) => (isActive ? 'activo' : undefined)}
              onClick={() => setAbierto(false)}
            >
              <Icono size={18} aria-hidden="true" />
              {texto}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
