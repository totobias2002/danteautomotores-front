import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  Car,
  ChevronLeft,
  ChevronRight,
  Fuel,
  Gauge,
  Heart,
  Info,
  MapPin,
  Palette,
  Pencil,
  Repeat,
  Settings2,
  Share2,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import api from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import useExigirCuenta from '../hooks/useExigirCuenta.js'
import { destinoDeGate, evaluarAcceso } from '../utils/cuenta.js'
import PublicacionCard from '../components/PublicacionCard.jsx'
import { TRANSFORMACION_DETALLE, TRANSFORMACION_MINIATURA, urlMiniatura } from '../utils/cloudinary.js'
import { mensajeDeError } from '../utils/errores.js'
import useTitulo from '../hooks/useTitulo.js'
import {
  COMBUSTIBLE,
  CONDICION,
  ESTADO,
  TIPO_CARROCERIA,
  TRANSMISION,
  ZONA,
  simboloMoneda,
} from '../utils/etiquetas.js'

const formatoNumero = (valor) => new Intl.NumberFormat('es-AR').format(valor)

const SIN_DESCRIPCION = 'La agencia todavía no cargó una descripción para este auto.'

function Dato({ icono: Icono, etiqueta, valor }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icono className="mt-0.5 h-4 w-4 shrink-0 text-bronze" />
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{etiqueta}</p>
        <p className="text-sm font-bold text-navy-dark">{valor}</p>
      </div>
    </div>
  )
}

