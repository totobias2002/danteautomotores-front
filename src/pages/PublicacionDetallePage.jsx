import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Car,
  ChevronLeft,
  ChevronRight,
  Gauge,
  Heart,
  MapPin,
  Palette,
  Repeat,
  Settings2,
  Share2,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import api from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { catalogoMock } from '../mocks/catalogoMock.js'

// TODO: sacar esto cuando el backend esté levantado y probado. Mientras
// USE_MOCK_DATA sea true, el detalle de la publicación se arma con el
// catálogo mock en vez de pedirlo a la API real.
const USE_MOCK_DATA = true

const formatoNumero = (valor) => new Intl.NumberFormat('es-AR').format(valor)

const ESTADO_BADGE = {
  RESERVADO: { texto: 'Reservado', clase: 'bg-amber-100 text-amber-800' },
  VENDIDO: { texto: 'Vendido', clase: 'bg-slate-200 text-slate-700' },
}

// TODO: reemplazar por la descripción real que cargue la agencia cuando
// exista el backend. Mientras tanto armamos una descripción genérica a
// partir de los datos que sí tenemos, para que la página no se vea vacía.
const armarDescripcion = (p) =>
  `${p.tipoAuto ?? 'Auto'} ${p.marca} ${p.modelo} ${p.anio}, con ${formatoNumero(p.kilometraje ?? 0)} km, transmisión ${
    p.mecanica ? p.mecanica.toLowerCase() : 'manual'
  } y color ${p.colorExterior ? p.colorExterior.toLowerCase() : 'a definir'}. Verificado por DanteAutomotores: revisamos su documentación y estado mecánico antes de publicarlo, para que puedas comprar con confianza.`

function Dato({ icono: Icono, etiqueta, valor }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icono className="mt-0.5 h-4 w-4 shrink-0 text-bronze" />
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{etiqueta}</p>
        <p className="text-sm font-bold text-navy-dark">{valor}</p>
      </div>
    </div>
  )
}

