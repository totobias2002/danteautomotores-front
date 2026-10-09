import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Check, Eye, EyeOff, IdCard, Lock, Mail, Phone, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import BotonGoogle, { googleDisponible } from '../components/BotonGoogle.jsx'
import { destinoPostLogin, esDniValido, normalizarDni, sanitizarDestino, validarTelefonoBasico } from '../utils/cuenta.js'
import { mensajeDeError } from '../utils/errores.js'
import useTitulo from '../hooks/useTitulo.js'

const BENEFICIOS = [
  'Creá tu cuenta en menos de un minuto',
  'Guardá tus autos favoritos para comparar',
  'Reservá visitas y hablá directo con la agencia',
]

const CLASE_CAMPO = 'flex items-center gap-3 rounded-xl border border-slate-200 px-5 py-4 transition focus-within:border-bronze'
const CLASE_INPUT = 'w-full text-base font-semibold text-navy outline-none placeholder:font-normal placeholder:text-slate-400'

// Ayuda y mensaje de error de un campo; el error reemplaza a la ayuda.
function PieDeCampo({ id, ayuda, error }) {
  if (error) {
    return (
      <p id={id} role="alert" className="mt-1.5 px-1 text-sm font-semibold text-red-600">
        {error}
      </p>
    )
  }
  return (
    <p id={id} className="mt-1.5 px-1 text-sm text-slate-400">
      {ayuda}
    </p>
  )
}

export default function RegistroPage() {
  useTitulo('Crear cuenta')
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [dni, setDni] = useState('')
  const [password, setPassword] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [error, setError] = useState('')
  const [errores, setErrores] = useState({})
  const [cargando, setCargando] = useState(false)
  const { registrar, loginConGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Solo se vuelve a rutas internas de la app (nunca a una URL externa ni a "//host").
  const from = sanitizarDestino(location.state?.from)

  // Cuenta incompleta: a Completá tus datos (que después vuelve al origen); si no, directo al origen.
  const irAlDestino = (usuario) => {
    const { ruta, state } = destinoPostLogin(usuario, from)
    navigate(ruta, { replace: true, state })
  }

  // Validación liviana antes de enviar: el back es la fuente de verdad y sus mensajes se muestran tal cual.
  const validar = () => {
    const nuevos = {}
    if (!validarTelefonoBasico(telefono)) nuevos.telefono = 'Ingresá un celular válido con código de área.'
    if (!esDniValido(normalizarDni(dni))) nuevos.dni = 'Ingresá tu DNI sin puntos (7 u 8 dígitos).'
    if (password.length < 8 || password.length > 72) nuevos.password = 'La contraseña debe tener entre 8 y 72 caracteres.'
    return nuevos
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const nuevos = validar()
    setErrores(nuevos)
    if (Object.keys(nuevos).length > 0) return
    setCargando(true)
    try {
      const usuario = await registrar({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim(),
        password,
        telefono: telefono.trim(),
        dni: normalizarDni(dni),
      })
      irAlDestino(usuario)
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo crear la cuenta'))
    } finally {
      setCargando(false)
    }
  }

  const handleGoogle = async (credential) => {
    setError('')
    try {
      irAlDestino(await loginConGoogle(credential))
    } catch (err) {
      if (err?.response?.status === 401) setError('No pudimos verificar tu cuenta de Google. Probá de nuevo.')
      else setError(mensajeDeError(err, 'No se pudo ingresar con Google. Probá de nuevo.'))
    }
  }

  return (
    <main className="bg-[#fafaf9]">
      <div className="grid grid-cols-1 lg:min-h-[calc(100vh-89px)] lg:grid-cols-[42%_58%]">
        {/* Panel con video */}
        <div className="relative hidden overflow-hidden bg-navy lg:block">
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="/images/registro-car-poster.jpg"
            aria-label="Video de un auto premium en un garage con iluminación moderna"
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src="/videos/registro-car.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-navy/10" />
          <div className="relative flex h-full flex-col justify-end p-12">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-bronze-light">DanteAutomotores</p>
            <p className="mt-2 max-w-sm font-heading text-3xl text-white">Sumate y encontrá tu próximo auto.</p>
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
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-bronze">Crear cuenta</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-navy-dark">Sumate a DanteAutomotores</h1>
            <p className="mt-2 text-base text-slate-500">Creá tu cuenta gratis para guardar autos y reservar visitas.</p>

            <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className={CLASE_CAMPO}>
                  <User className="h-5 w-5 shrink-0 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Nombre"
                    autoComplete="given-name"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className={CLASE_INPUT}
                    required
                  />
                </label>
                <label className={CLASE_CAMPO}>
                  <User className="h-5 w-5 shrink-0 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Apellido"
                    autoComplete="family-name"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    className={CLASE_INPUT}
                    required
                  />
                </label>
              </div>

              <label className={CLASE_CAMPO}>
                <Mail className="h-5 w-5 shrink-0 text-slate-400" />
                <input
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={CLASE_INPUT}
                  required
                />
              </label>

              <div>
                <label className={CLASE_CAMPO}>
                  <Phone className="h-5 w-5 shrink-0 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="Teléfono"
                    autoComplete="tel"
                    inputMode="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    aria-invalid={Boolean(errores.telefono)}
                    aria-describedby="ayuda-telefono"
                    className={CLASE_INPUT}
                    required
                  />
                </label>
                <PieDeCampo id="ayuda-telefono" ayuda="Celular con código de área, por ejemplo 11 2345-6789" error={errores.telefono} />
              </div>

              <div>
                <label className={CLASE_CAMPO}>
                  <IdCard className="h-5 w-5 shrink-0 text-slate-400" />
                  <input
                    type="text"
                    placeholder="DNI"
                    autoComplete="off"
                    inputMode="numeric"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    aria-invalid={Boolean(errores.dni)}
                    aria-describedby="ayuda-dni"
                    className={CLASE_INPUT}
                    required
                  />
                </label>
                <PieDeCampo id="ayuda-dni" ayuda="Sin puntos" error={errores.dni} />
              </div>

              <div>
                <label className={CLASE_CAMPO}>
                  <Lock className="h-5 w-5 shrink-0 text-slate-400" />
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    placeholder="Contraseña"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={Boolean(errores.password)}
                    aria-describedby="ayuda-password"
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
                <PieDeCampo id="ayuda-password" ayuda="Entre 8 y 72 caracteres" error={errores.password} />
              </div>

              {error && (
                <p role="alert" className="text-sm font-semibold text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={cargando}
                className="mt-1 rounded-xl bg-bronze px-4 py-4 text-base font-bold text-white transition hover:bg-navy disabled:opacity-60"
              >
                {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>

              <p className="text-center text-sm text-slate-500">
                Te vamos a mandar un mail para confirmar tu cuenta. Revisá también la carpeta de spam.
              </p>
            </form>

            {googleDisponible && (
              <>
                <div className="my-7 flex items-center gap-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
                  <span className="h-px flex-1 bg-slate-200" /> o continuá con <span className="h-px flex-1 bg-slate-200" />
                </div>

                <BotonGoogle onCredential={handleGoogle} onError={setError} />
              </>
            )}

            <p className="mt-9 text-center text-base text-slate-500">
              ¿Ya tenés cuenta?{' '}
              <Link to="/login" state={{ from }} className="font-bold text-bronze hover:underline">
                Ingresá
              </Link>
            </p>

            <p className="mt-6 text-center text-xs leading-relaxed text-slate-400">
              Al crear tu cuenta, aceptás nuestros Términos y Condiciones y nuestra{' '}
              <Link to="/privacidad" className="underline hover:text-bronze">
                Política de Privacidad
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
