import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import api from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useNoLeidos } from '../context/NoLeidosContext.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import HiloDeMensajes from '../components/HiloDeMensajes.jsx'
import useSondeo from '../hooks/useSondeo.js'
import { TRANSFORMACION_MINIATURA, urlMiniatura } from '../utils/cloudinary.js'
import { mensajeDeError } from '../utils/errores.js'
import { ESTADO, simboloMoneda } from '../utils/etiquetas.js'
import { etiquetaTipo } from '../utils/mensajes.js'

// Cada cuánto se vuelve a pedir el hilo (D-07): solo con la pestaña visible y sin WebSockets.
const INTERVALO_MS = 10000

const formatoNumero = (valor) => new Intl.NumberFormat('es-AR').format(valor)

function EncabezadoDelAuto({ conversacion }) {
  const { publicacion } = conversacion
  if (!publicacion) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
          {etiquetaTipo(conversacion.tipo)}
        </span>
      </div>
    )
  }

  const foto = urlMiniatura(publicacion.fotoPortada, TRANSFORMACION_MINIATURA)
  const estadoDelAuto = ESTADO[publicacion.estado]
  return (
    <Link
      to={`/publicaciones/${publicacion.id}`}
      className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-bronze"
    >
      <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-[#d7d9d7]">
        {foto ? (
          <img src={foto} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-600">Sin foto</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-bold text-navy-dark">
          {publicacion.marca} {publicacion.modelo} {publicacion.anio}
        </h1>
        {publicacion.precio != null && (
          <p className="mt-0.5 text-sm font-semibold text-bronze">
            {simboloMoneda(publicacion.moneda)} {formatoNumero(publicacion.precio)}
          </p>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {estadoDelAuto && (
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${estadoDelAuto.clase}`}>
              {estadoDelAuto.texto}
            </span>
          )}
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            {etiquetaTipo(conversacion.tipo)}
          </span>
        </div>
      </div>
    </Link>
  )
}

// Hilo de una conversación del comprador (/mensajes/:id): el auto asociado, los mensajes en orden y la caja de texto.
export default function ConversacionPage() {
  const { id } = useParams()
  const { esAdmin } = useAuth()
  const { refrescar } = useNoLeidos()
  const navigate = useNavigate()
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false)
  const [borrando, setBorrando] = useState(false)
  const [errorAlBorrar, setErrorAlBorrar] = useState('')
  const [conversacion, setConversacion] = useState(null)
  const [mensajes, setMensajes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [noEncontrada, setNoEncontrada] = useState(false)
  const [error, setError] = useState('')

  // `silencioso` es la consulta periódica: reemplaza la lista entera por la del servidor y no toca la pantalla si falla.
  const cargar = useCallback(
    (silencioso = false) => {
      if (!silencioso) {
        setCargando(true)
        setError('')
        setNoEncontrada(false)
      }
      return api
        .get(`/conversaciones/${id}`)
        .then((res) => {
          setConversacion(res.data.conversacion)
          setMensajes(Array.isArray(res.data.mensajes) ? res.data.mensajes : [])
        })
        .catch((err) => {
          const estado = err?.response?.status
          // Un 401 no muestra nada: el interceptor de api.js ya cierra la sesión y lleva a /login.
          if (estado === 401) return
          if (estado === 404) {
            setNoEncontrada(true)
            return
          }
          if (!silencioso) setError(mensajeDeError(err, 'No se pudo cargar la conversación'))
        })
        .finally(() => {
          if (!silencioso) setCargando(false)
        })
    },
    [id],
  )

  useEffect(() => {
    if (esAdmin) return
    setConversacion(null)
    setMensajes([])
    cargar()
  }, [esAdmin, cargar])

  useSondeo(() => cargar(true), INTERVALO_MS, !esAdmin && !noEncontrada && conversacion !== null)

  // Después de cada carga, si hay mensajes de la agencia sin leer y la pestaña está visible, se avisa al back (D-06) y se
  // marcan como leídos en el estado local: así la consulta periódica no repite la llamada. Con la pestaña oculta no se
  // marca nada; al volver a verla, la consulta periódica trae el hilo y este efecto corre de nuevo.
  const marcandoLeidos = useRef(false)
  useEffect(() => {
    if (esAdmin || marcandoLeidos.current) return
    if (document.visibilityState !== 'visible') return
    if (!mensajes.some((m) => m.autor === 'AGENCIA' && !m.leido)) return

    marcandoLeidos.current = true
    api
      .post(`/conversaciones/${id}/leida`)
      .then(() => {
        setMensajes((actuales) => actuales.map((m) => (m.autor === 'AGENCIA' ? { ...m, leido: true } : m)))
        return refrescar()
      })
      // Un fallo no se muestra: el próximo ciclo de la consulta periódica lo reintenta (el 401 lo maneja api.js).
      .catch(() => {})
      .finally(() => {
        marcandoLeidos.current = false
      })
  }, [mensajes, id, esAdmin, refrescar])

  // Al enviar se agrega el mensaje que devuelve el POST; la siguiente consulta periódica trae la lista del servidor.
  const enviar = async (texto) => {
    const res = await api.post(`/conversaciones/${id}/mensajes`, { texto })
    setMensajes((actuales) => (actuales.some((m) => m.id === res.data.id) ? actuales : [...actuales, res.data]))
  }

  // El admin atiende desde su propia bandeja (D-17): el mismo hilo, en su panel.
  if (esAdmin) return <Navigate to={`/admin/mensajes/${id}`} replace />

  const cerrada = conversacion?.estado === 'CERRADA'

  // Borrar solo la saca de la lista del comprador: la agencia conserva la conversación completa.
  const borrar = async () => {
    if (borrando) return
    setBorrando(true)
    setErrorAlBorrar('')
    try {
      await api.delete(`/conversaciones/${id}`)
      await refrescar()
      navigate('/mensajes', { replace: true })
    } catch (err) {
      setErrorAlBorrar(mensajeDeError(err, 'No se pudo borrar la conversación. Intentá de nuevo.'))
      setBorrando(false)
    }
  }

  return (
    <main className="bg-[#fafaf9] px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <Link to="/mensajes" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-bronze">
          <ArrowLeft className="h-4 w-4" />
          Volver a Mis mensajes
        </Link>

        {cargando ? (
          <p className="mt-10 text-center text-slate-500">Cargando...</p>
        ) : noEncontrada ? (
          <div className="mt-10 text-center">
            <p className="text-base font-semibold text-navy-dark">No encontramos esta conversación</p>
            <Link to="/mensajes" className="mt-4 inline-block text-sm font-bold text-bronze hover:underline">
              Ir a Mis mensajes
            </Link>
          </div>
        ) : error || !conversacion ? (
          <div className="mt-10 text-center">
            <p role="alert" className="text-sm font-semibold text-red-600">{error || 'No se pudo cargar la conversación'}</p>
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
            <div className="mt-4">
              <EncabezadoDelAuto conversacion={conversacion} />
            </div>

            <div className="mt-6">
              <HiloDeMensajes
                mensajes={mensajes}
                miAutor="USUARIO"
                etiquetaDelOtro="Dante Automotores"
                puedeEscribir={!cerrada}
                avisoSinEscribir={
                  cerrada ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
                      <p className="text-sm font-semibold text-slate-600">Esta conversación está cerrada.</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {conversacion.publicacion ? (
                          <>
                            Si querés retomarla,{' '}
                            <Link to={`/publicaciones/${conversacion.publicacion.id}`} className="font-bold text-bronze hover:underline">
                              volvé a la ficha del auto
                            </Link>{' '}
                            y tocá Lo quiero.
                          </>
                        ) : (
                          'Si querés retomarla, volvé a tocar Lo quiero en el auto.'
                        )}
                      </p>
                      <button
                        type="button"
                        onClick={() => setConfirmandoBorrado(true)}
                        className="mt-3 rounded-xl border border-red-300 px-5 py-2 text-sm font-bold text-red-600 transition hover:bg-red-600 hover:text-white"
                      >
                        Borrar conversación
                      </button>
                    </div>
                  ) : null
                }
                onEnviar={enviar}
              />
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        abierto={confirmandoBorrado}
        titulo="Borrar conversación"
        textoConfirmar="Borrar"
        cargando={borrando}
        error={errorAlBorrar}
        onConfirmar={borrar}
        onCancelar={() => setConfirmandoBorrado(false)}
      >
        <p>La conversación desaparece de tu lista de mensajes. Esto no se puede deshacer desde tu cuenta.</p>
      </ConfirmDialog>
    </main>
  )
}
