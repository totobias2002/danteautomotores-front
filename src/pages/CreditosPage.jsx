import { useMemo } from 'react'
import { CREDITOS_FOTOS, LICENCIAS } from '../data/creditosFotos.js'

const ENLACE = 'font-semibold text-bronze underline-offset-2 hover:underline'

export default function CreditosPage() {
  // Se agrupa por auto conservando el orden en que vienen los créditos.
  const grupos = useMemo(() => {
    const porAuto = new Map()
    for (const credito of CREDITOS_FOTOS) {
      if (!porAuto.has(credito.auto)) porAuto.set(credito.auto, [])
      porAuto.get(credito.auto).push(credito)
    }
    return [...porAuto.entries()]
  }, [])

  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-bronze">Transparencia</p>
      <h1 className="mt-2 font-heading text-3xl text-navy-dark">Créditos de imágenes</h1>
      <p className="mt-3 text-sm text-slate-500">
        Las fotos de los autos de demostración son de Wikimedia Commons y se publican bajo licencias Creative Commons,
        que exigen mencionar al autor y la licencia. Acá figuran todas.
      </p>

      <div className="mt-10 flex flex-col gap-8">
        {grupos.map(([auto, fotos]) => (
          <section key={auto}>
            <h2 className="text-sm font-bold uppercase tracking-wide text-navy-dark">{auto}</h2>
            <ul className="mt-3 flex flex-col divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
              {fotos.map((foto) => (
                <li key={foto.archivo} className="flex flex-col gap-1 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-slate-600">
                    <span className="font-semibold text-navy-dark">{foto.autor}</span>
                    {' · '}
                    <a href={LICENCIAS[foto.licencia]} target="_blank" rel="noopener noreferrer" className={ENLACE}>
                      {foto.licencia}
                    </a>
                  </span>
                  <a href={foto.fuente} target="_blank" rel="noopener noreferrer" className={`${ENLACE} text-xs`}>
                    Ver original ({foto.archivo})
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  )
}
