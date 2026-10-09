import { MapPin, ShieldCheck, TrendingUp } from 'lucide-react'
import { TRANSFORMACION_CARD, urlMiniatura } from '../utils/cloudinary.js'
import { ESTADO, TRANSMISION, ZONA, simboloMoneda } from '../utils/etiquetas.js'

const formatoNumero = (valor) => new Intl.NumberFormat('es-AR').format(valor)

export default function PublicacionCard({ publicacion }) {
  // El listado público trae fotoPortada; el fallback a fotos[0] mantiene andando las pantallas que reciben la respuesta completa.
  const foto = urlMiniatura(publicacion.fotoPortada ?? publicacion.fotos?.[0]?.url, TRANSFORMACION_CARD)
  // Solo RESERVADO y VENDIDO llevan etiqueta de estado; un auto disponible muestra Oferta o Verificado.
  const estadoBadge = publicacion.estado === 'DISPONIBLE' ? null : ESTADO[publicacion.estado]
  const vendido = publicacion.estado === 'VENDIDO'
  // La oferta la decide el servidor (oferta=true); el front nunca la deduce comparando precios.
  const mostrarOferta = publicacion.oferta === true && publicacion.precioAnterior != null
  const simbolo = simboloMoneda(publicacion.moneda)
  const zona = ZONA[publicacion.agenciaZona]
  const lugar = [zona, publicacion.agenciaNombre].filter(Boolean).join(' · ')

  const specs = [
    publicacion.anio,
    publicacion.kilometraje != null ? `${formatoNumero(publicacion.kilometraje)} km` : null,
    TRANSMISION[publicacion.transmision],
  ].filter(Boolean)

  return (
    <article className={`group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-500 hover:-translate-y-1.5 hover:border-bronze/30 hover:shadow-2xl hover:shadow-navy/10${vendido ? ' opacity-75' : ''}`}>
      <div className="relative h-52 overflow-hidden bg-[#d7d9d7]">
        {foto ? (
          <img
            src={foto}
            alt={`${publicacion.marca} ${publicacion.modelo}`}
            loading="lazy"
            width={640}
            height={420}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">Sin foto</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />

        <span
          className={`absolute left-4 top-4 flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider shadow-sm ${
            estadoBadge ? estadoBadge.clase : mostrarOferta ? 'bg-bronze text-white' : 'bg-white/90 text-navy'
          }`}
        >
          {estadoBadge ? (
            estadoBadge.texto
          ) : mostrarOferta ? (
            <>
              <TrendingUp className="h-3 w-3" /> Oferta
            </>
          ) : (
            <>
              <ShieldCheck className="h-3 w-3" /> Verificado
            </>
          )}
        </span>
      </div>

      <div className="p-5">
        <p className="text-lg font-bold tracking-tight text-navy-dark">
          {publicacion.marca} <span className="text-bronze">•</span> {publicacion.modelo}
        </p>
        <p className="mt-1 text-sm text-slate-500">{specs.join(' · ')}</p>

        <div className="mt-4 border-t border-slate-100 pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Precio de contado</p>
          {mostrarOferta && (
            <p className="mt-0.5 text-sm font-semibold text-slate-500 line-through">
              {simbolo} {formatoNumero(publicacion.precioAnterior)}
            </p>
          )}
          <p className="mt-0.5 text-2xl font-bold text-navy-dark">
            {simbolo} {formatoNumero(publicacion.precio)}
          </p>
        </div>

        {lugar && (
          <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <MapPin className="h-3.5 w-3.5 text-bronze" /> {lugar}
          </p>
        )}
      </div>
    </article>
  )
}
