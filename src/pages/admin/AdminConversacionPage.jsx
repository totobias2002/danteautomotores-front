import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import api from '../../services/api.js'
import { useNoLeidos } from '../../context/NoLeidosContext.jsx'
import HiloDeMensajes from '../../components/HiloDeMensajes.jsx'
import useSondeo from '../../hooks/useSondeo.js'
import { TRANSFORMACION_MINIATURA, urlMiniatura } from '../../utils/cloudinary.js'
import { mensajeDeError } from '../../utils/errores.js'
import { ESTADO, simboloMoneda } from '../../utils/etiquetas.js'
import { etiquetaTipo } from '../../utils/mensajes.js'

// Cada cuánto se vuelve a pedir el hilo (D-07): solo con la pestaña visible y sin WebSockets.
const INTERVALO_MS = 10000

const formatoNumero = (valor) => new Intl.NumberFormat('es-AR').format(valor)

const ESTADO_DE_LA_CONVERSACION = {
  ABIERTA: { texto: 'Abierta', clase: 'bg-emerald-100 text-emerald-700' },
  CERRADA: { texto: 'Cerrada', clase: 'bg-slate-200 text-slate-500' },
}

const nombreDelUsuario = (usuario) => [usuario?.nombre, usuario?.apellido].filter(Boolean).join(' ') || 'Usuario'

