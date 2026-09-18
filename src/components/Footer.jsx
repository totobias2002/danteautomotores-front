import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'

export default function Footer() {
  return (
    <footer className="bg-[#0b1b2b] px-6 py-10 text-slate-400 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <Logo variant="light" />
        <div className="flex flex-wrap gap-6 text-xs font-semibold">
          <Link to="/" className="transition hover:text-bronze-light">Comprar un auto</Link>
          <Link to="/favoritos" className="transition hover:text-bronze-light">Favoritos</Link>
          <Link to="/login" className="transition hover:text-bronze-light">Ingresar</Link>
          <Link to="/registro" className="transition hover:text-bronze-light">Crear cuenta</Link>
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-7xl border-t border-white/10 pt-5 text-[10px] text-slate-500">
        © {new Date().getFullYear()} DanteAutomotores. Todos los derechos reservados.
      </div>
    </footer>
  )
}
