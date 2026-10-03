import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Pencil, Plus, Trash2 } from 'lucide-react'
import api from '../../services/api.js'
import { mensajeDeError } from '../../utils/errores.js'

const AGENCIA_INICIAL = {
  nombre: '',
  emailContacto: '',
  direccion: '',
  telefonoContacto: '',
  descripcion: '',
  logo: '',
}

const ESTADOS = [
  { value: 'DISPONIBLE', label: 'Disponible' },
  { value: 'RESERVADO', label: 'Reservado' },
  { value: 'VENDIDO', label: 'Vendido' },
]

export default function AdminDashboardPage() {
  const [agencias, setAgencias] = useState([])
  const [publicaciones, setPublicaciones] = useState([])
  const [nuevaAgencia, setNuevaAgencia] = useState(AGENCIA_INICIAL)
  const [mostrarFormAgencia, setMostrarFormAgencia] = useState(false)
  const [agenciaEditando, setAgenciaEditando] = useState(null)
  const [error, setError] = useState('')
  const [errorEdicion, setErrorEdicion] = useState('')
  const [errorListado, setErrorListado] = useState('')

  const cargar = () => {
    api.get('/agencias').then((res) => setAgencias(res.data)).catch(() => {})
    api.get('/admin/publicaciones')
      .then((res) => {
        setPublicaciones(res.data)
        setErrorListado('')
      })
      .catch((err) => setErrorListado(mensajeDeError(err, 'No se pudo cargar el listado de autos.')))
  }

  useEffect(() => {
    cargar()
  }, [])

  const crearAgencia = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/agencias', nuevaAgencia)
      setNuevaAgencia(AGENCIA_INICIAL)
      setMostrarFormAgencia(false)
      cargar()
    } catch {
      setError('No se pudo crear la agencia')
    }
  }

  const eliminarAgencia = async (id) => {
    await api.delete(`/agencias/${id}`)
    cargar()
  }

  const comenzarEdicionAgencia = (a) => {
    setErrorEdicion('')
    setMostrarFormAgencia(false)
    setAgenciaEditando({
      id: a.id,
      nombre: a.nombre ?? '',
      emailContacto: a.emailContacto ?? '',
      direccion: a.direccion ?? '',
      telefonoContacto: a.telefonoContacto ?? '',
      descripcion: a.descripcion ?? '',
      logo: a.logo ?? '',
    })
  }

  const guardarEdicionAgencia = async (e) => {
    e.preventDefault()
    setErrorEdicion('')
    const { id, ...datos } = agenciaEditando
    try {
      await api.put(`/agencias/${id}`, datos)
      setAgenciaEditando(null)
      cargar()
    } catch {
      setErrorEdicion('No se pudieron guardar los cambios.')
    }
  }

  const cambiarEstado = async (id, estado) => {
    await api.patch(`/publicaciones/${id}/estado`, { estado })
    cargar()
  }

  const eliminarPublicacion = async (id) => {
    await api.delete(`/publicaciones/${id}`)
    cargar()
  }

  const campoAgencia = (nombre) => ({
    value: nuevaAgencia[nombre],
    onChange: (e) => setNuevaAgencia({ ...nuevaAgencia, [nombre]: e.target.value }),
  })

  return (
    <main className="min-h-screen bg-[#fafaf9] py-10">
      <div className="mx-auto max-w-5xl px-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-bronze">Panel</p>
        <h1 className="mt-2 font-heading text-3xl text-navy-dark">Administración</h1>
        <p className="mt-2 text-sm text-slate-500">Gestioná las agencias y los autos publicados en el marketplace.</p>

        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-navy-dark">Agencias</h2>
            <button
              type="button"
              onClick={() => setMostrarFormAgencia((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-navy-dark transition hover:border-bronze"
            >
              <Plus className="h-3.5 w-3.5" /> {mostrarFormAgencia ? 'Cancelar' : 'Nueva agencia'}
            </button>
          </div>

          {mostrarFormAgencia && (
            <form onSubmit={crearAgencia} className="mb-6 rounded-2xl border border-slate-200 bg-white p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <CampoAgencia label="Nombre" required {...campoAgencia('nombre')} />
                <CampoAgencia label="Email de contacto" type="email" required {...campoAgencia('emailContacto')} />
                <CampoAgencia label="Dirección" {...campoAgencia('direccion')} />
                <CampoAgencia label="Teléfono" {...campoAgencia('telefonoContacto')} />
                <CampoAgencia label="Logo (URL)" {...campoAgencia('logo')} />
                <CampoAgencia label="Descripción" {...campoAgencia('descripcion')} />
              </div>
              {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
              <button
                type="submit"
                className="mt-4 rounded-xl bg-bronze px-4 py-3 text-sm font-bold text-white transition hover:bg-navy"
              >
                Crear agencia
              </button>
            </form>
          )}

          {agencias.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 px-6 py-8 text-center text-sm text-slate-400">
              Todavía no hay agencias cargadas.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {agencias.map((a) =>
                agenciaEditando?.id === a.id ? (
                  <li key={a.id} className="rounded-2xl border border-bronze/40 bg-white p-5">
                    <form onSubmit={guardarEdicionAgencia}>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <CampoAgencia
                          label="Nombre"
                          required
                          value={agenciaEditando.nombre}
                          onChange={(e) => setAgenciaEditando({ ...agenciaEditando, nombre: e.target.value })}
                        />
                        <CampoAgencia
                          label="Email de contacto"
                          type="email"
                          required
                          value={agenciaEditando.emailContacto}
                          onChange={(e) => setAgenciaEditando({ ...agenciaEditando, emailContacto: e.target.value })}
                        />
                        <CampoAgencia
                          label="Dirección"
                          value={agenciaEditando.direccion}
                          onChange={(e) => setAgenciaEditando({ ...agenciaEditando, direccion: e.target.value })}
                        />
                        <CampoAgencia
                          label="Teléfono"
                          value={agenciaEditando.telefonoContacto}
                          onChange={(e) => setAgenciaEditando({ ...agenciaEditando, telefonoContacto: e.target.value })}
                        />
                        <CampoAgencia
                          label="Logo (URL)"
                          value={agenciaEditando.logo}
                          onChange={(e) => setAgenciaEditando({ ...agenciaEditando, logo: e.target.value })}
                        />
                        <CampoAgencia
                          label="Descripción"
                          value={agenciaEditando.descripcion}
                          onChange={(e) => setAgenciaEditando({ ...agenciaEditando, descripcion: e.target.value })}
                        />
                      </div>
                      {errorEdicion && <p className="mt-3 text-sm font-semibold text-red-600">{errorEdicion}</p>}
                      <div className="mt-4 flex gap-2">
                        <button
                          type="submit"
                          className="rounded-xl bg-bronze px-4 py-2.5 text-xs font-bold text-white transition hover:bg-navy"
                        >
                          Guardar cambios
                        </button>
                        <button
                          type="button"
                          onClick={() => setAgenciaEditando(null)}
                          className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-navy-dark transition hover:border-bronze"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </li>
                ) : (
                  <li
                    key={a.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"
                  >
                    <span className="flex items-center gap-2.5 text-sm font-semibold text-navy-dark">
                      <Building2 className="h-4 w-4 shrink-0 text-slate-400" />
                      {a.nombre} <span className="font-normal text-slate-400">/{a.slug}</span>
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => comenzarEdicionAgencia(a)}
                        aria-label="Editar agencia"
                        className="text-slate-400 transition hover:text-bronze"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => eliminarAgencia(a.id)}
                        aria-label="Eliminar agencia"
                        className="text-slate-400 transition hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                )
              )}
            </ul>
          )}
        </section>

        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-navy-dark">Publicaciones</h2>
            <Link
              to="/admin/publicaciones/nueva"
              className="inline-flex items-center gap-1.5 rounded-xl bg-bronze px-3 py-2 text-xs font-bold text-white transition hover:bg-navy"
            >
              <Plus className="h-3.5 w-3.5" /> Nueva publicación
            </Link>
          </div>

          {errorListado && <p className="mb-3 text-sm font-semibold text-red-600">{errorListado}</p>}

          {publicaciones.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 px-6 py-8 text-center text-sm text-slate-400">
              Todavía no hay autos publicados.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {publicaciones.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-sm font-semibold text-navy-dark">
                    {p.marca} {p.modelo} · {p.anio} — {p.moneda} {Number(p.precio).toLocaleString('es-AR')}{' '}
                    <span className="font-normal text-slate-400">({p.agenciaNombre})</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <select
                      value={p.estado}
                      onChange={(e) => cambiarEstado(p.id, e.target.value)}
                      className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-semibold text-navy outline-none focus:border-bronze"
                    >
                      {ESTADOS.map((estado) => (
                        <option key={estado.value} value={estado.value}>
                          {estado.label}
                        </option>
                      ))}
                    </select>
                    <Link
                      to={`/admin/publicaciones/${p.id}/editar`}
                      aria-label="Editar publicación"
                      className="text-slate-400 transition hover:text-bronze"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => eliminarPublicacion(p.id)}
                      aria-label="Eliminar publicación"
                      className="text-slate-400 transition hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}

function CampoAgencia({ label, ...props }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-slate-500">{label}</span>
      <input
        {...props}
        className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-navy outline-none transition focus:border-bronze"
      />
    </label>
  )
}
