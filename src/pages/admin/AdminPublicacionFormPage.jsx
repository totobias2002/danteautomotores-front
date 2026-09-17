import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api.js'

export default function AdminPublicacionFormPage() {
  const [agencias, setAgencias] = useState([])
  const [form, setForm] = useState({
    agenciaId: '', marca: '', modelo: '', anio: '', precio: '', moneda: 'ARS',
    kilometraje: '', transmision: 'MANUAL', combustible: 'NAFTA', color: '', condicion: 'BUENO', descripcion: '',
  })
  const [publicacionCreada, setPublicacionCreada] = useState(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/agencias').then((res) => setAgencias(res.data)).catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const { data } = await api.post('/publicaciones', {
        ...form,
        agenciaId: Number(form.agenciaId),
        anio: Number(form.anio),
        precio: Number(form.precio),
        kilometraje: form.kilometraje ? Number(form.kilometraje) : null,
      })
      setPublicacionCreada(data)
    } catch {
      setError('No se pudo crear la publicación. Revisá los datos.')
    }
  }

  const subirFoto = async (e) => {
    const archivo = e.target.files[0]
    if (!archivo) return
    const formData = new FormData()
    formData.append('archivo', archivo)
    await api.post(`/publicaciones/${publicacionCreada.id}/fotos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }

  if (publicacionCreada) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold mb-4">Publicación creada</h1>
        <p className="mb-4 text-gray-600">Ahora podés subirle fotos (una por una). Necesita Cloudinary configurado en el backend.</p>
        <input type="file" accept="image/*" onChange={subirFoto} className="mb-4" />
        <button onClick={() => navigate('/admin')} className="bg-black text-white rounded px-3 py-2">
          Volver al panel
        </button>
      </main>
    )
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">Cargar publicación</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <select value={form.agenciaId} onChange={(e) => setForm({ ...form, agenciaId: e.target.value })} className="border rounded px-3 py-2 sm:col-span-2" required>
          <option value="">Seleccionar agencia</option>
          {agencias.map((a) => (
            <option key={a.id} value={a.id}>{a.nombre}</option>
          ))}
        </select>
        <input placeholder="Marca" value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} className="border rounded px-3 py-2" required />
        <input placeholder="Modelo" value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} className="border rounded px-3 py-2" required />
        <input type="number" placeholder="Año" value={form.anio} onChange={(e) => setForm({ ...form, anio: e.target.value })} className="border rounded px-3 py-2" required />
        <input type="number" placeholder="Precio" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} className="border rounded px-3 py-2" required />
        <input placeholder="Moneda" value={form.moneda} onChange={(e) => setForm({ ...form, moneda: e.target.value })} className="border rounded px-3 py-2" />
        <input type="number" placeholder="Kilometraje" value={form.kilometraje} onChange={(e) => setForm({ ...form, kilometraje: e.target.value })} className="border rounded px-3 py-2" />
        <select value={form.transmision} onChange={(e) => setForm({ ...form, transmision: e.target.value })} className="border rounded px-3 py-2">
          <option value="MANUAL">Manual</option>
          <option value="AUTOMATICA">Automática</option>
        </select>
        <select value={form.combustible} onChange={(e) => setForm({ ...form, combustible: e.target.value })} className="border rounded px-3 py-2">
          <option value="NAFTA">Nafta</option>
          <option value="DIESEL">Diesel</option>
          <option value="GNC">GNC</option>
          <option value="HIBRIDO">Híbrido</option>
          <option value="ELECTRICO">Eléctrico</option>
        </select>
        <input placeholder="Color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="border rounded px-3 py-2" />
        <select value={form.condicion} onChange={(e) => setForm({ ...form, condicion: e.target.value })} className="border rounded px-3 py-2">
          <option value="EXCELENTE">Excelente</option>
          <option value="MUY_BUENO">Muy bueno</option>
          <option value="BUENO">Bueno</option>
          <option value="REGULAR">Regular</option>
        </select>
        <textarea placeholder="Descripción" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="border rounded px-3 py-2 sm:col-span-2" />
        {error && <p className="text-red-600 text-sm sm:col-span-2">{error}</p>}
        <button type="submit" className="bg-black text-white rounded px-3 py-2 sm:col-span-2">Crear publicación</button>
      </form>
    </main>
  )
}
