import { ChevronLeft, ChevronRight } from 'lucide-react'
import { paginasVisibles } from '../utils/catalogoParams.js'

const botonBase = 'flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-xs font-bold transition'

export default function Paginador({ pagina, totalPaginas, onCambiar }) {
  if (!totalPaginas || totalPaginas <= 1) return null

  return (
    <nav aria-label="Paginación" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onCambiar(pagina - 1)}
        disabled={pagina <= 1}
        className={`${botonBase} gap-1 border-slate-200 text-slate-600 hover:border-bronze/40 hover:text-bronze disabled:pointer-events-none disabled:opacity-40`}
      >
        <ChevronLeft className="h-3.5 w-3.5" /> Anterior
      </button>

      {paginasVisibles(pagina, totalPaginas).map((item, i) =>
        item === '…' ? (
          <span key={`salto-${i}`} aria-hidden="true" className="px-1 text-xs font-bold text-slate-500">
            …
          </span>
        ) : item === pagina ? (
          // La página actual no es clickeable: se marca con aria-current para lectores de pantalla.
          <span key={item} aria-current="page" aria-label={`Página ${item}, actual`} className={`${botonBase} border-bronze bg-bronze text-white`}>
            {item}
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onCambiar(item)}
            aria-label={`Ir a la página ${item}`}
            className={`${botonBase} border-slate-200 text-slate-600 hover:border-bronze/40 hover:text-bronze`}
          >
            {item}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onCambiar(pagina + 1)}
        disabled={pagina >= totalPaginas}
        className={`${botonBase} gap-1 border-slate-200 text-slate-600 hover:border-bronze/40 hover:text-bronze disabled:pointer-events-none disabled:opacity-40`}
      >
        Siguiente <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </nav>
  )
}
