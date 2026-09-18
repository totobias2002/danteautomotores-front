import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../services/api.js'
import PublicacionCard from '../components/PublicacionCard.jsx'
import SeccionConfianza from '../components/SeccionConfianza.jsx'
import { agenciaMock, publicacionesMock } from '../mocks/agenciaMock.js'

// TODO: sacar esto cuando el backend esté levantado y probado.
// Mientras USE_MOCK_DATA sea true, la página ignora la API real y muestra
// datos hardcodeados solo para previsualizar el diseño.
const USE_MOCK_DATA = true

export default function AgenciaPage() {
  const { slug } = useParams()
  const [agencia, setAgencia] = useState(null)
  const [publicaciones, setPublicaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (USE_MOCK_DATA) {
      setCargando(true)
      setAgencia(agenciaMock)
      setPublicaciones(publicacionesMock)
      setCargando(false)
      return
    }

    setCargando(true)
    api.get(`/agencias/${slug}`)
      .then((res) => {
        setAgencia(res.data)
        return api.get('/publicaciones', { params: { agenciaId: res.data.id } })
      })
      .then((res) => setPublicaciones(res?.data ?? []))
      .catch(() => setError('No se encontró la agencia'))
      .finally(() => setCargando(false))
  }, [slug])

  const marcas = useMemo(
    () => [...new Set(publicaciones.map((p) => p.marca).filter(Boolean))],
    [publicaciones]
  )

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-slate-500">{error}</p>
        <Link to="/" className="mt-4 inline-block text-bronze hover:underline">Volver al inicio</Link>
      </main>
    )
  }

  if (!agencia) return null

  return (
    <main className="min-h-screen overflow-hidden bg-[#fafaf9]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-bronze/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="animate-fade-in-up">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-bronze-light">
                Vendedor en DanteAutomotores
              </span>
              <h1 className="mt-4 text-4xl tracking-[-0.03em] md:text-5xl">{agencia.nombre}</h1>
              <p className="mt-3 text-sm text-slate-300">
                {agencia.direccion}
                {agencia.telefonoContacto && ` · ${agencia.telefonoContacto}`}
                {agencia.emailContacto && ` · ${agencia.emailContacto}`}
              </p>
              {agencia.descripcion && (
                <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">{agencia.descripcion}</p>
              )}
            </div>
            {agencia.logo && (
              <div className="animate-fade-in-up rounded-2xl bg-white/5 p-6">
                <img src={agencia.logo} alt={agencia.nombre} className="h-24 w-24 object-contain" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Marquee de marcas */}
      {marcas.length > 0 && (
        <section className="overflow-hidden border-y border-slate-200 bg-white py-5">
          <div className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Marcas disponibles en {agencia.nombre}
          </div>
          <div className="flex w-max animate-marquee gap-14 px-8">
            {[...marcas, ...marcas].map((marca, i) => (
              <div key={`${marca}-${i}`} className="flex items-center gap-2 text-sm font-bold text-navy/60">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy/5 text-[10px] text-bronze">
                  {marca.charAt(0)}
                </span>
                {marca}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Autos disponibles */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-bronze">Catálogo</p>
            <h2 className="text-4xl tracking-[-0.035em] text-navy-dark md:text-5xl">
              {cargando ? 'Buscando...' : `Autos disponibles (${publicaciones.length})`}
            </h2>
          </div>
        </div>

        {!cargando && publicaciones.length === 0 && (
          <p className="text-slate-500">Esta agencia todavía no tiene autos publicados.</p>
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
