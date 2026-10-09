import { useEffect } from 'react'

const MARCA = 'DanteAutomotores'
const TITULO_POR_DEFECTO = `${MARCA} | Comprá y vendé tu auto con confianza`

// Pone el título de la pestaña de la pantalla actual ("Mi perfil | DanteAutomotores") y al salir vuelve al general.
// Sin título (todavía cargando) deja el que estaba.
export default function useTitulo(titulo) {
  useEffect(() => {
    if (!titulo) return undefined
    document.title = `${titulo} | ${MARCA}`
    return () => {
      document.title = TITULO_POR_DEFECTO
    }
  }, [titulo])
}
