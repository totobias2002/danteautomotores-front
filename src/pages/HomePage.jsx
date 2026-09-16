import { useEffect, useState } from 'react'
import api from '../services/api.js'
import PublicacionCard from '../components/PublicacionCard.jsx'

export default function HomePage() {
  const [publicaciones, setPublicaciones] = useState([])

  useEffect(() => {
    api.get('/publicaciones').then((res) => setPublicaciones(res.data)).catch(() => {})
  }, [])

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Autos en venta</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {publicaciones.map((p) => (
          <PublicacionCard key={p.id} publicacion={p} />
        ))}
      </div>
    </main>
  )
}
