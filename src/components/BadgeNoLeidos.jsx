import { textoContador } from '../utils/mensajes.js'

// Círculo con la cantidad de mensajes sin leer. No dibuja nada si es cero. El número se anuncia completo
// ("12 mensajes sin leer") aunque el círculo muestre "9+".
export default function BadgeNoLeidos({ cantidad, className = '' }) {
  const texto = textoContador(cantidad)
  if (!texto) return null

  const n = Number(cantidad)
  return (
    <span
      aria-label={`${n} ${n === 1 ? 'mensaje sin leer' : 'mensajes sin leer'}`}
      className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-bronze px-1.5 text-[11px] font-bold leading-none text-white ${className}`}
    >
      {texto}
    </span>
  )
}
