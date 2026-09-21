import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Check, Search, Sparkles } from 'lucide-react'
import api from '../services/api.js'
import PublicacionCard from '../components/PublicacionCard.jsx'
import SeccionConfianza from '../components/SeccionConfianza.jsx'
import SeccionFinanciamiento from '../components/SeccionFinanciamiento.jsx'
import LogoMarca, { LOGOS } from '../components/LogoMarca.jsx'
import { destacadosMock } from '../mocks/homeMock.js'
import { BANDAS_PRECIO, catalogoMock } from '../mocks/catalogoMock.js'

// TODO: sacar esto cuando el backend esté levantado y probado.
// Mientras USE_MOCK_DATA sea true, el Home ignora la API real y muestra
// datos hardcodeados solo para previsualizar el diseño.
const USE_MOCK_DATA = true

const brands = ['Toyota', 'Volkswagen', 'Jeep', 'Chevrolet', 'Ford', 'Fiat', 'Peugeot', 'Renault', 'BMW']

// Marcas y bandas de precio que se muestran como accesos rápidos en el hero,
// debajo del buscador, para no tener que escribir nada.
const MARCAS_ACCESO_RAPIDO = ['Toyota', 'Volkswagen', 'Jeep', 'Ford', 'Fiat', 'Peugeot']

const formatoNumero = (valor) => new Intl.NumberFormat('es-AR').format(valor)

const etiquetaBanda = (banda, i) => {
  if (i === 0) return `Hasta $${formatoNumero(banda.hasta)}`
  if (i === BANDAS_PRECIO.length - 1) return `Más de $${formatoNumero(banda.desde)}`
  return `$${formatoNumero(banda.desde)} - $${formatoNumero(banda.hasta)}`
}

// Para el autocompletado del buscador del hero: todas las marcas del catálogo
// más cada combinación "marca modelo", para que sugiera tanto si escribís una
// marca como si escribís (parte de) un modelo puntual.
const SUGERENCIAS_BASE = [...new Set([...brands, ...catalogoMock.map((a) => `${a.marca} ${a.modelo}`)])]

export default function HomePage() {
  const navigate = useNavigate()
  const [publicaciones, setPublicaciones] = useState([])
  const [filtros, setFiltros] = useState({ marca: '' })
  const [cargando, setCargando] = useState(true)
  const [sugerenciasAbiertas, setSugerenciasAbiertas] = useState(false)

  const sugerencias = useMemo(() => {
    const q = filtros.marca.trim().toLowerCase()
    if (!q) return []
    return SUGERENCIAS_BASE.filter((s) => s.toLowerCase().includes(q)).slice(0, 6)
  }, [filtros.marca])

  const buscarMock = (params = {}) => {
    let resultado = destacadosMock
    if (params.marca) {
      const q = params.marca.toLowerCase()
      resultado = resultado.filter((p) => `${p.marca} ${p.modelo}`.toLowerCase().includes(q))
    }
    setPublicaciones(resultado)
  }

  const buscar = (params = {}) => {
    setCargando(true)
    if (USE_MOCK_DATA) {
      buscarMock(params)
      setCargando(false)
      return
    }
    api.get('/publicaciones', { params })
      .then((res) => setPublicaciones(res.data))
      .catch(() => setPublicaciones([]))
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    buscar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    setSugerenciasAbiertas(false)
    const texto = filtros.marca.trim()
    navigate(texto ? `/autos?busqueda=${encodeURIComponent(texto)}` : '/autos')
  }

  const elegirSugerencia = (sugerencia) => {
    setFiltros({ marca: sugerencia })
    setSugerenciasAbiertas(false)
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#fafaf9]">
      {/* Hero */}
      <section className="bg-cream">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-6 pb-16 pt-10 md:grid-cols-[1fr_1.1fr] md:pb-24 md:pt-14 lg:px-10">
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
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">¿Qué buscás?</label>
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

            <div className="mt-6 flex items-center gap-5 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-bronze" /> 100% verificados
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-bronze" /> Sin sorpresas
              </span>
            </div>

            <div className="mt-8 max-w-xl">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Buscá por marca</p>
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
                      <span className="text-[10px] font-bold text-bronze">{marca}</span>
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

              <p className="mb-3 mt-6 text-[11px] font-bold uppercase tracking-wider text-slate-400">Buscá por presupuesto</p>
              <div className="flex flex-wrap gap-2">
                {BANDAS_PRECIO.map((banda, i) => (
                  <Link
                    key={i}
                    to={`/autos?precioMin=${banda.desde}&precioMax=${banda.hasta}`}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-navy-dark transition hover:-translate-y-0.5 hover:border-bronze hover:text-bronze hover:shadow-md"
                  >
                    {etiquetaBanda(banda, i)}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-2xl animate-fade-in-up [animation-delay:250ms]">
            <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full border border-bronze/20" />
            <div className="absolute -bottom-5 -left-5 h-20 w-20 rounded-full bg-bronze/10" />
            <div className="relative overflow-hidden rounded-[2rem] rounded-br-[5rem] bg-navy shadow-2xl shadow-navy/20">
              <img src="/images/hero-car.png" alt="Sedán moderno color cobre" className="h-[310px] w-full object-cover md:h-[430px]" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-7 text-white">
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
        <div className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
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
          <button
            type="button"
            onClick={() => {
              setFiltros({ marca: '' })
              buscar({})
            }}
            className="hidden items-center gap-2 text-sm font-bold text-navy transition hover:text-bronze sm:flex"
          >
            Ver todos <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {!cargando && publicaciones.length === 0 && (
          <p className="text-slate-500">No encontramos autos con esos filtros.</p>
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
