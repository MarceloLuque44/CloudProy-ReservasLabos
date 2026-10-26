import { Link } from 'react-router-dom'
import { CalendarDays, CalendarPlus } from 'lucide-react'
import { Card } from '../components/ui'
import { HORARIOS } from '../config/constantes'

// Solo ilustrativo: qué bloques se muestran como ocupados en el ejemplo
const OCUPADOS_EJEMPLO = [1, 4]

const PASOS = [
  { titulo: 'Consulta los horarios', texto: 'Elige el laboratorio y la fecha. Los bloques libres aparecen en verde.' },
  { titulo: 'Reserva tu bloque', texto: 'Completa tus datos y la materia. La reserva se confirma al instante.' },
  { titulo: 'Guarda tu código', texto: 'Lo necesitas para cancelar. Al cancelar, el horario queda libre para otros.' },
]

const REGLAS = [
  'Una reserva es un laboratorio, una fecha y un bloque horario.',
  'Un bloque ya reservado no se puede volver a reservar.',
  'No se pueden reservar fechas pasadas.',
  'Cancelar libera el horario de inmediato.',
]

export default function InicioPage() {
  return (
    <>
      <section className="portada">
        <div className="portada-texto">
          <h1>Reserva un laboratorio sin esperar la respuesta de nadie</h1>
          <p>
            Antes la solicitud se enviaba en Word por WhatsApp y alguien la respondía a mano. Ahora ves qué horarios
            están libres, reservas y cancelas desde aquí.
          </p>
          <div className="portada-acciones">
            <Link to="/reservar" className="btn btn-primario">
              <CalendarPlus size={18} aria-hidden="true" />
              Reservar un laboratorio
            </Link>
            <Link to="/horarios" className="btn btn-secundario">
              <CalendarDays size={18} aria-hidden="true" />
              Ver horarios libres
            </Link>
          </div>
        </div>

        <figure className="portada-franja">
          <div className="franja" role="img" aria-label="Ejemplo de un día con bloques libres y ocupados">
            {HORARIOS.map((h, i) => (
              <div key={h} className={`franja-bloque ${OCUPADOS_EJEMPLO.includes(i) ? 'ocupado' : 'libre'}`}>
                <span>{h.split(' - ')[0]}</span>
                <small>{OCUPADOS_EJEMPLO.includes(i) ? 'Ocupado' : 'Libre'}</small>
              </div>
            ))}
          </div>
          <figcaption>Así se ve un día en un laboratorio. Cada bloque dura dos horas.</figcaption>
        </figure>
      </section>

      <div className="rejilla-2">
        <Card titulo="Cómo funciona">
          <ol className="pasos">
            {PASOS.map((p) => (
              <li key={p.titulo}>
                <strong>{p.titulo}</strong>
                <span>{p.texto}</span>
              </li>
            ))}
          </ol>
        </Card>

        <Card titulo="Reglas de reserva">
          <ul className="reglas">
            {REGLAS.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  )
}
