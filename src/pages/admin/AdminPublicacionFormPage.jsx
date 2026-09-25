import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, ImagePlus, Loader2, Trash2 } from 'lucide-react'
import api from '../../services/api.js'

const TRANSMISIONES = [
  { value: 'MANUAL', label: 'Manual' },
  { value: 'AUTOMATICA', label: 'Automática' },
]

const COMBUSTIBLES = [
  { value: 'NAFTA', label: 'Nafta' },
  { value: 'DIESEL', label: 'Diesel' },
  { value: 'GNC', label: 'GNC' },
  { value: 'HIBRIDO', label: 'Híbrido' },
  { value: 'ELECTRICO', label: 'Eléctrico' },
]

const CONDICIONES = [
  { value: 'EXCELENTE', label: 'Excelente' },
  { value: 'MUY_BUENO', label: 'Muy bueno' },
  { value: 'BUENO', label: 'Bueno' },
  { value: 'REGULAR', label: 'Regular' },
]

const MARCAS = [
  'Toyota', 'Ford', 'Chevrolet', 'Volkswagen', 'Renault', 'Peugeot', 'Fiat', 'Honda',
  'Nissan', 'Hyundai', 'Kia', 'Citroën', 'Jeep', 'Mercedes-Benz', 'BMW', 'Audi',
  'Chery', 'BAIC', 'JAC', 'DS', 'RAM', 'Suzuki', 'Mitsubishi', 'Subaru',
]

const COLORES = [
  'Blanco', 'Negro', 'Gris', 'Plata', 'Azul', 'Rojo', 'Verde', 'Beige', 'Marrón', 'Bordó', 'Amarillo', 'Naranja',
]

const MODELOS_SUGERIDOS = [
  'Corolla', 'Hilux', 'Etios', 'Yaris', 'SW4', 'Ranger', 'Focus', 'EcoSport', 'Ka',
  'Onix', 'Cruze', 'Tracker', 'S10', 'Gol', 'Polo', 'Amarok', 'T-Cross', 'Virtus',
  'Sandero', 'Logan', 'Duster', 'Kangoo', '208', '2008', '3008', 'Partner',
  'Cronos', 'Argo', 'Pulse', 'Toro', 'Civic', 'CR-V', 'HR-V', 'Versa', 'Kicks',
  'Frontier', 'Creta', 'Tucson', 'Sportage', 'Rio', 'C4 Cactus', 'Compass', 'Renegade',
]

const MAX_FOTOS = 10

const formatearPrecio = (valor) => {
  const soloDigitos = String(valor ?? '').replace(/\D/g, '')
  if (!soloDigitos) return ''
  return Number(soloDigitos).toLocaleString('es-AR')
}

const FORM_INICIAL = {
  agenciaId: '',
  marca: '',
  modelo: '',
  anio: '',
  precio: '',
  moneda: 'ARS',
  kilometraje: '',
  transmision: 'MANUAL',
  combustible: 'NAFTA',
  color: '',
  condicion: 'BUENO',
  descripcion: '',
}

const publicacionAForm = (p) => ({
  agenciaId: p.agenciaId != null ? String(p.agenciaId) : '',
  marca: p.marca ?? '',
  modelo: p.modelo ?? '',
  anio: p.anio != null ? String(p.anio) : '',
  precio: p.precio != null ? String(p.precio) : '',
  moneda: p.moneda ?? 'ARS',
  kilometraje: p.kilometraje != null ? String(p.kilometraje) : '',
  transmision: p.transmision ?? 'MANUAL',
  combustible: p.combustible ?? 'NAFTA',
  color: p.color ?? '',
  condicion: p.condicion ?? 'BUENO',
  descripcion: p.descripcion ?? '',
})

