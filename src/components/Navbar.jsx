import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Logo from './Logo.jsx'

export default function Navbar() {
  const { usuario, esAdmin, logout } = useAuth()

  return (
    <header className="bg-cream sticky top-0 z-40 border-b border-black/5">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10" aria-label="Navegación principal">
        <Link to="/">
          <Logo />
        </Link>

        <div className="hidden flex-1 items-center justify-center gap-8 text-sm font-semibold text-slate-500 md:flex">
          <Link to="/" className="transition hover:text-bronze">Comprar un auto</Link>
          <Link to="/agencias/demo" className="transition hover:text-bronze">Nuestras sucursales</Link>
          <Link to="/#nosotros" className="transition hover:text-bronze">Nosotros</Link>
          {esAdmin && (
            <Link to="/admin" className="transition hover:text-bronze">Administración</Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {usuario ? (
            <>
              <Link to="/favoritos" className="text-sm font-semibold text-slate-500 transition hover:text-bronze">
                Favoritos
              </Link>
              <button
                onClick={logout}
                className="rounded-full bg-navy px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-navy/15 transition hover:-translate-y-0.5 hover:bg-bronze"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-slate-500 transition hover:text-bronze">
                Ingresar
              </Link>
              <Link
                to="/registro"
                className="rounded-full bg-navy px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-navy/15 transition hover:-translate-y-0.5 hover:bg-bronze"
              >
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
