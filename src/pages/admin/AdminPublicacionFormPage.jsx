import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, ChevronLeft, ChevronRight, ImagePlus, Loader2, Star, Trash2 } from 'lucide-react'
import api from '../../services/api.js'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import { mensajeDeError } from '../../utils/errores.js'
import { TIPO_CARROCERIA, opcionesDe } from '../../utils/etiquetas.js'
import { KM_MAXIMO, MARCAS, MODELOS_SUGERIDOS } from '../../constants/vehiculo.js'

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

const COLORES = [
  'Blanco', 'Negro', 'Gris', 'Plata', 'Azul', 'Rojo', 'Verde', 'Beige', 'Marrón', 'Bordó', 'Amarillo', 'Naranja',
]

const MAX_FOTOS = 10
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 10 * 1024 * 1024

// Devuelve el motivo por el que el backend rechazaría el archivo, o null si parece válido.
// El backend vuelve a validar el tipo real; esto solo evita subir de balde un archivo que seguro falla.
function motivoRechazo(archivo) {
  if (!TIPOS_PERMITIDOS.includes(archivo.type)) return 'formato no permitido (usá JPG, PNG o WebP)'
  if (archivo.size > MAX_BYTES) return 'pesa más de 10 MB'
  return null
}

const formatearPrecio = (valor) => {
  const soloDigitos = String(valor ?? '').replace(/\D/g, '')
  if (!soloDigitos) return ''
  return Number(soloDigitos).toLocaleString('es-AR')
}

const acotarKm = (valor) => {
  const soloDigitos = String(valor ?? '').replace(/\D/g, '')
  if (!soloDigitos) return ''
  const numero = Math.min(Number(soloDigitos), KM_MAXIMO)
  return String(numero)
}

