import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api.js'
import PublicacionCard from '../components/PublicacionCard.jsx'

export default function FavoritosPage() {
  const [favoritos, setFavoritos] = useState([])

  useEffect(() => {
    api.get('/favoritos').then((res) => setFavoritos(res.data)).catch(() => {})
  }, [])

  const quitar = async (publicacionId) => {
    await api.delete(`/favoritos/${publicacionId}`)
    setFavoritos((prev) => prev.filter((f) => f.publicacion.id !== publicacionId))
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Tus favoritos</h1>
      {favoritos.length === 0 && <p className="text-gray-500">Todavía no guardaste ningún auto.</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {favoritos.map((f) => (
          <div key={f.id}>
            <Link to={`/publicaciones/${f.publicacion.id}`}>
              <PublicacionCard publicacion={f.publicacion} />
            </Link>
            <button onClick={() => quitar(f.publicacion.id)} className="text-sm text-gray-500 mt-1">
              Quitar de favoritos
            </button>
          </div>
        ))}
      </div>
    </main>
  )
}
