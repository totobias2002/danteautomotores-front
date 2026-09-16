export default function PublicacionCard({ publicacion }) {
  const foto = publicacion.fotos?.[0]?.url

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="aspect-video bg-gray-100">
        {foto && <img src={foto} alt={`${publicacion.marca} ${publicacion.modelo}`} className="w-full h-full object-cover" />}
      </div>
      <div className="p-3">
        <p className="font-semibold">{publicacion.marca} {publicacion.modelo} · {publicacion.anio}</p>
        <p className="text-sm text-gray-600">{publicacion.moneda} {publicacion.precio}</p>
      </div>
    </div>
  )
}
