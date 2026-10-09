import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react'
import api from '../services/api.js'
import PublicacionCard from '../components/PublicacionCard.jsx'
import FiltroAcordeon from '../components/FiltroAcordeon.jsx'
import Paginador from '../components/Paginador.jsx'
import { LOGOS } from '../components/LogoMarca.jsx'
import {
  FILTROS_LISTA,
  FILTROS_ESCALAR,
  aSearchParams,
  alternarEnLista,
  bandasDePrecio,
  conFiltro,
  leerFiltros,
  paramsParaApi,
} from '../utils/catalogoParams.js'
import { ESTADO, TIPO_CARROCERIA, TRANSMISION, ZONA } from '../utils/etiquetas.js'
import { mensajeDeError } from '../utils/errores.js'
import useTitulo from '../hooks/useTitulo.js'

const ORDENES = [
  { value: 'relevancia', label: 'Relevancia' },
  { value: 'precio_asc', label: 'Menor precio' },
  { value: 'precio_desc', label: 'Mayor precio' },
  { value: 'anio_desc', label: 'Año: más nuevo' },
  { value: 'km_asc', label: 'Menos km' },
]

// Lo que se escribe (búsqueda, rangos) espera este tiempo antes de pasar a la URL y pedir al backend,
// para no hacer un pedido por tecla.
const DEBOUNCE_MS = 350

const inputClase =
  'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-navy outline-none focus:border-bronze'

const formatoNumero = (valor) => new Intl.NumberFormat('es-AR').format(valor)

const opcionesDeFacetas = (lista, etiquetar = (valor) => valor) =>
  (lista ?? []).map(({ valor }) => ({ value: valor, label: etiquetar(valor) }))

// Campo de texto con estado local (la persona ve lo que escribe al instante) que recién pasa a la URL
// después de DEBOUNCE_MS sin teclear. Si la URL cambia desde afuera (atrás, un link, un chip) el campo se resincroniza.
function useCampoConDebounce(valorUrl, alConfirmar) {
  const [valor, setValor] = useState(valorUrl)
  const alConfirmarRef = useRef(alConfirmar)
  alConfirmarRef.current = alConfirmar
  const timer = useRef(null)

  useEffect(() => {
    clearTimeout(timer.current)
    setValor(valorUrl)
  }, [valorUrl])

  useEffect(() => () => clearTimeout(timer.current), [])

  const cambiar = (nuevo) => {
    setValor(nuevo)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => alConfirmarRef.current(nuevo), DEBOUNCE_MS)
  }

  // Para acciones discretas (elegir una banda de precio): sin esperar.
  const fijarYa = (nuevo) => {
    clearTimeout(timer.current)
    setValor(nuevo)
    alConfirmarRef.current(nuevo)
  }

  return [valor, cambiar, fijarYa]
}

