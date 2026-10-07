import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'
import api from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { TRANSFORMACION_MINIATURA, urlMiniatura } from '../utils/cloudinary.js'
import { mensajeDeError } from '../utils/errores.js'
import { ESTADO } from '../utils/etiquetas.js'
import { etiquetaTipo, extracto, fechaDeMensaje } from '../utils/mensajes.js'

function FilaConversacion({ conversacion }) {
  const { publicacion } = conversacion
  const foto = urlMiniatura(publicacion?.fotoPortada, TRANSFORMACION_MINIATURA)
  const titulo = publicacion
    ? `${publicacion.marca} ${publicacion.modelo} ${publicacion.anio}`
    : etiquetaTipo(conversacion.tipo)
  const estadoDelAuto = publicacion ? ESTADO[publicacion.estado] : null

  return (
    <li className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-[#d7d9d7]">
        {foto ? (
          <img src={foto} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">Sin foto</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h2 className="truncate text-base font-bold text-navy-dark">{titulo}</h2>
          <span className="shrink-0 text-xs font-semibold text-slate-400">
            {fechaDeMensaje(conversacion.ultimoMensajeEn)}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {estadoDelAuto && (
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${estadoDelAuto.clase}`}>
              {estadoDelAuto.texto}
            </span>
          )}
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
            {etiquetaTipo(conversacion.tipo)}
          </span>
        </div>
        {/* Texto plano: React lo escapa, nunca se interpreta como HTML. */}
        <p className="mt-2 truncate text-sm text-slate-500">
          {conversacion.ultimoMensajeAutor === 'AGENCIA' ? 'Dante Automotores: ' : conversacion.ultimoMensaje ? 'Vos: ' : ''}
          {extracto(conversacion.ultimoMensaje, 120)}
        </p>
      </div>
    </li>
  )
}

export default function MisMensajesPage() {
  const { esAdmin } = useAuth()
  const [conversaciones, setConversaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargar = useCallback(() => {
    setCargando(true)
    setError('')
    return api
      .get('/conversaciones')
      .then((res) => setConversaciones(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        // Un 401 no muestra nada: el interceptor de api.js ya cierra la sesión y lleva a /login.
        if (err?.response?.status !== 401) {
          setError(mensajeDeError(err, 'No se pudieron cargar tus mensajes'))
        }
      })
      .finally(() => setCargando(false))
  }, [])

  useEffect(() => {
    if (esAdmin) return
    cargar()
  }, [esAdmin, cargar])

  // El admin tiene su propia bandeja (D-17); por ahora lo lleva al panel.
  if (esAdmin) return <Navigate to="/admin" replace />

  return (
    <main className="bg-[#fafaf9] px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold text-navy-dark">Mis mensajes</h1>

        {cargando ? (
          <p className="mt-10 text-center text-slate-400">Cargando...</p>
        ) : error ? (
          <div className="mt-10 text-center">
            <p role="alert" className="text-sm font-semibold text-red-600">{error}</p>
            <button
              type="button"
              onClick={cargar}
              className="mt-4 rounded-xl border border-bronze px-5 py-2.5 text-sm font-bold text-bronze transition hover:bg-bronze hover:text-white"
            >
              Reintentar
            </button>
          </div>
        ) : conversaciones.length === 0 ? (
          <div className="mt-8 flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <MessageSquare className="h-10 w-10 text-bronze" />
            <p className="mt-4 text-base font-semibold text-navy-dark">Todavía no tenés conversaciones</p>
            <p className="mt-2 text-base text-slate-500">
              Cuando toques "Lo quiero" en un auto, la conversación con la agencia aparece acá.
            </p>
            <Link to="/autos" className="mt-6 rounded-xl bg-bronze px-6 py-3 text-base font-bold text-white transition hover:bg-navy">
              Ver el catálogo
            </Link>
          </div>
        ) : (
          <ul className="mt-6 grid gap-3">
            {conversaciones.map((c) => (
              <FilaConversacion key={c.id} conversacion={c} />
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
