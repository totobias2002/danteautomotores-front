import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api.js'

export default function AdminDashboardPage() {
  const [agencias, setAgencias] = useState([])
  const [publicaciones, setPublicaciones] = useState([])
  const [nuevaAgencia, setNuevaAgencia] = useState({
    nombre: '', emailContacto: '', direccion: '', telefonoContacto: '', descripcion: '', logo: '',
  })
  const [error, setError] = useState('')

  const cargar = () => {
    api.get('/agencias').then((res) => setAgencias(res.data)).catch(() => {})
    api.get('/publicaciones', { params: { estado: 'DISPONIBLE' } }).then((res) => setPublicaciones(res.data)).catch(() => {})
  }

  useEffect(() => {
    cargar()
  }, [])

  const crearAgencia = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/agencias', nuevaAgencia)
      setNuevaAgencia({ nombre: '', emailContacto: '', direccion: '', telefonoContacto: '', descripcion: '', logo: '' })
      cargar()
    } catch {
      setError('No se pudo crear la agencia')
    }
  }

  const eliminarAgencia = async (id) => {
    await api.delete(`/agencias/${id}`)
    cargar()
  }

  const cambiarEstado = async (id, estado) => {
    await api.patch(`/publicaciones/${id}/estado`, { estado })
    cargar()
  }

  const eliminarPublicacion = async (id) => {
    await api.delete(`/publicaciones/${id}`)
    cargar()
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Panel de administración</h1>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3">Agencias</h2>
        <form onSubmit={crearAgencia} className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 max-w-2xl">
          <input placeholder="Nombre" value={nuevaAgencia.nombre} onChange={(e) => setNuevaAgencia({ ...nuevaAgencia, nombre: e.target.value })} className="border rounded px-3 py-2" required />
          <input placeholder="Email de contacto" value={nuevaAgencia.emailContacto} onChange={(e) => setNuevaAgencia({ ...nuevaAgencia, emailContacto: e.target.value })} className="border rounded px-3 py-2" required />
          <input placeholder="Dirección" value={nuevaAgencia.direccion} onChange={(e) => setNuevaAgencia({ ...nuevaAgencia, direccion: e.target.value })} className="border rounded px-3 py-2" />
          <input placeholder="Teléfono" value={nuevaAgencia.telefonoContacto} onChange={(e) => setNuevaAgencia({ ...nuevaAgencia, telefonoContacto: e.target.value })} className="border rounded px-3 py-2" />
          <input placeholder="Logo (URL)" value={nuevaAgencia.logo} onChange={(e) => setNuevaAgencia({ ...nuevaAgencia, logo: e.target.value })} className="border rounded px-3 py-2" />
          <input placeholder="Descripción" value={nuevaAgencia.descripcion} onChange={(e) => setNuevaAgencia({ ...nuevaAgencia, descripcion: e.target.value })} className="border rounded px-3 py-2" />
          <button type="submit" className="bg-black text-white rounded px-3 py-2 sm:col-span-2">Crear agencia</button>
        </form>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <ul className="flex flex-col gap-2">
          {agencias.map((a) => (
            <li key={a.id} className="flex items-center justify-between border rounded px-3 py-2">
              <span>{a.nombre} <span className="text-gray-500 text-sm">/{a.slug}</span></span>
              <button onClick={() => eliminarAgencia(a.id)} className="text-sm text-red-600">Eliminar</button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Publicaciones</h2>
          <Link to="/admin/publicaciones/nueva" className="bg-black text-white rounded px-3 py-2 text-sm">
            + Nueva publicación
          </Link>
        </div>
        <ul className="flex flex-col gap-2">
          {publicaciones.map((p) => (
            <li key={p.id} className="flex items-center justify-between border rounded px-3 py-2">
              <span>{p.marca} {p.modelo} · {p.anio} — {p.moneda} {p.precio} ({p.agenciaNombre})</span>
              <div className="flex items-center gap-2">
                <select value={p.estado} onChange={(e) => cambiarEstado(p.id, e.target.value)} className="border rounded px-2 py-1 text-sm">
                  <option value="DISPONIBLE">Disponible</option>
                  <option value="RESERVADO">Reservado</option>
                  <option value="VENDIDO">Vendido</option>
                </select>
                <button onClick={() => eliminarPublicacion(p.id)} className="text-sm text-red-600">Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
