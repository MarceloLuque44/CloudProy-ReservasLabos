import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import InicioPage from './pages/InicioPage'
import './App.css'

// Carga diferida: cada pantalla se descarga solo cuando se visita (bundle inicial más liviano)
const HorariosPage = lazy(() => import('./pages/HorariosPage'))
const ReservaPage = lazy(() => import('./pages/ReservaPage'))
const CancelarPage = lazy(() => import('./pages/CancelarPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const NoEncontradaPage = lazy(() => import('./pages/NoEncontradaPage'))

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<InicioPage />} />
        <Route path="/horarios" element={<HorariosPage />} />
        <Route path="/reservar" element={<ReservaPage />} />
        <Route path="/cancelar" element={<CancelarPage />} />
        <Route path="/reservas" element={<AdminPage />} />
        <Route path="*" element={<NoEncontradaPage />} />
      </Route>
    </Routes>
  )
}
