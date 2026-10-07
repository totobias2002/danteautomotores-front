import { useEffect, useRef } from 'react'

// Llama a `callback` cada `intervaloMs` solo mientras la pestaña está visible (D-07: sin WebSockets). Al volver a
// una pestaña oculta consulta de inmediato, para que el hilo no muestre datos viejos. Limpia el temporizador y el
// listener al desmontar o cuando `activo` pasa a falso.
export function useSondeo(callback, intervaloMs, activo = true) {
  // El callback va en una referencia: cambiarlo no reinicia el temporizador.
  const ultimoCallback = useRef(callback)
  useEffect(() => {
    ultimoCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (!activo) return undefined

    const visible = () => document.visibilityState === 'visible'
    const llamar = () => {
      if (visible()) ultimoCallback.current()
    }
    const temporizador = setInterval(llamar, intervaloMs)
    const alCambiarVisibilidad = () => llamar()
    document.addEventListener('visibilitychange', alCambiarVisibilidad)

    return () => {
      clearInterval(temporizador)
      document.removeEventListener('visibilitychange', alCambiarVisibilidad)
    }
  }, [intervaloMs, activo])
}

export default useSondeo
