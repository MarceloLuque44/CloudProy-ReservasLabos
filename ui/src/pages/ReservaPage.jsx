import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader, Campo, Button, Alert, Card } from '../components/ui'
import { reservasService } from '../services/reservasService'
import { useToast } from '../context/ToastContext'
import {
  LABORATORIOS,
  ACTIVIDADES,
  TIPOS_SOLICITANTE,
  hoyISO,
  validarReserva,
} from '../utils/validaciones'

const DATOS_INICIALES = {
  nombre: '',
  tipoSolicitante: TIPOS_SOLICITANTE[0],
  sigla: '',
  paralelo: '',
  materia: '',
  actividad: ACTIVIDADES[1],
  laboratorio: LABORATORIOS[0],
  fecha: hoyISO(),
  horario: '',
}

export default function ReservaPage() {
  const toast = useToast()
  const [datos, setDatos] = useState(DATOS_INICIALES)
  const [errores, setErrores] = useState({})
  const [reservaCreada, setReservaCreada] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [horarios, setHorarios] = useState([])
  const [consultaFecha, setConsultaFecha] = useState(hoyISO())
  const [consultaLaboratorio, setConsultaLaboratorio] = useState(LABORATORIOS[0])

  useEffect(() => {
    let vigente = true

    async function consultar() {
      setHorarios([])
      try {
        const resultado = await reservasService.obtenerHorarios({
          fecha: consultaFecha,
          laboratorio: consultaLaboratorio,
        })
        if (vigente) {
          setHorarios(resultado.horarios || [])
        }
      } catch {
        if (vigente) {
          setHorarios([])
        }
      }
    }

    if (consultaFecha && consultaLaboratorio) {
      consultar()
    }

    return () => {
      vigente = false
    }
  }, [consultaFecha, consultaLaboratorio])

  const disponibles = horarios.filter((h) => h.disponible).map((h) => h.horario)

  const cambiar = (campo, valor) => {
    setDatos((previo) => ({ ...previo, [campo]: valor }))
    if (errores[campo]) {
      setErrores((previo) => {
        const siguiente = { ...previo }
        delete siguiente[campo]
        return siguiente
      })
    }
  }

  const enviar = async (e) => {
    e.preventDefault()
    const resultado = validarReserva(datos)
    setErrores(resultado.errores)
    if (!resultado.valido) return

    if (!disponibles.includes(datos.horario)) {
      setErrores((previo) => ({ ...previo, horario: 'El horario seleccionado no está disponible.' }))
      return
    }

    setCargando(true)
    try {
      const reserva = await reservasService.crearReserva(datos)
      setReservaCreada(reserva)
      setEnviado(true)
      toast.exito('Reserva registrada correctamente.')
    } catch (error) {
      setErrores((previo) => ({ ...previo, servidor: error.message || 'No se pudo registrar la reserva.' }))
    } finally {
      setCargando(false)
    }
  }

  return (
    <>
      <PageHeader
        titulo="Reservar un laboratorio"
        descripcion="Completa tus datos y elige un bloque libre. Recibirás un código para poder cancelar."
      />

      {enviado ? (
        <>
          <Alert tipo="exito" titulo="Reserva confirmada">
            Tus datos se guardaron. Guarda el código que se muestra para poder cancelar la reserva.
          </Alert>

          <Card titulo="Tu código de reserva">
            <div className="reserva-detalle">
              <p className="codigo-destacado">{reservaCreada?.codigo}</p>
              <p><strong>Solicitante:</strong> {reservaCreada?.nombre}</p>
              <p><strong>Laboratorio:</strong> {reservaCreada?.laboratorio}</p>
              <p><strong>Fecha:</strong> {reservaCreada?.fecha}</p>
              <p><strong>Horario:</strong> {reservaCreada?.horario}</p>
            </div>

            <div className="modal-acciones">
              <Button type="button" variante="fantasma" onClick={() => { setDatos(DATOS_INICIALES); setEnviado(false); setReservaCreada(null) }}>
                Reservar otro bloque
              </Button>
              <Link to="/cancelar" className="btn btn-secundario">
                Cancelar reserva
              </Link>
            </div>
          </Card>
        </>
      ) : (
        <Card titulo="Nueva reserva">
          <form onSubmit={enviar} noValidate>
            <div className="formulario-rejilla">
              <Campo id="nombre" etiqueta="Nombre completo" error={errores.nombre} ayuda="Ejemplo: Juan Pérez">
                <input
                  id="nombre"
                  value={datos.nombre}
                  onChange={(e) => cambiar('nombre', e.target.value)}
                  required
                />
              </Campo>

              <Campo id="tipoSolicitante" etiqueta="Tipo de solicitante" error={errores.tipoSolicitante}>
                <select
                  id="tipoSolicitante"
                  value={datos.tipoSolicitante}
                  onChange={(e) => cambiar('tipoSolicitante', e.target.value)}
                >
                  {TIPOS_SOLICITANTE.map((tipo) => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </Campo>

              <Campo id="sigla" etiqueta="Sigla de la materia" error={errores.sigla} ayuda="Ejemplo: INF-312">
                <input
                  id="sigla"
                  value={datos.sigla}
                  onChange={(e) => cambiar('sigla', e.target.value)}
                  required
                />
              </Campo>

              <Campo id="paralelo" etiqueta="Paralelo" ayuda="Opcional. Ejemplo: A">
                <input
                  id="paralelo"
                  value={datos.paralelo}
                  onChange={(e) => cambiar('paralelo', e.target.value)}
                />
              </Campo>

              <Campo id="materia" etiqueta="Materia" error={errores.materia} ayuda="Ejemplo: Base de Datos">
                <input
                  id="materia"
                  value={datos.materia}
                  onChange={(e) => cambiar('materia', e.target.value)}
                  required
                />
              </Campo>

              <Campo id="actividad" etiqueta="Tipo de actividad" error={errores.actividad}>
                <select
                  id="actividad"
                  value={datos.actividad}
                  onChange={(e) => cambiar('actividad', e.target.value)}
                >
                  {ACTIVIDADES.map((actividad) => (
                    <option key={actividad} value={actividad}>{actividad}</option>
                  ))}
                </select>
              </Campo>

              <Campo
                id="laboratorio"
                etiqueta="Laboratorio"
                error={errores.laboratorio}
                ayuda="Selecciona el laboratorio donde deseas reservar."
              >
                <select
                  id="laboratorio"
                  value={datos.laboratorio}
                  onChange={(e) => {
                    cambiar('laboratorio', e.target.value)
                    setConsultaLaboratorio(e.target.value)
                  }}
                >
                  {LABORATORIOS.map((nombre) => (
                    <option key={nombre} value={nombre}>{nombre}</option>
                  ))}
                </select>
              </Campo>

              <Campo
                id="fecha"
                etiqueta="Fecha"
                error={errores.fecha}
                ayuda="No se permiten fechas pasadas."
              >
                <input
                  id="fecha"
                  type="date"
                  min={hoyISO()}
                  value={datos.fecha}
                  onChange={(e) => {
                    cambiar('fecha', e.target.value)
                    setConsultaFecha(e.target.value)
                  }}
                  required
                />
              </Campo>

              <Campo id="horario" etiqueta="Horario" error={errores.horario}>
                <select
                  id="horario"
                  value={datos.horario}
                  onChange={(e) => cambiar('horario', e.target.value)}
                >
                  <option value="">Selecciona un bloque</option>
                  {disponibles.map((horario) => (
                    <option key={horario} value={horario}>{horario}</option>
                  ))}
                </select>
                {horarios.length > 0 && disponibles.length === 0 && (
                  <p className="campo-ayuda">No hay bloques disponibles para esta fecha y laboratorio.</p>
                )}
              </Campo>
            </div>

            <div className="modal-acciones">
              <Button type="button" variante="fantasma" onClick={() => setDatos(DATOS_INICIALES)}>
                Limpiar
              </Button>
              <Button
                type="submit"
                variante="primario"
                cargando={cargando}
                disabled={cargando || horarios.length === 0}
                title={horarios.length === 0 ? 'Cargando disponibles…' : undefined}
              >
                Reservar
              </Button>
            </div>
          </form>
        </Card>
      )}
    </>
  )
}
