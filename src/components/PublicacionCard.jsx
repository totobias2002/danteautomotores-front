import { MapPin, ShieldCheck, TrendingUp } from 'lucide-react'

const ESTADO_BADGE = {
  RESERVADO: { texto: 'Reservado', clase: 'bg-amber-100 text-amber-800' },
  VENDIDO: { texto: 'Vendido', clase: 'bg-slate-200 text-slate-700' },
}

const formatoNumero = (valor) => new Intl.NumberFormat('es-AR').format(valor)

export default function PublicacionCard({ publicacion }) {
  const foto = publicacion.fotos?.[0]?.url
  const estadoBadge = ESTADO_BADGE[publicacion.estado]

  const specs = [
    publicacion.anio,
    publicacion.kilometraje != null ? `${formatoNumero(publicacion.kilometraje)} km` : null,
    publicacion.mecanica,
  ].filter(Boolean)

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

        <span
          className={`absolute left-4 top-4 flex items-center gap-1 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider shadow-sm ${
            estadoBadge ? estadoBadge.clase : publicacion.oferta ? 'bg-bronze text-white' : 'bg-white/90 text-navy'
          }`}
        >
          {estadoBadge ? (
            estadoBadge.texto
          ) : publicacion.oferta ? (
            <>
              <TrendingUp className="h-3 w-3" /> Oferta
            </>
          ) : (
            <>
              <ShieldCheck className="h-3 w-3" /> Verificado
            </>
          )}
        </span>

        <button
          aria-label="Guardar auto"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-navy transition hover:bg-bronze hover:text-white"
        >
          ♡
        </button>
      </div>

      <div className="p-5">
        <p className="text-lg font-bold tracking-tight text-navy-dark">
          {publicacion.marca} <span className="text-bronze">•</span> {publicacion.modelo}
        </p>
        <p className="mt-1 text-xs text-slate-400">{specs.join(' · ')}</p>

        <div className="mt-4 border-t border-slate-100 pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Precio de contado</p>
          <p className="mt-0.5 text-2xl font-bold text-navy-dark">$ {formatoNumero(publicacion.precio)}</p>
        </div>

        {(publicacion.ubicacion || publicacion.agenciaNombre) && (
          <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <MapPin className="h-3.5 w-3.5 text-bronze" /> {publicacion.ubicacion || publicacion.agenciaNombre}
          </p>
        )}
      </div>
    </article>
  )
}
