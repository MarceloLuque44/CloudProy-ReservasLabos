import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import ErrorBoundary from './ErrorBoundary'
import { Cargando } from './ui'
import { USAR_MOCK } from '../config/entorno'

export default function Layout() {
  const { pathname } = useLocation()

  return (
    <div className="app">
      <Navbar />
      {USAR_MOCK && (
        <div className="franja-demo">Modo demostración: los datos se guardan solo en este navegador.</div>
      )}
      <main className="principal">
        {/* key = ruta: al cambiar de pantalla se reinicia el ErrorBoundary */}
        <ErrorBoundary key={pathname}>
          <Suspense fallback={<Cargando />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <footer className="pie">
        Universidad Mayor de San Andrés, Carrera de Informática. Computación en la Nube, Grupo 13.
      </footer>
    </div>
  )
}