export default function PublicacionDetallePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { usuario, esAdmin, refrescarUsuario } = useAuth()
  const exigir = useExigirCuenta()

  const [publicacion, setPublicacion] = useState(null)
  useTitulo(publicacion ? `${publicacion.marca} ${publicacion.modelo} ${publicacion.anio}` : '')
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')
  const [similares, setSimilares] = useState([])
  const [fotoActiva, setFotoActiva] = useState(0)
  const [favoritoOk, setFavoritoOk] = useState(false)
  const [guardandoFavorito, setGuardandoFavorito] = useState(false)
  const [errorFavorito, setErrorFavorito] = useState('')
  const [enlaceCopiado, setEnlaceCopiado] = useState(false)
  const [avisoCuenta, setAvisoCuenta] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [errorConsulta, setErrorConsulta] = useState('')
  const [abriendoConversacion, setAbriendoConversacion] = useState(false)
  const [errorLoQuiero, setErrorLoQuiero] = useState('')

  // Un link directo puede abrir un auto en cualquier estado (D-06). La carga se repite si cambia el id (por ejemplo,
  // al pasar de un vendido a uno de sus parecidos) y se descarta si el usuario ya se fue a otro auto.
  useEffect(() => {
    let vigente = true
    setCargando(true)
    setErrorCarga('')
    setPublicacion(null)
    setSimilares([])
    setFotoActiva(0)
    setFavoritoOk(false)
    setGuardandoFavorito(false)
    setErrorFavorito('')
    setEnviando(false)
    setErrorConsulta('')
    setAbriendoConversacion(false)
    setErrorLoQuiero('')

    api
      .get(`/publicaciones/${id}`)
      .then((res) => {
        if (vigente) setPublicacion(res.data)
      })
      .catch((err) => {
        if (vigente) setErrorCarga(mensajeDeError(err, 'No se encontró la publicación'))
      })
      .finally(() => {
        if (vigente) setCargando(false)
      })

    return () => {
      vigente = false
    }
  }, [id])

  const estado = publicacion?.estado
  const vendido = estado === 'VENDIDO'
  const reservado = estado === 'RESERVADO'

  // Solo un vendido sugiere alternativas; si la lista viene vacía o el pedido falla, la sección no se muestra.
  useEffect(() => {
    if (!vendido) return undefined
    let vigente = true
    api
      .get(`/publicaciones/${id}/similares`)
      .then((res) => {
        if (vigente && Array.isArray(res.data)) setSimilares(res.data)
      })
      .catch(() => {})
    return () => {
      vigente = false
    }
  }, [id, vendido])

  // Con sesión, el corazón arranca con el estado real. Si el pedido falla queda vacío: guardar de nuevo daría el
  // aviso de "ya está en tus favoritos" y no se marca nada que el backend no haya confirmado.
  useEffect(() => {
    if (!usuario) return undefined
    let vigente = true
    api
      .get('/favoritos')
      .then((res) => {
        if (vigente && Array.isArray(res.data)) {
          setFavoritoOk(res.data.some((f) => String(f?.publicacion?.id) === String(id)))
        }
      })
      .catch(() => {})
    return () => {
      vigente = false
    }
  }, [id, usuario])

  const fotos = publicacion?.fotos ?? []
  const simbolo = simboloMoneda(publicacion?.moneda)
  // La oferta la decide el servidor (oferta=true); el front nunca la deduce comparando precios.
  const esOferta = publicacion?.oferta === true && publicacion?.precioAnterior != null

  const badge = useMemo(() => {
    if (!publicacion) return null
    if (publicacion.estado === 'RESERVADO' || publicacion.estado === 'VENDIDO') {
      return { ...ESTADO[publicacion.estado], Icono: null }
    }
    if (publicacion.oferta === true) return { texto: 'Oferta', clase: 'bg-bronze text-white', Icono: TrendingUp }
    return { texto: 'Verificado', clase: 'bg-white/90 text-navy', Icono: ShieldCheck }
  }, [publicacion])

  // Lo quiero, Cotizar y Simulá tu financiamiento exigen cuenta verificada (AUTH-06): sin sesión llevan al login y con
  // la cuenta incompleta a Completá tus datos, y en ambos casos vuelven a esta ficha. Cotizar y Simulá tu financiamiento
  // conservan el aviso temporal hasta que la Fase 5 (cotizador) conecte el flujo real; Lo quiero ya abre la conversación.
  const requiereCuenta = () =>
    exigir(() => {
      setAvisoCuenta(true)
      setTimeout(() => setAvisoCuenta(false), 4000)
    })

  // Lo quiero abre (o reutiliza) la conversación de compra con la agencia y lleva directo al hilo (D-04). Si el back rechaza
  // el pedido, el motivo se muestra debajo del botón; el 403 de cuenta no verificada lo maneja el interceptor de api.js.
  const abrirConversacion = async () => {
    if (abriendoConversacion) return
    setErrorLoQuiero('')
    setAbriendoConversacion(true)
    try {
      const { data } = await api.post('/conversaciones', { publicacionId: Number(id) })
      navigate(`/mensajes/${data.id}`)
    } catch (err) {
      if (err?.response?.status !== 401) {
        setErrorLoQuiero(mensajeDeError(err, 'No se pudo abrir la conversación. Intentá de nuevo.'))
      }
      setAbriendoConversacion(false)
    }
  }

  const handleLoQuiero = () => exigir(abrirConversacion)

  // Al cambiar de auto no queda el mensaje a medio escribir del anterior.
  useEffect(() => {
    setMensaje('')
    setErrorConsulta('')
  }, [id])

  // Una sesión guardada antes de la fase no sabe qué le falta: se pregunta al servidor para decidir qué mostrar.
  const accesoConsulta = evaluarAcceso(usuario)
  useEffect(() => {
    if (accesoConsulta === 'desconocida') refrescarUsuario().catch(() => {})
  }, [accesoConsulta])

  // El corazón solo cambia cuando el backend confirma: guardar con POST, quitar con DELETE. Ante cualquier error
  // queda como estaba y se muestra el motivo. Un 401 no muestra nada: el interceptor de api.js ya cierra la sesión y
  // lleva a /login.
  const alternarFavorito = async () => {
    if (!usuario) {
      navigate('/login')
      return
    }
    if (guardandoFavorito) return
    setGuardandoFavorito(true)
    setErrorFavorito('')
    try {
      if (favoritoOk) {
        await api.delete(`/favoritos/${id}`)
        setFavoritoOk(false)
      } else {
        await api.post(`/favoritos/${id}`)
        setFavoritoOk(true)
      }
    } catch (err) {
      if (err?.response?.status !== 401) {
        setErrorFavorito(mensajeDeError(err, 'No se pudo actualizar tus favoritos. Intentá de nuevo.'))
      }
    } finally {
      setGuardandoFavorito(false)
    }
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

  // "Consultar por este auto" abre (o reutiliza) la misma conversación de compra con el texto que escribió el usuario y
  // lleva directo al hilo (D-04). Los datos de contacto salen de la cuenta, no del formulario.
  const handleConsultaSubmit = async (e) => {
    e.preventDefault()
    if (enviando) return
    setErrorConsulta('')
    setEnviando(true)
    try {
      const { data } = await api.post('/conversaciones', { publicacionId: Number(id), mensaje })
      navigate(`/mensajes/${data.id}`)
    } catch (err) {
      // Si el auto se vendió mientras tanto, el backend responde "Este auto ya se vendió". Un 401 no muestra nada: el
      // interceptor de api.js ya cierra la sesión y lleva a /login.
      if (err?.response?.status !== 401) {
        setErrorConsulta(mensajeDeError(err, 'No se pudo enviar el mensaje. Intentá de nuevo.'))
      }
      setEnviando(false)
    }
  }

  if (cargando) {
    return <main className="mx-auto max-w-7xl px-6 py-24 text-center text-slate-500 lg:px-10">Cargando...</main>
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

  const zona = ZONA[publicacion.agenciaZona]
  const lugar = [zona, publicacion.agenciaNombre].filter(Boolean).join(' · ')
  const descripcion = publicacion.descripcion?.trim() ? publicacion.descripcion : SIN_DESCRIPCION
  const fotoPrincipal = urlMiniatura(fotos[fotoActiva]?.url, TRANSFORMACION_DETALLE)

  return (
    <main className="bg-[#fafaf9]">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm font-bold text-slate-500 transition hover:text-bronze"
          >
            <ArrowLeft className="h-4 w-4" /> Volver a resultados
          </button>

          {esAdmin && (
            <Link
              to={`/admin/publicaciones/${publicacion.id}/editar`}
              className="flex items-center gap-1.5 rounded-xl border border-bronze px-3.5 py-2 text-xs font-bold text-bronze transition hover:bg-bronze hover:text-white"
            >
              <Pencil className="h-3.5 w-3.5" /> Editar publicación
            </Link>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr] lg:gap-10">
          {/* Galería y contenido principal. En el celular el precio y "Lo quiero" suben justo debajo de la galería. */}
          <div className="contents lg:block">
            <div className="order-1 lg:order-none">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#d7d9d7] sm:aspect-video">
              {fotoPrincipal ? (
                <img
                  src={fotoPrincipal}
                  alt={`${publicacion.marca} ${publicacion.modelo}`}
                  className={`h-full w-full object-cover${vendido ? ' opacity-80' : ''}`}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">Sin foto</div>
              )}

              {badge && (
                <span
                  className={`absolute left-4 top-4 flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider shadow-sm ${badge.clase}`}
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
                    className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy shadow transition hover:bg-white"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setFotoActiva((i) => (i + 1) % fotos.length)}
                    aria-label="Foto siguiente"
                    className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy shadow transition hover:bg-white"
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
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {fotos.map((f, i) => (
                  <button
                    key={f.id ?? i}
                    type="button"
                    onClick={() => setFotoActiva(i)}
                    aria-label={`Ver foto ${i + 1}`}
                    className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                      i === fotoActiva ? 'border-bronze' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={urlMiniatura(f.url, TRANSFORMACION_MINIATURA)}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            </div>

            <div className="order-3 lg:order-none">
            {/* Ficha técnica */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:mt-10">
              <h2 className="mb-5 text-lg font-bold text-navy-dark">Ficha técnica</h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
                <Dato icono={Calendar} etiqueta="Año" valor={publicacion.anio} />
                <Dato
                  icono={Gauge}
                  etiqueta="Kilometraje"
                  valor={publicacion.kilometraje != null ? `${formatoNumero(publicacion.kilometraje)} km` : '—'}
                />
                <Dato icono={Settings2} etiqueta="Transmisión" valor={TRANSMISION[publicacion.transmision] ?? '—'} />
                <Dato icono={Fuel} etiqueta="Combustible" valor={COMBUSTIBLE[publicacion.combustible] ?? '—'} />
                <Dato icono={Palette} etiqueta="Color" valor={publicacion.color || '—'} />
                <Dato icono={BadgeCheck} etiqueta="Condición" valor={CONDICION[publicacion.condicion] ?? '—'} />
                <Dato
                  icono={Car}
                  etiqueta="Tipo de carrocería"
                  valor={TIPO_CARROCERIA[publicacion.tipoCarroceria] ?? 'Sin especificar'}
                />
                <Dato
                  icono={MapPin}
                  etiqueta="Ubicación"
                  valor={
                    publicacion.agenciaSlug && lugar ? (
                      <Link to={`/agencias/${publicacion.agenciaSlug}`} className="hover:text-bronze hover:underline">
                        {lugar}
                      </Link>
                    ) : (
                      lugar || '—'
                    )
                  }
                />
              </div>
            </div>

            <div className="mt-8">
              <h2 className="mb-3 text-lg font-bold text-navy-dark">Descripción</h2>
              {/* Texto plano: React lo escapa, nunca se interpreta como HTML. */}
              <p className="whitespace-pre-line leading-7 text-slate-600">{descripcion}</p>
              {publicacion.agenciaNombre && (
                <p className="mt-4 text-sm font-semibold text-slate-500">
                  Vendido por {publicacion.agenciaNombre}
                </p>
              )}
            </div>

            {/* Consulta: un auto vendido ya no se consulta (D-06); uno reservado sí, por si la reserva se cae (D-05). */}
            {!vendido && (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 lg:mt-10">
                <h2 className="mb-4 text-lg font-bold text-navy-dark">Consultar por este auto</h2>
                {reservado && (
                  <p className="mb-4 flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                    <Info className="mt-0.5 h-4 w-4 shrink-0" />
                    Este auto está reservado. Podés consultar igual por si la reserva se cae.
                  </p>
                )}
                {accesoConsulta === 'verificada' ? (
                  <form onSubmit={handleConsultaSubmit} className="grid grid-cols-1 gap-3 sm:max-w-md">
                    <textarea
                      placeholder="Mensaje"
                      aria-label="Mensaje"
                      rows={3}
                      maxLength={2000}
                      value={mensaje}
                      onChange={(e) => setMensaje(e.target.value)}
                      className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-bronze"
                      required
                    />
                    {errorConsulta && <p role="alert" className="text-sm font-semibold text-red-600">{errorConsulta}</p>}
                    <button
                      type="submit"
                      disabled={enviando}
                      className="rounded-xl bg-navy px-4 py-3 text-sm font-bold text-white transition hover:bg-navy-dark disabled:opacity-60"
                    >
                      {enviando ? 'Enviando...' : 'Enviar mensaje'}
                    </button>
                  </form>
                ) : accesoConsulta === 'desconocida' ? (
                  <p className="text-sm font-semibold text-slate-500">Revisando tu cuenta...</p>
                ) : (
                  <div className="sm:max-w-md">
                    <p className="text-sm font-semibold text-slate-600">
                      {accesoConsulta === 'anonimo'
                        ? 'Ingresá o creá tu cuenta para consultar por este auto'
                        : 'Completá tus datos para poder consultar'}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const { ruta, state } = destinoDeGate(accesoConsulta, location.pathname + location.search)
                        navigate(ruta, { state })
                      }}
                      className="mt-3 rounded-xl bg-navy px-4 py-3 text-sm font-bold text-white transition hover:bg-navy-dark"
                    >
                      {accesoConsulta === 'anonimo' ? 'Ingresar' : 'Completar mis datos'}
                    </button>
                  </div>
                )}
              </div>
            )}
            </div>
          </div>

          {/* Panel lateral: precio y acciones */}
          <div className="order-2 lg:sticky lg:top-24 lg:order-none lg:self-start">
            {vendido && (
              <div role="status" className="mb-5 rounded-2xl border border-slate-300 bg-slate-100 p-5">
                <p className="flex items-center gap-2 text-base font-bold text-navy-dark">
                  <Info className="h-5 w-5 text-bronze" /> Este auto ya se vendió
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Ya no está disponible, pero dejamos la ficha abierta por si tenías el link.
                  {similares.length > 0 ? ' Mirá abajo autos parecidos que sí están disponibles.' : ''}
                </p>
                <Link to="/autos" className="mt-3 inline-block text-sm font-bold text-bronze hover:underline">
                  Ver todos los autos disponibles
                </Link>
              </div>
            )}

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
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-navy transition hover:border-bronze hover:text-bronze"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={alternarFavorito}
                  aria-label={favoritoOk ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                  aria-pressed={favoritoOk}
                  disabled={guardandoFavorito}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border transition disabled:opacity-60 ${
                    favoritoOk ? 'border-bronze bg-bronze text-white' : 'border-slate-200 text-navy hover:border-bronze hover:text-bronze'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${favoritoOk ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            <p className="mt-2 flex flex-wrap items-center gap-1.5 text-sm font-semibold text-slate-500">
              {publicacion.kilometraje != null && `${formatoNumero(publicacion.kilometraje)} km`}
              {lugar && (
                <>
                  {publicacion.kilometraje != null && <span className="text-slate-300">·</span>}
                  <MapPin className="h-3.5 w-3.5 text-bronze" /> {lugar}
                </>
              )}
            </p>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Precio de contado</p>
                {esOferta && (
                  <span className="flex items-center gap-1 rounded-full bg-bronze px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                    <TrendingUp className="h-3 w-3" /> Oferta
                  </span>
                )}
              </div>
              {esOferta && (
                <p className="mt-1 text-base font-semibold text-slate-500 line-through">
                  {simbolo} {formatoNumero(publicacion.precioAnterior)}
                </p>
              )}
              <p className="mt-1 text-3xl font-bold text-navy-dark">
                {simbolo} {formatoNumero(publicacion.precio)}
              </p>
            </div>

            {/* Un auto vendido no ofrece financiar, cotizar ni reservar (D-06). */}
            {!vendido && (
              <>
                <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Precio financiando 50% o más</p>
                  <p className="mt-1 text-2xl font-bold text-navy-dark">
                    {simbolo} {formatoNumero(publicacion.precio)}
                  </p>
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
                  onClick={handleLoQuiero}
                  disabled={abriendoConversacion}
                  className="mt-4 w-full rounded-xl bg-bronze px-6 py-4 text-sm font-bold text-white shadow-lg shadow-bronze/20 transition hover:bg-navy disabled:opacity-60"
                >
                  {abriendoConversacion ? 'Abriendo conversación...' : 'Lo quiero'}
                </button>
                {errorLoQuiero && (
                  <p role="alert" className="mt-3 text-center text-xs font-semibold text-red-600">
                    {errorLoQuiero}
                  </p>
                )}
              </>
            )}

            {avisoCuenta && (
              <p className="mt-3 text-center text-xs font-semibold text-slate-500">
                Esta función todavía no está conectada — muy pronto vas a poder completarla desde acá.
              </p>
            )}
            {enlaceCopiado && <p className="mt-3 text-center text-xs font-semibold text-bronze">Enlace copiado ✓</p>}
            {errorFavorito && (
              <p role="alert" className="mt-3 text-center text-xs font-semibold text-red-600">
                {errorFavorito}
              </p>
            )}

            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-slate-500">
              <ShieldCheck className="h-4 w-4 text-bronze" /> Auto verificado por DanteAutomotores
            </div>
          </div>
        </div>

        {/* Autos parecidos: solo en el detalle de un vendido y solo si hay alguno disponible (D-06). */}
        {vendido && similares.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-5 text-xl font-bold text-navy-dark">Autos parecidos</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {similares.map((p) => (
                <Link key={p.id} to={`/publicaciones/${p.id}`}>
                  <PublicacionCard publicacion={p} />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
