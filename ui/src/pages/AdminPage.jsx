import { PageHeader, Pendiente } from '../components/ui'

export default function AdminPage() {
  return (
    <>
      <PageHeader titulo="Reservas registradas" descripcion="Todas las reservas del sistema, ordenadas por fecha y hora." />
      <Pendiente integrante="Integrante 5" usa="reservasService.listarReservas()" />
    </>
  )
}
