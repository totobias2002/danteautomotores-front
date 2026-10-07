import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import api from '../../services/api.js'
import BadgeNoLeidos from '../../components/BadgeNoLeidos.jsx'
import PerfilDelUsuario from '../../components/PerfilDelUsuario.jsx'
import { mensajeDeError } from '../../utils/errores.js'
import { etiquetaTipo, extracto, fechaDeMensaje } from '../../utils/mensajes.js'

const ESTADO_DE_LA_CONVERSACION = {
  ABIERTA: { texto: 'Abierta', clase: 'bg-emerald-100 text-emerald-700' },
  CERRADA: { texto: 'Cerrada', clase: 'bg-slate-200 text-slate-500' },
}

function FilaDelHistorial({ conversacion }) {
  const { publicacion } = conversacion
  const auto = publicacion
    ? `${publicacion.marca} ${publicacion.modelo} ${publicacion.anio}`
    : etiquetaTipo(conversacion.tipo)
  const estado = ESTADO_DE_LA_CONVERSACION[conversacion.estado]

  return (
    <li>
      <Link
        to={`/admin/mensajes/${conversacion.id}`}
        className="block rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-bronze"
      >
        <div className="flex items-start justify-between gap-3">
          <p className="min-w-0 truncate text-base font-bold text-navy-dark">{auto}</p>
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
        <p className="mt-2 truncate text-sm text-slate-500">
          {conversacion.ultimoMensajeAutor === 'AGENCIA' ? 'Agencia: ' : ''}
          {extracto(conversacion.ultimoMensaje, 120)}
        </p>
      </Link>
    </li>
  )
}

// Ficha del usuario para la agencia (/admin/usuarios/:id): con quién se habla y el historial de sus conversaciones.
// Las cotizaciones se suman acá con la Fase 5.
export default function AdminUsuarioPage() {
  const { id } = useParams()
  const [ficha, setFicha] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [noEncontrado, setNoEncontrado] = useState(false)
  const [error, setError] = useState('')

  const cargar = useCallback(() => {
    setCargando(true)
    setError('')
    setNoEncontrado(false)
    return api
      .get(`/admin/usuarios/${id}`)
      .then((res) => setFicha(res.data))
      .catch((err) => {
        const estado = err?.response?.status
        // Un 401 no muestra nada: el interceptor de api.js ya cierra la sesión y lleva a /login.
        if (estado === 401) return
        if (estado === 404) {
          setNoEncontrado(true)
          return
        }
        setError(mensajeDeError(err, 'No se pudo cargar la ficha del usuario'))
      })
      .finally(() => setCargando(false))
  }, [id])

  useEffect(() => {
    setFicha(null)
    cargar()
  }, [cargar])

  const nombreCompleto = ficha ? [ficha.nombre, ficha.apellido].filter(Boolean).join(' ') : ''
  const conversaciones = Array.isArray(ficha?.conversaciones) ? ficha.conversaciones : []

  return (
    <main className="min-h-screen bg-[#fafaf9] px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/admin/mensajes"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-bronze"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a la bandeja
        </Link>

        {cargando ? (
          <p className="mt-10 text-center text-slate-400">Cargando...</p>
        ) : noEncontrado ? (
          <div className="mt-10 text-center">
            <p className="text-base font-semibold text-navy-dark">No encontramos al usuario</p>
            <Link to="/admin/mensajes" className="mt-4 inline-block text-sm font-bold text-bronze hover:underline">
              Ir a la bandeja
            </Link>
          </div>
        ) : error || !ficha ? (
          <div className="mt-10 text-center">
            <p role="alert" className="text-sm font-semibold text-red-600">{error || 'No se pudo cargar la ficha del usuario'}</p>
            <button
              type="button"
              onClick={() => cargar()}
              className="mt-4 rounded-xl border border-bronze px-5 py-2.5 text-sm font-bold text-bronze transition hover:bg-bronze hover:text-white"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-bronze">Usuario</p>
            <h1 className="mt-1 font-heading text-3xl text-navy-dark">{nombreCompleto || 'Usuario'}</h1>

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
              <PerfilDelUsuario ficha={ficha} columnas />
            </section>

            <section className="mt-8">
              <h2 className="text-lg font-bold text-navy-dark">Historial de conversaciones</h2>
              {conversaciones.length === 0 ? (
                <p className="mt-3 rounded-2xl border border-dashed border-slate-300 px-6 py-8 text-center text-sm text-slate-400">
                  Todavía no tiene conversaciones.
                </p>
              ) : (
                <ul className="mt-3 flex flex-col gap-3">
                  {conversaciones.map((conversacion) => (
                    <FilaDelHistorial key={conversacion.id} conversacion={conversacion} />
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  )
}