function ChipsFiltro({ opciones, activos, onToggle }) {
  if (opciones.length === 0) return <p className="text-xs text-slate-400">Sin opciones por ahora</p>

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
  useTitulo('Autos usados')
  const [searchParams, setSearchParams] = useSearchParams()
  // La URL es la ÚNICA fuente de verdad de los filtros, el orden y la página: recargar, compartir el link
  // o apretar "atrás" vuelven exactamente al mismo listado.
  const filtros = useMemo(() => leerFiltros(searchParams), [searchParams])
  // En el celular los filtros arrancan plegados para ver los autos enseguida; en pantallas grandes siempre se ven.
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)

  // Los campos con debounce y los efectos de más abajo leen siempre el estado más reciente desde acá:
  // si dos campos confirman casi juntos, el segundo parte de lo que escribió el primero.
  const filtrosRef = useRef(filtros)
  filtrosRef.current = filtros

  const [listado, setListado] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [facetas, setFacetas] = useState(null)
  const [mostrarRangosPrecio, setMostrarRangosPrecio] = useState(false)

  // Cambiar un filtro reemplaza la entrada del historial (no se llena de pasos); cambiar de página la agrega.
  const escribir = (nuevos, { replace = true } = {}) => {
    filtrosRef.current = nuevos
    setSearchParams(aSearchParams(nuevos), { replace })
  }
  const escribirFiltro = (clave, valor) => escribir(conFiltro(filtrosRef.current, clave, valor))

  const alternar = (clave) => (valor) => {
    let nuevos = alternarEnLista(filtrosRef.current, clave, valor)
    // Al sacar una marca, los modelos elegidos que eran de esa marca dejan de tener sentido.
    if (clave === 'marca' && nuevos.marca.length > 0 && facetas?.modelos) {
      const marcas = nuevos.marca.map((m) => m.toLowerCase())
      const modelosValidos = new Set(
        facetas.modelos.filter((m) => marcas.includes(m.marca.toLowerCase())).map((m) => m.valor)
      )
      nuevos = { ...nuevos, modelo: nuevos.modelo.filter((m) => modelosValidos.has(m)) }
    }
    escribir(nuevos)
  }

  const irAPagina = (pagina) => {
    escribir({ ...filtrosRef.current, pagina }, { replace: false })
    window.scrollTo({ top: 0 })
  }

  const limpiarFiltros = () => {
    filtrosRef.current = leerFiltros(new URLSearchParams())
    setSearchParams({}, { replace: true })
  }

  const [busqueda, setBusqueda] = useCampoConDebounce(filtros.busqueda, (v) => escribirFiltro('busqueda', v))
  const [precioMin, setPrecioMin, fijarPrecioMin] = useCampoConDebounce(filtros.precioMin, (v) =>
    escribirFiltro('precioMin', v)
  )
  const [precioMax, setPrecioMax, fijarPrecioMax] = useCampoConDebounce(filtros.precioMax, (v) =>
    escribirFiltro('precioMax', v)
  )
  const [anioMin, setAnioMin] = useCampoConDebounce(filtros.anioMin, (v) => escribirFiltro('anioMin', v))
  const [anioMax, setAnioMax] = useCampoConDebounce(filtros.anioMax, (v) => escribirFiltro('anioMax', v))
  const [kmMax, setKmMax] = useCampoConDebounce(filtros.kmMax, (v) => escribirFiltro('kmMax', v))

  // Las opciones, los rangos y el histograma salen del catálogo real. Se piden una vez por visita
  // (no se recalculan con los filtros activos: una combinación puede dar 0 resultados y se resuelve con el estado vacío).
  useEffect(() => {
    const controller = new AbortController()
    api.get('/publicaciones/facetas', { signal: controller.signal })
      .then((res) => setFacetas(res.data))
      .catch(() => {
        if (!controller.signal.aborted) setFacetas(null)
      })
    return () => controller.abort()
  }, [])

  // Cada cambio de la URL pide su página; el pedido anterior se cancela para que una respuesta lenta no pise a la nueva.
  useEffect(() => {
    const controller = new AbortController()
    setCargando(true)
    setError('')

    api.get('/publicaciones', { params: paramsParaApi(filtros), signal: controller.signal })
      .then((res) => {
        setListado(res.data)
        // Página que ya no existe (link viejo, autos vendidos): se reemplaza por la última sin sumar historial.
        if (res.data.totalPaginas > 0 && filtros.pagina > res.data.totalPaginas) {
          escribir({ ...filtros, pagina: res.data.totalPaginas })
        }
      })
      .catch((err) => {
        if (controller.signal.aborted) return
        setListado(null)
        setError(mensajeDeError(err, 'No pudimos cargar los autos. Probá de nuevo en un rato.'))
      })
      .finally(() => {
        if (!controller.signal.aborted) setCargando(false)
      })

    return () => controller.abort()
    // escribir cambia de identidad en cada render; lo que dispara el pedido es solo la URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros])

  const marcasDisponibles = useMemo(() => opcionesDeFacetas(facetas?.marcas), [facetas])
  const modelosDisponibles = useMemo(() => {
    const marcas = filtros.marca.map((m) => m.toLowerCase())
    const modelos = (facetas?.modelos ?? []).filter((m) => marcas.length === 0 || marcas.includes(m.marca.toLowerCase()))
    return opcionesDeFacetas([...new Map(modelos.map((m) => [m.valor, m])).values()])
  }, [facetas, filtros.marca])
  const coloresDisponibles = useMemo(() => opcionesDeFacetas(facetas?.colores), [facetas])
  const tiposDisponibles = useMemo(
    () => opcionesDeFacetas(facetas?.tipos, (v) => TIPO_CARROCERIA[v] ?? v),
    [facetas]
  )
  const zonasDisponibles = useMemo(() => opcionesDeFacetas(facetas?.zonas, (v) => ZONA[v] ?? v), [facetas])
  const transmisionesDisponibles = useMemo(
    () => opcionesDeFacetas(facetas?.transmisiones, (v) => TRANSMISION[v] ?? v),
    [facetas]
  )
  const estadosDisponibles = useMemo(
    () => opcionesDeFacetas(facetas?.estados, (v) => ESTADO[v]?.texto ?? v),
    [facetas]
  )

  const rangoPrecio = facetas?.precio ?? null
  const precioTope = rangoPrecio ? { min: Math.floor(rangoPrecio.min), max: Math.ceil(rangoPrecio.max) } : null
  const hayRangoDePrecio = precioTope !== null && precioTope.max > precioTope.min
  const histograma = rangoPrecio?.histograma ?? []
  const maxCantidadTramo = Math.max(...histograma.map((t) => t.cantidad), 1)
  const bandas = useMemo(
    () => (rangoPrecio ? bandasDePrecio(rangoPrecio.min, rangoPrecio.max) : []),
    [rangoPrecio]
  )

  const hayFiltrosActivos =
    FILTROS_LISTA.some((clave) => filtros[clave].length > 0) ||
    FILTROS_ESCALAR.some((clave) => clave !== 'orden' && filtros[clave] !== '')

  const filtrosActivos = useMemo(() => {
    const chips = []
    const quitarEscalar = (clave) => () => escribirFiltro(clave, '')
    const quitarDeLista = (clave) => (valor) => () => alternar(clave)(valor)
    const deLista = (clave, prefijo, etiquetar = (v) => v) =>
      filtros[clave].forEach((valor) =>
        chips.push({ id: `${clave}-${valor}`, label: `${prefijo}: ${etiquetar(valor)}`, onQuitar: quitarDeLista(clave)(valor) })
      )

    if (filtros.busqueda) chips.push({ id: 'busqueda', label: `"${filtros.busqueda}"`, onQuitar: quitarEscalar('busqueda') })
    if (filtros.precioMin)
      chips.push({ id: 'precioMin', label: `Precio desde $${formatoNumero(filtros.precioMin)}`, onQuitar: quitarEscalar('precioMin') })
    if (filtros.precioMax)
      chips.push({ id: 'precioMax', label: `Precio hasta $${formatoNumero(filtros.precioMax)}`, onQuitar: quitarEscalar('precioMax') })
    if (filtros.ofertas) chips.push({ id: 'ofertas', label: 'Solo ofertas', onQuitar: quitarEscalar('ofertas') })
    deLista('zona', 'Ubicación', (v) => ZONA[v] ?? v)
    deLista('marca', 'Marca')
    deLista('modelo', 'Modelo')
    if (filtros.anioMin) chips.push({ id: 'anioMin', label: `Año desde ${filtros.anioMin}`, onQuitar: quitarEscalar('anioMin') })
    if (filtros.anioMax) chips.push({ id: 'anioMax', label: `Año hasta ${filtros.anioMax}`, onQuitar: quitarEscalar('anioMax') })
    if (filtros.kmMax) chips.push({ id: 'kmMax', label: `Hasta ${formatoNumero(filtros.kmMax)} km`, onQuitar: quitarEscalar('kmMax') })
    deLista('tipo', 'Tipo', (v) => TIPO_CARROCERIA[v] ?? v)
    deLista('transmision', 'Transmisión', (v) => TRANSMISION[v] ?? v)
    deLista('color', 'Color')
    deLista('estado', 'Disponibilidad', (v) => ESTADO[v]?.texto ?? v)
    return chips
    // Los quitar de cada chip leen filtrosRef: solo hay que rearmar la lista cuando cambia la URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros, facetas])

  const categoriasActivas = [
    Boolean(filtros.precioMin) || Boolean(filtros.precioMax),
    Boolean(filtros.ofertas),
    filtros.zona.length > 0,
    filtros.marca.length > 0,
    filtros.modelo.length > 0,
    Boolean(filtros.anioMin) || Boolean(filtros.anioMax) || Boolean(filtros.kmMax),
    filtros.tipo.length > 0,
    filtros.transmision.length > 0,
    filtros.color.length > 0,
    filtros.estado.length > 0,
  ].filter(Boolean).length

  const ordenActual = ORDENES.some((o) => o.value === filtros.orden) ? filtros.orden : 'relevancia'
  const total = listado?.totalElementos ?? 0
  const sinResultados = !cargando && !error && listado !== null && listado.contenido.length === 0

  return (
    <main className="min-h-screen bg-[#fafaf9]">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Autos usados</p>

        <div className="mb-8 flex items-center gap-3 rounded-2xl border border-black/5 bg-white px-5 py-4 shadow-sm shadow-navy/5">
          <Search className="h-5 w-5 shrink-0 text-bronze" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscá por marca o modelo"
            maxLength={60}
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

        <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:gap-10">
          <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto lg:pb-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between lg:mb-1">
                <button
                  type="button"
                  onClick={() => setFiltrosAbiertos((abierto) => !abierto)}
                  aria-expanded={filtrosAbiertos}
                  aria-controls="panel-filtros"
                  className="flex flex-1 items-center gap-2 py-1 text-left text-sm font-bold text-navy-dark lg:pointer-events-none"
                >
                  <SlidersHorizontal className="h-4 w-4 text-bronze" />
                  Filtros{categoriasActivas > 0 ? ` (${categoriasActivas})` : ''}
                  <ChevronDown className={`ml-auto h-4 w-4 text-slate-400 transition lg:hidden ${filtrosAbiertos ? 'rotate-180' : ''}`} />
                </button>
                {hayFiltrosActivos && (
                  <button type="button" onClick={limpiarFiltros} className="ml-3 text-xs font-bold text-bronze hover:underline">
                    Limpiar
                  </button>
                )}
              </div>

              <div id="panel-filtros" className={`${filtrosAbiertos ? 'block' : 'hidden'} lg:block`}>

              <FiltroAcordeon titulo="Precio" contador={(filtros.precioMin ? 1 : 0) + (filtros.precioMax ? 1 : 0)}>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex min-w-0 items-center gap-1 rounded-xl border border-slate-200 px-2 py-2 transition focus-within:border-bronze">
                    <span className="shrink-0 text-xs font-bold text-slate-400">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      aria-label="Precio desde"
                      value={precioMin ? formatoNumero(precioMin) : ''}
                      onChange={(e) => setPrecioMin(e.target.value.replace(/\D/g, ''))}
                      placeholder={precioTope ? formatoNumero(precioTope.min) : 'Desde'}
                      className="w-full min-w-0 text-xs font-semibold text-navy outline-none"
                    />
                  </label>
                  <label className="flex min-w-0 items-center gap-1 rounded-xl border border-slate-200 px-2 py-2 transition focus-within:border-bronze">
                    <span className="shrink-0 text-xs font-bold text-slate-400">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      aria-label="Precio hasta"
                      value={precioMax ? formatoNumero(precioMax) : ''}
                      onChange={(e) => setPrecioMax(e.target.value.replace(/\D/g, ''))}
                      placeholder={precioTope ? formatoNumero(precioTope.max) : 'Hasta'}
                      className="w-full min-w-0 text-xs font-semibold text-navy outline-none"
                    />
                  </label>
                </div>

                {hayRangoDePrecio &&
                  (() => {
                    // Lo que escribe la persona puede ser cualquier número (incluso fuera del rango del catálogo,
                    // como $0). Para el slider y el histograma se "recorta" entre el mínimo y el máximo reales,
                    // así el resaltado siempre es coherente con las dos puntas.
                    const { min, max } = precioTope
                    const clamp = (valor) => Math.min(max, Math.max(min, valor))
                    const sliderMin = clamp(precioMin ? Number(precioMin) : min)
                    const sliderMax = clamp(precioMax ? Number(precioMax) : max)
                    const porcentajeMin = ((sliderMin - min) / (max - min)) * 100
                    const porcentajeMax = ((sliderMax - min) / (max - min)) * 100

                    return (
                      <>
                        <div className="mt-4 flex h-14 items-end gap-0.5">
                          {histograma.map((tramo, i) => {
                            const centro = (tramo.desde + tramo.hasta) / 2
                            const enRango = centro >= sliderMin && centro <= sliderMax
                            const altura = Math.max((tramo.cantidad / maxCantidadTramo) * 100, 6)
                            return (
                              <div
                                key={i}
                                title={`${tramo.cantidad} auto(s)`}
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
                              left: `${porcentajeMin}%`,
                              right: `${100 - porcentajeMax}%`,
                            }}
                          />
                          <input
                            type="range"
                            aria-label="Precio mínimo"
                            min={min}
                            max={max}
                            value={sliderMin}
                            onChange={(e) => {
                              const valor = Math.min(Number(e.target.value), sliderMax)
                              setPrecioMin(String(valor))
                            }}
                            className="precio-range pointer-events-none absolute inset-0 h-4 w-full appearance-none bg-transparent"
                          />
                          <input
                            type="range"
                            aria-label="Precio máximo"
                            min={min}
                            max={max}
                            value={sliderMax}
                            onChange={(e) => {
                              const valor = Math.max(Number(e.target.value), sliderMin)
                              setPrecioMax(String(valor))
                            }}
                            className="precio-range pointer-events-none absolute inset-0 h-4 w-full appearance-none bg-transparent"
                          />
                        </div>
                      </>
                    )
                  })()}

                {bandas.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setMostrarRangosPrecio((v) => !v)}
                    className="mt-3 text-xs font-bold text-bronze hover:underline"
                  >
                    Ver rangos de precios
                  </button>
                )}

                {mostrarRangosPrecio && bandas.length > 1 && (
                  <div className="mt-2 space-y-1 rounded-xl border border-slate-100 bg-slate-50 p-2">
                    {bandas.map((banda, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          fijarPrecioMin(String(banda.desde))
                          fijarPrecioMax(String(banda.hasta))
                        }}
                        className="block w-full rounded-lg px-2 py-1.5 text-left text-xs font-semibold text-navy-dark transition hover:bg-bronze/10"
                      >
                        $ {formatoNumero(banda.desde)} - $ {formatoNumero(banda.hasta)}
                      </button>
                    ))}
                  </div>
                )}
              </FiltroAcordeon>

              <FiltroAcordeon titulo="Ofertas" contador={filtros.ofertas ? 1 : 0}>
                <label className="flex items-center gap-2 text-sm font-semibold text-navy">
                  <input
                    type="checkbox"
                    checked={filtros.ofertas === 'true'}
                    onChange={(e) => escribirFiltro('ofertas', e.target.checked ? 'true' : '')}
                    className="h-4 w-4 rounded border-slate-300 text-bronze focus:ring-bronze"
                  />
                  Solo autos en oferta
                </label>
              </FiltroAcordeon>

              <FiltroAcordeon titulo="Ubicación" contador={filtros.zona.length}>
                <ChipsFiltro opciones={zonasDisponibles} activos={filtros.zona} onToggle={alternar('zona')} />
              </FiltroAcordeon>

              <FiltroAcordeon titulo="Marca" contador={filtros.marca.length}>
                {marcasDisponibles.length === 0 ? (
                  <p className="text-xs text-slate-400">Sin opciones por ahora</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {marcasDisponibles.map(({ value }) => (
                      <ChipMarcaLogo
                        key={value}
                        marca={value}
                        activa={filtros.marca.includes(value)}
                        onToggle={alternar('marca')}
                      />
                    ))}
                  </div>
                )}
              </FiltroAcordeon>

              <FiltroAcordeon titulo="Modelo" contador={filtros.modelo.length}>
                <ChipsFiltro opciones={modelosDisponibles} activos={filtros.modelo} onToggle={alternar('modelo')} />
              </FiltroAcordeon>

              <FiltroAcordeon
                titulo="Año y Kilometraje"
                contador={(filtros.anioMin ? 1 : 0) + (filtros.anioMax ? 1 : 0) + (filtros.kmMax ? 1 : 0)}
              >
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={anioMin}
                      onChange={(e) => setAnioMin(e.target.value)}
                      placeholder={facetas?.anio ? `Año desde (${facetas.anio.min})` : 'Año desde'}
                      className={inputClase}
                    />
                    <input
                      type="number"
                      value={anioMax}
                      onChange={(e) => setAnioMax(e.target.value)}
                      placeholder={facetas?.anio ? `Año hasta (${facetas.anio.max})` : 'Año hasta'}
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

              <FiltroAcordeon titulo="Tipo de Auto" contador={filtros.tipo.length}>
                <ChipsFiltro opciones={tiposDisponibles} activos={filtros.tipo} onToggle={alternar('tipo')} />
              </FiltroAcordeon>

              <FiltroAcordeon titulo="Transmisión" contador={filtros.transmision.length}>
                <ChipsFiltro
                  opciones={transmisionesDisponibles}
                  activos={filtros.transmision}
                  onToggle={alternar('transmision')}
                />
              </FiltroAcordeon>

              <FiltroAcordeon titulo="Color exterior" contador={filtros.color.length}>
                <ChipsFiltro opciones={coloresDisponibles} activos={filtros.color} onToggle={alternar('color')} />
              </FiltroAcordeon>

              <FiltroAcordeon titulo="Disponibilidad del auto" contador={filtros.estado.length}>
                <ChipsFiltro opciones={estadosDisponibles} activos={filtros.estado} onToggle={alternar('estado')} />
              </FiltroAcordeon>
              </div>
            </div>
          </aside>

          <section>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-500" aria-live="polite">
                {listado === null ? (cargando ? 'Cargando autos...' : '') : `${formatoNumero(total)} resultados`}
              </p>
              <select
                value={ordenActual}
                onChange={(e) => escribirFiltro('orden', e.target.value === 'relevancia' ? '' : e.target.value)}
                aria-label="Ordenar por"
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-navy outline-none"
              >
                {ORDENES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {error && <p className="mb-6 text-red-600">{error}</p>}

            {sinResultados &&
              (hayFiltrosActivos ? (
                <div>
                  <p className="text-slate-500">No encontramos autos con esos filtros.</p>
                  <button
                    type="button"
                    onClick={limpiarFiltros}
                    className="mt-3 rounded-full border border-bronze px-4 py-2 text-xs font-bold text-bronze transition hover:bg-bronze hover:text-white"
                  >
                    Limpiar filtros
                  </button>
                </div>
              ) : (
                <p className="text-slate-500">Todavía no hay autos publicados.</p>
              ))}

            {listado !== null && listado.contenido.length > 0 && (
              <div
                className={`grid gap-5 transition-opacity sm:grid-cols-2 xl:grid-cols-3 ${cargando ? 'opacity-60' : ''}`}
              >
                {listado.contenido.map((p) => (
                  <Link key={p.id} to={`/publicaciones/${p.id}`}>
                    <PublicacionCard publicacion={p} />
                  </Link>
                ))}
              </div>
            )}

            <Paginador pagina={filtros.pagina} totalPaginas={listado?.totalPaginas ?? 0} onCambiar={irAPagina} />
          </section>
        </div>
      </div>
    </main>
  )
}