export default function AdminPublicacionFormPage() {
  const { id } = useParams()
  const esEdicion = Boolean(id)
  const [agencias, setAgencias] = useState([])
  const [form, setForm] = useState(FORM_INICIAL)
  const [publicacion, setPublicacion] = useState(null)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [cargandoInicial, setCargandoInicial] = useState(esEdicion)
  const [subiendoFoto, setSubiendoFoto] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [otraMarca, setOtraMarca] = useState(false)
  const [otroColor, setOtroColor] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/agencias').then((res) => setAgencias(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!esEdicion) return
    api
      .get(`/publicaciones/${id}`)
      .then((res) => {
        const datos = res.data
        setForm(publicacionAForm(datos))
        setPublicacion(datos)
        if (datos.marca && !MARCAS.includes(datos.marca)) setOtraMarca(true)
        if (datos.color && !COLORES.includes(datos.color)) setOtroColor(true)
      })
      .catch(() => setError('No se pudo cargar la publicación.'))
      .finally(() => setCargandoInicial(false))
  }, [id, esEdicion])

  const campo = (nombre) => ({
    value: form[nombre],
    onChange: (e) => setForm({ ...form, [nombre]: e.target.value }),
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setGuardado(false)

    if (form.descripcion.trim().length < 10) {
      setError('La descripción tiene que tener al menos 10 caracteres.')
      return
    }

    setCargando(true)
    const payload = {
      ...form,
      agenciaId: Number(form.agenciaId),
      anio: Number(form.anio),
      precio: Number(form.precio),
      kilometraje: form.kilometraje ? Number(form.kilometraje) : null,
    }
    try {
      if (esEdicion) {
        const { data } = await api.put(`/publicaciones/${id}`, payload)
        setPublicacion(data)
        setGuardado(true)
      } else {
        const { data } = await api.post('/publicaciones', payload)
        setPublicacion(data)
      }
    } catch {
      setError(
        esEdicion
          ? 'No se pudieron guardar los cambios. Revisá que los datos obligatorios estén completos.'
          : 'No se pudo crear la publicación. Revisá que los datos obligatorios estén completos.'
      )
    } finally {
      setCargando(false)
    }
  }

  const subirFotos = async (e) => {
    const archivos = Array.from(e.target.files || [])
    if (!archivos.length) return

    const actuales = publicacion?.fotos?.length ?? 0
    const restantes = Math.max(MAX_FOTOS - actuales, 0)
    const aSubir = archivos.slice(0, restantes)

    if (aSubir.length === 0) {
      setError(`Ya llegaste al máximo de ${MAX_FOTOS} fotos por auto.`)
      e.target.value = ''
      return
    }
    setError(
      aSubir.length < archivos.length
        ? `El máximo es ${MAX_FOTOS} fotos por auto — se subieron ${aSubir.length}.`
        : ''
    )

    setSubiendoFoto(true)
    try {
      let actual = publicacion
      for (const archivo of aSubir) {
        const formData = new FormData()
        formData.append('archivo', archivo)
        const { data } = await api.post(`/publicaciones/${actual.id}/fotos`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        actual = data
        setPublicacion(data)
      }
    } catch {
      setError('No se pudo subir alguna de las fotos.')
    } finally {
      setSubiendoFoto(false)
      e.target.value = ''
    }
  }

  const eliminarFoto = async (fotoId) => {
    await api.delete(`/publicaciones/${publicacion.id}/fotos/${fotoId}`)
    setPublicacion({ ...publicacion, fotos: publicacion.fotos.filter((f) => f.id !== fotoId) })
  }

  if (cargandoInicial) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fafaf9]">
        <Loader2 className="h-6 w-6 animate-spin text-bronze" />
      </main>
    )
  }

  if (publicacion && !esEdicion) {
    return (
      <main className="min-h-screen bg-[#fafaf9] py-10">
        <div className="mx-auto max-w-3xl px-4">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-600">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
              <Check className="h-3.5 w-3.5" />
            </span>
            Publicación creada
          </div>
          <h1 className="mt-3 font-heading text-3xl text-navy-dark">Ahora sumale fotos</h1>
          <p className="mt-2 text-sm text-slate-500">
            {publicacion.marca} {publicacion.modelo} · {publicacion.anio} — cuantas más fotos, más consultas de compradores.
          </p>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
            <FotosGrid
              fotos={publicacion.fotos}
              subiendoFoto={subiendoFoto}
              onSubir={subirFotos}
              onEliminar={eliminarFoto}
              max={MAX_FOTOS}
            />
            {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to={`/publicaciones/${publicacion.id}`}
              className="flex-1 rounded-xl bg-bronze px-4 py-3.5 text-center text-sm font-bold text-white transition hover:bg-navy"
            >
              Ver publicación
            </Link>
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3.5 text-sm font-bold text-navy-dark transition hover:border-bronze"
            >
              Volver al panel
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#fafaf9] py-10">
      <div className="mx-auto max-w-3xl px-4">
        <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-bronze">
          <ArrowLeft className="h-4 w-4" /> Volver al panel
        </Link>

        <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-bronze">
          {esEdicion ? 'Editar publicación' : 'Nueva publicación'}
        </p>
        <h1 className="mt-2 font-heading text-3xl text-navy-dark">{esEdicion ? 'Editá el auto' : 'Publicá un auto'}</h1>
        <p className="mt-2 text-sm text-slate-500">
          {esEdicion
            ? 'Actualizá los datos del vehículo — los cambios se guardan al instante.'
            : 'Cargá los datos del vehículo — cuando lo guardes vas a poder sumarle las fotos.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
          <Seccion titulo="Agencia">
            <Select label="¿Quién lo vende?" required {...campo('agenciaId')}>
              <option value="">Seleccionar agencia</option>
              {agencias.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
            </Select>
            {agencias.length === 0 && (
              <p className="mt-2 text-xs font-semibold text-slate-400">
                Todavía no cargaste ninguna agencia — creá una primero desde el panel.
              </p>
            )}
          </Seccion>

          <Seccion titulo="Datos del vehículo">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Select
                  label="Marca"
                  required={!otraMarca}
                  value={otraMarca ? '__otra__' : form.marca}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val === '__otra__') {
                      setOtraMarca(true)
                      setForm({ ...form, marca: '' })
                    } else {
                      setOtraMarca(false)
                      setForm({ ...form, marca: val })
                    }
                  }}
                >
                  <option value="">Seleccionar marca</option>
                  {MARCAS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                  <option value="__otra__">Otra marca...</option>
                </Select>
                {otraMarca && (
                  <div className="mt-2">
                    <Input label="¿Cuál marca?" required {...campo('marca')} />
                  </div>
                )}
              </div>

              <div>
                <Input label="Modelo" required list="modelos-sugeridos" {...campo('modelo')} />
                <datalist id="modelos-sugeridos">
                  {MODELOS_SUGERIDOS.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              </div>

              <Input label="Año" type="number" required {...campo('anio')} />
              <Input label="Kilometraje" type="number" {...campo('kilometraje')} />
              <Select label="Transmisión" {...campo('transmision')}>
                {TRANSMISIONES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
              <Select label="Combustible" {...campo('combustible')}>
                {COMBUSTIBLES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>

              <div>
                <Select
                  label="Color"
                  value={otroColor ? '__otro__' : form.color}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val === '__otro__') {
                      setOtroColor(true)
                      setForm({ ...form, color: '' })
                    } else {
                      setOtroColor(false)
                      setForm({ ...form, color: val })
                    }
                  }}
                >
                  <option value="">Seleccionar color</option>
                  {COLORES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="__otro__">Otro color...</option>
                </Select>
                {otroColor && (
                  <div className="mt-2">
                    <Input label="¿Cuál color?" {...campo('color')} />
                  </div>
                )}
              </div>

              <Select label="Condición" {...campo('condicion')}>
                {CONDICIONES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </div>
          </Seccion>

          <Seccion titulo="Precio">
            <div className="grid grid-cols-[1fr_2fr] gap-4">
              <Select label="Moneda" {...campo('moneda')}>
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
              </Select>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-slate-500">Precio</span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  placeholder="0"
                  value={formatearPrecio(form.precio)}
                  onChange={(e) => setForm({ ...form, precio: e.target.value.replace(/\D/g, '') })}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-navy outline-none transition focus:border-bronze"
                />
              </label>
            </div>
          </Seccion>

          <Seccion titulo="Descripción">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-slate-500">
                Contale al comprador sobre el estado, el uso, los extras... (mínimo 10 caracteres)
              </span>
              <textarea
                rows={4}
                required
                minLength={10}
                {...campo('descripcion')}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-navy outline-none transition focus:border-bronze"
              />
            </label>
          </Seccion>

          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
          {guardado && !error && <p className="text-sm font-semibold text-emerald-600">Cambios guardados.</p>}

          <button
            type="submit"
            disabled={cargando}
            className="rounded-xl bg-bronze px-4 py-4 text-sm font-bold text-white transition hover:bg-navy disabled:opacity-60"
          >
            {cargando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Publicar auto'}
          </button>
        </form>

        {esEdicion && publicacion && (
          <Seccion titulo="Fotos">
            <FotosGrid fotos={publicacion.fotos} subiendoFoto={subiendoFoto} onSubir={subirFotos} onEliminar={eliminarFoto} max={MAX_FOTOS} />
          </Seccion>
        )}
      </div>
    </main>
  )
}

function FotosGrid({ fotos, subiendoFoto, onSubir, onEliminar, max }) {
  const cantidad = fotos?.length ?? 0
  const llegoAlMaximo = cantidad >= max

  return (
    <div>
      <p className="mb-3 text-xs font-semibold text-slate-400">
        {cantidad}/{max} fotos {llegoAlMaximo && '— llegaste al máximo por auto'}
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {fotos?.map((foto) => (
          <div key={foto.id} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
            <img src={foto.url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onEliminar(foto.id)}
              aria-label="Eliminar foto"
              className="absolute right-1.5 top-1.5 rounded-full bg-navy/80 p-1.5 text-white opacity-0 transition group-hover:opacity-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {!llegoAlMaximo && (
          <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 transition hover:border-bronze hover:text-bronze">
            {subiendoFoto ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
            <span className="text-xs font-semibold">{subiendoFoto ? 'Subiendo...' : 'Agregar fotos'}</span>
            <input type="file" accept="image/*" multiple onChange={onSubir} className="hidden" disabled={subiendoFoto} />
          </label>
        )}
      </div>
    </div>
  )
}

function Seccion({ titulo, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-navy-dark">{titulo}</h2>
      {children}
    </div>
  )
}

function Input({ label, ...props }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-slate-500">{label}</span>
      <input
        {...props}
        className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-navy outline-none transition focus:border-bronze"
      />
    </label>
  )
}

function Select({ label, children, ...props }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-slate-500">{label}</span>
      <select
        {...props}
        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-navy outline-none transition focus:border-bronze"
      >
        {children}
      </select>
    </label>
  )
}
