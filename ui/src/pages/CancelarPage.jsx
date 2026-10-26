import { useState } from 'react'
import { PageHeader, Campo, Button, Alert, Card, Badge, Modal, Vacio } from '../components/ui'
import { reservasService } from '../services/reservasService'
import { useToast } from '../context/ToastContext'
import { ESTADOS } from '../config/constantes'

const mensajeTecnico = (error) => error.message || 'Ocurrió un problema inesperado.'

export default function CancelarPage() {
  const toast = useToast()
  const [codigo, setCodigo] = useState('')
  const [reserva, setReserva] = useState(null)
  const [error, setError] = useState(null)
  const [consultando, setConsultando] = useState(false)
  const [cancelando, setCancelando] = useState(false)
  const [confirmarAbierto, setConfirmarAbierto] = useState(false)
  const [noEncontrada, setNoEncontrada] = useState(false)

  const normalizar = (valor) => String(valor).trim().toUpperCase()

  const consultar = async (e) => {
    e.preventDefault()
    const clave = normalizar(codigo)
    if (!clave) {
      setError({ titulo: 'Código obligatorio', detalle: 'Escribe el código que recibiste al reservar.' })
      return
    }

    setError(null)
    setReserva(null)
    setNoEncontrada(false)
    setConsultando(true)
    try {
      const resultado = await reservasService.obtenerReserva(clave)
      setReserva(resultado)
    } catch (err) {
      if (err.estado === 404) {
        // No existe la reserva: es una respuesta normal, no un error del sistema.
        setNoEncontrada(true)
      } else {
        setError({ titulo: 'No se pudo consultar la reserva', detalle: mensajeTecnico(err) })
      }
    } finally {
      setConsultando(false)
    }
  }

  const cancelar = async () => {
    setConfirmarAbierto(false)
    setCancelando(true)
    try {
      const resultado = await reservasService.cancelarReserva(normalizar(codigo))
      setReserva(resultado)
      toast.exito('La reserva fue cancelada. El horario quedó libre.')
    } catch (err) {
      setError({ titulo: 'No se pudo cancelar la reserva', detalle: mensajeTecnico(err) })
      // El horario puede haber cambiado: re-consultamos para mostrar el estado real.
      reservasService
        .obtenerReserva(normalizar(codigo))
        .then((actual) => setReserva(actual))
        .catch(() => setReserva(null))
    } finally {
      setCancelando(false)
    }
  }

  const reiniciar = () => {
    setCodigo('')
    setReserva(null)
    setError(null)
    setNoEncontrada(false)
  }

  const cancelada = reserva?.estado === ESTADOS.CANCELADA

  return (
    <>
      <PageHeader
        titulo="Cancelar una reserva"
        descripcion="Ingresa el código que recibiste al reservar. Al cancelar, el horario quedará libre."
      />

      {error && (
        <Alert tipo="error" titulo={error.titulo}>
          {error.detalle}
        </Alert>
      )}

      {noEncontrada && (
        <Vacio titulo="Reserva no encontrada">
          No existe una reserva con el código <strong>{codigo.trim().toUpperCase()}</strong>.
          Revisa que esté escrito correctamente (formato RES-XXXXXX) o consulta tu código en la
          pantalla de confirmación de la reserva.
        </Vacio>
      )}

      <Card titulo="Buscar reserva por código">
        <form onSubmit={consultar} noValidate>
          <Campo
            id="codigo"
            etiqueta="Código de reserva"
            ayuda="Ejemplo: RES-AB12CD"
          >
            <input
              id="codigo"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="RES-XXXXXX"
              required
            />
          </Campo>

          <div className="modal-acciones">
            <Button type="button" variante="fantasma" onClick={reiniciar}>
              Limpiar
            </Button>
            <Button type="submit" variante="secundario" cargando={consultando}>
              Consultar
            </Button>
          </div>
        </form>
      </Card>

      {reserva && (
        <Card titulo="Detalles de la reserva">
          <div className="reserva-detalle">
            <p>
              {typeof reserva.estado === 'string' ? <Badge estado={reserva.estado} /> : null}
            </p>
            <p><strong>Código:</strong> {reserva.codigo}</p>
            <p><strong>Solicitante:</strong> {reserva.nombre}</p>
            <p><strong>Tipo:</strong> {reserva.tipoSolicitante}</p>
            <p>
              <strong>Materia:</strong> {reserva.materia}
              {reserva.sigla ? ` (${reserva.sigla})` : ''}
              {reserva.paralelo ? ` — Paralelo ${reserva.paralelo}` : ''}
            </p>
            <p><strong>Actividad:</strong> {reserva.actividad}</p>
            <p><strong>Laboratorio:</strong> {reserva.laboratorio}</p>
            <p><strong>Fecha:</strong> {reserva.fecha}</p>
            <p><strong>Horario:</strong> {reserva.horario}</p>
          </div>

          <div className="modal-acciones">
            {cancelada ? (
              <>
                <Alert tipo="info" titulo="Reserva cancelada">
                  Este horario ya está disponible para otras personas. No requiere ninguna acción.
                </Alert>
                <Button type="button" variante="secundario" onClick={reiniciar}>
                  Nueva consulta
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variante="peligro"
                cargando={cancelando}
                onClick={() => setConfirmarAbierto(true)}
              >
                Cancelar reserva
              </Button>
            )}
          </div>
        </Card>
      )}

      <Modal
        abierto={confirmarAbierto}
        titulo="Confirmar cancelación"
        onCerrar={() => setConfirmarAbierto(false)}
      >
        <p>
          ¿Seguro que deseas cancelar la reserva <strong>{reserva?.codigo}</strong>?
          El bloque <strong>{reserva?.horario}</strong> del <strong>{reserva?.fecha}</strong> en{' '}
          <strong>{reserva?.laboratorio}</strong> quedará libre y esta acción no se puede deshacer.
        </p>
        <div className="modal-acciones">
          <Button type="button" variante="fantasma" onClick={() => setConfirmarAbierto(false)}>
            Conservar reserva
          </Button>
          <Button type="button" variante="peligro" onClick={cancelar}>
            Sí, cancelar
          </Button>
        </div>
      </Modal>
    </>
  )
}
