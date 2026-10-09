import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Heart, Menu, MessageSquare, UserRound, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useNoLeidos } from '../context/NoLeidosContext.jsx'
import BadgeNoLeidos from './BadgeNoLeidos.jsx'
import Logo from './Logo.jsx'

export default function Navbar() {
  const { usuario, esAdmin, logout } = useAuth()
  const { noLeidos } = useNoLeidos()
  // El admin atiende desde su propia bandeja (/admin/mensajes); el comprador ve sus mensajes y su perfil.
  const esComprador = Boolean(usuario) && !esAdmin
  const [menuAbierto, setMenuAbierto] = useState(false)
  const { pathname } = useLocation()

  // El menú del celular se cierra solo al navegar.
  useEffect(() => {
    setMenuAbierto(false)
  }, [pathname])

  const itemMenu = 'flex items-center gap-2 rounded-xl px-3 py-3 text-base font-bold text-navy-dark/85 transition hover:bg-bronze/10 hover:text-bronze'

  return (
    <header className="bg-cream sticky top-0 z-40 border-b border-black/5">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-5 lg:px-10" aria-label="Navegación principal">
        <Link to="/">
          <Logo />
        </Link>

        <div className="hidden flex-1 items-center justify-center gap-7 text-sm font-bold text-navy-dark/80 lg:flex">
          <Link to="/autos" className="transition hover:text-bronze">Comprar tu auto</Link>
          <Link to="/vender" className="transition hover:text-bronze">Vender tu auto</Link>
          {esComprador && (
            <Link to="/mensajes" className="inline-flex items-center gap-1.5 transition hover:text-bronze">
              Mis mensajes
              <BadgeNoLeidos cantidad={noLeidos} />
            </Link>
          )}
          {esAdmin && <Link to="/admin" className="transition hover:text-bronze">Administración</Link>}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
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
              className="hidden rounded-full bg-navy px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-navy/15 transition hover:-translate-y-0.5 hover:bg-bronze lg:block"
            >
              Cerrar sesión
            </button>
          ) : (
            <>
              <Link to="/login" className="hidden text-sm font-semibold text-slate-500 transition hover:text-bronze lg:block">
                Ingresar
              </Link>
              <Link
                to="/registro"
                className="hidden rounded-full bg-navy px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-navy/15 transition hover:-translate-y-0.5 hover:bg-bronze lg:block"
              >
                Crear cuenta
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => setMenuAbierto((abierto) => !abierto)}
            aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuAbierto}
            aria-controls="menu-movil"
            className="flex h-10 w-10 items-center justify-center rounded-full text-navy-dark/80 transition hover:bg-bronze/10 hover:text-bronze lg:hidden"
          >
            {menuAbierto ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {menuAbierto && (
        <div id="menu-movil" className="border-t border-black/5 bg-cream px-4 pb-5 pt-2 shadow-lg lg:hidden">
          <Link to="/autos" className={itemMenu}>Comprar tu auto</Link>
          <Link to="/vender" className={itemMenu}>Vender tu auto</Link>
          <Link to="/creditos" className={itemMenu}>Financiación</Link>
          {esComprador && (
            <Link to="/mensajes" className={itemMenu}>
              Mis mensajes
              <BadgeNoLeidos cantidad={noLeidos} />
            </Link>
          )}
          {esAdmin && <Link to="/admin" className={itemMenu}>Administración</Link>}
          <div className="mt-3 flex flex-col gap-2 border-t border-black/5 pt-4">
            {usuario ? (
              <button onClick={logout} className="rounded-full bg-navy px-5 py-3 text-sm font-bold text-white transition hover:bg-bronze">
                Cerrar sesión
              </button>
            ) : (
              <>
                <Link to="/registro" className="rounded-full bg-navy px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-bronze">
                  Crear cuenta
                </Link>
                <Link to="/login" className="rounded-full border border-navy/15 px-5 py-3 text-center text-sm font-bold text-navy-dark transition hover:border-bronze hover:text-bronze">
                  Ingresar
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
