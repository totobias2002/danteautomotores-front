import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Banknote,
  Car,
  Check,
  ClipboardCheck,
  Gauge,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import api from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { armarLinkWhatsapp } from '../utils/whatsapp.js'
import { CIUDADES, KM_MAXIMO, MARCAS, MODELOS_SUGERIDOS } from '../constants/vehiculo.js'

const ANIO_ACTUAL = new Date().getFullYear()
const ANIOS = Array.from({ length: 25 }, (_, i) => ANIO_ACTUAL - i)

const PASOS = [
  { numero: 1, titulo: 'Tu auto' },
  { numero: 2, titulo: 'Cotización' },
  { numero: 3, titulo: 'Contacto' },
]

const formatearNumero = (valor) => {
  const soloDigitos = String(valor ?? '').replace(/\D/g, '')
  if (!soloDigitos) return ''
  return Number(soloDigitos).toLocaleString('es-AR')
}

const acotarKm = (valor) => {
  const soloDigitos = String(valor ?? '').replace(/\D/g, '')
  if (!soloDigitos) return ''
  const numero = Math.min(Number(soloDigitos), KM_MAXIMO)
  return String(numero)
}

// TODO: esto es una estimación ilustrativa (no conectada a un motor de
// cotización real ni a datos de mercado). Sirve para mostrar el flujo tipo
// Kavak; cuando haya una fuente de precios real, reemplazar esta función.
const calcularEstimacion = ({ anio, kilometraje }) => {
  const antiguedad = Math.max(ANIO_ACTUAL - Number(anio || ANIO_ACTUAL), 0)
  const km = Number(kilometraje || 0)
  let base = 30000000
  base -= antiguedad * 1400000
  base -= (km / 10000) * 500000
  base = Math.max(base, 3000000)
  const min = Math.round((base * 0.85) / 50000) * 50000
  const max = Math.round((base * 1.05) / 50000) * 50000
  return { min, max }
}

const COMO_FUNCIONA = [
  {
    icono: ClipboardCheck,
    titulo: 'Contanos sobre tu auto',
    texto: 'Marca, modelo, año y kilometraje. Te toma menos de un minuto.',
  },
  {
    icono: Sparkles,
    titulo: 'Recibí una cotización estimada',
    texto: 'Un rango de precio al instante, sin cargo y sin compromiso.',
  },
  {
    icono: ShieldCheck,
    titulo: 'Coordinamos una inspección gratis',
    texto: 'Un asesor revisa el auto y te confirma el precio final.',
  },
  {
    icono: Banknote,
    titulo: 'Cobrás en 24 horas',
    texto: 'Si aceptás la oferta, el pago se acredita al día siguiente.',
  },
]

