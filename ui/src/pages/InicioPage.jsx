import { Link } from 'react-router-dom'
import {
  CalendarDays,
  CalendarPlus,
  Clock3,
  CheckCircle2,
  ArrowRight,
  ClipboardList,
  ShieldCheck,
} from 'lucide-react'
import { HORARIOS } from '../config/constantes'
import './InicioPage.css'

const OCUPADOS_EJEMPLO = [1, 4]

const PASOS = [
  {
    numero: '01',
    icono: CalendarDays,
    titulo: 'Consulta disponibilidad',
    texto:
      'Selecciona el laboratorio y la fecha para revisar los bloques horarios.',
  },
  {
    numero: '02',
    icono: ClipboardList,
    titulo: 'Completa tu solicitud',
    texto:
      'Ingresa tus datos y la información de la actividad académica.',
  },
  {
    numero: '03',
    icono: CheckCircle2,
    titulo: 'Confirma tu reserva',
    texto:
      'Guarda el código de reserva para identificarla y gestionar su cancelación.',
  },
]

const REGLAS = [
  'Cada reserva corresponde a un laboratorio, una fecha y un bloque horario.',
  'Un bloque que ya está reservado no puede asignarse nuevamente.',
  'No se permiten reservas para fechas pasadas.',
  'Al cancelar una reserva, el horario puede quedar disponible nuevamente.',
]

