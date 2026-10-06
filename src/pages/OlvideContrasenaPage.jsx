import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import api from '../services/api.js'
import { mensajeDeError } from '../utils/errores.js'

const MENSAJE_RESPALDO =
  'Si el mail tiene una cuenta, te mandamos un link para cambiar tu contraseña. Revisá también la carpeta de spam.'

// Pide el link para cambiar la contraseña. La respuesta es siempre la misma exista o no la cuenta (D-14).
export default function OlvideContrasenaPage() {
  const [email, setEmail] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMensaje('')
    setEnviando(true)
    try {
      const { data } = await api.post('/auth/olvide-contrasena', { email: email.trim() })
      setMensaje(typeof data?.mensaje === 'string' && data.mensaje.trim() !== '' ? data.mensaje : MENSAJE_RESPALDO)
    } catch (err) {
      // Solo llegan acá un mail con formato inválido, el límite de intentos (429) o un fallo de red.
      setError(mensajeDeError(err, 'No pudimos procesar el pedido. Probá de nuevo.'))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="bg-[#fafaf9]">
      <div className="flex min-h-[640px] items-center justify-center px-6 py-16 lg:min-h-[calc(100vh-89px)]">
        <div className="w-full max-w-lg">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-bronze">Recuperar cuenta</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-navy-dark">¿Olvidaste tu contraseña?</h1>
          <p className="mt-2 text-base text-slate-500">
            Ingresá el email de tu cuenta y te mandamos un link para elegir una contraseña nueva.
          </p>

          {mensaje ? (
            <p role="status" className="mt-8 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
              {mensaje}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
              <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-5 py-4 transition focus-within:border-bronze">
                <Mail className="h-5 w-5 shrink-0 text-slate-400" />
                <input
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-base font-semibold text-navy outline-none placeholder:font-normal placeholder:text-slate-400"
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
                {enviando ? 'Enviando...' : 'Enviarme el link'}
              </button>
            </form>
          )}

          <p className="mt-9 text-center text-base text-slate-500">
            <Link to="/login" className="font-bold text-bronze hover:underline">
              Volver a ingresar
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
