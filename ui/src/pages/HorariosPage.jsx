
import { useEffect, useState } from 'react'
import { CalendarDays, RefreshCw, Search } from 'lucide-react'
import { PageHeader, Card } from '../components/ui'
import { LABORATORIOS } from '../config/constantes'
import { reservasService } from '../services/reservasService'
import { hoyISO } from '../utils/fechas'

export default function HorariosPage() {
  const [fecha, setFecha] = useState(hoyISO())
  const [laboratorio, setLaboratorio] = useState(LABORATORIOS[0])
  const [horarios, setHorarios] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    let vigente = true

    async function consultarHorarios() {
      setCargando(true)
      setError('')
      setHorarios([])

      try {
        const resultado = await reservasService.obtenerHorarios({
          fecha,
          laboratorio,
        })

        console.log('Resultado de horarios:', resultado)

        if (vigente) {
          setHorarios(resultado.horarios || [])
        }
      } catch (err) {
        if (vigente) {
          setError(
            err.message || 'No se pudieron consultar los horarios.'
          )
        }
      } finally {
        if (vigente) {
          setCargando(false)
        }
      }
    }

    if (fecha && laboratorio) {
      consultarHorarios()
    }

    return () => {
      vigente = false
    }
  }, [fecha, laboratorio, intento])

  const disponibles = horarios.filter((h) => h.disponible).length
  const ocupados = horarios.filter((h) => !h.disponible).length

  return (
    <>
      <PageHeader
        titulo="Horarios disponibles"
        descripcion="Selecciona un laboratorio y una fecha para consultar los bloques disponibles."
      />

      <Card titulo="Consultar disponibilidad">
        <div className="filtros-horarios">
          <div className="campo-horarios">
            <label htmlFor="laboratorio">
              Laboratorio
            </label>

            <select
              id="laboratorio"
              value={laboratorio}
              onChange={(e) => setLaboratorio(e.target.value)}
            >
              {LABORATORIOS.map((nombre) => (
                <option key={nombre} value={nombre}>
                  {nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="campo-horarios">
            <label htmlFor="fecha">
              Fecha
            </label>

            <input
              id="fecha"
              type="date"
              min={hoyISO()}
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="btn btn-secundario"
            onClick={() => setIntento((actual) => actual + 1)}
            disabled={cargando}
          >
            <RefreshCw size={17} aria-hidden="true" />
            Actualizar
          </button>
        </div>
      </Card>

      {cargando && (
        <div className="estado-horarios" role="status">
          <RefreshCw size={20} className="girando" aria-hidden="true" />
          <p>Consultando horarios disponibles...</p>
        </div>
      )}

      {!cargando && error && (
        <div className="mensaje-error" role="alert">
          <p>{error}</p>

          <button
            type="button"
            className="btn btn-secundario"
            onClick={() => setIntento((actual) => actual + 1)}
          >
            Intentar nuevamente
          </button>
        </div>
      )}

      {!cargando && !error && (
        <Card titulo={`Disponibilidad: ${laboratorio}`}>
          <div className="resumen-horarios">
            <span className="resumen-libre">
              {disponibles} disponibles
            </span>

            <span className="resumen-ocupado">
              {ocupados} ocupados
            </span>
          </div>

          {horarios.length === 0 ? (
            <div className="estado-horarios">
              <CalendarDays size={28} aria-hidden="true" />
              <p>No hay horarios registrados para esta consulta.</p>
            </div>
          ) : (
            <div className="lista-horarios">
              {horarios.map((bloque) => (
                <div
                  key={bloque.horario}
                  className={`bloque-horario ${
                    bloque.disponible ? 'bloque-libre' : 'bloque-ocupado'
                  }`}
                >
                  <div className="bloque-info">
                    <strong>{bloque.horario}</strong>

                    <span>
                      {bloque.disponible ? 'Disponible' : 'Ocupado'}
                    </span>
                  </div>

                  <span
                    className={`estado-etiqueta ${
                      bloque.disponible ? 'etiqueta-libre' : 'etiqueta-ocupado'
                    }`}
                  >
                    {bloque.disponible ? 'Libre' : 'No disponible'}
                  </span>
                </div>
              ))}
            </div>
          )}

          <p className="nota-horarios">
            Fecha consultada: {fecha}. Cada bloque corresponde al horario
            definido para el laboratorio seleccionado.
          </p>
        </Card>
      )}
    </>
  )
}