export default function PublicacionDetallePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { usuario } = useAuth()

  const [publicacion, setPublicacion] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')
  const [fotoActiva, setFotoActiva] = useState(0)
  const [favoritoOk, setFavoritoOk] = useState(false)
  const [enlaceCopiado, setEnlaceCopiado] = useState(false)
  const [avisoCuenta, setAvisoCuenta] = useState(false)
  const [consulta, setConsulta] = useState({ nombreComprador: '', emailComprador: '', telefonoComprador: '', mensaje: '' })
  const [enviado, setEnviado] = useState(false)
  const [errorConsulta, setErrorConsulta] = useState('')

  useEffect(() => {
    setCargando(true)
    setErrorCarga('')
    setFotoActiva(0)

    if (USE_MOCK_DATA) {
      const encontrada = catalogoMock.find((p) => String(p.id) === id)
      if (encontrada) setPublicacion(encontrada)
      else setErrorCarga('No se encontró la publicación')
      setCargando(false)
      return
    }

    api
      .get(`/publicaciones/${id}`)
      .then((res) => setPublicacion(res.data))
      .catch(() => setErrorCarga('No se encontró la publicación'))
      .finally(() => setCargando(false))
  }, [id])

  const fotos = publicacion?.fotos ?? []

  const descripcion = useMemo(() => (publicacion ? armarDescripcion(publicacion) : ''), [publicacion])

  const badge = useMemo(() => {
    if (!publicacion) return null
    if (ESTADO_BADGE[publicacion.estado]) return { ...ESTADO_BADGE[publicacion.estado], Icono: null }
    if (publicacion.oferta) return { texto: 'Oferta', clase: 'bg-bronze text-white', Icono: TrendingUp }
    return { texto: 'Verificado', clase: 'bg-white/90 text-navy', Icono: ShieldCheck }
  }, [publicacion])

  // Las funciones de reserva, financiamiento y cotización de auto van a
  // necesitar que el usuario tenga una cuenta y el backend conectado. Por
  // ahora, si no hay sesión iniciada lo mandamos a loguearse/crear cuenta;
  // si ya tiene sesión, avisamos que la función todavía no está disponible.
  const requiereCuenta = () => {
    if (!usuario) {
      navigate('/login')
      return
    }
    setAvisoCuenta(true)
    setTimeout(() => setAvisoCuenta(false), 4000)
  }

  const alternarFavorito = () => {
    if (!usuario) {
      navigate('/login')
      return
    }
    if (USE_MOCK_DATA) {
      setFavoritoOk(true)
      return
    }
    api
      .post(`/favoritos/${id}`)
      .then(() => setFavoritoOk(true))
      .catch(() => setFavoritoOk(true)) // probablemente ya estaba en favoritos
  }

  const compartir = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setEnlaceCopiado(true)
      setTimeout(() => setEnlaceCopiado(false), 2000)
    } catch {
      // el navegador no permitió copiar; no rompemos la página por esto
    }
  }

  const handleConsultaSubmit = async (e) => {
    e.preventDefault()
    setErrorConsulta('')
    if (USE_MOCK_DATA) {
      setEnviado(true)
      return
    }
    try {
      await api.post('/consultas', { publicacionId: Number(id), ...consulta })
      setEnviado(true)
    } catch {
      setErrorConsulta('No se pudo enviar la consulta')
    }
  }

  if (cargando) {
    return <main className="mx-auto max-w-7xl px-6 py-24 text-center text-slate-400 lg:px-10">Cargando...</main>
  }

  if (errorCarga || !publicacion) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-24 text-center lg:px-10">
        <p className="text-slate-500">{errorCarga || 'No se encontró la publicación'}</p>
        <Link to="/autos" className="mt-4 inline-block text-sm font-bold text-bronze hover:underline">
          Volver al catálogo
        </Link>
      </main>
    )
  }

  return (
    <main className="bg-[#fafaf9]">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-1.5 text-sm font-bold text-slate-500 transition hover:text-bronze"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a resultados
        </button>

        <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr]">
          {/* Galería y contenido principal */}
          <div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#d7d9d7] sm:aspect-video">
              {fotos[fotoActiva] ? (
                <img
                  src={fotos[fotoActiva].url}
                  alt={`${publicacion.marca} ${publicacion.modelo}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">Sin foto</div>
              )}

              {badge && (
                <span
                  className={`absolute left-4 top-4 flex items-center gap-1 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider shadow-sm ${badge.clase}`}
                >
                  {badge.Icono && <badge.Icono className="h-3 w-3" />} {badge.texto}
                </span>
              )}

              {fotos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setFotoActiva((i) => (i - 1 + fotos.length) % fotos.length)}
                    aria-label="Foto anterior"
                    className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy shadow transition hover:bg-white"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setFotoActiva((i) => (i + 1) % fotos.length)}
                    aria-label="Foto siguiente"
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy shadow transition hover:bg-white"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white">
                    {fotoActiva + 1}/{fotos.length}
                  </span>
                </>
              )}
            </div>

            {fotos.length > 1 && (
              <div className="mt-3 flex gap-2">
                {fotos.map((f, i) => (
                  <button
                    key={f.id ?? i}
                    type="button"
                    onClick={() => setFotoActiva(i)}
                    className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                      i === fotoActiva ? 'border-bronze' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={f.url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Ficha técnica */}
            <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="mb-5 text-lg font-bold text-navy-dark">Ficha técnica</h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
                <Dato icono={Calendar} etiqueta="Año" valor={publicacion.anio} />
                <Dato
                  icono={Gauge}
                  etiqueta="Kilometraje"
                  valor={publicacion.kilometraje != null ? `${formatoNumero(publicacion.kilometraje)} km` : '—'}
                />
                <Dato icono={Settings2} etiqueta="Mecánica" valor={publicacion.mecanica ?? '—'} />
                <Dato icono={Palette} etiqueta="Color" valor={publicacion.colorExterior ?? '—'} />
                <Dato icono={MapPin} etiqueta="Ubicación" valor={publicacion.ubicacion ?? '—'} />
                <Dato icono={Car} etiqueta="Tipo de auto" valor={publicacion.tipoAuto ?? '—'} />
              </div>
            </div>

            <div className="mt-8">
              <h2 className="mb-3 text-lg font-bold text-navy-dark">Descripción</h2>
              <p className="leading-7 text-slate-600">{descripcion}</p>
              {publicacion.agenciaNombre && (
                <p className="mt-4 text-sm font-semibold text-slate-400">Vendido por {publicacion.agenciaNombre}</p>
              )}
            </div>

            {/* Consulta */}
            <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-bold text-navy-dark">Consultar por este auto</h2>
              {enviado ? (
                <p className="font-semibold text-bronze">¡Listo! La agencia se va a poner en contacto.</p>
              ) : (
                <form onSubmit={handleConsultaSubmit} className="grid gap-3 sm:max-w-md">
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    value={consulta.nombreComprador}
                    onChange={(e) => setConsulta({ ...consulta, nombreComprador: e.target.value })}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-bronze"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Tu email"
                    value={consulta.emailComprador}
                    onChange={(e) => setConsulta({ ...consulta, emailComprador: e.target.value })}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-bronze"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Tu teléfono (opcional)"
                    value={consulta.telefonoComprador}
                    onChange={(e) => setConsulta({ ...consulta, telefonoComprador: e.target.value })}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-bronze"
                  />
                  <textarea
                    placeholder="Mensaje"
                    rows={3}
                    value={consulta.mensaje}
                    onChange={(e) => setConsulta({ ...consulta, mensaje: e.target.value })}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-bronze"
                    required
                  />
                  {errorConsulta && <p className="text-sm font-semibold text-red-600">{errorConsulta}</p>}
                  <button type="submit" className="rounded-xl bg-navy px-4 py-3 text-sm font-bold text-white transition hover:bg-navy-dark">
                    Enviar consulta
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Panel lateral: precio y acciones */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-bronze">{publicacion.marca}</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-navy-dark md:text-3xl">
                  {publicacion.marca} {publicacion.modelo} {publicacion.anio}
                </h1>
              </div>
              <div className="flex shrink-0 gap-2 pt-1">
                <button
                  type="button"
                  onClick={compartir}
                  aria-label="Compartir"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-navy transition hover:border-bronze hover:text-bronze"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={alternarFavorito}
                  aria-label="Guardar en favoritos"
                  className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
                    favoritoOk ? 'border-bronze bg-bronze text-white' : 'border-slate-200 text-navy hover:border-bronze hover:text-bronze'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${favoritoOk ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            <p className="mt-2 flex flex-wrap items-center gap-1.5 text-sm font-semibold text-slate-500">
              {publicacion.kilometraje != null && `${formatoNumero(publicacion.kilometraje)} km`}
              {publicacion.ubicacion && (
                <>
                  <span className="text-slate-300">·</span>
                  <MapPin className="h-3.5 w-3.5 text-bronze" /> {publicacion.ubicacion}
                </>
              )}
            </p>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Precio de contado</p>
              <p className="mt-1 text-3xl font-bold text-navy-dark">$ {formatoNumero(publicacion.precio)}</p>
            </div>

            <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Precio financiando 50% o más</p>
              <p className="mt-1 text-2xl font-bold text-navy-dark">$ {formatoNumero(publicacion.precio)}</p>
              <button
                type="button"
                onClick={requiereCuenta}
                className="mt-3 flex items-center gap-1.5 text-sm font-bold text-bronze transition hover:text-navy"
              >
                <Wallet className="h-4 w-4" /> Simulá tu financiamiento <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5">
              <div>
                <p className="flex items-center gap-1.5 text-sm font-bold text-navy-dark">
                  <Repeat className="h-4 w-4 text-bronze" /> Cambiá tu auto y obtené más
                </p>
                <p className="mt-1 text-xs text-slate-500">Te damos hasta 3% extra por tu auto al cambiarlo.</p>
              </div>
              <button
                type="button"
                onClick={requiereCuenta}
                className="shrink-0 rounded-lg border border-bronze px-3 py-2 text-xs font-bold text-bronze transition hover:bg-bronze hover:text-white"
              >
                Cotizar
              </button>
            </div>

            <button
              type="button"
              onClick={requiereCuenta}
              className="mt-4 w-full rounded-xl bg-bronze px-6 py-4 text-sm font-bold text-white shadow-lg shadow-bronze/20 transition hover:bg-navy"
            >
              Reservar o agendar visita
            </button>

            {avisoCuenta && (
              <p className="mt-3 text-center text-xs font-semibold text-slate-400">
                Esta función todavía no está conectada — muy pronto vas a poder completarla desde acá.
              </p>
            )}
            {enlaceCopiado && <p className="mt-3 text-center text-xs font-semibold text-bronze">Enlace copiado ✓</p>}

            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-slate-400">
              <ShieldCheck className="h-4 w-4 text-bronze" /> Auto verificado por DanteAutomotores
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
