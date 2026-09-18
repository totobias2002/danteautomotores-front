import { Car, Percent } from 'lucide-react'
import { armarLinkWhatsapp } from '../utils/whatsapp.js'

export default function SeccionFinanciamiento() {
  return (
    <section className="bg-navy-dark py-14 text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-6 md:flex-row md:items-center md:justify-between lg:px-10">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-bronze-light">Financiá tu próximo auto</p>
          <h2 className="text-3xl tracking-[-0.02em] md:text-4xl">Financiamiento a medida y entrega inmediata.</h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-slate-300">
            Armamos un plan según tu presupuesto y, si tenés un auto para entregar, te lo cotizamos al toque.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <a
            href={armarLinkWhatsapp('Hola, quiero información sobre financiamiento.')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-bronze px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-bronze/20 transition hover:-translate-y-0.5 hover:bg-bronze-light"
          >
            <Percent className="h-3.5 w-3.5" /> Financiamiento a medida · entrega inmediata
          </a>
          <a
            href={armarLinkWhatsapp('Hola, quiero cotizar mi auto como parte de pago.')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-white/10"
          >
            <Car className="h-3.5 w-3.5" /> Cotizá tu usado
          </a>
        </div>
      </div>
    </section>
  )
}
