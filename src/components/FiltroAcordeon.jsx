import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function FiltroAcordeon({ titulo, children, abiertoPorDefecto = false, contador = 0 }) {
  const [abierto, setAbierto] = useState(abiertoPorDefecto)
  const activo = contador > 0

  return (
    <div className="border-b border-slate-200 py-4 first:pt-0 last:border-b-0 last:pb-0">
      <button
        type="button"
        onClick={() => setAbierto((a) => !a)}
        className="flex w-full items-center justify-between text-left text-sm font-bold"
      >
        <span className={`flex items-center gap-2 ${activo ? 'text-bronze' : 'text-navy-dark'}`}>
          {titulo}
          {activo && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-bronze px-1 text-[11px] font-bold text-white">
              {contador}
            </span>
          )}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-300 ease-in-out ${
            abierto ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          abierto ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="pt-4">{children}</div>
        </div>
      </div>
    </div>
  )
}
