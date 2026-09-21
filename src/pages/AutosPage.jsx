import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import PublicacionCard from '../components/PublicacionCard.jsx'
import FiltroAcordeon from '../components/FiltroAcordeon.jsx'
import {
  catalogoMock,
  ESTADO_LABELS,
  PRECIO_MIN,
  PRECIO_MAX,
  HISTOGRAMA_PRECIOS,
  MAX_CANTIDAD_BIN_PRECIO,
  BANDAS_PRECIO,
} from '../mocks/catalogoMock.js'
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

const formatoNumero = (valor) => new Intl.NumberFormat('es-AR').format(valor)

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
  const [searchParams] = useSearchParams()
  const [busqueda, setBusqueda] = useState(() => searchParams.get('busqueda') || '')
  const [precioMin, setPrecioMin] = useState(() => searchParams.get('precioMin') || '')
  const [precioMax, setPrecioMax] = useState(() => searchParams.get('precioMax') || '')
  const [soloOfertas, setSoloOfertas] = useState(false)
  const [ubicacionesActivas, setUbicacionesActivas] = useState([])
  const [marcasActivas, setMarcasActivas] = useState(() => {
    const marca = searchParams.get('marca')
    return marca ? [marca] : []
  })
  const [modelosActivos, setModelosActivos] = useState([])
  const [anioMin, setAnioMin] = useState('')
  const [anioMax, setAnioMax] = useState('')
  const [kmMax, setKmMax] = useState('')
  const [tiposActivos, setTiposActivos] = useState([])
  const [mecanicasActivas, setMecanicasActivas] = useState([])
  const [coloresActivos, setColoresActivos] = useState([])
  const [disponibilidadActiva, setDisponibilidadActiva] = useState([])
  const [orden, setOrden] = useState('relevancia')
  const [mostrarRangosPrecio, setMostrarRangosPrecio] = useState(false)

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

  const filtrosActivos = useMemo(() => {
    const chips = []
    if (busqueda) chips.push({ id: 'busqueda', label: `"${busqueda}"`, onQuitar: () => setBusqueda('') })
    if (precioMin) chips.push({ id: 'precioMin', label: `Precio desde $${formatoNumero(precioMin)}`, onQuitar: () => setPrecioMin('') })
    if (precioMax) chips.push({ id: 'precioMax', label: `Precio hasta $${formatoNumero(precioMax)}`, onQuitar: () => setPrecioMax('') })
    if (soloOfertas) chips.push({ id: 'ofertas', label: 'Solo ofertas', onQuitar: () => setSoloOfertas(false) })
    ubicacionesActivas.forEach((u) =>
      chips.push({ id: `ubicacion-${u}`, label: `Ubicación: ${u}`, onQuitar: () => toggleUbicacion(u) })
    )
    marcasActivas.forEach((m) => chips.push({ id: `marca-${m}`, label: `Marca: ${m}`, onQuitar: () => toggleMarca(m) }))
    modelosActivos.forEach((m) => chips.push({ id: `modelo-${m}`, label: `Modelo: ${m}`, onQuitar: () => toggleModelo(m) }))
    if (anioMin) chips.push({ id: 'anioMin', label: `Año desde ${anioMin}`, onQuitar: () => setAnioMin('') })
    if (anioMax) chips.push({ id: 'anioMax', label: `Año hasta ${anioMax}`, onQuitar: () => setAnioMax('') })
    if (kmMax) chips.push({ id: 'kmMax', label: `Hasta ${formatoNumero(kmMax)} km`, onQuitar: () => setKmMax('') })
    tiposActivos.forEach((t) => chips.push({ id: `tipo-${t}`, label: `Tipo: ${t}`, onQuitar: () => toggleTipo(t) }))
    mecanicasActivas.forEach((m) =>
      chips.push({ id: `mecanica-${m}`, label: `Mecánica: ${m}`, onQuitar: () => toggleMecanica(m) })
    )
    coloresActivos.forEach((c) => chips.push({ id: `color-${c}`, label: `Color: ${c}`, onQuitar: () => toggleColor(c) }))
    disponibilidadActiva.forEach((e) =>
      chips.push({ id: `estado-${e}`, label: `Estado: ${ESTADO_LABELS[e] || e}`, onQuitar: () => toggleDisponibilidad(e) })
    )
    return chips
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
  ])

  const categoriasActivas = [
    Boolean(precioMin) || Boolean(precioMax),
    soloOfertas,
    ubicacionesActivas.length > 0,
    marcasActivas.length > 0,
    modelosActivos.length > 0,
    Boolean(anioMin) || Boolean(anioMax) || Boolean(kmMax),
    tiposActivos.length > 0,
    mecanicasActivas.length > 0,
    coloresActivos.length > 0,
    disponibilidadActiva.length > 0,
  ].filter(Boolean).length

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

        {filtrosActivos.length > 0 && (
          <div className="mb-8 flex flex-wrap items-center gap-2 rounded-2xl border border-bronze/20 bg-bronze/5 px-4 py-3">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-bronze">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filtrando por:
            </span>
            {filtrosActivos.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={f.onQuitar}
                className="flex items-center gap-1.5 rounded-full border border-bronze/30 bg-white px-3 py-1.5 text-xs font-semibold text-navy-dark shadow-sm transition hover:border-bronze hover:bg-bronze/10"
              >
                {f.label}
                <X className="h-3 w-3 text-bronze" />
              </button>
            ))}
            <button
              type="button"
              onClick={limpiarFiltros}
              className="ml-1 text-xs font-bold text-bronze hover:underline"
            >
              Limpiar todo
            </button>
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto lg:pb-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-navy-dark">
                  <SlidersHorizontal className="h-4 w-4 text-bronze" />
                  Filtros{categoriasActivas > 0 ? ` (${categoriasActivas})` : ''}
                </div>
                {hayFiltrosActivos && (
                  <button type="button" onClick={limpiarFiltros} className="text-xs font-bold text-bronze hover:underline">
                    Limpiar
                  </button>
                )}
              </div>

              <FiltroAcordeon titulo="Precio" contador={(precioMin ? 1 : 0) + (precioMax ? 1 : 0)}>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex min-w-0 items-center gap-1 rounded-xl border border-slate-200 px-2 py-2 transition focus-within:border-bronze">
                    <span className="shrink-0 text-xs font-bold text-slate-400">$</span>
                    <input
                      type="number"
                      value={precioMin}
                      onChange={(e) => setPrecioMin(e.target.value)}
                      placeholder={formatoNumero(PRECIO_MIN)}
                      className="w-full min-w-0 text-xs font-semibold text-navy outline-none"
                    />
                  </label>
                  <label className="flex min-w-0 items-center gap-1 rounded-xl border border-slate-200 px-2 py-2 transition focus-within:border-bronze">
                    <span className="shrink-0 text-xs font-bold text-slate-400">$</span>
                    <input
                      type="number"
                      value={precioMax}
                      onChange={(e) => setPrecioMax(e.target.value)}
                      placeholder={formatoNumero(PRECIO_MAX)}
                      className="w-full min-w-0 text-xs font-semibold text-navy outline-none"
                    />
                  </label>
                </div>

                <div className="mt-4 flex h-14 items-end gap-0.5">
                  {HISTOGRAMA_PRECIOS.map((bin, i) => {
                    const centro = (bin.desde + bin.hasta) / 2
                    const sliderMin = precioMin ? Number(precioMin) : PRECIO_MIN
                    const sliderMax = precioMax ? Number(precioMax) : PRECIO_MAX
                    const enRango = centro >= sliderMin && centro <= sliderMax
                    const altura = Math.max((bin.cantidad / MAX_CANTIDAD_BIN_PRECIO) * 100, 6)
                    return (
                      <div
                        key={i}
                        title={`${bin.cantidad} auto(s)`}
                        className={`flex-1 rounded-sm transition-colors ${enRango ? 'bg-bronze' : 'bg-slate-200'}`}
                        style={{ height: `${altura}%` }}
                      />
                    )
                  })}
                </div>

                <div className="relative mt-3 h-4">
                  <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-slate-200" />
                  <div
                    className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-bronze"
                    style={{
                      left: `${((precioMin ? Number(precioMin) : PRECIO_MIN - PRECIO_MIN) / (PRECIO_MAX - PRECIO_MIN)) * 100}%`,
                      right: `${100 - ((precioMax ? Number(precioMax) : PRECIO_MAX - PRECIO_MIN) / (PRECIO_MAX - PRECIO_MIN)) * 100}%`,
                    }}
                  />
                  <input
                    type="range"
                    min={PRECIO_MIN}
                    max={PRECIO_MAX}
                    value={precioMin ? Number(precioMin) : PRECIO_MIN}
                    onChange={(e) => {
                      const valor = Math.min(Number(e.target.value), precioMax ? Number(precioMax) : PRECIO_MAX)
                      setPrecioMin(String(valor))
                    }}
                    className="precio-range pointer-events-none absolute inset-0 h-4 w-full appearance-none bg-transparent"
                  />
                  <input
                    type="range"
                    min={PRECIO_MIN}
                    max={PRECIO_MAX}
                    value={precioMax ? Number(precioMax) : PRECIO_MAX}
                    onChange={(e) => {
                      const valor = Math.max(Number(e.target.value), precioMin ? Number(precioMin) : PRECIO_MIN)
                      setPrecioMax(String(valor))
                    }}
                    className="precio-range pointer-events-none absolute inset-0 h-4 w-full appearance-none bg-transparent"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setMostrarRangosPrecio((v) => !v)}
                  className="mt-3 text-xs font-bold text-bronze hover:underline"
                >
                  Ver rangos de precios
                </button>

                {mostrarRangosPrecio && (
                  <div className="mt-2 space-y-1 rounded-xl border border-slate-100 bg-slate-50 p-2">
                    {BANDAS_PRECIO.map((banda, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setPrecioMin(String(banda.desde))
                          setPrecioMax(String(banda.hasta))
                        }}
                        className="block w-full rounded-lg px-2 py-1.5 text-left text-xs font-semibold text-navy-dark transition hover:bg-bronze/10"
                      >
                        $ {formatoNumero(banda.desde)} - $ {formatoNumero(banda.hasta)}
                      </button>
                    ))}
                  </div>
                )}
              </FiltroAcordeon>

              <FiltroAcordeon titulo="Ofertas" contador={soloOfertas ? 1 : 0}>
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

              <FiltroAcordeon titulo="Ubicación" contador={ubicacionesActivas.length}>
                <ChipsFiltro opciones={ubicacionesDisponibles} activos={ubicacionesActivas} onToggle={toggleUbicacion} />
              </FiltroAcordeon>

              <FiltroAcordeon titulo="Marca" contador={marcasActivas.length}>
                <div className="flex flex-wrap gap-2">
                  {marcasDisponibles.map(({ value }) => (
                    <ChipMarcaLogo key={value} marca={value} activa={marcasActivas.includes(value)} onToggle={toggleMarca} />
                  ))}
                </div>
              </FiltroAcordeon>

              <FiltroAcordeon titulo="Modelo" contador={modelosActivos.length}>
                <ChipsFiltro opciones={modelosDisponibles} activos={modelosActivos} onToggle={toggleModelo} />
              </FiltroAcordeon>

              <FiltroAcordeon titulo="Año y Kilometraje" contador={(anioMin ? 1 : 0) + (anioMax ? 1 : 0) + (kmMax ? 1 : 0)}>
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

              <FiltroAcordeon titulo="Tipo de Auto" contador={tiposActivos.length}>
                <ChipsFiltro opciones={tiposDisponibles} activos={tiposActivos} onToggle={toggleTipo} />
              </FiltroAcordeon>

              <FiltroAcordeon titulo="Mecánica" contador={mecanicasActivas.length}>
                <ChipsFiltro opciones={mecanicasDisponibles} activos={mecanicasActivas} onToggle={toggleMecanica} />
              </FiltroAcordeon>

              <FiltroAcordeon titulo="Color exterior" contador={coloresActivos.length}>
                <ChipsFiltro opciones={coloresDisponibles} activos={coloresActivos} onToggle={toggleColor} />
              </FiltroAcordeon>

              <FiltroAcordeon titulo="Disponibilidad del auto" contador={disponibilidadActiva.length}>
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