const FORM_INICIAL = {
  agenciaId: '',
  marca: '',
  modelo: '',
  anio: '',
  precio: '',
  precioAnterior: '',
  moneda: 'ARS',
  kilometraje: '',
  tipoCarroceria: '',
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
  // El campo de precio solo maneja enteros (formatearPrecio descarta todo lo que no sea dígito): un "12500.5"
  // se mostraría como 125.005. Los precios son números redondos, así que se redondea al cargar.
  precio: p.precio != null ? String(Math.round(Number(p.precio))) : '',
  // Mismo redondeo que el precio. Si no se carga acá, guardar desde el form borraría el valor (el PUT reemplaza todo).
  precioAnterior: p.precioAnterior != null ? String(Math.round(Number(p.precioAnterior))) : '',
  moneda: p.moneda ?? 'ARS',
  kilometraje: p.kilometraje != null ? String(p.kilometraje) : '',
  tipoCarroceria: p.tipoCarroceria ?? '',
  // Los tres son opcionales en el backend: un null se conserva como '' ("Sin especificar") y no se reemplaza por
  // un valor inventado que el próximo guardado escribiría en la base.
  transmision: p.transmision ?? '',
  combustible: p.combustible ?? '',
  color: p.color ?? '',
  condicion: p.condicion ?? '',
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
  const [reordenando, setReordenando] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [fotoAEliminar, setFotoAEliminar] = useState(null)
  const [otraMarca, setOtraMarca] = useState(false)
  const [otroColor, setOtroColor] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/agencias')
      .then((res) => setAgencias(res.data))
      .catch((err) => setError(mensajeDeError(err, 'No se pudieron cargar las agencias.')))
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
      .catch((err) => setError(mensajeDeError(err, 'No se pudo cargar la publicación.')))
      .finally(() => setCargandoInicial(false))
  }, [id, esEdicion])

  const campo = (nombre) => ({
    value: form[nombre],
    onChange: (e) => setForm({ ...form, [nombre]: e.target.value }),
  })

  // Aviso no bloqueante: la API acepta un precio anterior que no supera al precio, pero entonces no hay oferta.
  const sinOferta = form.precioAnterior !== '' && Number(form.precioAnterior) <= Number(form.precio || 0)

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
      precioAnterior: form.precioAnterior ? Number(form.precioAnterior) : null,
      kilometraje: form.kilometraje ? Number(form.kilometraje) : null,
      tipoCarroceria: form.tipoCarroceria || null,
      transmision: form.transmision || null,
      combustible: form.combustible || null,
      condicion: form.condicion || null,
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
    } catch (err) {
      setError(mensajeDeError(err, esEdicion ? 'No se pudieron guardar los cambios.' : 'No se pudo crear la publicación.'))
    } finally {
      setCargando(false)
    }
  }

  const subirFotos = async (e) => {
    const archivos = Array.from(e.target.files || [])
    if (!archivos.length) return

    // Cada archivo rechazado se informa como "nombre: motivo" y no frena a los demás.
    const rechazos = []
    const validos = []
    for (const archivo of archivos) {
      const motivo = motivoRechazo(archivo)
      if (motivo) rechazos.push(`${archivo.name}: ${motivo}`)
      else validos.push(archivo)
    }

    const actuales = publicacion?.fotos?.length ?? 0
    const restantes = Math.max(MAX_FOTOS - actuales, 0)
    const aSubir = validos.slice(0, restantes)
    for (const archivo of validos.slice(restantes)) {
      rechazos.push(`${archivo.name}: superaste el máximo de ${MAX_FOTOS} fotos por auto`)
    }

    setError(rechazos.join('\n'))
    if (aSubir.length === 0) {
      e.target.value = ''
      return
    }

    setSubiendoFoto(true)
    try {
      let actual = publicacion
      for (const archivo of aSubir) {
        try {
          const formData = new FormData()
          formData.append('archivo', archivo)
          const { data } = await api.post(`/publicaciones/${actual.id}/fotos`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
          actual = data
          setPublicacion(data)
        } catch (err) {
          rechazos.push(`${archivo.name}: ${mensajeDeError(err, 'no se pudo subir')}`)
        }
      }
      setError(rechazos.join('\n'))
    } finally {
      setSubiendoFoto(false)
      e.target.value = ''
    }
  }

  const guardarOrden = async (fotoIds) => {
    setReordenando(true)
    setError('')
    try {
      const { data } = await api.put(`/publicaciones/${publicacion.id}/fotos/orden`, { fotoIds })
      setPublicacion(data)
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo cambiar el orden de las fotos.'))
    } finally {
      setReordenando(false)
    }
  }

  const moverFoto = (indice, delta) => {
    const ids = (publicacion.fotos ?? []).map((f) => f.id)
    const destino = indice + delta
    if (destino < 0 || destino >= ids.length) return
    ;[ids[indice], ids[destino]] = [ids[destino], ids[indice]]
    guardarOrden(ids)
  }

  const hacerPortada = (fotoId) => {
    const ids = (publicacion.fotos ?? []).map((f) => f.id)
    guardarOrden([fotoId, ...ids.filter((fid) => fid !== fotoId)])
  }

  const pedirEliminarFoto = (foto, indice) => {
    setFotoAEliminar({ foto, indice, eliminando: false, error: '' })
  }

  // El backend ya resecuenció el orden al borrar; acá solo se saca la foto y el resto conserva su orden relativo.
  const confirmarEliminarFoto = async () => {
    const { foto } = fotoAEliminar
    setFotoAEliminar((actual) => ({ ...actual, eliminando: true, error: '' }))
    try {
      await api.delete(`/publicaciones/${publicacion.id}/fotos/${foto.id}`)
      setPublicacion((actual) => ({ ...actual, fotos: actual.fotos.filter((f) => f.id !== foto.id) }))
      setFotoAEliminar(null)
    } catch (err) {
      setFotoAEliminar((actual) => ({
        ...actual,
        eliminando: false,
        error: mensajeDeError(err, 'No se pudo eliminar la foto.'),
      }))
    }
  }

  // Un solo diálogo para las dos pantallas donde aparece FotosGrid.
  const dialogoEliminarFoto = (
    <ConfirmDialog
      abierto={Boolean(fotoAEliminar)}
      titulo="Eliminar foto"
      cargando={fotoAEliminar?.eliminando}
      error={fotoAEliminar?.error}
      onConfirmar={confirmarEliminarFoto}
      onCancelar={() => setFotoAEliminar(null)}
    >
      <p>La foto se borra del auto y de la nube de imágenes.</p>
      {fotoAEliminar?.indice === 0 && (publicacion?.fotos?.length ?? 0) > 1 && (
        <p className="mt-2">Es la portada: la siguiente foto pasa a ser la portada.</p>
      )}
    </ConfirmDialog>
  )

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
              onEliminar={pedirEliminarFoto}
              onMover={moverFoto}
              onHacerPortada={hacerPortada}
              reordenando={reordenando}
              max={MAX_FOTOS}
            />
            {error && <p className="mt-4 whitespace-pre-line text-sm font-semibold text-red-600">{error}</p>}
          </div>
          {dialogoEliminarFoto}

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
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-slate-500">Kilometraje</span>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={formatearPrecio(form.kilometraje)}
                    onChange={(e) => setForm({ ...form, kilometraje: acotarKm(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 text-sm font-semibold text-navy outline-none transition focus:border-bronze"
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    km
                  </span>
                </div>
                <span className="mt-1 text-[11px] text-slate-400">Hasta {KM_MAXIMO.toLocaleString('es-AR')} km</span>
              </label>
              <Select label="Tipo de carrocería" {...campo('tipoCarroceria')}>
                <option value="">Sin especificar</option>
                {opcionesDe(TIPO_CARROCERIA).map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
              <Select label="Transmisión" {...campo('transmision')}>
                <option value="">Sin especificar</option>
                {TRANSMISIONES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
              <Select label="Combustible" {...campo('combustible')}>
                <option value="">Sin especificar</option>
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
                <option value="">Sin especificar</option>
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
            <label className="mt-4 flex flex-col gap-1.5">
              <span className="text-xs font-bold text-slate-500">Precio anterior (opcional)</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={formatearPrecio(form.precioAnterior)}
                onChange={(e) => setForm({ ...form, precioAnterior: e.target.value.replace(/\D/g, '') })}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-navy outline-none transition focus:border-bronze"
              />
              <span className="text-xs text-slate-400">
                Si es mayor al precio, el auto aparece como oferta con el precio anterior tachado.
              </span>
              {sinOferta && (
                <span className="text-xs font-semibold text-amber-600">Con este valor el auto no se muestra como oferta.</span>
              )}
            </label>
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

          {error && <p className="whitespace-pre-line text-sm font-semibold text-red-600">{error}</p>}
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
            <FotosGrid
              fotos={publicacion.fotos}
              subiendoFoto={subiendoFoto}
              onSubir={subirFotos}
              onEliminar={pedirEliminarFoto}
              onMover={moverFoto}
              onHacerPortada={hacerPortada}
              reordenando={reordenando}
              max={MAX_FOTOS}
            />
          </Seccion>
        )}
        {dialogoEliminarFoto}
      </div>
    </main>
  )
}

function FotosGrid({ fotos, subiendoFoto, onSubir, onEliminar, onMover, onHacerPortada, reordenando, max }) {
  const cantidad = fotos?.length ?? 0
  const llegoAlMaximo = cantidad >= max
  const botonFoto = 'rounded-full bg-navy/80 p-1.5 text-white transition hover:bg-bronze disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-navy/80'

  return (
    <div>
      <p className="mb-1 text-xs font-semibold text-slate-400">
        {cantidad}/{max} fotos {llegoAlMaximo && '— llegaste al máximo por auto'}
      </p>
      {cantidad > 1 && (
        <p className="mb-3 text-xs text-slate-400">La primera foto es la portada. Usá las flechas para ordenarlas.</p>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {fotos?.map((foto, indice) => (
          <div key={foto.id} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
            <img src={foto.url} alt="" className="h-full w-full object-cover" />
            {indice === 0 && (
              <span className="absolute left-1.5 top-1.5 rounded-full bg-bronze px-2 py-0.5 text-[11px] font-bold text-white">
                Portada
              </span>
            )}
            {/* Visible siempre en pantallas táctiles; en escritorio aparece al pasar el mouse o al enfocar un botón */}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/50 to-transparent p-1.5 opacity-100 transition sm:opacity-0 sm:focus-within:opacity-100 sm:group-hover:opacity-100">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => onMover(indice, -1)}
                  disabled={reordenando || indice === 0}
                  aria-label="Mover foto hacia la izquierda"
                  className={botonFoto}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onMover(indice, 1)}
                  disabled={reordenando || indice === cantidad - 1}
                  aria-label="Mover foto hacia la derecha"
                  className={botonFoto}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
                {indice > 0 && (
                  <button
                    type="button"
                    onClick={() => onHacerPortada(foto.id)}
                    disabled={reordenando}
                    aria-label="Hacer portada"
                    title="Hacer portada"
                    className={botonFoto}
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => onEliminar(foto, indice)}
                disabled={reordenando}
                aria-label="Eliminar foto"
                className={botonFoto}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
        {!llegoAlMaximo && (
          <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 transition hover:border-bronze hover:text-bronze">
            {subiendoFoto ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
            <span className="text-xs font-semibold">{subiendoFoto ? 'Subiendo...' : 'Agregar fotos'}</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={onSubir} className="hidden" disabled={subiendoFoto} />
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
