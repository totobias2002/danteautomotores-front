import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function PublicacionDetallePage() {
  const { id } = useParams()
  const { usuario } = useAuth()
  const [publicacion, setPublicacion] = useState(null)
  const [fotoActiva, setFotoActiva] = useState(0)
  const [consulta, setConsulta] = useState({ nombreComprador: '', emailComprador: '', telefonoComprador: '', mensaje: '' })
  const [enviado, setEnviado] = useState(false)
  const [favoritoOk, setFavoritoOk] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/publicaciones/${id}`).then((res) => setPublicacion(res.data)).catch(() => setError('No se encontró la publicación'))
  }, [id])

  const handleConsultaSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/consultas', { publicacionId: Number(id), ...consulta })
      setEnviado(true)
    } catch {
      setError('No se pudo enviar la consulta')
    }
  }

  const agregarFavorito = async () => {
    try {
      await api.post(`/favoritos/${id}`)
      setFavoritoOk(true)
    } catch {
      setFavoritoOk(true) // probablemente ya estaba en favoritos
    }
  }

  if (error) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-6">
        <p className="text-gray-500">{error}</p>
      </main>
    )
  }

  if (!publicacion) return null

  const fotos = publicacion.fotos ?? []

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3">
        {fotos[fotoActiva] && <img src={fotos[fotoActiva].url} alt="" className="w-full h-full object-cover" />}
      </div>
      {fotos.length > 1 && (
        <div className="flex gap-2 mb-6">
          {fotos.map((f, i) => (
            <button
              key={f.id}
              onClick={() => setFotoActiva(i)}
              className={`h-14 w-14 rounded overflow-hidden border ${i === fotoActiva ? 'border-black' : 'border-gray-200'}`}
            >
              <img src={f.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <h1 className="text-2xl font-bold">{publicacion.marca} {publicacion.modelo} · {publicacion.anio}</h1>
      <p className="text-xl text-gray-800 mb-4">{publicacion.moneda} {publicacion.precio}</p>
      <p className="text-sm text-gray-600 mb-1">
        {publicacion.kilometraje ? `${publicacion.kilometraje} km · ` : ''}
        {publicacion.transmision} · {publicacion.combustible} · {publicacion.condicion}
      </p>
      <p className="mb-4 text-gray-700">{publicacion.descripcion}</p>
      <p className="text-sm text-gray-500 mb-6">Vendido por {publicacion.agenciaNombre}</p>

      {usuario && (
        <button onClick={agregarFavorito} className="mb-6 border rounded px-3 py-2 text-sm">
          {favoritoOk ? 'Guardado en favoritos ✓' : 'Guardar en favoritos'}
        </button>
      )}

      <h2 className="text-lg font-semibold mb-3">Consultar por este auto</h2>
      {enviado ? (
        <p className="text-green-700">¡Listo! La agencia se va a poner en contacto.</p>
      ) : (
        <form onSubmit={handleConsultaSubmit} className="flex flex-col gap-3 max-w-sm">
          <input type="text" placeholder="Tu nombre" value={consulta.nombreComprador} onChange={(e) => setConsulta({ ...consulta, nombreComprador: e.target.value })} className="border rounded px-3 py-2" required />
          <input type="email" placeholder="Tu email" value={consulta.emailComprador} onChange={(e) => setConsulta({ ...consulta, emailComprador: e.target.value })} className="border rounded px-3 py-2" required />
          <input type="text" placeholder="Tu teléfono (opcional)" value={consulta.telefonoComprador} onChange={(e) => setConsulta({ ...consulta, telefonoComprador: e.target.value })} className="border rounded px-3 py-2" />
          <textarea placeholder="Mensaje" value={consulta.mensaje} onChange={(e) => setConsulta({ ...consulta, mensaje: e.target.value })} className="border rounded px-3 py-2" required />
          <button type="submit" className="bg-black text-white rounded px-3 py-2">Enviar consulta</button>
        </form>
      )}
    </main>
  )
}
