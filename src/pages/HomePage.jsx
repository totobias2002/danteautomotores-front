import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Check, Pause, Play, Search, Sparkles } from 'lucide-react'
import api from '../services/api.js'
import PublicacionCard from '../components/PublicacionCard.jsx'
import SeccionConfianza from '../components/SeccionConfianza.jsx'
import SeccionFinanciamiento from '../components/SeccionFinanciamiento.jsx'
import LogoMarca, { LOGOS } from '../components/LogoMarca.jsx'
import { bandasDePrecio } from '../utils/catalogoParams.js'
import { mensajeDeError } from '../utils/errores.js'

const brands = ['Toyota', 'Volkswagen', 'Jeep', 'Chevrolet', 'Ford', 'Fiat', 'Peugeot', 'Renault', 'BMW']

// Marcas y bandas de precio que se muestran como accesos rápidos en el hero,
// debajo del buscador, para no tener que escribir nada.
const MARCAS_ACCESO_RAPIDO = ['Toyota', 'Volkswagen', 'Jeep', 'Ford', 'Fiat', 'Peugeot']

const formatoNumero = (valor) => new Intl.NumberFormat('es-AR').format(valor)

const etiquetaBanda = (banda, i, cantidad) => {
  if (i === 0) return `Hasta $${formatoNumero(banda.hasta)}`
  if (i === cantidad - 1) return `Más de $${formatoNumero(banda.desde)}`
  return `$${formatoNumero(banda.desde)} - $${formatoNumero(banda.hasta)}`
}