export default function VenderPage() {
  const { refrescarUsuario } = useAuth()
  const [paso, setPaso] = useState(1)
  const [datosAuto, setDatosAuto] = useState({ marca: '', modelo: '', anio: '', kilometraje: '' })
  const [otraMarca, setOtraMarca] = useState(false)
  const [otraCiudad, setOtraCiudad] = useState(false)
  const [datosContacto, setDatosContacto] = useState({ nombre: '', telefono: '', ciudad: '', descripcion: '' })
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')

  // El teléfono no se guarda en el navegador: se pide al servidor y completa el paso Contacto
  // solo en lo que la persona todavía no escribió.
  useEffect(() => {
    let activo = true
    refrescarUsuario()
      .then((perfil) => {
        if (!activo) return
        const nombreCompleto = [perfil.nombre, perfil.apellido].filter(Boolean).join(' ')
        setDatosContacto((actual) => ({
          ...actual,
          nombre: actual.nombre || nombreCompleto,
          telefono: actual.telefono || perfil.telefono || '',
        }))
      })
      .catch(() => {})
    return () => {
      activo = false
    }
  }, [])

  const estimacion = calcularEstimacion(datosAuto)

  const campoAuto = (nombre) => ({
    value: datosAuto[nombre],
    onChange: (e) => setDatosAuto({ ...datosAuto, [nombre]: e.target.value }),
  })

  const campoContacto = (nombre) => ({
    value: datosContacto[nombre],
    onChange: (e) => setDatosContacto({ ...datosContacto, [nombre]: e.target.value }),
  })

  const irAPaso2 = (e) => {
    e.preventDefault()
    setError('')
    if (!datosAuto.marca || !datosAuto.modelo || !datosAuto.anio) {
      setError('Completá marca, modelo y año para poder estimarlo.')
      return
    }
    setPaso(2)
  }

  const confirmarYContactar = async (e) => {
    e.preventDefault()
    setError('')
    if (!datosContacto.nombre || !datosContacto.telefono) {
      setError('Necesitamos tu nombre y tu teléfono para coordinar la inspección.')
      return
    }

    const mensaje = [
      'Hola! Quiero vender mi auto, esta es la info:',
      `Auto: ${datosAuto.marca} ${datosAuto.modelo} ${datosAuto.anio}`,
      datosAuto.kilometraje ? `Kilometraje: ${formatearNumero(datosAuto.kilometraje)} km` : null,
      `Cotización estimada online: $${estimacion.min.toLocaleString('es-AR')} - $${estimacion.max.toLocaleString('es-AR')}`,
      `Nombre: ${datosContacto.nombre}`,
      `Teléfono: ${datosContacto.telefono}`,
      datosContacto.ciudad ? `Ciudad: ${datosContacto.ciudad}` : null,
      datosContacto.descripcion ? `Detalles: ${datosContacto.descripcion}` : null,
    ]
      .filter(Boolean)
      .join('\n')

    try {
      await api.post('/solicitudes-venta', {
        marca: datosAuto.marca,
        modelo: datosAuto.modelo,
        anio: Number(datosAuto.anio),
        kilometraje: datosAuto.kilometraje ? Number(datosAuto.kilometraje) : null,
        cotizacionMin: estimacion.min,
        cotizacionMax: estimacion.max,
        nombreVendedor: datosContacto.nombre,
        telefonoVendedor: datosContacto.telefono,
        ciudad: datosContacto.ciudad || null,
        descripcion: datosContacto.descripcion || null,
      })
    } catch {
      // Si falla el guardado en el panel de admin igual dejamos que el
      // vendedor coordine por WhatsApp; no le bloqueamos el flujo por esto.
    }

    window.open(armarLinkWhatsapp(mensaje), '_blank', 'noopener,noreferrer')
    setEnviado(true)
    setPaso(4)
  }

  return (
    <main className="min-h-screen bg-[#fafaf9]">
      <div className="bg-navy-dark py-12 text-white">
        <div className="mx-auto max-w-3xl px-6 lg:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-bronze-light">Vender tu auto</p>
          <h1 className="mt-2 font-heading text-3xl tracking-[-0.02em] md:text-4xl">
            Vendé tu auto de forma simple, rápida y segura.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
            Cotizalo online en minutos, coordinamos una inspección sin cargo y si aceptás la oferta, cobrás en 24 horas.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-10 lg:px-10">
        {paso < 4 && (
          <div className="mb-8 flex items-center gap-2">
            {PASOS.map((p, i) => (
              <div key={p.numero} className="flex flex-1 items-center gap-2">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                    paso >= p.numero ? 'bg-bronze text-white' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {paso > p.numero ? <Check className="h-4 w-4" /> : p.numero}
                </div>
                <span className={`hidden text-xs font-bold sm:block ${paso >= p.numero ? 'text-navy-dark' : 'text-slate-400'}`}>
                  {p.titulo}
                </span>
                {i < PASOS.length - 1 && <div className={`h-0.5 flex-1 rounded ${paso > p.numero ? 'bg-bronze' : 'bg-slate-200'}`} />}
              </div>
            ))}
          </div>
        )}

        {paso === 1 && (
          <form onSubmit={irAPaso2} className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="mb-5 text-sm font-bold uppercase tracking-wide text-navy-dark">Contanos sobre tu auto</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Campo label="Marca">
                  <select
                    required={!otraMarca}
                    value={otraMarca ? '__otra__' : datosAuto.marca}
                    onChange={(e) => {
                      const val = e.target.value
                      if (val === '__otra__') {
                        setOtraMarca(true)
                        setDatosAuto({ ...datosAuto, marca: '' })
                      } else {
                        setOtraMarca(false)
                        setDatosAuto({ ...datosAuto, marca: val })
                      }
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-navy outline-none transition focus:border-bronze"
                  >
                    <option value="">Seleccionar marca</option>
                    {MARCAS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                    <option value="__otra__">Otra marca...</option>
                  </select>
                </Campo>
                {otraMarca && (
                  <div className="mt-2">
                    <Campo label="¿Cuál marca?">
                      <input
                        type="text"
                        required
                        {...campoAuto('marca')}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-navy outline-none transition focus:border-bronze"
                      />
                    </Campo>
                  </div>
                )}
              </div>

              <Campo label="Modelo">
                <input
                  type="text"
                  required
                  list="modelos-sugeridos-vender"
                  {...campoAuto('modelo')}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-navy outline-none transition focus:border-bronze"
                />
                <datalist id="modelos-sugeridos-vender">
                  {MODELOS_SUGERIDOS.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              </Campo>

              <Campo label="Año">
                <select
                  required
                  {...campoAuto('anio')}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-navy outline-none transition focus:border-bronze"
                >
                  <option value="">Seleccionar año</option>
                  {ANIOS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </Campo>

              <Campo label="Kilometraje">
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={formatearNumero(datosAuto.kilometraje)}
                    onChange={(e) => setDatosAuto({ ...datosAuto, kilometraje: acotarKm(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 text-sm font-semibold text-navy outline-none transition focus:border-bronze"
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    km
                  </span>
                </div>
                <span className="mt-1 text-[11px] text-slate-400">Hasta {KM_MAXIMO.toLocaleString('es-AR')} km</span>
              </Campo>
            </div>

            {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}

            <button
              type="submit"
              className="mt-6 w-full rounded-xl bg-bronze px-4 py-4 text-sm font-bold text-white transition hover:bg-navy"
            >
              Ver mi cotización estimada
            </button>
          </form>
        )}

        {paso === 2 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2.5 text-sm font-bold text-navy-dark">
              <Car className="h-4 w-4 text-bronze" />
              {datosAuto.marca} {datosAuto.modelo} {datosAuto.anio}
              {datosAuto.kilometraje && (
                <span className="flex items-center gap-1 font-normal text-slate-400">
                  <Gauge className="h-3.5 w-3.5" /> {formatearNumero(datosAuto.kilometraje)} km
                </span>
              )}
            </div>

            <div className="mt-5 rounded-2xl bg-cream p-6 text-center">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Cotización estimada</p>
              <p className="mt-1 font-heading text-3xl text-navy-dark">
                $ {estimacion.min.toLocaleString('es-AR')} — $ {estimacion.max.toLocaleString('es-AR')}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Es un valor estimado online. El precio final se confirma en una inspección gratuita, cara a cara.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setPaso(1)}
                className="rounded-xl border border-slate-200 px-4 py-3.5 text-sm font-bold text-navy-dark transition hover:border-bronze sm:w-40"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={() => setPaso(3)}
                className="flex-1 rounded-xl bg-bronze px-4 py-3.5 text-sm font-bold text-white transition hover:bg-navy"
              >
                Quiero coordinar la inspección
              </button>
            </div>
          </div>
        )}

        {paso === 3 && (
          <form onSubmit={confirmarYContactar} className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="mb-5 text-sm font-bold uppercase tracking-wide text-navy-dark">Tus datos de contacto</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Campo label="Nombre y apellido">
                <input
                  type="text"
                  required
                  {...campoContacto('nombre')}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-navy outline-none transition focus:border-bronze"
                />
              </Campo>
              <Campo label="Teléfono">
                <input
                  type="tel"
                  required
                  placeholder="11 2222-3333"
                  {...campoContacto('telefono')}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-navy outline-none transition focus:border-bronze"
                />
              </Campo>
              <div className="sm:col-span-2">
                <Campo label="Ciudad (opcional)">
                  <select
                    value={otraCiudad ? '__otra__' : datosContacto.ciudad}
                    onChange={(e) => {
                      const val = e.target.value
                      if (val === '__otra__') {
                        setOtraCiudad(true)
                        setDatosContacto({ ...datosContacto, ciudad: '' })
                      } else {
                        setOtraCiudad(false)
                        setDatosContacto({ ...datosContacto, ciudad: val })
                      }
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-navy outline-none transition focus:border-bronze"
                  >
                    <option value="">Seleccionar ciudad</option>
                    {CIUDADES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="__otra__">Otra...</option>
                  </select>
                </Campo>
                {otraCiudad && (
                  <div className="mt-2">
                    <Campo label="¿Cuál ciudad?">
                      <input
                        type="text"
                        {...campoContacto('ciudad')}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-navy outline-none transition focus:border-bronze"
                      />
                    </Campo>
                  </div>
                )}
              </div>
              <div className="sm:col-span-2">
                <Campo label="Contanos más sobre tu auto (opcional)">
                  <textarea
                    rows={3}
                    placeholder="Estado general, service al día, algún golpe o detalle, extras..."
                    {...campoContacto('descripcion')}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-navy outline-none transition focus:border-bronze"
                  />
                </Campo>
              </div>
            </div>

            {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setPaso(2)}
                className="rounded-xl border border-slate-200 px-4 py-3.5 text-sm font-bold text-navy-dark transition hover:border-bronze sm:w-40"
              >
                Volver
              </button>
              <button
                type="submit"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-bronze px-4 py-3.5 text-sm font-bold text-white transition hover:bg-navy"
              >
                <MessageCircle className="h-4 w-4" /> Confirmar y coordinar por WhatsApp
              </button>
            </div>
          </form>
        )}

        {paso === 4 && enviado && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Check className="h-6 w-6" />
            </span>
            <h2 className="mt-4 font-heading text-2xl text-navy-dark">¡Listo, {datosContacto.nombre}!</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Te abrimos WhatsApp con tus datos ya cargados — mandá el mensaje y un asesor te contacta para coordinar la
              inspección gratuita de tu {datosAuto.marca} {datosAuto.modelo}.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-bronze px-5 py-3 text-sm font-bold text-white transition hover:bg-navy"
            >
              <ArrowLeft className="h-4 w-4" /> Volver al inicio
            </Link>
          </div>
        )}

        <section className="mt-14">
          <p className="mb-6 text-center text-xs font-bold uppercase tracking-[0.18em] text-bronze">Cómo funciona</p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {COMO_FUNCIONA.map(({ icono: Icono, titulo, texto }, i) => (
              <div key={titulo} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bronze/10 text-bronze">
                  <Icono className="h-4.5 w-4.5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-navy-dark">
                    {i + 1}. {titulo}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{texto}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

function Campo({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-slate-500">{label}</span>
      {children}
    </label>
  )
}
