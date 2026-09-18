import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, Check, ChevronDown, Search, Sparkles } from 'lucide-react'
import api from '../services/api.js'
import PublicacionCard from '../components/PublicacionCard.jsx'
import SeccionConfianza from '../components/SeccionConfianza.jsx'
import { destacadosMock } from '../mocks/homeMock.js'

// TODO: sacar esto cuando el backend esté levantado y probado.
// Mientras USE_MOCK_DATA sea true, el Home ignora la API real y muestra
// datos hardcodeados solo para previsualizar el diseño.
const USE_MOCK_DATA = true

const brands = ['Toyota', 'Volkswagen', 'Jeep', 'Chevrolet', 'Ford', 'Fiat']

export default function HomePage() {
  const location = useLocation()
  const [publicaciones, setPublicaciones] = useState([])
  const [filtros, setFiltros] = useState({ marca: '', modelo: '', precioMax: '' })
  const [cargando, setCargando] = useState(true)

  const buscarMock = (params = {}) => {
    let resultado = destacadosMock
    if (params.marca) {
      const q = params.marca.toLowerCase()
      resultado = resultado.filter((p) => `${p.marca} ${p.modelo}`.toLowerCase().includes(q))
    }
    if (params.precioMax) {
      resultado = resultado.filter((p) => p.precio <= Number(params.precioMax))
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

  useEffect(() => {
    if (!location.hash) return
    const el = document.querySelector(location.hash)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }, [location.hash])

  const handleSubmit = (e) => {
    e.preventDefault()
    const params = {}
    if (filtros.marca) params.marca = filtros.marca
    if (filtros.precioMax) params.precioMax = filtros.precioMax
    buscar(params)
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
              className="mt-9 flex max-w-xl flex-wrap items-center gap-3 rounded-2xl border border-black/5 bg-white p-2 shadow-xl shadow-navy/10"
            >
              <div className="flex min-w-[130px] flex-1 items-center gap-3 rounded-xl px-3 py-2">
                <Search className="h-4 w-4 text-bronze" />
                <div className="w-full">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">¿Qué buscás?</label>
                  <input
                    placeholder="Marca o modelo"
                    value={filtros.marca}
                    onChange={(e) => setFiltros({ ...filtros, marca: e.target.value })}
                    className="block w-full text-sm font-semibold text-navy outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>
              <div className="hidden h-9 w-px bg-slate-200 sm:block" />
              <div className="flex min-w-[110px] flex-1 items-center gap-3 rounded-xl px-3 py-2">
                <div className="w-full">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Presupuesto</label>
                  <input
                    type="number"
                    placeholder="Sin límite"
                    value={filtros.precioMax}
                    onChange={(e) => setFiltros({ ...filtros, precioMax: e.target.value })}
                    className="block w-full text-sm font-semibold text-navy outline-none placeholder:text-slate-400"
                  />
                </div>
                <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-slate-400" />
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

      {/* Marquee de marcas */}
      <section className="overflow-hidden border-y border-slate-200 bg-white py-5">
        <div className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
          Marcas que encontrás en DanteAutomotores
        </div>
        <div className="flex w-max animate-marquee gap-14 px-8">
          {[...brands, ...brands].map((brand, i) => (
            <div key={`${brand}-${i}`} className="flex items-center gap-2 text-sm font-bold text-navy/60">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy/5 text-[10px] text-bronze">
                {brand.charAt(0)}
              </span>
              {brand}
            </div>
          ))}
        </div>
      </section>

      {/* Destacados */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-bronze">Selección de la semana</p>
            <h2 className="text-4xl tracking-[-0.035em] text-navy-dark md:text-5xl">
              {cargando ? 'Buscando...' : 'Autos destacados'}
            </h2>
          </div>
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
      </section>

      <SeccionConfianza />
    </main>
  )
}
