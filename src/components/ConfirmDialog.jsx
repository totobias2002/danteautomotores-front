import { useEffect, useRef } from 'react'

// Diálogo de confirmación para acciones destructivas del panel. Usa el dialog nativo (showModal), que
// ya resuelve el foco, el fondo bloqueado y la tecla Esc, sin sumar librerías.
export default function ConfirmDialog({
  abierto,
  titulo,
  children,
  textoConfirmar = 'Eliminar',
  cargando = false,
  deshabilitado = false,
  error = '',
  onConfirmar,
  onCancelar,
}) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (abierto && !dialog.open) dialog.showModal()
    else if (!abierto && dialog.open) dialog.close()
  }, [abierto])

  // Esc: el estado manda, así que se cancela el cierre nativo y se deja que el padre cierre el diálogo.
  const handleCancel = (e) => {
    e.preventDefault()
    if (!cargando) onCancelar()
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      className="m-auto w-[min(92vw,28rem)] rounded-2xl p-0 backdrop:bg-navy/60"
    >
      <div className="p-6">
        <h2 className="font-heading text-xl text-navy-dark">{titulo}</h2>
        <div className="mt-3 text-sm text-slate-600">{children}</div>
        {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancelar}
            disabled={cargando}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-navy-dark transition hover:border-bronze disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={cargando || deshabilitado}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {cargando ? 'Eliminando...' : textoConfirmar}
          </button>
        </div>
      </div>
    </dialog>
  )
}
