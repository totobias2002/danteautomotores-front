import { Link } from 'react-router-dom'
import { Car } from 'lucide-react'

// No muestra ni lee la ruta pedida: un link armado a mano no debe poder poner texto propio
// (por ejemplo un teléfono falso) en una página con la marca del sitio.
export default function NoEncontradaPage() {
  return (
    <main className="mx-auto flex max-w-2xl animate-fade-in-up flex-col items-center px-6 py-24 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-bronze/10 text-bronze">
        <Car className="h-7 w-7" aria-hidden="true" />
      </div>
      <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-bronze">Error 404</p>
      <h1 className="mt-2 font-heading text-3xl text-navy-dark">No encontramos esta página</h1>
      <p className="mt-3 text-sm text-slate-500">
        Puede que el link esté mal escrito o que la página ya no exista.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          to="/autos"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-bronze px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-bronze/20 transition hover:-translate-y-0.5 hover:bg-bronze-light"
        >
          Ver autos
        </Link>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-full bg-navy px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-navy/15 transition hover:-translate-y-0.5 hover:bg-bronze"
        >
          Ir al inicio
        </Link>
      </div>
    </main>
  )
}
