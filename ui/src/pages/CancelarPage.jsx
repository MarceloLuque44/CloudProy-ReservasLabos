import { PageHeader, Pendiente } from '../components/ui'

export default function CancelarPage() {
  return (
    <>
      <PageHeader
        titulo="Cancelar una reserva"
        descripcion="Ingresa el código que recibiste al reservar. El horario quedará libre."
      />
      <Pendiente integrante="Integrante 4" usa="reservasService.obtenerReserva(codigo) y cancelarReserva(codigo)" />
    </>
  )
}
