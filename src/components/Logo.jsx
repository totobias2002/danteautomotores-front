export default function Logo({ variant = 'dark' }) {
  const textClass = variant === 'light' ? 'text-white' : 'text-navy-dark'
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-bronze text-white shadow-lg shadow-bronze/20">
        <span className="font-heading text-xl font-bold italic">D</span>
      </div>
      <span className={`font-heading text-xl font-bold tracking-tight ${textClass}`}>
        Dante<span className="text-bronze">Automotores</span>
      </span>
    </div>
  )
}
