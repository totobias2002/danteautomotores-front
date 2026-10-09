import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'

export default function Footer() {
  return (
    <footer className="bg-[#0b1b2b] px-6 pb-24 pt-10 text-slate-400 sm:pb-10 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <Logo variant="light" />
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold sm:text-xs">
          <Link to="/autos" className="transition hover:text-bronze-light">Comprar un auto</Link>
          <Link to="/favoritos" className="transition hover:text-bronze-light">Favoritos</Link>
          <Link to="/login" className="transition hover:text-bronze-light">Ingresar</Link>
          <Link to="/registro" className="transition hover:text-bronze-light">Crear cuenta</Link>
        </div>
      </div>
      <div className="mx-auto mt-8 flex max-w-7xl flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-5 text-xs text-slate-400 sm:text-[11px]">
        <span>© {new Date().getFullYear()} DanteAutomotores. Todos los derechos reservados.</span>
        <span className="flex flex-wrap gap-4">
          <Link to="/privacidad" className="transition hover:text-slate-300">Política de privacidad</Link>
          <Link to="/creditos" className="transition hover:text-slate-300">Créditos de imágenes</Link>
        </span>
      </div>
    </footer>
  )
}
