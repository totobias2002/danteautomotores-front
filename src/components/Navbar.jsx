import { Link } from 'react-router-dom'
import { Heart, MessageSquare, UserRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useNoLeidos } from '../context/NoLeidosContext.jsx'
import BadgeNoLeidos from './BadgeNoLeidos.jsx'
import Logo from './Logo.jsx'

export default function Navbar() {
  const { usuario, esAdmin, logout } = useAuth()
  const { noLeidos } = useNoLeidos()
  // El admin atiende desde su propia bandeja (/admin/mensajes); el comprador ve sus mensajes y su perfil.
  const esComprador = Boolean(usuario) && !esAdmin

  return (
    <header className="bg-cream sticky top-0 z-40 border-b border-black/5">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10" aria-label="Navegación principal">
        <Link to="/">
          <Logo />
        </Link>

        <div className="hidden flex-1 items-center justify-center gap-7 text-sm font-bold text-navy-dark/80 md:flex">
          <Link to="/autos" className="transition hover:text-bronze">Comprar tu auto</Link>
          <Link to="/vender" className="transition hover:text-bronze">Vender tu auto</Link>
          <span className="cursor-default select-none text-navy-dark/40">Nuestras sucursales</span>
          <span className="cursor-default select-none text-navy-dark/40">Nosotros</span>
          {esComprador && (
            <Link to="/mensajes" className="inline-flex items-center gap-1.5 transition hover:text-bronze">
              Mis mensajes
              <BadgeNoLeidos cantidad={noLeidos} />
            </Link>
          )}
          {esAdmin && (
            <>
              <Link to="/admin" className="transition hover:text-bronze">Administración</Link>
              <Link to="/admin/mensajes" className="inline-flex items-center gap-1.5 transition hover:text-bronze">
                Mensajes
                <BadgeNoLeidos cantidad={noLeidos} />
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/favoritos"
            aria-label="Favoritos"
            title="Favoritos"
            className="flex h-9 w-9 items-center justify-center rounded-full text-navy-dark/70 transition hover:bg-bronze/10 hover:text-bronze"
          >
            <Heart className="h-5 w-5" />
          </Link>
          {esAdmin && (
            <Link
              to="/admin/mensajes"
              aria-label={noLeidos > 0 ? `Mensajes, ${noLeidos} sin leer` : 'Mensajes'}
              title="Mensajes"
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-navy-dark/70 transition hover:bg-bronze/10 hover:text-bronze"
            >
              <MessageSquare className="h-5 w-5" />
              <BadgeNoLeidos cantidad={noLeidos} className="absolute -right-1 -top-1" />
            </Link>
          )}
          {esComprador && (
            <>
              <Link
                to="/mensajes"
                aria-label={noLeidos > 0 ? `Mis mensajes, ${noLeidos} sin leer` : 'Mis mensajes'}
                title="Mis mensajes"
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-navy-dark/70 transition hover:bg-bronze/10 hover:text-bronze"
              >
                <MessageSquare className="h-5 w-5" />
                <BadgeNoLeidos cantidad={noLeidos} className="absolute -right-1 -top-1" />
              </Link>
              <Link
                to="/perfil"
                aria-label="Mi perfil"
                title="Mi perfil"
                className="flex h-9 w-9 items-center justify-center rounded-full text-navy-dark/70 transition hover:bg-bronze/10 hover:text-bronze"
              >
                <UserRound className="h-5 w-5" />
              </Link>
            </>
          )}
          {usuario ? (
            <button
              onClick={logout}
              className="rounded-full bg-navy px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-navy/15 transition hover:-translate-y-0.5 hover:bg-bronze"
            >
              Cerrar sesión
            </button>
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
