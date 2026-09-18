import { ShieldCheck, Sparkles, Users } from 'lucide-react'

const beneficios = [
  {
    titulo: 'Autos verificados',
    texto: 'Trabajamos solo con vendedores profesionales y transparentes.',
    Icono: ShieldCheck,
  },
  {
    titulo: 'Autos seleccionados',
    texto: 'Una colección curada de vehículos que realmente valen la pena.',
    Icono: Sparkles,
  },
  {
    titulo: 'Acompañamiento real',
    texto: 'Te damos la información que necesitás para decidir tranquilo.',
    Icono: Users,
  },
]

export default function SeccionConfianza() {
  return (
    <section id="nosotros" className="bg-navy py-20 text-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-10 md:grid-cols-[1fr_2fr] md:items-end">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-bronze-light">Comprar mejor</p>
            <h2 className="text-4xl leading-tight tracking-[-0.03em] md:text-5xl">Una forma más clara de elegir.</h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-slate-300">
            En DanteAutomotores hacemos que encontrar tu próximo auto sea simple, seguro y sin vueltas.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {beneficios.map(({ titulo, texto, Icono }) => (
            <div key={titulo} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <Icono className="mb-8 h-7 w-7 text-bronze-light" />
              <h3 className="text-lg">{titulo}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{texto}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
