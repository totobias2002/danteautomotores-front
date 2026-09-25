import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import IconoGoogle from '../components/IconoGoogle.jsx'

const BENEFICIOS = ['Guardá autos en tus favoritos', 'Reservá una visita en minutos', 'Seguí tus consultas con las agencias']

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [avisoGoogle, setAvisoGoogle] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      await login(email, password)
      navigate('/')
    } catch {
      setError('Email o contraseña incorrectos')
    } finally {
      setCargando(false)
    }
  }

  // TODO: sacar este aviso cuando el login con Google esté conectado al backend.
  const avisarGoogle = () => {
    setAvisoGoogle(true)
    setTimeout(() => setAvisoGoogle(false), 4000)
  }

  return (
    <main className="bg-[#fafaf9]">
      <div className="grid lg:min-h-[calc(100vh-89px)] lg:grid-cols-[42%_58%]">
        {/* Panel con video */}
        <div className="relative hidden overflow-hidden bg-navy lg:block">
          <video autoPlay loop muted playsInline poster="/images/login-car-poster.jpg" className="absolute inset-0 h-full w-full object-cover">
            <source src="/videos/login-car.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-navy/10" />
          <div className="relative flex h-full flex-col justify-end p-12">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-bronze-light">DanteAutomotores</p>
            <p className="mt-2 max-w-sm font-heading text-3xl text-white">Tu cuenta, tu forma más rápida de comprar.</p>
            <ul className="mt-8 space-y-3">
              {BENEFICIOS.map((beneficio) => (
                <li key={beneficio} className="flex items-center gap-2.5 text-sm font-semibold text-white/90">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-bronze/90">
                    <Check className="h-3 w-3 text-white" />
                  </span>
                  {beneficio}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Panel con formulario */}
        <div className="flex min-h-[640px] items-center justify-center px-6 py-16 lg:px-10 xl:px-16">
          <div className="w-full max-w-lg">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-bronze">Ingresar</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-navy-dark">Bienvenido de nuevo</h1>
            <p className="mt-2 text-base text-slate-500">Ingresá con tu email para ver tus favoritos y tus consultas.</p>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
              <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-5 py-4 transition focus-within:border-bronze">
                <Mail className="h-5 w-5 shrink-0 text-slate-400" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-base font-semibold text-navy outline-none placeholder:font-normal placeholder:text-slate-400"
                  required
                />
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-5 py-4 transition focus-within:border-bronze">
                <Lock className="h-5 w-5 shrink-0 text-slate-400" />
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-base font-semibold text-navy outline-none placeholder:font-normal placeholder:text-slate-400"
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

              {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={cargando}
                className="mt-1 rounded-xl bg-bronze px-4 py-4 text-base font-bold text-white transition hover:bg-navy disabled:opacity-60"
              >
                {cargando ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>

            <div className="my-7 flex items-center gap-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
              <span className="h-px flex-1 bg-slate-200" /> o continuá con <span className="h-px flex-1 bg-slate-200" />
            </div>

            <button
              type="button"
              onClick={avisarGoogle}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 px-4 py-4 text-base font-bold text-navy-dark transition hover:border-bronze"
            >
              <IconoGoogle className="h-5 w-5" /> Continuar con Google
            </button>
            {avisoGoogle && (
              <p className="mt-3 text-center text-sm font-semibold text-slate-400">
                El ingreso con Google todavía no está conectado — muy pronto.
              </p>
            )}

            <p className="mt-9 text-center text-base text-slate-500">
              ¿No tenés cuenta?{' '}
              <Link to="/registro" className="font-bold text-bronze hover:underline">
                Creá una gratis
              </Link>
            </p>

            <p className="mt-6 text-center text-xs leading-relaxed text-slate-400">
              Al continuar, aceptás nuestros Términos y Condiciones y nuestra Política de Privacidad.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
