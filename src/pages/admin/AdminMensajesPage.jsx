import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import api from '../../services/api.js'
import BadgeNoLeidos from '../../components/BadgeNoLeidos.jsx'
import Paginador from '../../components/Paginador.jsx'
import useSondeo from '../../hooks/useSondeo.js'
import { mensajeDeError } from '../../utils/errores.js'
import {
  etiquetaTipo,
  extracto,
  fechaDeMensaje,
  leerFiltrosBandeja,
  paramsDeBandeja,
  paramsParaApi,
} from '../../utils/mensajes.js'

// Cada cuánto se vuelve a pedir la bandeja (D-07): solo con la pestaña visible y sin WebSockets.
const INTERVALO_MS = 30000

const OPCIONES_DE_TIPO = [
  { value: '', label: 'Todos los tipos' },
  { value: 'COMPRA', label: 'Compra' },
  { value: 'COTIZACION', label: 'Cotización' },
]

const OPCIONES_DE_ESTADO = [
  { value: 'ABIERTA', label: 'Abiertas' },
  { value: 'CERRADA', label: 'Cerradas' },
  { value: 'TODAS', label: 'Todas' },
]

const ESTADO_DE_LA_CONVERSACION = {
  ABIERTA: { texto: 'Abierta', clase: 'bg-emerald-100 text-emerald-700' },
  CERRADA: { texto: 'Cerrada', clase: 'bg-slate-200 text-slate-500' },
}

