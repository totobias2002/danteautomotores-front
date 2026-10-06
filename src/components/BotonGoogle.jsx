import { useEffect, useRef } from 'react'

// Client ID público de Google Cloud (variable de build). Sin él no se muestra el botón.
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

// Las páginas lo usan para ocultar también el separador "o continuá con".
export const googleDisponible = Boolean(CLIENT_ID)

let promesaScript = null
let inicializado = false
// El callback registrado en initialize es fijo y lee siempre el último onCredential de este módulo.
let credencialVigente = null

// El script oficial se carga una sola vez; si falla, se permite reintentar en el próximo montaje.
function cargarScript() {
  if (window.google?.accounts?.id) return Promise.resolve()
  if (promesaScript) return promesaScript
  promesaScript = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => {
      script.remove()
      promesaScript = null
      reject(new Error('No se pudo cargar el script de Google'))
    }
    document.head.appendChild(script)
  })
  return promesaScript
}

// Botón oficial de Google Identity Services: entrega un ID token (credential) que verifica el back.
// Solo admite tema, tamaño, texto, forma y ancho; no se puede re-estilizar.
export default function BotonGoogle({ onCredential, onError }) {
  const contenedor = useRef(null)
  const errorVigente = useRef(onError)

  credencialVigente = onCredential
  errorVigente.current = onError

  useEffect(() => {
    if (!CLIENT_ID) return undefined
    let vigente = true
    cargarScript()
      .then(() => {
        if (!vigente || !contenedor.current) return
        if (!inicializado) {
          // StrictMode monta dos veces: initialize corre una sola vez.
          window.google.accounts.id.initialize({
            client_id: CLIENT_ID,
            callback: (respuesta) => {
              if (respuesta?.credential) credencialVigente?.(respuesta.credential)
            },
          })
          inicializado = true
        }
        window.google.accounts.id.renderButton(contenedor.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'center',
          width: Math.min(400, contenedor.current.offsetWidth || 400),
        })
      })
      .catch(() => {
        if (vigente) errorVigente.current?.('No pudimos cargar el ingreso con Google. Revisá tu conexión e ingresá con tu email.')
      })
    return () => {
      vigente = false
    }
  }, [])

  if (!CLIENT_ID) return null
  return <div ref={contenedor} className="flex w-full justify-center" />
}
