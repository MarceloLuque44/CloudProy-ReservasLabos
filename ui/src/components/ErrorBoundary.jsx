import { Component } from 'react'
import { Alert, Card } from './ui'

// Si una pantalla falla al dibujarse, muestra un aviso en vez de dejar la página en blanco.
export default class ErrorBoundary extends Component {
  state = { fallo: false }

  static getDerivedStateFromError() {
    return { fallo: true }
  }

  componentDidCatch(error) {
    console.error('Error en la pantalla:', error)
  }

  render() {
    if (this.state.fallo) {
      return (
        <Card>
          <Alert tipo="error" titulo="Esta pantalla tuvo un problema">
            Recarga la página o vuelve al inicio. Si se repite, avisa al equipo con la hora y lo que estabas haciendo.
          </Alert>
        </Card>
      )
    }
    return this.props.children
  }
}
