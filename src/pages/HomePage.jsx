import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api.js'
import PublicacionCard from '../components/PublicacionCard.jsx'

export default function HomePage() {
  const [publicaciones, setPublicaciones] = useState([])
  const [filtros, setFiltros] = useState({ marca: '', modelo: '', precioMax: '' })
  const [cargando, setCargando] = useState(true)

  const buscar = (params = {}) => {
    setCargando(true)
    api.get('/publicaciones', { params })
      .then((res) => setPublicaciones(res.data))
      .catch(() => setPublicaciones([]))
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    buscar()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    const params = {}
    if (filtros.marca) params.marca = filtros.marca
    if (filtros.modelo) params.modelo = filtros.modelo
    if (filtros.precioMax) params.precioMax = filtros.precioMax
    buscar(params)
  }

  return (
    <>
      <section className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Encontrá tu próximo auto</h1>
          <p className="text-slate-300 mb-8">Autos usados de agencias verificadas, todo en un solo lugar.</p>
          <form onSubmit={handleSubmit} className="bg-white rounded-lg p-3 flex flex-col sm:flex-row gap-2 max-w-3xl mx-auto">
            <input
              placeholder="Marca (ej. Chery)"
              value={filtros.marca}
              onChange={(e) => setFiltros({ ...filtros, marca: e.target.value })}
              className="flex-1 px-3 py-2 rounded text-slate-900"
            />
            <input
              placeholder="Modelo"
              value={filtros.modelo}
              onChange={(e) => setFiltros({ ...filtros, modelo: e.target.value })}
              className="flex-1 px-3 py-2 rounded text-slate-900"
            />
            <input
              type="number"
              placeholder="Precio máximo"
              value={filtros.precioMax}
              onChange={(e) => setFiltros({ ...filtros, precioMax: e.target.value })}
              className="flex-1 px-3 py-2 rounded text-slate-900"
            />
            <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2 rounded">
              Buscar
            </button>
          </form>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-xl font-bold mb-4">
          {cargando ? 'Buscando...' : `${publicaciones.length} autos encontrados`}
        </h2>
        {!cargando && publicaciones.length === 0 && (
          <p className="text-gray-500">No encontramos autos con esos filtros.</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {publicaciones.map((p) => (
            <Link key={p.id} to={`/publicaciones/${p.id}`}>
              <PublicacionCard publicacion={p} />
            </Link>
          ))}
        </div>
      </main>
    </>
  )
}
