import { Link } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'

// Próximamente: la Fase 4 llena esta página con las conversaciones de compra y de cotización.
export default function MisMensajesPage() {
  return (
    <main className="bg-[#fafaf9] px-6 py-16">
      <div className="mx-auto flex max-w-lg flex-col items-center rounded-2xl border border-slate-200 bg-white p-10 text-center">
        <MessageSquare className="h-10 w-10 text-bronze" />
        <p className="mt-4 text-sm font-bold uppercase tracking-[0.18em] text-bronze">Próximamente</p>
        <h1 className="mt-2 text-2xl font-bold text-navy-dark">Mis mensajes</h1>
        <p className="mt-2 text-base text-slate-500">
          Acá van a aparecer tus conversaciones con la agencia sobre los autos que te interesan y sobre tu usado.
        </p>
        <Link to="/autos" className="mt-6 rounded-xl bg-bronze px-6 py-3 text-base font-bold text-white transition hover:bg-navy">
          Ver el catálogo
        </Link>
      </div>
    </main>
  )
}
