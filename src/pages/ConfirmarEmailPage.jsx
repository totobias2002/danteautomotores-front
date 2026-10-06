import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Loader2, MailWarning } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../services/api.js'
import { mensajeDeError } from '../utils/errores.js'

// Confirma el mail con el token del link. El token se guarda en una referencia y se saca de la URL (T-03-65);
// la confirmación se manda una sola vez aunque React monte la página dos veces (T-03-69): el token es de un solo uso.
export default function ConfirmarEmailPage() {
  const { usuario, refrescarUsuario } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const token = useRef(searchParams.get('token') || '')
  const enviado = useRef(false)
  const [estado, setEstado] = useState('confirmando') // 'confirmando' | 'ok' | 'error'
  const [reenviando, setReenviando] = useState(false)
  const [avisoReenvio, setAvisoReenvio] = useState('')
  const [errorReenvio, setErrorReenvio] = useState('')

  useEffect(() => {
    if (location.search !== '') navigate(location.pathname, { replace: true })

    // La guardia es una referencia y no el estado: StrictMode monta el efecto dos veces antes de que el estado cambie.
    if (enviado.current) return
    enviado.current = true

    const confirmar = async () => {
      if (!token.current) {
        setEstado('error')
        return
      }
      try {
        await api.post('/auth/confirmar-email', { token: token.current })
        setEstado('ok')
        if (usuario) refrescarUsuario().catch(() => {})
      } catch {
        // Un doble envío (por ejemplo, abrir el link dos veces) gasta el token: si la cuenta ya figura confirmada, es éxito.
        if (usuario) {
          try {
            const perfil = await refrescarUsuario()
            if (perfil?.emailConfirmado) {
              setEstado('ok')
              return
            }
          } catch {
            // Sin poder confirmar el estado de la cuenta se muestra el error.
          }
        }
        setEstado('error')
      }
    }
    confirmar()
  }, [])

  const handleReenviar = async () => {
    setAvisoReenvio('')
    setErrorReenvio('')
    setReenviando(true)
    try {
      const { data } = await api.post('/usuarios/me/reenviar-confirmacion')
      setAvisoReenvio(
        typeof data?.mensaje === 'string' && data.mensaje.trim() !== ''
          ? data.mensaje
          : 'Te mandamos un mail nuevo. Revisá también la carpeta de spam.',
      )
    } catch (err) {
      setErrorReenvio(mensajeDeError(err, 'No pudimos reenviar el mail. Probá de nuevo más tarde.'))
    } finally {
      setReenviando(false)
    }
  }

  return (
    <main className="bg-[#fafaf9]">
      <div className="flex min-h-[640px] items-center justify-center px-6 py-16 lg:min-h-[calc(100vh-89px)]">
        <div className="w-full max-w-lg text-center">
          {estado === 'confirmando' && (
            <div role="status" className="flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-bronze" />
              <p className="text-base font-semibold text-slate-500">Confirmando tu mail...</p>
            </div>
          )}

          {estado === 'ok' && (
            <div role="status" className="flex flex-col items-center gap-4">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
              <h1 className="text-3xl font-bold tracking-tight text-navy-dark">¡Listo! Tu mail quedó confirmado.</h1>
              <Link
                to="/"
                className="mt-2 rounded-xl bg-bronze px-6 py-3.5 text-base font-bold text-white transition hover:bg-navy"
              >
                Seguir buscando autos
              </Link>
            </div>
          )}

          {estado === 'error' && (
            <div className="flex flex-col items-center gap-4">
              <MailWarning className="h-12 w-12 text-amber-600" />
              <h1 role="alert" className="text-3xl font-bold tracking-tight text-navy-dark">
                El link no es válido o ya venció. Pedí uno nuevo.
              </h1>
              {usuario ? (
                <>
                  <button
                    type="button"
                    onClick={handleReenviar}
                    disabled={reenviando}
                    className="mt-2 rounded-xl bg-bronze px-6 py-3.5 text-base font-bold text-white transition hover:bg-navy disabled:opacity-60"
                  >
                    {reenviando ? 'Enviando...' : 'Reenviar mail de confirmación'}
                  </button>
                  {avisoReenvio && (
                    <p role="status" className="text-sm font-semibold text-green-700">
                      {avisoReenvio}
                    </p>
                  )}
                  {errorReenvio && (
                    <p role="alert" className="text-sm font-semibold text-red-600">
                      {errorReenvio}
                    </p>
                  )}
                  <p className="text-sm text-slate-400">Revisá también la carpeta de spam.</p>
                </>
              ) : (
                <Link
                  to="/login"
                  className="mt-2 rounded-xl bg-bronze px-6 py-3.5 text-base font-bold text-white transition hover:bg-navy"
                >
                  Ingresar
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
