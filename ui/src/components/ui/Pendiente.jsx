import Card from './Card'
import Alert from './Alert'

// Marcador temporal. Cada integrante lo reemplaza al construir su pantalla.
export default function Pendiente({ integrante, usa }) {
  return (
    <Card>
      <Alert tipo="aviso" titulo={`Pantalla en construcción (${integrante})`}>
        Datos disponibles con <code>{usa}</code> desde <code>services/reservasService.js</code>.
      </Alert>
    </Card>
  )
}
