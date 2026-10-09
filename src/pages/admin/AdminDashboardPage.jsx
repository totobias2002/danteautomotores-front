import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Building2, Car, MessageSquare, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react'
import api from '../../services/api.js'
import BadgeNoLeidos from '../../components/BadgeNoLeidos.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import { useNoLeidos } from '../../context/NoLeidosContext.jsx'
import { urlMiniatura } from '../../utils/cloudinary.js'
import { mensajeDeError } from '../../utils/errores.js'
import { ZONA, opcionesDe } from '../../utils/etiquetas.js'

const AGENCIA_INICIAL = {
  nombre: '',
  emailContacto: '',
  direccion: '',
  telefonoContacto: '',
  descripcion: '',
  logo: '',
  zona: '',
}

const ESTADOS = [
  { value: 'DISPONIBLE', label: 'Disponible' },
  { value: 'RESERVADO', label: 'Reservado' },
  { value: 'VENDIDO', label: 'Vendido' },
]

const FILTROS_ESTADO = [
  { value: 'TODOS', label: 'Todos' },
  { value: 'DISPONIBLE', label: 'Disponibles' },
  { value: 'RESERVADO', label: 'Reservados' },
  { value: 'VENDIDO', label: 'Vendidos' },
]

// Para buscar sin distinguir mayúsculas ni acentos.
const normalizar = (texto) =>
  String(texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// La portada es la primera foto: el backend las entrega ordenadas con su única regla de portada
// (orden, null como 0, desempate por id), la misma que usan la card pública, el detalle y el
// formulario de edición. Buscar la de orden 0 podía elegir otra si una foto vieja tiene orden null.
const fotoDePortada = (fotos) => {
  if (!Array.isArray(fotos) || fotos.length === 0) return null
  return fotos[0]
}

export default function AdminDashboardPage() {
  const { noLeidos } = useNoLeidos()
  const [agencias, setAgencias] = useState([])
  const [publicaciones, setPublicaciones] = useState([])
  const [nuevaAgencia, setNuevaAgencia] = useState(AGENCIA_INICIAL)
  const [mostrarFormAgencia, setMostrarFormAgencia] = useState(false)
  const [agenciaEditando, setAgenciaEditando] = useState(null)
  const [error, setError] = useState('')
  const [errorEdicion, setErrorEdicion] = useState('')
  const [errorListado, setErrorListado] = useState('')
  const [errorAgencias, setErrorAgencias] = useState('')
  const [agenciaAEliminar, setAgenciaAEliminar] = useState(null)
  const [filtroEstado, setFiltroEstado] = useState('TODOS')
  const [busqueda, setBusqueda] = useState('')
  const [errorAccion, setErrorAccion] = useState('')
  const [aEliminar, setAEliminar] = useState(null)

  const publicacionesFiltradas = useMemo(() => {
    const texto = normalizar(busqueda.trim())
    return publicaciones.filter(
      (p) =>
        (filtroEstado === 'TODOS' || p.estado === filtroEstado) &&
        normalizar(`${p.marca} ${p.modelo}`).includes(texto)
    )
  }, [publicaciones, filtroEstado, busqueda])

  const cantidadPorEstado = (estado) =>
    estado === 'TODOS' ? publicaciones.length : publicaciones.filter((p) => p.estado === estado).length

  const cargar = () => {
    api.get('/agencias')
      .then((res) => {
        setAgencias(res.data)
        setErrorAgencias('')
      })
      .catch((err) => setErrorAgencias(mensajeDeError(err, 'No se pudieron cargar las agencias.')))
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
      await api.post('/agencias', { ...nuevaAgencia, zona: nuevaAgencia.zona || null })
      setNuevaAgencia(AGENCIA_INICIAL)
      setMostrarFormAgencia(false)
      cargar()
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo crear la agencia.'))
    }
  }

  // El backend rechaza con 400 la baja de una agencia que todavía tiene autos; el mensaje se muestra arriba de la lista.
  const eliminarAgencia = async (id) => {
    setErrorAgencias('')
    setAgenciaAEliminar(null)
    try {
      await api.delete(`/agencias/${id}`)
      cargar()
    } catch (err) {
      setErrorAgencias(mensajeDeError(err, 'No se pudo eliminar la agencia.'))
    }
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
      zona: a.zona ?? '',
    })
  }

  const guardarEdicionAgencia = async (e) => {
    e.preventDefault()
    setErrorEdicion('')
    const { id, ...datos } = agenciaEditando
    try {
      await api.put(`/agencias/${id}`, { ...datos, zona: datos.zona || null })
      setAgenciaEditando(null)
      cargar()
    } catch (err) {
      setErrorEdicion(mensajeDeError(err, 'No se pudieron guardar los cambios.'))
    }
  }

  // Reemplaza solo la fila modificada: el auto sigue en el listado aunque cambie de estado.
  function actualizarEnLista(data) {
    setPublicaciones((lista) => lista.map((p) => (p.id === data.id ? data : p)))
  }

  const cambiarEstado = async (id, estado) => {
    setErrorAccion('')
    try {
      const { data } = await api.patch(`/publicaciones/${id}/estado`, { estado })
      actualizarEnLista(data)
    } catch (err) {
      setErrorAccion(mensajeDeError(err, 'No se pudo cambiar el estado.'))
    }
  }

  const cambiarDestacado = async (p) => {
    setErrorAccion('')
    try {
      const { data } = await api.patch(`/publicaciones/${p.id}/destacado`, { destacado: !p.destacado })
      actualizarEnLista(data)
    } catch (err) {
      setErrorAccion(mensajeDeError(err, 'No se pudo actualizar el destacado.'))
    }
  }

  // Borrar un auto se lleva sus conversaciones y favoritos (decisión: cascada + aviso). Antes de abrir el
  // diálogo se pide el conteo, y el botón de confirmar queda deshabilitado hasta tenerlo.
  const pedirEliminacion = (p) => {
    setErrorAccion('')
    setAEliminar({ publicacion: p, impacto: null, cargandoImpacto: true, eliminando: false, error: '' })
    api.get(`/admin/publicaciones/${p.id}/impacto-eliminacion`)
      .then((res) =>
        setAEliminar((actual) =>
          actual?.publicacion.id === p.id ? { ...actual, impacto: res.data, cargandoImpacto: false } : actual
        )
      )
      .catch((err) =>
        setAEliminar((actual) =>
          actual?.publicacion.id === p.id
            ? {
                ...actual,
                cargandoImpacto: false,
                error: mensajeDeError(err, 'No se pudo calcular qué se borra junto con el auto.'),
              }
            : actual
        )
      )
  }

  const confirmarEliminacion = async () => {
    const { publicacion } = aEliminar
    setAEliminar((actual) => ({ ...actual, eliminando: true, error: '' }))
    try {
      await api.delete(`/publicaciones/${publicacion.id}`)
      setPublicaciones((lista) => lista.filter((p) => p.id !== publicacion.id))
      setAEliminar(null)
    } catch (err) {
      setAEliminar((actual) => ({
        ...actual,
        eliminando: false,
        error: mensajeDeError(err, 'No se pudo eliminar la publicación.'),
      }))
    }
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

        <Link
          to="/admin/mensajes"
          className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 transition hover:border-bronze"
        >
          <span>
            <span className="flex items-center gap-2 text-sm font-bold text-navy-dark">
              Mensajes
              <BadgeNoLeidos cantidad={noLeidos} />
            </span>
            <span className="block text-xs text-slate-500">Las conversaciones de compra y de cotización con los usuarios.</span>
          </span>
          <ArrowRight className="h-4 w-4 shrink-0 text-bronze" />
        </Link>

        <Link
          to="/admin/solicitudes-venta"
          className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 transition hover:border-bronze"
        >
          <span>
            <span className="block text-sm font-bold text-navy-dark">Solicitudes de venta</span>
            <span className="block text-xs text-slate-500">Autos que la gente cargó en "Vender tu auto" para que los contactemos.</span>
          </span>
          <ArrowRight className="h-4 w-4 shrink-0 text-bronze" />
        </Link>

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
                <SelectZona {...campoAgencia('zona')} />
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

          {errorAgencias && <p className="mb-3 text-sm font-semibold text-red-600">{errorAgencias}</p>}

          {agencias.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 px-6 py-8 text-center text-sm text-slate-500">
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
                        <SelectZona
                          value={agenciaEditando.zona}
                          onChange={(e) => setAgenciaEditando({ ...agenciaEditando, zona: e.target.value })}
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
                      <Building2 className="h-4 w-4 shrink-0 text-slate-500" />
                      {a.nombre} <span className="font-normal text-slate-500">/{a.slug}</span>
                      {a.zona && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">
                          {ZONA[a.zona] ?? a.zona}
                        </span>
                      )}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => comenzarEdicionAgencia(a)}
                        aria-label="Editar agencia"
                        className="text-slate-500 transition hover:text-bronze"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {agenciaAEliminar === a.id ? (
                        <span className="flex items-center gap-2 text-xs font-bold">
                          <span className="text-red-600">¿Eliminar?</span>
                          <button
                            type="button"
                            onClick={() => eliminarAgencia(a.id)}
                            className="rounded-lg bg-red-600 px-2.5 py-1 text-white transition hover:bg-red-700"
                          >
                            Confirmar
                          </button>
                          <button
                            type="button"
                            onClick={() => setAgenciaAEliminar(null)}
                            className="rounded-lg border border-slate-200 px-2.5 py-1 text-navy-dark transition hover:border-bronze"
                          >
                            Cancelar
                          </button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setAgenciaAEliminar(a.id)}
                          aria-label="Eliminar agencia"
                          className="text-slate-500 transition hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
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

          <div className="mb-4 flex flex-wrap items-center gap-2">
            {FILTROS_ESTADO.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFiltroEstado(f.value)}
                aria-pressed={filtroEstado === f.value}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  filtroEstado === f.value
                    ? 'bg-navy text-white'
                    : 'border border-slate-200 text-navy-dark hover:border-bronze'
                }`}
              >
                {f.label} ({cantidadPorEstado(f.value)})
              </button>
            ))}
            <label className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3 py-1.5 transition focus-within:border-bronze sm:min-w-[220px]">
              <Search className="h-4 w-4 shrink-0 text-slate-500" />
              <input
                type="text"
                aria-label="Buscar por marca o modelo"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por marca o modelo"
                className="w-full text-sm font-semibold text-navy outline-none placeholder:font-normal"
              />
            </label>
          </div>

          {errorListado && <p className="mb-3 text-sm font-semibold text-red-600">{errorListado}</p>}
          {errorAccion && <p className="mb-3 text-sm font-semibold text-red-600">{errorAccion}</p>}

          {publicaciones.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 px-6 py-8 text-center text-sm text-slate-500">
              Todavía no hay autos publicados.
            </p>
          ) : publicacionesFiltradas.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 px-6 py-8 text-center text-sm text-slate-500">
              No hay autos que coincidan con el filtro.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {publicacionesFiltradas.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {/* La key por URL de portada reinicia el estado de error si cambia la portada. */}
                    <MiniaturaPublicacion key={fotoDePortada(p.fotos)?.url ?? 'sin-fotos'} publicacion={p} />
                    <span className="min-w-0 text-sm font-semibold text-navy-dark">
                      {p.marca} {p.modelo} · {p.anio} — {p.moneda} {Number(p.precio).toLocaleString('es-AR')}{' '}
                      <span className="font-normal text-slate-500">({p.agenciaNombre})</span>
                      {p.destacado && (
                        <span className="ml-2 rounded-full bg-bronze/10 px-2 py-0.5 text-[11px] font-bold text-bronze">
                          Destacado
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => cambiarDestacado(p)}
                      aria-pressed={p.destacado}
                      aria-label={p.destacado ? 'Quitar de destacados' : 'Marcar como destacado'}
                      title={p.destacado ? 'Quitar de destacados' : 'Marcar como destacado'}
                      className={`transition ${p.destacado ? 'text-bronze' : 'text-slate-300 hover:text-bronze'}`}
                    >
                      <Star className="h-4 w-4" fill={p.destacado ? 'currentColor' : 'none'} />
                    </button>
                    <select
                      aria-label={`Estado de ${p.marca} ${p.modelo}`}
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
                      to={`/admin/mensajes?publicacionId=${p.id}&estado=TODAS`}
                      aria-label={`Mensajes de ${p.marca} ${p.modelo}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-semibold text-navy transition hover:border-bronze hover:text-bronze"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Mensajes
                    </Link>
                    <Link
                      to={`/admin/publicaciones/${p.id}/editar`}
                      aria-label="Editar publicación"
                      className="text-slate-500 transition hover:text-bronze"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => pedirEliminacion(p)}
                      aria-label="Eliminar publicación"
                      className="text-slate-500 transition hover:text-red-600"
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

      <ConfirmDialog
        abierto={Boolean(aEliminar)}
        titulo="Eliminar publicación"
        deshabilitado={!aEliminar?.impacto}
        cargando={aEliminar?.eliminando}
        error={aEliminar?.error}
        onConfirmar={confirmarEliminacion}
        onCancelar={() => setAEliminar(null)}
      >
        {aEliminar && (
          <>
            <p>
              Vas a eliminar {aEliminar.publicacion.marca} {aEliminar.publicacion.modelo} {aEliminar.publicacion.anio}.
            </p>
            {aEliminar.cargandoImpacto && <p className="mt-2">Calculando qué se borra junto con el auto…</p>}
            {aEliminar.impacto && <ResumenImpacto impacto={aEliminar.impacto} />}
            <p className="mt-2 font-semibold text-navy-dark">Esta acción no se puede deshacer.</p>
          </>
        )}
      </ConfirmDialog>
    </main>
  )
}

