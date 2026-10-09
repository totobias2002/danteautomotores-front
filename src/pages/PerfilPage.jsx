import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BadgeCheck, MailWarning } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../services/api.js'
import { mensajeDeError } from '../utils/errores.js'
import { etiquetaFaltante, normalizarDni, validarTelefonoBasico } from '../utils/cuenta.js'
import useTitulo from '../hooks/useTitulo.js'

const CLASE_CAMPO = 'rounded-xl border border-slate-200 px-5 py-3.5 transition focus-within:border-bronze'
const CLASE_CAMPO_BLOQUEADO = 'rounded-xl border border-slate-200 bg-slate-50 px-5 py-3.5'
const CLASE_INPUT = 'w-full text-base font-semibold text-navy outline-none placeholder:font-normal placeholder:text-slate-400'
const CLASE_BOTON = 'rounded-xl bg-bronze px-6 py-3.5 text-base font-bold text-white transition hover:bg-navy disabled:opacity-60'
const CLASE_TARJETA = 'rounded-2xl border border-slate-200 bg-white p-6'

// Perfil de la cuenta (AUTH-05). El DNI y el teléfono viven solo en el estado de esta pantalla: nunca en localStorage.
export default function PerfilPage() {
  useTitulo('Mi perfil')
  const { guardarSesion, refrescarUsuario } = useAuth()

  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')

  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [telefono, setTelefono] = useState('')
  const [errorDatos, setErrorDatos] = useState('')
  const [datosGuardados, setDatosGuardados] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const [actual, setActual] = useState('')
  const [nueva, setNueva] = useState('')
  const [repeticion, setRepeticion] = useState('')
  const [errorClave, setErrorClave] = useState('')
  const [claveCambiada, setClaveCambiada] = useState(false)
  const [cambiandoClave, setCambiandoClave] = useState(false)

  const [enviandoLink, setEnviandoLink] = useState(false)
  const [avisoLink, setAvisoLink] = useState('')
  const [errorLink, setErrorLink] = useState('')

  const [reenviando, setReenviando] = useState(false)
  const [avisoReenvio, setAvisoReenvio] = useState('')
  const [errorReenvio, setErrorReenvio] = useState('')

  const cargarPerfil = () => {
    setCargando(true)
    setErrorCarga('')
    api
      .get('/usuarios/me')
      .then(({ data }) => {
        setPerfil(data)
        setNombre(data.nombre || '')
        setApellido(data.apellido || '')
        setTelefono(data.telefono || '')
      })
      .catch((err) => setErrorCarga(mensajeDeError(err, 'No pudimos cargar tu perfil. Probá de nuevo.')))
      .finally(() => setCargando(false))
  }

  useEffect(cargarPerfil, [])

  const esAdmin = perfil?.rol === 'ADMIN'
  const dniCargado = Boolean(perfil?.dni)
  const faltantes = Array.isArray(perfil?.faltantes) ? perfil.faltantes : []

  const handleGuardarDatos = async (e) => {
    e.preventDefault()
    setErrorDatos('')
    setDatosGuardados(false)

    if (!nombre.trim() || !apellido.trim()) {
      setErrorDatos('Completá tu nombre y tu apellido.')
      return
    }
    if (!validarTelefonoBasico(telefono)) {
      setErrorDatos('Ingresá un teléfono válido, con el código de área. Por ejemplo: 11 1234-5678.')
      return
    }

    setGuardando(true)
    try {
      // El DNI no se manda: no se cambia desde la web.
      await api.put('/usuarios/me', { nombre: nombre.trim(), apellido: apellido.trim(), telefono: telefono.trim() })
      const actualizado = await refrescarUsuario()
      setPerfil(actualizado)
      setNombre(actualizado.nombre || '')
      setApellido(actualizado.apellido || '')
      setTelefono(actualizado.telefono || '')
      setDatosGuardados(true)
    } catch (err) {
      setErrorDatos(mensajeDeError(err, 'No pudimos guardar tus datos. Probá de nuevo.'))
    } finally {
      setGuardando(false)
    }
  }

  const handleCambiarClave = async (e) => {
    e.preventDefault()
    setErrorClave('')
    setClaveCambiada(false)

    if (nueva.length < 8 || nueva.length > 72) {
      setErrorClave('La contraseña nueva debe tener entre 8 y 72 caracteres.')
      return
    }
    if (nueva !== repeticion) {
      setErrorClave('Las contraseñas nuevas no coinciden.')
      return
    }

    setCambiandoClave(true)
    try {
      const { data } = await api.post('/usuarios/me/contrasena', { actual, nueva })
      // El token nuevo conserva esta sesión; el back cierra las demás (D-19).
      guardarSesion(data)
      setActual('')
      setNueva('')
      setRepeticion('')
      setClaveCambiada(true)
    } catch (err) {
      setErrorClave(mensajeDeError(err, 'No pudimos cambiar tu contraseña. Probá de nuevo.'))
    } finally {
      setCambiandoClave(false)
    }
  }

  const handleEnviarLink = async () => {
    setAvisoLink('')
    setErrorLink('')
    setEnviandoLink(true)
    try {
      const { data } = await api.post('/auth/olvide-contrasena', { email: perfil.email })
      setAvisoLink(
        typeof data?.mensaje === 'string' && data.mensaje.trim() !== ''
          ? data.mensaje
          : 'Te mandamos un link a tu mail para crear una contraseña. Revisá también la carpeta de spam.',
      )
    } catch (err) {
      setErrorLink(mensajeDeError(err, 'No pudimos enviar el mail. Probá de nuevo en unos minutos.'))
    } finally {
      setEnviandoLink(false)
    }
  }

  const handleReenviar = async () => {
    setAvisoReenvio('')
    setErrorReenvio('')
    setReenviando(true)
    try {
      const { data } = await api.post('/usuarios/me/reenviar-confirmacion')
      setAvisoReenvio(data?.mensaje || 'Te mandamos el mail de confirmación.')
    } catch (err) {
      setErrorReenvio(mensajeDeError(err, 'No pudimos enviar el mail. Probá de nuevo en unos minutos.'))
    } finally {
      setReenviando(false)
    }
  }

  if (cargando) {
    return <main className="px-6 py-20 text-center text-sm font-semibold text-slate-500">Cargando tu perfil...</main>
  }

  if (errorCarga) {
    return (
      <main className="px-6 py-20 text-center">
        <p className="text-sm font-semibold text-red-600">{errorCarga}</p>
        <button type="button" onClick={cargarPerfil} className="mt-4 text-sm font-bold text-bronze hover:underline">
          Reintentar
        </button>
      </main>
    )
  }

  return (
    <main className="bg-[#fafaf9] px-6 py-12">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
        <header>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-bronze">Tu cuenta</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy-dark">Mi perfil</h1>
        </header>

        <section className={CLASE_TARJETA} aria-labelledby="estado-cuenta">
          <h2 id="estado-cuenta" className="text-lg font-bold text-navy-dark">
            Estado de la cuenta
          </h2>
          {perfil.cuentaVerificada ? (
            <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-green-800">
              <BadgeCheck className="h-5 w-5" /> Cuenta verificada. Ya podés comprar, cotizar y consultar.
            </p>
          ) : (
            <div className="mt-3 text-sm text-slate-600">
              <p className="font-semibold text-navy-dark">Todavía no podés comprar ni cotizar. Te falta:</p>
              <ul className="mt-2 list-disc pl-5">
                {faltantes.map((codigo) => (
                  <li key={codigo}>{etiquetaFaltante(codigo)}</li>
                ))}
              </ul>
              {faltantes.some((codigo) => codigo !== 'EMAIL_SIN_CONFIRMAR') && (
                <Link to="/completar-datos" state={{ from: '/perfil' }} className="mt-3 inline-block font-bold text-bronze hover:underline">
                  Completá tus datos
                </Link>
              )}
            </div>
          )}

          {!perfil.emailConfirmado && (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <MailWarning className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
              <div>
                <p className="text-sm font-bold text-amber-900">Tu mail todavía no está confirmado</p>
                <button
                  type="button"
                  onClick={handleReenviar}
                  disabled={reenviando}
                  className="mt-3 rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-sm font-bold text-navy-dark transition hover:border-bronze disabled:opacity-60"
                >
                  {reenviando ? 'Enviando...' : 'Reenviar mail de confirmación'}
                </button>
                {avisoReenvio && (
                  <p role="status" className="mt-3 text-sm font-semibold text-green-800">
                    {avisoReenvio}
                  </p>
                )}
                {errorReenvio && (
                  <p role="alert" className="mt-3 text-sm font-semibold text-red-600">
                    {errorReenvio}
                  </p>
                )}
              </div>
            </div>
          )}
        </section>

        <section className={CLASE_TARJETA} aria-labelledby="datos-cuenta">
          <h2 id="datos-cuenta" className="text-lg font-bold text-navy-dark">
            Tus datos
          </h2>

          {!esAdmin && !dniCargado ? (
            <p className="mt-3 text-sm text-slate-600">
              Primero tenés que completar tus datos, incluido el DNI.{' '}
              <Link to="/completar-datos" state={{ from: '/perfil' }} className="font-bold text-bronze hover:underline">
                Completá tus datos
              </Link>
            </p>
          ) : (
            <form onSubmit={handleGuardarDatos} className="mt-5 flex flex-col gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-sm font-bold text-navy-dark">
                  Nombre
                  <span className={CLASE_CAMPO}>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      autoComplete="given-name"
                      maxLength={100}
                      className={CLASE_INPUT}
                      required
                    />
                  </span>
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-bold text-navy-dark">
                  Apellido
                  <span className={CLASE_CAMPO}>
                    <input
                      type="text"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      autoComplete="family-name"
                      maxLength={100}
                      className={CLASE_INPUT}
                      required
                    />
                  </span>
                </label>
              </div>

              <label className="flex flex-col gap-1.5 text-sm font-bold text-navy-dark">
                Teléfono
                <span className={CLASE_CAMPO}>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="11 1234-5678"
                    autoComplete="tel"
                    maxLength={30}
                    className={CLASE_INPUT}
                    required
                  />
                </span>
              </label>

              <div className="flex flex-col gap-1.5 text-sm font-bold text-navy-dark">
                <label htmlFor="perfil-email">Mail</label>
                <span className={CLASE_CAMPO_BLOQUEADO}>
                  <input
                    id="perfil-email"
                    type="text"
                    value={perfil.email || ''}
                    readOnly
                    className="w-full bg-transparent text-base font-semibold text-slate-500 outline-none"
                  />
                </span>
              </div>

              {dniCargado && (
                <div className="flex flex-col gap-1.5 text-sm font-bold text-navy-dark">
                  <label htmlFor="perfil-dni">DNI</label>
                  <span className={CLASE_CAMPO_BLOQUEADO}>
                    <input
                      id="perfil-dni"
                      type="text"
                      value={normalizarDni(perfil.dni)}
                      readOnly
                      className="w-full bg-transparent text-base font-semibold text-slate-500 outline-none"
                    />
                  </span>
                  <span className="text-xs font-normal text-slate-400">Si hay un error en tu DNI, escribinos.</span>
                </div>
              )}

              {errorDatos && (
                <p role="alert" className="text-sm font-semibold text-red-600">
                  {errorDatos}
                </p>
              )}
              {datosGuardados && (
                <p role="status" className="text-sm font-semibold text-green-800">
                  Guardamos tus datos.
                </p>
              )}

              <button type="submit" disabled={guardando} className={`${CLASE_BOTON} self-start`}>
                {guardando ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </form>
          )}
        </section>

        <section className={CLASE_TARJETA} aria-labelledby="clave-cuenta">
          <h2 id="clave-cuenta" className="text-lg font-bold text-navy-dark">
            Contraseña
          </h2>

          {perfil.tieneContrasena ? (
            <form onSubmit={handleCambiarClave} className="mt-5 flex flex-col gap-5">
              <label className="flex flex-col gap-1.5 text-sm font-bold text-navy-dark">
                Contraseña actual
                <span className={CLASE_CAMPO}>
                  <input
                    type="password"
                    value={actual}
                    onChange={(e) => setActual(e.target.value)}
                    autoComplete="current-password"
                    maxLength={200}
                    className={CLASE_INPUT}
                    required
                  />
                </span>
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-bold text-navy-dark">
                Contraseña nueva
                <span className={CLASE_CAMPO}>
                  <input
                    type="password"
                    value={nueva}
                    onChange={(e) => setNueva(e.target.value)}
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={72}
                    className={CLASE_INPUT}
                    required
                  />
                </span>
                <span className="text-xs font-normal text-slate-400">De 8 a 72 caracteres.</span>
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-bold text-navy-dark">
                Repetí la contraseña nueva
                <span className={CLASE_CAMPO}>
                  <input
                    type="password"
                    value={repeticion}
                    onChange={(e) => setRepeticion(e.target.value)}
                    autoComplete="new-password"
                    maxLength={72}
                    className={CLASE_INPUT}
                    required
                  />
                </span>
              </label>

              {errorClave && (
                <p role="alert" className="text-sm font-semibold text-red-600">
                  {errorClave}
                </p>
              )}
              {claveCambiada && (
                <p role="status" className="text-sm font-semibold text-green-800">
                  Cambiaste tu contraseña. Cerramos tus otras sesiones.
                </p>
              )}

              <button type="submit" disabled={cambiandoClave} className={`${CLASE_BOTON} self-start`}>
                {cambiandoClave ? 'Cambiando...' : 'Cambiar contraseña'}
              </button>
            </form>
          ) : (
            <div className="mt-3">
              <p className="text-sm text-slate-600">
                Entrás con Google y tu cuenta no tiene contraseña. Si querés poder ingresar también con tu mail, te mandamos un link para crear una.
              </p>
              <button type="button" onClick={handleEnviarLink} disabled={enviandoLink} className={`${CLASE_BOTON} mt-4`}>
                {enviandoLink ? 'Enviando...' : 'Enviarme un mail para crear una contraseña'}
              </button>
              {avisoLink && (
                <p role="status" className="mt-3 text-sm font-semibold text-green-800">
                  {avisoLink}
                </p>
              )}
              {errorLink && (
                <p role="alert" className="mt-3 text-sm font-semibold text-red-600">
                  {errorLink}
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