function EncabezadoDeLaConversacion({ conversacion }) {
  const { publicacion, usuario } = conversacion
  const estadoDeLaConversacion = ESTADO_DE_LA_CONVERSACION[conversacion.estado]
  const estadoDelAuto = publicacion ? ESTADO[publicacion.estado] : null
  const foto = publicacion ? urlMiniatura(publicacion.fotoPortada, TRANSFORMACION_MINIATURA) : null

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-bronze">Usuario</p>
        <h1 className="mt-1 text-lg font-bold text-navy-dark">{nombreDelUsuario(usuario)}</h1>
        {usuario?.email && <p className="text-sm text-slate-500">{usuario.email}</p>}
        {usuario?.id != null && (
          <Link
            to={`/admin/usuarios/${usuario.id}`}
            className="mt-1 inline-block text-sm font-bold text-bronze hover:underline"
          >
            Ver ficha del usuario
          </Link>
        )}
      </div>

      {publicacion && (
        <Link
          to={`/publicaciones/${publicacion.id}`}
          className="mt-4 flex gap-4 rounded-xl border border-slate-200 p-3 transition hover:border-bronze"
        >
          <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-[#d7d9d7]">
            {foto ? (
              <img src={foto} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">Sin foto</div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold text-navy-dark">
              {publicacion.marca} {publicacion.modelo} {publicacion.anio}
            </p>
            {publicacion.precio != null && (
              <p className="mt-0.5 text-sm font-semibold text-bronze">
                {simboloMoneda(publicacion.moneda)} {formatoNumero(publicacion.precio)}
              </p>
            )}
            {estadoDelAuto && (
              <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${estadoDelAuto.clase}`}>
                {estadoDelAuto.texto}
              </span>
            )}
          </div>
        </Link>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
          {etiquetaTipo(conversacion.tipo)}
        </span>
        {estadoDeLaConversacion && (
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${estadoDeLaConversacion.clase}`}>
            {estadoDeLaConversacion.texto}
          </span>
        )}
      </div>
    </div>
  )
}

// Hilo de una conversación visto por la agencia (/admin/mensajes/:id): responde, cierra y reabre.
export default function AdminConversacionPage() {
  const { id } = useParams()
  const { refrescar } = useNoLeidos()
  const [conversacion, setConversacion] = useState(null)
  const [mensajes, setMensajes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [noEncontrada, setNoEncontrada] = useState(false)
  const [error, setError] = useState('')
  const [cambiandoEstado, setCambiandoEstado] = useState(false)
  const [errorDeEstado, setErrorDeEstado] = useState('')

  // `silencioso` es la consulta periódica: reemplaza la lista entera por la del servidor y no toca la pantalla si falla.
  const cargar = useCallback(
    (silencioso = false) => {
      if (!silencioso) {
        setCargando(true)
        setError('')
        setNoEncontrada(false)
      }
      return api
        .get(`/admin/conversaciones/${id}`)
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
    setConversacion(null)
    setMensajes([])
    setErrorDeEstado('')
    cargar()
  }, [cargar])

  useSondeo(() => cargar(true), INTERVALO_MS, !noEncontrada && conversacion !== null)

  // Después de cada carga, si hay mensajes del usuario sin leer y la pestaña está visible, se avisa al back (D-06) y se
  // marcan como leídos en el estado local: así la consulta periódica no repite la llamada. Con la pestaña oculta no se
  // marca nada; al volver a verla, la consulta periódica trae el hilo y este efecto corre de nuevo.
  const marcandoLeidos = useRef(false)
  useEffect(() => {
    if (marcandoLeidos.current) return
    if (document.visibilityState !== 'visible') return
    if (!mensajes.some((m) => m.autor === 'USUARIO' && !m.leido)) return

    marcandoLeidos.current = true
    api
      .post(`/admin/conversaciones/${id}/leida`)
      .then(() => {
        setMensajes((actuales) => actuales.map((m) => (m.autor === 'USUARIO' ? { ...m, leido: true } : m)))
        return refrescar()
      })
      // Un fallo no se muestra: el próximo ciclo de la consulta periódica lo reintenta (el 401 lo maneja api.js).
      .catch(() => {})
      .finally(() => {
        marcandoLeidos.current = false
      })
  }, [mensajes, id, refrescar])

  // Al responder se agrega el mensaje que devuelve el POST; la siguiente consulta periódica trae la lista del servidor.
  const responder = async (texto) => {
    const res = await api.post(`/admin/conversaciones/${id}/mensajes`, { texto })
    setMensajes((actuales) => (actuales.some((m) => m.id === res.data.id) ? actuales : [...actuales, res.data]))
  }

  // Cerrar y reabrir son reversibles: sin diálogo de confirmación. El error del back (por ejemplo una reapertura
  // rechazada porque el usuario ya tiene otra conversación abierta por el mismo auto) se muestra tal cual.
  const cambiarEstado = async (accion) => {
    if (cambiandoEstado) return
    setCambiandoEstado(true)
    setErrorDeEstado('')
    try {
      const res = await api.post(`/admin/conversaciones/${id}/${accion}`)
      setConversacion((actual) => ({ ...actual, ...res.data }))
    } catch (err) {
      setErrorDeEstado(mensajeDeError(err, 'No se pudo cambiar el estado de la conversación'))
    } finally {
      setCambiandoEstado(false)
    }
  }

  const cerrada = conversacion?.estado === 'CERRADA'

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
        ) : noEncontrada ? (
          <div className="mt-10 text-center">
            <p className="text-base font-semibold text-navy-dark">No encontramos esta conversación</p>
            <Link to="/admin/mensajes" className="mt-4 inline-block text-sm font-bold text-bronze hover:underline">
              Ir a la bandeja
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
              <EncabezadoDeLaConversacion conversacion={conversacion} />
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-end gap-3">
              {errorDeEstado && (
                <p role="alert" className="text-sm font-semibold text-red-600">{errorDeEstado}</p>
              )}
              <button
                type="button"
                onClick={() => cambiarEstado(cerrada ? 'reabrir' : 'cerrar')}
                disabled={cambiandoEstado}
                className="rounded-xl border border-bronze px-5 py-2.5 text-sm font-bold text-bronze transition hover:bg-bronze hover:text-white disabled:opacity-60"
              >
                {cambiandoEstado ? 'Un momento...' : cerrada ? 'Reabrir conversación' : 'Cerrar conversación'}
              </button>
            </div>

            <div className="mt-6">
              <HiloDeMensajes
                mensajes={mensajes}
                miAutor="AGENCIA"
                etiquetaDelOtro={nombreDelUsuario(conversacion.usuario)}
                puedeEscribir={!cerrada}
                avisoSinEscribir={
                  cerrada ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
                      <p className="text-sm font-semibold text-slate-600">Conversación cerrada. Reabrila para responder.</p>
                    </div>
                  ) : null
                }
                onEnviar={responder}
              />
            </div>
          </>
        )}
      </div>
    </main>
  )
}
