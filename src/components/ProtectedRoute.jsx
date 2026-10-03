import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children, soloAdmin = false }) {
  const { usuario, esAdmin } = useAuth()
  const location = useLocation()

  if (!usuario) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  if (soloAdmin && !esAdmin) return <Navigate to="/" replace />

  return children
}
