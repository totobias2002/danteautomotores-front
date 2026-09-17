import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../services/api.js'
import PublicacionCard from '../components/PublicacionCard.jsx'

export default function AgenciaPage() {
  const { slug } = useParams()
  const [agencia, setAgencia] = useState(null)
  const [publicaciones, setPublicaciones] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/agencias/${slug}`)
      .then((res) => {
        setAgencia(res.data)
        return api.get('/publicaciones', { params: { agenciaId: res.data.id } })
      })
      .then((res) => setPublicaciones(res?.data ?? []))
      .catch(() => setError('No se encontró la agencia'))
  }, [slug])

  if (error) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-6">
        <p className="text-gray-500">{error}</p>
      </main>
    )
  }

  if (!agencia) return null

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        {agencia.logo && <img src={agencia.logo} alt={agencia.nombre} className="h-16 w-16 object-contain" />}
        <div>
          <h1 className="text-2xl font-bold">{agencia.nombre}</h1>
          <p className="text-sm text-gray-600">{agencia.direccion}</p>
          <p className="text-sm text-gray-600">{agencia.telefonoContacto} · {agencia.emailContacto}</p>
        </div>
      </div>
      {agencia.descripcion && <p className="mb-6 text-gray-700">{agencia.descripcion}</p>}
      <h2 className="text-lg font-semibold mb-3">Autos disponibles</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {publicaciones.map((p) => (
          <Link key={p.id} to={`/publicaciones/${p.id}`}>
            <PublicacionCard publicacion={p} />
          </Link>
        ))}
      </div>
    </main>
  )
}
