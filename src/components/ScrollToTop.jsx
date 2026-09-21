import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Al cambiar de página, lleva el scroll arriba de todo en vez de mantener
// la posición en la que había quedado la vista anterior.
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
