import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { PageHeader, Card, Button, Alert, Badge, Vacio, Cargando, Campo } from '../components/ui'
import { reservasService } from '../services/reservasService'
import { useAsync } from '../hooks/useAsync'

function coincide(reserva, texto) {
  const t = texto.trim().toLowerCase()
  if (!t) return true
  return [
    reserva.codigo,
    reserva.nombre,
    reserva.materia,
    reserva.sigla,
    reserva.laboratorio,
    reserva.fecha,
    reserva.horario,
    reserva.estado,
  ]
    .filter(Boolean)
    .some((campo) => String(campo).toLowerCase().includes(t))
}

export default function AdminPage() {
  const { datos, error, cargando, recargar } = useAsync(
    () => reservasService.listarReservas(),
    [],
  )
  const [filtro, setFiltro] = useState('')

  const reservas = datos?.reservas ?? []
  const visibles = reservas.filter((r) => coincide(r, filtro))
  const confirmadas = reservas.filter((r) => r.estado === 'CONFIRMADA').length
  const canceladas = reservas.length - confirmadas

  return (
    <>
      <PageHeader
        titulo="Reservas registradas"
        descripcion="Todas las reservas del sistema, ordenadas por fecha y hora."
      />

      {error && (
        <Alert tipo="error" titulo="No se pudieron cargar las reservas">
          {error.message || 'Revisa tu conexión e intenta de nuevo.'}
          <div style={{ marginTop: '0.5rem' }}>
            <Button type="button" variante="secundario" onClick={recargar}>
              Reintentar
            </Button>
          </div>
        </Alert>
      )}

      {cargando && <Cargando texto="Cargando reservas…" />}

      {!cargando && !error && (
        <>
          <div className="estadisticas">
            <span><strong>{reservas.length}</strong> reservas en total</span>
            <span><strong>{confirmadas}</strong> confirmadas</span>
            <span><strong>{canceladas}</strong> canceladas</span>
          </div>

          <Card titulo="Listado">
            {reservas.length === 0 ? (
              <Vacio titulo="Aún no hay reservas registradas">
                Cuando alguien complete el formulario de Reservar, su reserva aparecerá aquí.
              </Vacio>
            ) : (
              <>
                <Campo id="filtro" etiqueta="Buscar" ayuda="Por código, nombre, materia, laboratorio, fecha o estado.">
                  <input
                    id="filtro"
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    placeholder="Ejemplo: RES- o Base de Datos"
                  />
                </Campo>

                {visibles.length === 0 ? (
                  <Vacio titulo="Sin resultados">
                    Ninguna reserva coincide con “{filtro}”.
                  </Vacio>
                ) : (
                  <div className="tabla-envuelta">
                    <table className="tabla-reservas">
                      <thead>
                        <tr>
                          <th>Código</th>
                          <th>Estado</th>
                          <th>Solicitante</th>
                          <th>Materia</th>
                          <th>Laboratorio</th>
                          <th>Fecha</th>
                          <th>Horario</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibles.map((r) => (
                          <tr key={`${r.PK}-${r.SK}`}>
                            <td>{r.codigo}</td>
                            <td><Badge estado={r.estado} /></td>
                            <td>{r.nombre}{r.tipoSolicitante ? <small> ({r.tipoSolicitante})</small> : null}</td>
                            <td>{r.materia}{r.sigla ? ` (${r.sigla})` : ''}{r.paralelo ? ` — Par. ${r.paralelo}` : ''}</td>
                            <td>{r.laboratorio}</td>
                            <td>{r.fecha}</td>
                            <td>{r.horario}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="modal-acciones">
                  <Button type="button" variante="fantasma" icono={RefreshCw} onClick={recargar}>
                    Actualizar lista
                  </Button>
                </div>
              </>
            )}
          </Card>
        </>
      )}
    </>
  )
}
