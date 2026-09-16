import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const { usuario, esAdmin, logout } = useAuth()

  return (
    <header className="border-b border-gray-200">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="font-bold text-lg">DanteAutomotores</Link>
        <div className="flex items-center gap-4 text-sm">
          {esAdmin && <Link to="/admin">Administración</Link>}
          {usuario ? (
            <>
              <Link to="/favoritos">Favoritos</Link>
              <button onClick={logout}>Cerrar sesión</button>
            </>
          ) : (
            <>
              <Link to="/login">Ingresar</Link>
              <Link to="/registro">Crear cuenta</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
