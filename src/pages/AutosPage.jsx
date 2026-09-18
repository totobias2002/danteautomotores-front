import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, SlidersHorizontal } from 'lucide-react'
import PublicacionCard from '../components/PublicacionCard.jsx'
import FiltroAcordeon from '../components/FiltroAcordeon.jsx'
import { catalogoMock, ESTADO_LABELS } from '../mocks/catalogoMock.js'
import { LOGOS } from '../components/LogoMarca.jsx'

// TODO: sacar esto cuando el backend esté levantado y probado, y traer el
// catálogo real paginado desde /publicaciones.
const ORDENES = [
  { value: 'relevancia', label: 'Relevancia' },
  { value: 'precio_asc', label: 'Menor precio' },
  { value: 'precio_desc', label: 'Mayor precio' },
  { value: 'anio_desc', label: 'Año: más nuevo' },
]

const inputClase =
  'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-navy outline-none focus:border-bronze'

function ChipsFiltro({ opciones, activos, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {opciones.map(({ value, label }) => {
        const activa = activos.includes(value)
        return (
          <button
            key={value}
            type="button"
            onClick={() => onToggle(value)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              activa
                ? 'border-bronze bg-bronze text-white'
                : 'border-slate-200 text-slate-500 hover:border-bronze/40 hover:text-bronze'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

function ChipMarcaLogo({ marca, activa, onToggle }) {
  const src = LOGOS[marca]

  return (
    <button
      type="button"
      onClick={() => onToggle(marca)}
      title={marca}
      className={`flex h-14 w-20 items-center justify-center rounded-xl border p-2 transition ${
        activa ? 'border-bronze bg-bronze/10' : 'border-slate-200 hover:border-bronze/40'
      }`}
    >
      {src ? (
        <img
          src={src}
          alt={marca}
          loading="lazy"
          className={`max-h-8 max-w-[80%] object-contain transition ${activa ? '' : 'grayscale-[35%] opacity-70'}`}
        />
      ) : (
        <span className="text-[10px] font-bold text-bronze">{marca}</span>
      )}
    </button>
  )
}

export default function AutosPage() {
  const [busqueda, setBusqueda] = useState('')
  const [precioMin, setPrecioMin] = useState('')
  const [precioMax, setPrecioMax] = useState('')
  const [soloOfertas, setSoloOfertas] = useState(false)
  const [ubicacionesActivas, setUbicacionesActivas] = useState([])
  const [marcasActivas, setMarcasActivas] = useState([])
  const [modelosActivos, setModelosActivos] = useState([])
  const [anioMin, setAnioMin] = useState('')
  const [anioMax, setAnioMax] = useState('')
  const [kmMax, setKmMax] = useState('')
  const [tiposActivos, setTiposActivos] = useState([])
  const [mecanicasActivas, setMecanicasActivas] = useState([])
  const [coloresActivos, setColoresActivos] = useState([])
  const [disponibilidadActiva, setDisponibilidadActiva] = useState([])
  const [orden, setOrden] = useState('relevancia')

  const toggleEnLista = (setter) => (valor) =>
    setter((prev) => (prev.includes(valor) ? prev.filter((v) => v !== valor) : [...prev, valor]))

  const toggleUbicacion = toggleEnLista(setUbicacionesActivas)
  const toggleMarca = toggleEnLista(setMarcasActivas)
  const toggleModelo = toggleEnLista(setModelosActivos)
  const toggleTipo = toggleEnLista(setTiposActivos)
  const toggleMecanica = toggleEnLista(setMecanicasActivas)
  const toggleColor = toggleEnLista(setColoresActivos)
  const toggleDisponibilidad = toggleEnLista(setDisponibilidadActiva)

  const comoOpciones = (lista) => lista.map((v) => ({ value: v, label: v }))

  const ubicacionesDisponibles = useMemo(
    () => comoOpciones([...new Set(catalogoMock.map((a) => a.ubicacion))].sort()),
    []
  )
  const marcasDisponibles = useMemo(
    () => comoOpciones([...new Set(catalogoMock.map((a) => a.marca))].sort()),
    []
  )
  const modelosDisponibles = useMemo(
    () => comoOpciones([...new Set(catalogoMock.map((a) => a.modelo))].sort()),
    []
  )
  const tiposDisponibles = useMemo(
    () => comoOpciones([...new Set(catalogoMock.map((a) => a.tipoAuto))].sort()),
    []
  )
  const mecanicasDisponibles = useMemo(
    () => comoOpciones([...new Set(catalogoMock.map((a) => a.mecanica))].sort()),
    []
  )
  const coloresDisponibles = useMemo(
    () => comoOpciones([...new Set(catalogoMock.map((a) => a.colorExterior))].sort()),
    []
  )
  const disponibilidadOpciones = useMemo(
    () => [...new Set(catalogoMock.map((a) => a.estado))].map((estado) => ({ value: estado, label: ESTADO_LABELS[estado] || estado })),
    []
  )

  const resultados = useMemo(() => {
    let lista = catalogoMock.filter((auto) => {
      const coincideTexto =
        !busqueda || `${auto.marca} ${auto.modelo}`.toLowerCase().includes(busqueda.toLowerCase())
      const coincidePrecioMin = !precioMin || auto.precio >= Number(precioMin)
      const coincidePrecioMax = !precioMax || auto.precio <= Number(precioMax)
      const coincideOferta = !soloOfertas || auto.oferta
      const coincideUbicacion = ubicacionesActivas.length === 0 || ubicacionesActivas.includes(auto.ubicacion)
      const coincideMarca = marcasActivas.length === 0 || marcasActivas.includes(auto.marca)
      const coincideModelo = modelosActivos.length === 0 || modelosActivos.includes(auto.modelo)
      const coincideAnioMin = !anioMin || auto.anio >= Number(anioMin)
      const coincideAnioMax = !anioMax || auto.anio <= Number(anioMax)
      const coincideKm = !kmMax || auto.kilometraje <= Number(kmMax)
      const coincideTipo = tiposActivos.length === 0 || tiposActivos.includes(auto.tipoAuto)
      const coincideMecanica = mecanicasActivas.length === 0 || mecanicasActivas.includes(auto.mecanica)
      const coincideColor = coloresActivos.length === 0 || coloresActivos.includes(auto.colorExterior)
      const coincideDisponibilidad =
        disponibilidadActiva.length === 0 || disponibilidadActiva.includes(auto.estado)

      return (
        coincideTexto &&
        coincidePrecioMin &&
        coincidePrecioMax &&
        coincideOferta &&
        coincideUbicacion &&
        coincideMarca &&
        coincideModelo &&
        coincideAnioMin &&
        coincideAnioMax &&
        coincideKm &&
        coincideTipo &&
        coincideMecanica &&
        coincideColor &&
        coincideDisponibilidad
      )
    })

    if (orden === 'precio_asc') lista = [...lista].sort((a, b) => a.precio - b.precio)
    if (orden === 'precio_desc') lista = [...lista].sort((a, b) => b.precio - a.precio)
    if (orden === 'anio_desc') lista = [...lista].sort((a, b) => b.anio - a.anio)

    return lista
  }, [
    busqueda,
    precioMin,
    precioMax,
    soloOfertas,
    ubicacionesActivas,
    marcasActivas,
    modelosActivos,
    anioMin,
    anioMax,
    kmMax,
    tiposActivos,
    mecanicasActivas,
    coloresActivos,
    disponibilidadActiva,
    orden,
  ])

  const hayFiltrosActivos =
    busqueda ||
    precioMin ||
    precioMax ||
    soloOfertas ||
    ubicacionesActivas.length > 0 ||
    marcasActivas.length > 0 ||
    modelosActivos.length > 0 ||
    anioMin ||
    anioMax ||
    kmMax ||
    tiposActivos.length > 0 ||
    mecanicasActivas.length > 0 ||
    coloresActivos.length > 0 ||
    disponibilidadActiva.length > 0

  const limpiarFiltros = () => {
    setBusqueda('')
    setPrecioMin('')
    setPrecioMax('')
    setSoloOfertas(false)
    setUbicacionesActivas([])
    setMarcasActivas([])
    setModelosActivos([])
    setAnioMin('')
    setAnioMax('')
    setKmMax('')
    setTiposActivos([])
    setMecanicasActivas([])
    setColoresActivos([])
    setDisponibilidadActiva([])
    setOrden('relevancia')
  }

  return (
    <main className="min-h-screen bg-[#fafaf9]">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Autos usados</p>

        <div className="mb-8 flex items-center gap-3 rounded-2xl border border-black/5 bg-white px-5 py-4 shadow-sm shadow-navy/5">
          <Search className="h-5 w-5 shrink-0 text-bronze" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscá por modelo"
            className="w-full text-sm font-semibold text-navy outline-none placeholder:font-normal placeholder:text-slate-400"
          />
        </div>

        <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
          <aside>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-navy-dark">
                  <SlidersHorizontal className="h-4 w-4 text-bronze" /> Filtros
                </div>
                {hayFiltrosActivos && (
                  <button type="button" onClick={limpiarFiltros} className="text-xs font-bold text-bronze hover:underline">
                    Limpiar
                  </button>
                )}
              </div>

              <FiltroAcordeon titulo="Precio">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={precioMin}
                    onChange={(e) => setPrecioMin(e.target.value)}
                    placeholder="Desde"
                    className={inputClase}
                  />
                  <input
                    type="number"
                    value={precioMax}
                    onChange={(e) => setPrecioMax(e.target.value)}
                    placeholder="Hasta"
                    className={inputClase}
                  />
                </div>
              </FiltroAcordeon>

              <FiltroAcordeon titulo="Ofertas">
                <label className="flex items-center gap-2 text-sm font-semibold text-navy">
                  <input
                    type="checkbox"
                    checked={soloOfertas}
                    onChange={(e) => setSoloOfertas(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-bronze focus:ring-bronze"
                  />
                  Solo autos en oferta
                </label>
              </FiltroAcordeon>

              <FiltroAcordeon titulo="Ubicación">
                <ChipsFiltro opciones={ubicacionesDisponibles} activos={ubicacionesActivas} onToggle={toggleUbicacion} />
              </FiltroAcordeon>

              <FiltroAcordeon titulo="Marca">
                <div className="flex flex-wrap gap-2">
                  {marcasDisponibles.map(({ value }) => (
                    <ChipMarcaLogo key={value} marca={value} activa={marcasActivas.includes(value)} onToggle={toggleMarca} />
                  ))}
                </div>
              </FiltroAcordeon>

              <FiltroAcordeon titulo="Modelo">
                <ChipsFiltro opciones={modelosDisponibles} activos={modelosActivos} onToggle={toggleModelo} />
              </FiltroAcordeon>

              <FiltroAcordeon titulo="Año y Kilometraje">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={anioMin}
                      onChange={(e) => setAnioMin(e.target.value)}
                      placeholder="Año desde"
                      className={inputClase}
                    />
                    <input
                      type="number"
                      value={anioMax}
                      onChange={(e) => setAnioMax(e.target.value)}
                      placeholder="Año hasta"
                      className={inputClase}
                    />
                  </div>
                  <input
                    type="number"
                    value={kmMax}
                    onChange={(e) => setKmMax(e.target.value)}
                    placeholder="Kilometraje máximo"
                    className={inputClase}
                  />
                </div>
              </FiltroAcordeon>

              <FiltroAcordeon titulo="Tipo de Auto">
                <ChipsFiltro opciones={tiposDisponibles} activos={tiposActivos} onToggle={toggleTipo} />
              </FiltroAcordeon>

              <FiltroAcordeon titulo="Mecánica">
                <ChipsFiltro opciones={mecanicasDisponibles} activos={mecanicasActivas} onToggle={toggleMecanica} />
              </FiltroAcordeon>

              <FiltroAcordeon titulo="Color exterior">
                <ChipsFiltro opciones={coloresDisponibles} activos={coloresActivos} onToggle={toggleColor} />
              </FiltroAcordeon>

              <FiltroAcordeon titulo="Disponibilidad del auto">
                <ChipsFiltro opciones={disponibilidadOpciones} activos={disponibilidadActiva} onToggle={toggleDisponibilidad} />
              </FiltroAcordeon>
            </div>
          </aside>

          <section>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-500">{resultados.length} resultados</p>
              <select
                value={orden}
                onChange={(e) => setOrden(e.target.value)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-navy outline-none"
              >
                {ORDENES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {resultados.length === 0 ? (
              <p className="text-slate-500">No encontramos autos con esos filtros.</p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {resultados.map((p) => (
                  <Link key={p.id} to={`/publicaciones/${p.id}`}>
                    <PublicacionCard publicacion={p} />
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