export default function InicioPage() {
  return (
    <main className="inicio">
      {/* Portada principal (Hero full width) */}
      <section className="inicio-hero">
        <div className="inicio-hero-container">
          <div className="inicio-hero-contenido">
            <div className="inicio-identidad">
              <div className="inicio-logo-container">
                <img
                  src="/images/logo.jpg"
                  alt="Logo de la Carrera de Informática - UMSA"
                  className="inicio-logo"
                />
              </div>

              <div className="inicio-identidad-texto">
                <span className="inicio-etiqueta">
                  CARRERA DE INFORMÁTICA
                </span>
                <span className="inicio-universidad">
                  Universidad Mayor de San Andrés
                </span>
              </div>
            </div>

            <h1>
              Tu próximo laboratorio
              <span> comienza aquí.</span>
            </h1>

            <p className="inicio-descripcion">
              Consulta horarios, encuentra un espacio disponible y gestiona
              tus reservas de laboratorios en un solo lugar.
            </p>

            <div className="inicio-acciones">
              <Link
                to="/reservar"
                className="inicio-btn inicio-btn-principal"
              >
                <CalendarPlus size={19} aria-hidden="true" />
                Reservar laboratorio
                <ArrowRight size={17} aria-hidden="true" />
              </Link>

              <Link
                to="/horarios"
                className="inicio-btn inicio-btn-secundario"
              >
                <CalendarDays size={19} aria-hidden="true" />
                Consultar horarios
              </Link>
            </div>

            <div className="inicio-confianza">
              <ShieldCheck size={18} aria-hidden="true" />
              <span>
                Organiza tus actividades académicas con mayor facilidad.
              </span>
            </div>
          </div>

          {/* Vista previa de horarios */}
          <aside
            className="inicio-panel"
            aria-label="Ejemplo visual de horarios"
          >
            <div className="inicio-panel-cabecera">
              <div>
                <span className="inicio-panel-subtitulo">
                  VISTA PREVIA
                </span>
                <h2>Horario del laboratorio</h2>
                <p>Ejemplo ilustrativo de un día</p>
              </div>

              <div className="inicio-panel-icono">
                <Clock3 size={23} aria-hidden="true" />
              </div>
            </div>

            <div className="inicio-leyenda">
              <span>
                <i className="punto-libre" aria-hidden="true" />
                Libre
              </span>
              <span>
                <i className="punto-ocupado" aria-hidden="true" />
                Ocupado
              </span>
            </div>

            <div className="inicio-horarios">
              {HORARIOS.map((horario, index) => {
                const ocupado = OCUPADOS_EJEMPLO.includes(index)

                return (
                  <div
                    key={horario}
                    className={`inicio-bloque ${
                      ocupado ? 'bloque-ocupado' : 'bloque-libre'
                    }`}
                  >
                    <div className="inicio-bloque-hora">
                      <Clock3 size={15} aria-hidden="true" />
                      <span>{horario}</span>
                    </div>

                    <span className="inicio-estado">
                      {ocupado ? 'Ocupado' : 'Libre'}
                    </span>
                  </div>
                )
              })}
            </div>

            <Link
              to="/horarios"
              className="inicio-ver-horarios"
            >
              Explorar horarios
              <ArrowRight size={16} aria-hidden="true" />
            </Link>

            <p className="inicio-nota">
              Los estados mostrados son de ejemplo y no representan
              disponibilidad en tiempo real.
            </p>
          </aside>

          <div
            className="inicio-decoracion inicio-decoracion-uno"
            aria-hidden="true"
          />
          <div
            className="inicio-decoracion inicio-decoracion-dos"
            aria-hidden="true"
          />
        </div>
      </section>

      {/* Sección fotográfica */}
      <section className="inicio-laboratorio">
        <div className="inicio-seccion-container inicio-laboratorio-grid">
          <div className="inicio-laboratorio-imagen">
            <img
              src="/images/laboratorio.png"
              alt="Laboratorio de Informática UMSA"
              loading="lazy"
            />
            <span className="inicio-imagen-etiqueta">
              Espacios para el aprendizaje
            </span>
          </div>

          <div className="inicio-laboratorio-contenido">
            <span className="inicio-sobrelinea">
              ESPACIOS ACADÉMICOS
            </span>

            <h2>Un espacio para aprender y crear</h2>

            <p>
              Organiza tus prácticas, clases y actividades académicas
              consultando los horarios de los laboratorios.
            </p>

            <Link to="/horarios" className="inicio-enlace">
              Consultar horarios
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="inicio-seccion">
        <div className="inicio-seccion-container">
          <div className="inicio-titulo-seccion">
            <span className="inicio-sobrelinea">
              SENCILLO Y PRÁCTICO
            </span>
            <h2>¿Cómo funciona?</h2>
            <p>
              Tres pasos para organizar el uso de los laboratorios.
            </p>
          </div>

          <div className="inicio-pasos">
            {PASOS.map(({ numero, icono: Icono, titulo, texto }) => (
              <article className="inicio-paso" key={numero}>
                <div className="inicio-paso-superior">
                  <div className="inicio-paso-icono">
                    <Icono size={23} aria-hidden="true" />
                  </div>

                  <span className="inicio-paso-numero">
                    {numero}
                  </span>
                </div>

                <h3>{titulo}</h3>
                <p>{texto}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Reglas de reserva */}
      <section className="inicio-reglas-wrapper">
        <div className="inicio-seccion-container">
          <div className="inicio-reglas">
            <div className="inicio-reglas-intro">
              <div className="inicio-reglas-icono">
                <ShieldCheck size={26} aria-hidden="true" />
              </div>

              <span className="inicio-sobrelinea">
                USO RESPONSABLE
              </span>

              <h2>Antes de reservar</h2>

              <p>
                Ten en cuenta estas condiciones para que todos puedan
                utilizar los espacios académicos de manera organizada.
              </p>

              <Link to="/reservar" className="inicio-enlace">
                Comenzar una reserva
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>

            <div className="inicio-reglas-lista">
              {REGLAS.map((regla) => (
                <div className="inicio-regla" key={regla}>
                  <span className="inicio-regla-check">
                    <CheckCircle2 size={19} aria-hidden="true" />
                  </span>

                  <span>{regla}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pie de página */}
      <footer className="inicio-footer">
        <ShieldCheck size={19} aria-hidden="true" />

        <p>
          Sistema de reservas de laboratorios
          <span>Carrera de Informática · UMSA</span>
        </p>
      </footer>
    </main>
  )
}