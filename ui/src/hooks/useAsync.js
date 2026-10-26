import { useCallback, useEffect, useState } from 'react'

// Ejecuta una función asíncrona y entrega { datos, error, cargando, recargar }.
// Se vuelve a ejecutar cuando cambia algo de `dependencias`.
//   const { datos, error, cargando } = useAsync(
//     () => reservasService.obtenerHorarios({ fecha, laboratorio }),
//     [fecha, laboratorio],
//   )
export function useAsync(funcion, dependencias = []) {
  const [estado, setEstado] = useState({ datos: null, error: null, cargando: true })
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let cancelado = false
    setEstado((previo) => ({ ...previo, cargando: true, error: null }))
    funcion()
      .then((datos) => !cancelado && setEstado({ datos, error: null, cargando: false }))
      .catch((error) => !cancelado && setEstado({ datos: null, error, cargando: false }))
    return () => {
      cancelado = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencias, version])

  const recargar = useCallback(() => setVersion((v) => v + 1), [])
  return { ...estado, recargar }
}
