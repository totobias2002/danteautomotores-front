export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p>© {new Date().getFullYear()} Dante Automotores. Todos los derechos reservados.</p>
        <p>Marketplace de autos usados para agencias.</p>
      </div>
    </footer>
  )
}
