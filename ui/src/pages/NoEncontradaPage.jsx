import { Link } from 'react-router-dom'
import { Card, Vacio } from '../components/ui'

export default function NoEncontradaPage() {
  return (
    <Card>
      <Vacio
        titulo="No encontramos esa página"
        accion={
          <Link to="/" className="btn btn-primario">
            Volver al inicio
          </Link>
        }
      >
        La dirección no existe o fue movida.
      </Vacio>
    </Card>
  )
}
