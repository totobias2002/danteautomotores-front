import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const { usuario, esAdmin, logout } = useAuth()

  return (
    <header className="bg-slate-900 text-white">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-extrabold tracking-tight">
            Dante<span className="text-orange-500">Automotores</span>
          </span>
        </Link>
        <div className="flex items-center gap-5 text-sm">
          {esAdmin && (
            <Link to="/admin" className="hover:text-orange-400">Administración</Link>
          )}
          {usuario ? (
            <>
              <Link to="/favoritos" className="hover:text-orange-400">Favoritos</Link>
              <button onClick={logout} className="hover:text-orange-400">Cerrar sesión</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-orange-400">Ingresar</Link>
              <Link to="/registro" className="bg-orange-500 hover:bg-orange-600 text-white rounded px-3 py-1.5">
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
