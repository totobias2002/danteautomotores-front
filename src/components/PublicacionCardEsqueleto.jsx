// Tarjeta gris que ocupa el lugar de un auto mientras carga el listado: evita la pantalla vacía y que todo "salte".
export default function PublicacionCardEsqueleto() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white" aria-hidden="true">
      <div className="h-52 bg-slate-200" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-2/3 rounded bg-slate-200" />
        <div className="h-4 w-1/2 rounded bg-slate-100" />
        <div className="mt-4 h-7 w-1/3 rounded bg-slate-200" />
      </div>
    </div>
  )
}