function FilaConversacion({ conversacion }) {
  const { usuario, publicacion } = conversacion
  const quien = [usuario?.nombre, usuario?.apellido].filter(Boolean).join(' ') || 'Usuario'
  const auto = publicacion
    ? `${publicacion.marca} ${publicacion.modelo} ${publicacion.anio}`
    : etiquetaTipo(conversacion.tipo)
  const estado = ESTADO_DE_LA_CONVERSACION[conversacion.estado]
  const sinLeer = conversacion.noLeidos > 0

  return (
    <li>
      <Link
        to={`/admin/mensajes/${conversacion.id}`}
        className="block rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-bronze"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-navy-dark">{quien}</p>
            <p className="truncate text-sm text-slate-500">{auto}</p>
          </div>
          <span className="flex shrink-0 items-center gap-2 text-xs font-semibold text-slate-400">
            <BadgeNoLeidos cantidad={conversacion.noLeidos} />
            {fechaDeMensaje(conversacion.ultimoMensajeEn)}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
            {etiquetaTipo(conversacion.tipo)}
          </span>
          {estado && (
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${estado.clase}`}>
              {estado.texto}
            </span>
          )}
        </div>
        {/* Texto plano: React lo escapa, nunca se interpreta como HTML. */}
        <p className={`mt-2 truncate text-sm ${sinLeer ? 'font-bold text-navy-dark' : 'text-slate-500'}`}>
          {conversacion.ultimoMensajeAutor === 'AGENCIA' ? 'Agencia: ' : ''}
          {extracto(conversacion.ultimoMensaje, 120)}
        </p>
      </Link>
    </li>
  )
}

const claseDelSelector =
  'rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-navy outline-none transition focus:border-bronze'

export default function AdminMensajesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  // La URL es la fuente de verdad de los filtros y de la página: recargar o compartir el link da la misma bandeja.
  const filtros = useMemo(() => leerFiltrosBandeja(searchParams), [searchParams])
  const claveDelPedido = JSON.stringify(paramsParaApi(filtros))

  const [pagina, setPagina] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  // Cada pedido lleva un número: si llega tarde la respuesta de uno viejo (otro filtro u otra pasada), se descarta.
  const ultimoPedido = useRef(0)

  // `silencioso` es la consulta periódica: reemplaza la lista y no muestra "Cargando..." ni errores.
  const cargar = useCallback(
    (silencioso = false) => {
      const numero = ++ultimoPedido.current
      if (!silencioso) {
        setCargando(true)
        setError('')
      }
      return api
        .get('/admin/conversaciones', { params: JSON.parse(claveDelPedido) })
        .then((res) => {
          if (numero === ultimoPedido.current) setPagina(res.data)
        })
        .catch((err) => {
          // Un 401 no muestra nada: el interceptor de api.js ya cierra la sesión y lleva a /login.
          if (!silencioso && numero === ultimoPedido.current && err?.response?.status !== 401) {
            setError(mensajeDeError(err, 'No se pudo cargar la bandeja de mensajes'))
          }
        })
        .finally(() => {
          if (!silencioso && numero === ultimoPedido.current) setCargando(false)
        })
    },
    [claveDelPedido]
  )

  useEffect(() => {
    cargar()
  }, [cargar])

  useSondeo(() => cargar(true), INTERVALO_MS, !error)

  const conversaciones = Array.isArray(pagina?.contenido) ? pagina.contenido : []
  const totalPaginas = pagina?.totalPaginas ?? 0

  // Una página que ya no existe (por ejemplo un link viejo) vuelve a la primera.
  useEffect(() => {
    if (!cargando && !error && pagina && conversaciones.length === 0 && filtros.pagina > 1) {
      setSearchParams(paramsDeBandeja({ ...filtros, pagina: 1 }), { replace: true })
    }
  }, [cargando, error, pagina, conversaciones.length, filtros, setSearchParams])

  // Cambiar un filtro reemplaza la entrada del historial y vuelve a la página 1; cambiar de página agrega una entrada.
  const cambiarFiltro = (cambio) =>
    setSearchParams(paramsDeBandeja({ ...filtros, ...cambio, pagina: 1 }), { replace: true })
  const irAPagina = (nueva) => {
    setSearchParams(paramsDeBandeja({ ...filtros, pagina: nueva }))
    window.scrollTo({ top: 0 })
  }

  return (
    <main className="min-h-screen bg-[#fafaf9] py-10">
      <div className="mx-auto max-w-4xl px-4">
        <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 transition hover:text-bronze">
          <ArrowLeft className="h-3.5 w-3.5" /> Volver al panel
        </Link>
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-bronze">Panel</p>
        <h1 className="mt-2 font-heading text-3xl text-navy-dark">Mensajes</h1>
        <p className="mt-2 text-sm text-slate-500">Las conversaciones de todos los usuarios con la agencia.</p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <select
            aria-label="Filtrar por tipo"
            value={filtros.tipo}
            onChange={(e) => cambiarFiltro({ tipo: e.target.value })}
            className={claseDelSelector}
          >
            {OPCIONES_DE_TIPO.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            aria-label="Filtrar por estado"
            value={filtros.estado}
            onChange={(e) => cambiarFiltro({ estado: e.target.value })}
            className={claseDelSelector}
          >
            {OPCIONES_DE_ESTADO.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-xs font-bold text-navy-dark">
            <input
              type="checkbox"
              checked={filtros.soloNoLeidas}
              onChange={(e) => cambiarFiltro({ soloNoLeidas: e.target.checked })}
              className="h-4 w-4 accent-bronze"
            />
            Solo no leídas
          </label>
        </div>

        <section className="mt-6">
          {cargando && !pagina ? (
            <p className="rounded-2xl border border-dashed border-slate-300 px-6 py-8 text-center text-sm text-slate-400">
              Cargando...
            </p>
          ) : error ? (
            <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-8 text-center">
              <p role="alert" className="text-sm font-semibold text-red-600">{error}</p>
              <button
                type="button"
                onClick={() => cargar()}
                className="mt-4 rounded-xl border border-bronze px-5 py-2.5 text-sm font-bold text-bronze transition hover:bg-bronze hover:text-white"
              >
                Reintentar
              </button>
            </div>
          ) : cargando ? (
            <p className="rounded-2xl border border-dashed border-slate-300 px-6 py-8 text-center text-sm text-slate-400">
              Cargando...
            </p>
          ) : conversaciones.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 px-6 py-8 text-center">
              <MessageSquare className="h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm text-slate-400">No hay conversaciones con estos filtros.</p>
            </div>
          ) : (
            <ul className="grid gap-3">
              {conversaciones.map((c) => (
                <FilaConversacion key={c.id} conversacion={c} />
              ))}
            </ul>
          )}
        </section>

        {!cargando && !error && conversaciones.length > 0 && (
          <Paginador pagina={filtros.pagina} totalPaginas={totalPaginas} onCambiar={irAPagina} />
        )}
      </div>
    </main>
  )
}
