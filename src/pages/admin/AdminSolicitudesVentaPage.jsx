import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Gauge, MessageCircle } from 'lucide-react'
import api from '../../services/api.js'
import { armarLinkWhatsapp } from '../../utils/whatsapp.js'

const ESTADOS = [
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'CONTACTADO', label: 'Contactado' },
  { value: 'CONCRETADO', label: 'Concretado' },
  { value: 'DESCARTADO', label: 'Descartado' },
]

const ESTILO_ESTADO = {
  PENDIENTE: 'bg-amber-100 text-amber-700',
  CONTACTADO: 'bg-blue-100 text-blue-700',
  CONCRETADO: 'bg-emerald-100 text-emerald-700',
  DESCARTADO: 'bg-slate-200 text-slate-500',
}

export default function AdminSolicitudesVentaPage() {
  const [solicitudes, setSolicitudes] = useState([])
  const [cargando, setCargando] = useState(true)

  const cargar = () => {
    api
      .get('/solicitudes-venta')
      .then((res) => setSolicitudes(res.data))
      .catch(() => {})
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    cargar()
  }, [])

  const cambiarEstado = async (id, estado) => {
    await api.patch(`/solicitudes-venta/${id}/estado`, { estado })
    cargar()
  }

  const contactarPorWhatsapp = (s) => {
    const mensaje = `Hola ${s.nombreVendedor}! Te escribimos de Dante Automotores por tu ${s.marca} ${s.modelo} ${s.anio} que querés vender.`
    window.open(armarLinkWhatsapp(mensaje, s.telefonoVendedor), '_blank', 'noopener,noreferrer')
  }

  return (
    <main className="min-h-screen bg-[#fafaf9] py-10">
      <div className="mx-auto max-w-5xl px-4">
        <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 transition hover:text-bronze">
          <ArrowLeft className="h-3.5 w-3.5" /> Volver al panel
        </Link>
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-bronze">Panel</p>
        <h1 className="mt-2 font-heading text-3xl text-navy-dark">Solicitudes de venta</h1>
        <p className="mt-2 text-sm text-slate-500">
          Autos que la gente cargó en "Vender tu auto" para que los contactemos.
        </p>

        <section className="mt-8">
          {cargando ? (
            <p className="rounded-2xl border border-dashed border-slate-300 px-6 py-8 text-center text-sm text-slate-500">
              Cargando...
            </p>
          ) : solicitudes.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 px-6 py-8 text-center text-sm text-slate-500">
              Todavía no hay solicitudes de venta.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {solicitudes.map((s) => (
                <li key={s.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-navy-dark">
                          {s.marca} {s.modelo} · {s.anio}
                        </span>
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${ESTILO_ESTADO[s.estado] ?? 'bg-slate-200 text-slate-500'}`}>
                          {ESTADOS.find((e) => e.value === s.estado)?.label ?? s.estado}
                        </span>
                      </div>
                      {s.kilometraje != null && (
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                          <Gauge className="h-3.5 w-3.5" /> {Number(s.kilometraje).toLocaleString('es-AR')} km
                        </p>
                      )}
                      {(s.cotizacionMin || s.cotizacionMax) && (
                        <p className="mt-1 text-xs text-slate-500">
                          Cotización estimada: ${Number(s.cotizacionMin).toLocaleString('es-AR')} - $
                          {Number(s.cotizacionMax).toLocaleString('es-AR')}
                        </p>
                      )}
                      <p className="mt-2 text-sm font-semibold text-navy-dark">
                        {s.nombreVendedor} · {s.telefonoVendedor}
                        {s.ciudad ? ` · ${s.ciudad}` : ''}
                      </p>
                      {s.descripcion && <p className="mt-1 max-w-lg text-sm text-slate-500">{s.descripcion}</p>}
                      <p className="mt-2 text-[11px] text-slate-500">
                        {s.fecha ? new Date(s.fecha).toLocaleString('es-AR') : ''}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <select
                        value={s.estado}
                        onChange={(e) => cambiarEstado(s.id, e.target.value)}
                        className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-semibold text-navy outline-none focus:border-bronze"
                      >
                        {ESTADOS.map((estado) => (
                          <option key={estado.value} value={estado.value}>
                            {estado.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => contactarPorWhatsapp(s)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-bronze px-3 py-2 text-xs font-bold text-white transition hover:bg-navy"
                      >
                        <MessageCircle className="h-3.5 w-3.5" /> Contactar
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}
