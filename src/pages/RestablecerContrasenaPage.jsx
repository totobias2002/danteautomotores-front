import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Lock } from 'lucide-react'
import api from '../services/api.js'
import { mensajeDeError } from '../utils/errores.js'

const CLASE_CAMPO = 'flex items-center gap-3 rounded-xl border border-slate-200 px-5 py-4 transition focus-within:border-bronze'
const CLASE_INPUT = 'w-full text-base font-semibold text-navy outline-none placeholder:font-normal placeholder:text-slate-400'

// Define una contraseña nueva con el token del link del mail. El token se guarda en una referencia y se saca de la
// URL con replace, así no queda en la barra de direcciones ni en el historial (T-03-65).
export default function RestablecerContrasenaPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const token = useRef(searchParams.get('token') || '')
  const [password, setPassword] = useState('')
  const [repeticion, setRepeticion] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [error, setError] = useState(token.current ? '' : 'El link no es válido. Pedí uno nuevo.')
  const [linkInvalido, setLinkInvalido] = useState(!token.current)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (location.search !== '') navigate(location.pathname, { replace: true })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 8 || password.length > 72) {
      setError('La contraseña debe tener entre 8 y 72 caracteres.')
      return
    }
    if (password !== repeticion) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setEnviando(true)
    try {
      await api.post('/auth/restablecer-contrasena', { token: token.current, password })
      // El back no inicia sesión después de restablecer: se ingresa con la contraseña nueva.
      navigate('/login', { replace: true, state: { contrasenaRestablecida: true } })
    } catch (err) {
      setError(mensajeDeError(err, 'No pudimos cambiar tu contraseña. Probá de nuevo.'))
      // Un 400 es un token inválido o vencido: no sirve reintentar con el mismo link.
      if (err?.response?.status === 400) setLinkInvalido(true)
      setEnviando(false)
    }
  }

  return (
    <main className="bg-[#fafaf9]">
      <div className="flex min-h-[640px] items-center justify-center px-6 py-16 lg:min-h-[calc(100vh-89px)]">
        <div className="w-full max-w-lg">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-bronze">Recuperar cuenta</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-navy-dark">Elegí una contraseña nueva</h1>

          {linkInvalido ? (
            <div className="mt-8 flex flex-col gap-4">
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </p>
              <Link to="/olvide-contrasena" className="font-bold text-bronze hover:underline">
                Pedir un link nuevo
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
              <label className={CLASE_CAMPO}>
                <Lock className="h-5 w-5 shrink-0 text-slate-400" />
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  placeholder="Contraseña nueva"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={CLASE_INPUT}
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword((v) => !v)}
                  aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="shrink-0 text-slate-400 transition hover:text-bronze"
                >
                  {mostrarPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </label>
              <p className="-mt-3 px-1 text-sm text-slate-400">Entre 8 y 72 caracteres</p>

              <label className={CLASE_CAMPO}>
                <Lock className="h-5 w-5 shrink-0 text-slate-400" />
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  placeholder="Repetí la contraseña"
                  autoComplete="new-password"
                  value={repeticion}
                  onChange={(e) => setRepeticion(e.target.value)}
                  className={CLASE_INPUT}
                  required
                />
              </label>

              {error && (
                <p role="alert" className="text-sm font-semibold text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={enviando}
                className="mt-1 rounded-xl bg-bronze px-4 py-4 text-base font-bold text-white transition hover:bg-navy disabled:opacity-60"
              >
                {enviando ? 'Guardando...' : 'Cambiar contraseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