const plural = (n, singular, pluralTexto) => `${n} ${n === 1 ? singular : pluralTexto}`

function ResumenImpacto({ impacto }) {
  const { cantidadConversaciones, cantidadFavoritos } = impacto
  const partes = []
  if (cantidadConversaciones > 0) partes.push(`${plural(cantidadConversaciones, 'conversación', 'conversaciones')} con compradores`)
  if (cantidadFavoritos > 0) partes.push(plural(cantidadFavoritos, 'favorito', 'favoritos'))
  if (partes.length === 0) return null
  return <p className="mt-2">También se van a borrar {partes.join(' y ')}.</p>
}

function PlaceholderSinFotos() {
  return (
    <div
      role="img"
      aria-label="Sin fotos"
      title="Sin fotos"
      className="flex h-15 w-20 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-300"
    >
      <Car className="h-6 w-6" aria-hidden="true" />
    </div>
  )
}

function MiniaturaPublicacion({ publicacion }) {
  const portada = fotoDePortada(publicacion.fotos)
  const [intento, setIntento] = useState(0)
  if (!portada) return <PlaceholderSinFotos />

  // Si la cuenta de Cloudinary tiene "strict transformations" activado o la derivada falla, el admin
  // igual ve la foto original; si la original tampoco existe (404), placeholder en vez de imagen rota.
  // Para URLs que no son de Cloudinary ambas coinciden y queda una sola candidata.
  const candidatas = [...new Set([urlMiniatura(portada.url), portada.url])]
  if (intento >= candidatas.length) return <PlaceholderSinFotos />

  return (
    <img
      src={candidatas[intento]}
      onError={() => setIntento((actual) => actual + 1)}
      alt={`Foto de portada de ${publicacion.marca} ${publicacion.modelo} ${publicacion.anio}`}
      loading="lazy"
      decoding="async"
      width={80}
      height={60}
      className="h-15 w-20 shrink-0 rounded-lg border border-slate-200 bg-slate-100 object-cover"
    />
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

// La zona es opcional ("Sin especificar" se envía como null) y alimenta el filtro por zona del catálogo público.
function SelectZona(props) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-slate-500">Zona</span>
      <select
        {...props}
        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-navy outline-none transition focus:border-bronze"
      >
        <option value="">Sin especificar</option>
        {opcionesDe(ZONA).map((z) => (
          <option key={z.value} value={z.value}>
            {z.label}
          </option>
        ))}
      </select>
    </label>
  )
}
