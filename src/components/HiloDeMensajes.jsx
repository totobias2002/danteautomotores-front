import { useEffect, useRef, useState } from 'react'
import { mensajeDeError } from '../utils/errores.js'
import { horaYFecha } from '../utils/mensajes.js'

const MAXIMO = 2000
const AVISO_DESDE = 1800

// Hilo de mensajes y caja de texto, reutilizable por el comprador y por el admin. `miAutor` es 'USUARIO' o 'AGENCIA':
// los mensajes de ese autor van a la derecha en navy y los del otro a la izquierda con `etiquetaDelOtro`.
// Los textos se muestran como texto de React (nunca como HTML crudo): una etiqueta escrita en un mensaje se ve literal.
export default function HiloDeMensajes({
  mensajes,
  miAutor,
  etiquetaDelOtro,
  puedeEscribir = true,
  avisoSinEscribir = null,
  onEnviar,
}) {
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const contenedorDelHilo = useRef(null)
  const cantidadAnterior = useRef(0)

  // Baja al último mensaje cuando llega uno nuevo (no en cada consulta que trae la misma lista). Se mueve solo el
  // scroll del hilo, no el de la página, para que el pie quede quieto.
  useEffect(() => {
    if (mensajes.length !== cantidadAnterior.current) {
      cantidadAnterior.current = mensajes.length
      const contenedor = contenedorDelHilo.current
      if (contenedor) contenedor.scrollTop = contenedor.scrollHeight
    }
  }, [mensajes])

  const enBlanco = texto.trim() === ''

  const enviar = async () => {
    if (enviando || enBlanco) return
    setEnviando(true)
    setError('')
    try {
      await onEnviar(texto.trim())
      setTexto('')
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo enviar el mensaje. Intentá de nuevo.'))
    } finally {
      setEnviando(false)
    }
  }

  const alEnviarFormulario = (e) => {
    e.preventDefault()
    enviar()
  }

  const alTeclear = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      enviar()
    }
  }

  return (
    <div className="flex flex-col">
      {/* Alto fijo: el hilo scrollea por dentro y el resto de la página (pie incluido) no se corre con cada mensaje. */}
      <div ref={contenedorDelHilo} className="h-[calc(100vh-33rem)] min-h-40 overflow-y-auto pr-1">
      <ul className="flex flex-col gap-3" aria-live="polite">
        {mensajes.map((m) => {
          const propio = m.autor === miAutor
          return (
            <li key={m.id} className={`flex ${propio ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 sm:max-w-[75%] ${
                  propio ? 'rounded-br-md bg-navy text-white' : 'rounded-bl-md border border-slate-200 bg-white text-navy-dark'
                }`}
              >
                {!propio && etiquetaDelOtro && (
                  <p className="text-xs font-bold text-bronze">{etiquetaDelOtro}</p>
                )}
                {/* Texto de React: se escapa solo, nunca se interpreta como HTML. */}
                <p className="whitespace-pre-line break-words text-base">{m.texto}</p>
                <p className={`mt-1 text-right text-[11px] ${propio ? 'text-white/70' : 'text-slate-400'}`}>
                  {horaYFecha(m.creadoEn)}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
      </div>

      <div className="mt-4">
        {puedeEscribir ? (
          <form onSubmit={alEnviarFormulario} className="rounded-2xl border border-slate-200 bg-white p-4">
            <label htmlFor="texto-mensaje" className="sr-only">
              Escribí tu mensaje
            </label>
            <textarea
              id="texto-mensaje"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={alTeclear}
              maxLength={MAXIMO}
              rows={2}
              placeholder="Escribí tu mensaje..."
              className="w-full resize-y text-base text-navy outline-none placeholder:text-slate-400"
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-semibold text-bronze">
                {texto.length > AVISO_DESDE ? `${texto.length}/${MAXIMO}` : ''}
              </span>
              <div className="flex items-center gap-3">
                <span className="hidden text-xs text-slate-400 sm:inline">Ctrl + Enter para enviar</span>
                <button
                  type="submit"
                  disabled={enviando || enBlanco}
                  className="rounded-xl bg-bronze px-6 py-2.5 text-base font-bold text-white transition hover:bg-navy disabled:opacity-60"
                >
                  {enviando ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </div>
            {error && (
              <p role="alert" className="mt-3 text-sm font-semibold text-red-600">
                {error}
              </p>
            )}
          </form>
        ) : (
          avisoSinEscribir
        )}
      </div>
    </div>
  )
}
