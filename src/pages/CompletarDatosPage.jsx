import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle2, MailWarning } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../services/api.js'
import { mensajeDeError } from '../utils/errores.js'
import { esDniValido, evaluarAcceso, normalizarDni, sanitizarDestino, validarTelefonoBasico } from '../utils/cuenta.js'

const CLASE_CAMPO = 'rounded-xl border border-slate-200 px-5 py-3.5 transition focus-within:border-bronze'
const CLASE_INPUT = 'w-full text-base font-semibold text-navy outline-none placeholder:font-normal placeholder:text-slate-400'

// Pantalla para completar o corregir los datos de identidad (D-07, D-08). El perfil con DNI y teléfono vive solo
// en el estado de este componente: nunca se guarda en localStorage.
export default function CompletarDatosPage() {
  const { refrescarUsuario } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const destino = sanitizarDestino(location.state?.from)

  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [telefono, setTelefono] = useState('')
  const [dni, setDni] = useState('')
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)
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
      .catch((err) => setErrorCarga(mensajeDeError(err, 'No pudimos cargar tus datos. Probá de nuevo.')))
      .finally(() => setCargando(false))
  }

  useEffect(cargarPerfil, [])

  const dniCargado = Boolean(perfil?.dni)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setGuardado(false)

    if (!nombre.trim() || !apellido.trim()) {
      setError('Completá tu nombre y tu apellido.')
      return
    }
    if (!validarTelefonoBasico(telefono)) {
      setError('Ingresá un teléfono válido, con el código de área. Por ejemplo: 11 1234-5678.')
      return
    }
    if (!dniCargado && !esDniValido(dni)) {
      setError('Ingresá tu DNI: 7 u 8 números, sin puntos.')
      return
    }

    const cuerpo = { nombre: nombre.trim(), apellido: apellido.trim(), telefono: telefono.trim() }
    if (!dniCargado) cuerpo.dni = normalizarDni(dni)

    setGuardando(true)
    try {
      await api.put('/usuarios/me', cuerpo)
      const actualizado = await refrescarUsuario()
      if (evaluarAcceso(actualizado) === 'verificada') {
        navigate(destino, { replace: true })
        return
      }
      setPerfil(actualizado)
      setDni('')
      setGuardado(true)
    } catch (err) {
      setError(mensajeDeError(err, 'No pudimos guardar tus datos. Probá de nuevo.'))
    } finally {
      setGuardando(false)
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
    return <main className="px-6 py-20 text-center text-sm font-semibold text-slate-500">Cargando tus datos...</main>
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

  if (evaluarAcceso(perfil) === 'verificada') {
    return (
      <main className="bg-[#fafaf9] px-6 py-16">
        <div className="mx-auto flex max-w-lg flex-col items-center rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <CheckCircle2 className="h-10 w-10 text-bronze" />
          <h1 className="mt-4 text-2xl font-bold text-navy-dark">Tu cuenta está completa</h1>
          <p className="mt-2 text-base text-slate-500">Ya podés comprar, cotizar y consultar.</p>
          <Link to={destino} className="mt-6 rounded-xl bg-bronze px-6 py-3 text-base font-bold text-white transition hover:bg-navy">
            Continuar
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-[#fafaf9] px-6 py-12">
      <div className="mx-auto w-full max-w-lg">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-bronze">Tu cuenta</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy-dark">Completá tus datos</h1>
        <p className="mt-2 text-base text-slate-500">
          Los necesitamos para que la agencia sepa con quién habla cuando comprás o cotizás. Podés navegar y guardar favoritos sin completarlos.
        </p>

        {guardado && (
          <p role="status" className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
            Guardamos tus datos. Falta confirmar tu mail para poder comprar y cotizar.{' '}
            <Link to={destino} className="font-bold underline">
              Seguir navegando
            </Link>
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
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
          <p className="-mt-3 text-xs text-slate-400">Corregilos si hace falta: tienen que coincidir con tu DNI.</p>

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
            <span className="text-xs font-normal text-slate-400">Con el código de área, sin el 0 ni el 15.</span>
          </label>

          {dniCargado ? (
            <div className="flex flex-col gap-1.5 text-sm font-bold text-navy-dark">
              <label htmlFor="dni-cargado">DNI</label>
              <span className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3.5">
                <input
                  id="dni-cargado"
                  type="text"
                  value={normalizarDni(perfil.dni)}
                  readOnly
                  className="w-full bg-transparent text-base font-semibold text-slate-500 outline-none"
                />
              </span>
              <span className="text-xs font-normal text-slate-400">Si hay un error en tu DNI, escribinos.</span>
            </div>
          ) : (
            <label className="flex flex-col gap-1.5 text-sm font-bold text-navy-dark">
              DNI
              <span className={CLASE_CAMPO}>
                <input
                  type="text"
                  inputMode="numeric"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  placeholder="30123456"
                  autoComplete="off"
                  maxLength={12}
                  className={CLASE_INPUT}
                  required
                />
              </span>
              <span className="text-xs font-normal text-slate-400">7 u 8 números. Una vez guardado no se puede cambiar desde la web.</span>
            </label>
          )}

          {error && (
            <p role="alert" className="text-sm font-semibold text-red-600">
              {error}
            </p>
          )}

          <p className="text-xs leading-relaxed text-slate-400">
            Usamos estos datos para identificarte cuando comprás o cotizás. Más información en la{' '}
            <Link to="/privacidad" className="font-semibold text-bronze hover:underline">
              política de privacidad
            </Link>
            .
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 rounded-xl bg-bronze px-4 py-4 text-base font-bold text-white transition hover:bg-navy disabled:opacity-60"
            >
              {guardando ? 'Guardando...' : 'Guardar mis datos'}
            </button>
            <button
              type="button"
              onClick={() => navigate(destino)}
              className="rounded-xl border border-slate-200 px-6 py-4 text-base font-bold text-navy-dark transition hover:border-bronze"
            >
              Más tarde
            </button>
          </div>
        </form>

        {!perfil.emailConfirmado && (
          <section className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <div className="flex items-start gap-3">
              <MailWarning className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
              <div>
                <h2 className="text-base font-bold text-amber-900">Tu mail todavía no está confirmado</h2>
                <p className="mt-1 text-sm text-amber-800">
                  Te mandamos un link a tu casilla. Si no lo encontrás, pedí otro. Revisá también la carpeta de spam.
                </p>
                <button
                  type="button"
                  onClick={handleReenviar}
                  disabled={reenviando}
                  className="mt-4 rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-sm font-bold text-navy-dark transition hover:border-bronze disabled:opacity-60"
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
          </section>
        )}
      </div>
    </main>
  )
}
