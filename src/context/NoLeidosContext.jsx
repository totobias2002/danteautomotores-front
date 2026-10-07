import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import api from '../services/api.js'
import useSondeo from '../hooks/useSondeo.js'
import { useAuth } from './AuthContext.jsx'

// Cada cuánto se vuelve a pedir el contador (D-07): solo con la pestaña visible y sin WebSockets.
const INTERVALO_MS = 30000

const CERO = { noLeidos: 0, conversaciones: 0 }

// Sin proveedor (tests, pantallas aisladas) el contador queda en cero y refrescar no hace nada.
const NoLeidosContext = createContext({ ...CERO, refrescar: () => Promise.resolve() })

// Contador compartido de mensajes sin leer: el Navbar y Mis mensajes lo leen del mismo lugar.
export function NoLeidosProvider({ children }) {
  const { usuario } = useAuth()
  const email = usuario?.email ?? null
  const [conteo, setConteo] = useState(CERO)
  // Una respuesta que llega después de cerrar la sesión (o de cambiar de cuenta) no debe volver a mostrar el contador.
  const emailActual = useRef(email)
  emailActual.current = email

  const refrescar = useCallback(() => {
    if (!emailActual.current) return Promise.resolve()
    const pedidaPor = emailActual.current
    return api
      .get('/conversaciones/no-leidas')
      .then((res) => {
        if (emailActual.current !== pedidaPor) return
        setConteo({
          noLeidos: Number(res.data?.noLeidos) || 0,
          conversaciones: Number(res.data?.conversaciones) || 0,
        })
      })
      // Un fallo de red no molesta al usuario: se reintenta en el próximo ciclo. El 401 lo maneja el interceptor de api.js.
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (email) {
      refrescar()
    } else {
      setConteo(CERO)
    }
  }, [email, refrescar])

  useSondeo(refrescar, INTERVALO_MS, Boolean(email))

  return (
    <NoLeidosContext.Provider value={{ ...conteo, refrescar }}>
      {children}
    </NoLeidosContext.Provider>
  )
}

export function useNoLeidos() {
  return useContext(NoLeidosContext)
}
