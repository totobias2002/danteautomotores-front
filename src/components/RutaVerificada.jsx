import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { destinoDeGate, evaluarAcceso } from '../utils/cuenta.js'

// Como ProtectedRoute, pero además exige cuenta verificada: un visitante va al login y una cuenta incompleta
// a Completá tus datos, ambos con la página actual como destino de vuelta.
export default function RutaVerificada({ children }) {
  const { usuario, refrescarUsuario } = useAuth()
  const location = useLocation()
  const [fallo, setFallo] = useState(false)
  const [intento, setIntento] = useState(0)
  const estado = evaluarAcceso(usuario)

  // Una sesión guardada antes de la fase no sabe qué le falta: se pregunta al servidor antes de decidir.
  useEffect(() => {
    if (estado !== 'desconocida') return
    setFallo(false)
    refrescarUsuario().catch(() => setFallo(true))
  }, [estado, intento])

  if (estado === 'desconocida') {
    if (fallo) {
      return (
        <p className="px-6 py-16 text-center text-sm font-semibold text-slate-500">
          No pudimos revisar tu cuenta.{' '}
          <button type="button" onClick={() => setIntento((n) => n + 1)} className="font-bold text-bronze hover:underline">
            Reintentar
          </button>
        </p>
      )
    }
    return <p className="px-6 py-16 text-center text-sm font-semibold text-slate-500">Revisando tu cuenta...</p>
  }

  const { ruta, state } = destinoDeGate(estado, location.pathname + location.search)
  if (ruta) return <Navigate to={ruta} replace state={state} />

  return children
}