export default function HomePage() {
  const navigate = useNavigate()
  const [publicaciones, setPublicaciones] = useState([])
  const [facetas, setFacetas] = useState(null)
  const [facetasFallaron, setFacetasFallaron] = useState(false)
  const [filtros, setFiltros] = useState({ marca: '' })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [sugerenciasAbiertas, setSugerenciasAbiertas] = useState(false)
  const videoRef = useRef(null)
  const [videoPausado, setVideoPausado] = useState(false)

  // Para el autocompletado del buscador del hero: las marcas del catálogo real más cada combinación
  // "marca modelo", para que sugiera tanto si escribís una marca como si escribís (parte de) un modelo puntual.
  const sugerenciasBase = useMemo(
    () => [
      ...new Set([
        ...(facetas?.marcas ?? []).map((m) => m.valor),
        ...(facetas?.modelos ?? []).map((m) => `${m.marca} ${m.valor}`),
      ]),
    ],
    [facetas]
  )

  // Los accesos por presupuesto salen del rango de precios real; sin facetas o sin autos no se muestran.
  const bandas = useMemo(
    () => (facetas?.precio ? bandasDePrecio(facetas.precio.min, facetas.precio.max) : []),
    [facetas]
  )

  const sugerencias = useMemo(() => {
    const q = filtros.marca.trim().toLowerCase()
    if (!q) return []
    return sugerenciasBase.filter((s) => s.toLowerCase().includes(q)).slice(0, 6)
  }, [filtros.marca, sugerenciasBase])

  // Son un acceso rápido: si fallan no se muestra ningún error, solo no hay sugerencias ni presupuesto.
  useEffect(() => {
    const controller = new AbortController()
    api.get('/publicaciones/facetas', { signal: controller.signal })
      .then((res) => setFacetas(res.data))
      .catch((err) => {
        if (!controller.signal.aborted && err?.code !== 'ERR_CANCELED') setFacetasFallaron(true)
      })
    return () => controller.abort()
  }, [])

  // Los destacados los marca el admin y vienen del back sin token (los vendidos nunca aparecen acá).
  useEffect(() => {
    let cancelado = false
    api.get('/publicaciones/destacados', { params: { limite: 6 } })
      .then((res) => {
        if (!cancelado) setPublicaciones(res.data)
      })
      .catch((err) => {
        if (!cancelado) setError(mensajeDeError(err, 'No pudimos cargar los autos destacados.'))
      })
      .finally(() => {
        if (!cancelado) setCargando(false)
      })
    return () => {
      cancelado = true
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    setSugerenciasAbiertas(false)
    const texto = filtros.marca.trim()
    navigate(texto ? `/autos?busqueda=${encodeURIComponent(texto)}` : '/autos')
  }

  // El video arranca solo y en bucle: se puede pausar (accesibilidad y ahorro de batería en el celular).
  const alternarVideo = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play().catch(() => {})
      setVideoPausado(false)
    } else {
      video.pause()
      setVideoPausado(true)
    }
  }

  const elegirSugerencia = (sugerencia) => {
    setFiltros({ marca: sugerencia })
    setSugerenciasAbiertas(false)
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#fafaf9]">
      {/* Hero */}
      <section className="bg-cream">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-6 pb-16 md:grid-cols-[1fr_1.1fr] md:pb-24 md:pt-14 lg:px-10">
          <div className="animate-fade-in-up [animation-delay:100ms]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-bronze/20 bg-bronze/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-bronze">
              <Sparkles className="h-3.5 w-3.5" /> El marketplace de confianza
            </div>
            <h1 className="max-w-xl text-5xl leading-[0.98] tracking-[-0.045em] text-navy-dark md:text-7xl">
              Encontrá el auto que <span className="text-bronze">te mueve.</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-slate-500">
              Autos seleccionados, agencias verificadas y toda la información para elegir bien. Tu próximo auto empieza acá.
            </p>

            <form
              onSubmit={handleSubmit}
              className="relative mt-9 flex max-w-xl flex-wrap items-center gap-3 rounded-2xl border border-black/5 bg-white p-2 shadow-xl shadow-navy/10"
            >
              <div className="relative flex min-w-[220px] flex-1 items-center gap-3 rounded-xl px-3 py-2">
                <Search className="h-4 w-4 text-bronze" />
                <div className="w-full">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">¿Qué buscás?</label>
                  <input
                    placeholder="Marca o modelo"
                    value={filtros.marca}
                    onChange={(e) => setFiltros({ ...filtros, marca: e.target.value })}
                    onFocus={() => setSugerenciasAbiertas(true)}
                    onBlur={() => setTimeout(() => setSugerenciasAbiertas(false), 150)}
                    autoComplete="off"
                    className="block w-full text-sm font-semibold text-navy outline-none placeholder:text-slate-400"
                  />
                </div>
                {sugerenciasAbiertas && sugerencias.length > 0 && (
                  <ul className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl shadow-navy/10">
                    {sugerencias.map((sugerencia) => (
                      <li key={sugerencia}>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => elegirSugerencia(sugerencia)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-semibold text-navy-dark transition hover:bg-bronze/5 hover:text-bronze"
                        >
                          <Search className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                          {sugerencia}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-bronze px-6 py-3.5 text-sm font-bold text-white transition hover:bg-navy sm:w-auto"
              >
                Buscar autos
              </button>
            </form>

            <div className="mt-6 flex items-center gap-5 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-bronze" /> 100% verificados
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-bronze" /> Sin sorpresas
              </span>
            </div>

            <div className="mt-8 max-w-xl">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Buscá por marca</p>
              <div className="flex flex-wrap gap-2">
                {MARCAS_ACCESO_RAPIDO.map((marca) => (
                  <Link
                    key={marca}
                    to={`/autos?marca=${encodeURIComponent(marca)}`}
                    title={`Ver autos ${marca}`}
                    className="flex h-11 w-16 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white p-2 transition hover:-translate-y-0.5 hover:border-bronze/40 hover:shadow-md"
                  >
                    {LOGOS[marca] ? (
                      <img
                        src={LOGOS[marca]}
                        alt={marca}
                        loading="lazy"
                        className="max-h-6 max-w-[85%] object-contain grayscale-[25%] opacity-80 transition hover:grayscale-0 hover:opacity-100"
                      />
                    ) : (
                      <span className="text-[11px] font-bold text-bronze">{marca}</span>
                    )}
                  </Link>
                ))}
                <Link
                  to="/autos"
                  className="flex h-11 shrink-0 items-center justify-center rounded-xl border border-dashed border-slate-300 px-3 text-xs font-bold text-slate-500 transition hover:border-bronze hover:text-bronze"
                >
                  Ver todas
                </Link>
              </div>

              {/* Mientras llegan las facetas se reserva el lugar con placeholders, así el hero no se corre. */}
              {(!facetas && !facetasFallaron) && (
                <>
                  <p className="mb-3 mt-6 text-[11px] font-bold uppercase tracking-wider text-slate-500">Buscá por presupuesto</p>
                  <div className="flex flex-wrap gap-2" aria-hidden="true">
                    {[0, 1, 2, 3].map((i) => (
                      <span key={i} className="h-[34px] w-40 animate-pulse rounded-full border border-slate-200 bg-white/60" />
                    ))}
                  </div>
                </>
              )}
              {bandas.length > 1 && (
                <>
                  <p className="mb-3 mt-6 text-[11px] font-bold uppercase tracking-wider text-slate-500">Buscá por presupuesto</p>
                  <div className="flex flex-wrap gap-2">
                    {bandas.map((banda, i) => (
                      <Link
                        key={i}
                        to={`/autos?precioMin=${banda.desde}&precioMax=${banda.hasta}`}
                        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-navy-dark transition hover:-translate-y-0.5 hover:border-bronze hover:text-bronze hover:shadow-md"
                      >
                        {etiquetaBanda(banda, i, bandas.length)}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* En el celular el video va primero y a todo el ancho; desde md vuelve a la columna derecha. */}
          <div className="relative order-first -mx-6 w-auto animate-fade-in-up md:order-none md:mx-auto md:w-full md:max-w-2xl [animation-delay:250ms]">
            <div className="absolute -right-6 -top-6 hidden h-28 w-28 rounded-full border border-bronze/20 md:block" />
            <div className="absolute -bottom-5 -left-5 hidden h-20 w-20 rounded-full bg-bronze/10 md:block" />
            <div className="relative overflow-hidden rounded-b-[2.5rem] rounded-br-[4.5rem] bg-navy shadow-2xl shadow-navy/20 md:rounded-[2rem] md:rounded-br-[5rem]">
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                poster="/images/hero-car-poster.jpg"
                aria-label="Video de un auto premium en un garage con iluminación moderna"
                className="h-[min(62svh,460px)] min-h-[300px] w-full object-cover md:h-[430px] md:min-h-0"
              >
                <source src="/videos/hero-car.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-transparent to-navy/20 md:from-navy/60 md:to-transparent" />
              <button
                type="button"
                onClick={alternarVideo}
                aria-label={videoPausado ? 'Reproducir video' : 'Pausar video'}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-navy/50 text-white backdrop-blur transition hover:bg-bronze md:bottom-6 md:right-7 md:top-auto"
              >
                {videoPausado ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </button>
              <div className="absolute bottom-7 left-6 text-white md:bottom-6 md:left-7">
                <p className="text-xs uppercase tracking-[0.18em] text-bronze-light">Curaduría DanteAutomotores</p>
                <p className="mt-1 font-heading text-2xl">Elegí con confianza.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SeccionFinanciamiento />

      {/* Marquee de marcas */}
      <section className="overflow-hidden border-t border-slate-200 bg-white py-6">
        <div className="mb-3 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
          Marcas que encontrás en DanteAutomotores
        </div>
        <div className="flex w-max animate-marquee gap-14 px-8 hover:[animation-play-state:paused]">
          {[...brands, ...brands, ...brands, ...brands].map((brand, i) => (
            <LogoMarca key={`${brand}-${i}`} marca={brand} />
          ))}
        </div>
      </section>

      {/* Destacados */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-bronze">Selección de la semana</p>
            <h2 className="text-4xl tracking-[-0.035em] text-navy-dark md:text-5xl">
              {cargando ? 'Buscando...' : 'Autos destacados'}
            </h2>
          </div>
          <Link
            to="/autos"
            className="hidden items-center gap-2 text-sm font-bold text-navy transition hover:text-bronze sm:flex"
          >
            Ver todos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {error && <p className="text-red-600">{error}</p>}

        {!cargando && !error && publicaciones.length === 0 && (
          <p className="text-slate-500">Todavía no hay autos destacados.</p>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {publicaciones.map((p) => (
            <Link key={p.id} to={`/publicaciones/${p.id}`}>
              <PublicacionCard publicacion={p} />
            </Link>
          ))}
        </div>
        </div>
      </section>

      <SeccionConfianza />
    </main>
  )
}
