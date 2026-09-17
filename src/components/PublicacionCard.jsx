const estadoEstilos = {
  DISPONIBLE: 'bg-green-100 text-green-800',
  RESERVADO: 'bg-yellow-100 text-yellow-800',
  VENDIDO: 'bg-gray-200 text-gray-700',
}

const estadoTexto = {
  DISPONIBLE: 'Disponible',
  RESERVADO: 'Reservado',
  VENDIDO: 'Vendido',
}

const formatoNumero = (valor) => new Intl.NumberFormat('es-AR').format(valor)

export default function PublicacionCard({ publicacion }) {
  const foto = publicacion.fotos?.[0]?.url

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-white">
      <div className="aspect-video bg-gray-100 relative">
        {foto ? (
          <img src={foto} alt={`${publicacion.marca} ${publicacion.modelo}`} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Sin foto</div>
        )}
        {publicacion.estado && publicacion.estado !== 'DISPONIBLE' && (
          <span className={`absolute top-2 left-2 text-xs font-medium px-2 py-1 rounded ${estadoEstilos[publicacion.estado]}`}>
            {estadoTexto[publicacion.estado]}
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="font-semibold text-slate-900">{publicacion.marca} {publicacion.modelo}</p>
        <p className="text-sm text-gray-500 mb-1">
          {publicacion.anio} · {publicacion.kilometraje ? `${formatoNumero(publicacion.kilometraje)} km` : 'Sin datos de km'}
        </p>
        <p className="font-bold text-slate-900">{publicacion.moneda} {formatoNumero(publicacion.precio)}</p>
      </div>
    </div>
  )
}
