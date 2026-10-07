import { useState } from 'react'
import api from '../services/api.js'
import { mensajeDeError } from '../utils/errores.js'

const ESTADOS = [
  { value: 'DISPONIBLE', label: 'Disponible' },
  { value: 'RESERVADO', label: 'Reservado' },
  { value: 'VENDIDO', label: 'Vendido' },
]

// Cambia el estado del auto (disponible, reservado o vendido) en el momento, igual que el listado del panel.
// `onCambio` recibe la publicación que devuelve el servidor.
export default function SelectorDeEstado({ publicacionId, estado, onCambio }) {
  const [cambiando, setCambiando] = useState(false)
  const [error, setError] = useState('')

  const cambiar = async (nuevo) => {
    if (cambiando || nuevo === estado) return
    setCambiando(true)
    setError('')
    try {
      const { data } = await api.patch(`/publicaciones/${publicacionId}/estado`, { estado: nuevo })
      onCambio?.(data)
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo cambiar el estado.'))
    } finally {
      setCambiando(false)
    }
  }

  return (
    <div>
      <label className="flex flex-wrap items-center gap-3 text-sm font-semibold text-navy-dark">
        Estado del auto
        <select
          value={estado}
          disabled={cambiando}
          onChange={(e) => cambiar(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-navy-dark outline-none focus:border-bronze disabled:opacity-60"
        >
          {ESTADOS.map((e) => (
            <option key={e.value} value={e.value}>
              {e.label}
            </option>
          ))}
        </select>
      </label>
      {error && (
        <p role="alert" className="mt-1 text-sm font-semibold text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
