import { useEffect, useRef, useState } from 'react'
import { Check, CheckCheck, SendHorizontal } from 'lucide-react'
import { mensajeDeError } from '../utils/errores.js'
import { etiquetaDeDia, soloHora } from '../utils/mensajes.js'

const MAXIMO = 2000
const AVISO_DESDE = 1800

// Hilo de mensajes y caja de texto con aspecto de chat (estilo Mercado Libre), reutilizable por el comprador y por el
// admin. `miAutor` es 'USUARIO' o 'AGENCIA': los mensajes de ese autor van a la derecha y los del otro a la izquierda
// con `etiquetaDelOtro`. Los textos se muestran como texto de React (nunca como HTML crudo): una etiqueta escrita en
// un mensaje se ve literal. Enter envía; Shift + Enter hace un salto de línea.
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
  const cajaDeTexto = useRef(null)
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

  // La caja crece con lo que se escribe, hasta unas 5 líneas.
  useEffect(() => {
    const caja = cajaDeTexto.current
    if (!caja) return
    caja.style.height = 'auto'
    caja.style.height = `${Math.min(caja.scrollHeight, 120)}px`
  }, [texto])

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
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      enviar()
    }
  }

  let diaAnterior = ''

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Alto ajustado a la pantalla: el hilo scrollea por dentro y el cuadro para escribir siempre se ve. */}
      <div ref={contenedorDelHilo} className="h-[calc(100dvh-26rem)] min-h-64 overflow-y-auto sm:h-[calc(100dvh-33rem)] sm:min-h-40 bg-[#ebebeb] px-3 py-4 sm:px-5">
        <ul className="flex flex-col gap-1.5" aria-live="polite">
          {mensajes.map((m) => {
            const propio = m.autor === miAutor
            const dia = etiquetaDeDia(m.creadoEn)
            const separador = dia && dia !== diaAnterior
            diaAnterior = dia || diaAnterior
            return (
              <li key={m.id} className="flex flex-col">
                {separador && (
                  <div className="my-3 flex justify-center">
                    <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold text-slate-500 shadow-sm">
                      {dia}
                    </span>
                  </div>
                )}
                <div className={`flex ${propio ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 shadow-sm sm:max-w-[70%] ${
                      propio ? 'rounded-br-sm bg-[#dbe6fb] text-navy-dark' : 'rounded-bl-sm bg-white text-navy-dark'
                    }`}
                  >
                    {!propio && etiquetaDelOtro && <p className="text-xs font-bold text-bronze">{etiquetaDelOtro}</p>}
                    {/* Texto de React: se escapa solo, nunca se interpreta como HTML. */}
                    <p className="whitespace-pre-line break-words text-[15px] leading-snug">{m.texto}</p>
                    <p className="mt-0.5 flex items-center justify-end gap-1 text-[11px] text-slate-400">
                      {soloHora(m.creadoEn)}
                      {propio &&
                        (m.leido ? (
                          <CheckCheck className="h-3.5 w-3.5 text-sky-500" aria-label="Leído" />
                        ) : (
                          <Check className="h-3.5 w-3.5" aria-label="Enviado" />
                        ))}
                    </p>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="border-t border-slate-200 bg-white p-3">
        {puedeEscribir ? (
          <form onSubmit={alEnviarFormulario}>
            <label htmlFor="texto-mensaje" className="sr-only">
              Escribí tu mensaje
            </label>
            <div className="flex items-end gap-2">
              <textarea
                id="texto-mensaje"
                ref={cajaDeTexto}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={alTeclear}
                maxLength={MAXIMO}
                rows={1}
                placeholder="Escribí un mensaje..."
                className="max-h-[120px] min-h-[44px] flex-1 resize-none rounded-3xl border border-slate-200 bg-[#f5f5f5] px-4 py-3 text-base text-navy outline-none transition placeholder:text-slate-400 focus:border-bronze focus:bg-white"
              />
              <button
                type="submit"
                disabled={enviando || enBlanco}
                aria-label={enviando ? 'Enviando' : 'Enviar mensaje'}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bronze text-white transition hover:bg-navy disabled:opacity-50"
              >
                <SendHorizontal className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-1 flex items-center justify-between px-2 text-[11px] text-slate-400">
              <span className="hidden sm:inline">Enter para enviar · Shift + Enter para un salto de línea</span>
              <span className="font-semibold text-bronze">{texto.length > AVISO_DESDE ? `${texto.length}/${MAXIMO}` : ''}</span>
            </div>
            {error && (
              <p role="alert" className="mt-2 text-sm font-semibold text-red-600">
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
