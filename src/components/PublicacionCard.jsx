import { ArrowRight, MapPin, Star } from 'lucide-react'

const estadoEstilos = {
  RESERVADO: 'bg-yellow-100 text-yellow-800',
  VENDIDO: 'bg-slate-200 text-slate-700',
}

const estadoTexto = {
  RESERVADO: 'Reservado',
  VENDIDO: 'Vendido',
}

const formatoNumero = (valor) => new Intl.NumberFormat('es-AR').format(valor)

export default function PublicacionCard({ publicacion }) {
  const foto = publicacion.fotos?.[0]?.url

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-500 hover:-translate-y-1.5 hover:border-bronze/30 hover:shadow-2xl hover:shadow-navy/10">
      <div className="relative h-52 overflow-hidden bg-[#d7d9d7]">
        {foto ? (
          <img
            src={foto}
            alt={`${publicacion.marca} ${publicacion.modelo}`}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">Sin foto</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-navy">
          Verificado
        </span>
        <button
          aria-label="Guardar auto"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-navy transition hover:bg-bronze hover:text-white"
        >
          ♡
        </button>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-bold tracking-tight text-navy-dark">{publicacion.marca} {publicacion.modelo}</p>
            <p className="mt-1 text-xs text-slate-400">
              {publicacion.anio}
              <span className="mx-1.5">·</span>
              {publicacion.kilometraje ? `${formatoNumero(publicacion.kilometraje)} km` : 'Sin datos de km'}
              {publicacion.estado && estadoTexto[publicacion.estado] && (
                <span className={`ml-2 rounded px-1.5 py-0.5 text-[10px] font-semibold ${estadoEstilos[publicacion.estado]}`}>
                  {estadoTexto[publicacion.estado]}
                </span>
              )}
            </p>
          </div>
          <Star className="h-4 w-4 shrink-0 fill-bronze text-bronze" />
        </div>
        <div className="mt-5 flex items-end justify-between">
          <div>
            <p className="text-xl font-bold text-navy-dark">{publicacion.moneda} {formatoNumero(publicacion.precio)}</p>
            {publicacion.agenciaNombre && (
              <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                <MapPin className="h-3 w-3 text-bronze" /> {publicacion.agenciaNombre}
              </p>
            )}
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-white transition group-hover:bg-bronze">
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </article>
  )
}
