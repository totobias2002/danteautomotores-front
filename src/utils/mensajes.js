// Utilidades puras de los mensajes (sin React ni red): etiquetas, extractos y fechas. Las fechas llegan del back como
// instantes ISO con Z (D-13) y se muestran siempre en la hora local del navegador.

const ETIQUETAS_TIPO = {
  COMPRA: 'Compra',
  COTIZACION: 'Cotización',
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

export const etiquetaTipo = (tipo) => ETIQUETAS_TIPO[tipo] ?? ''

// Recorta a `max` caracteres (contando los puntos suspensivos) sin dejar espacios antes de "...".
export function extracto(texto, max = 120) {
  if (typeof texto !== 'string') return ''
  const limpio = texto.trim()
  if (limpio.length <= max) return limpio
  return `${limpio.slice(0, Math.max(max - 3, 0)).trimEnd()}...`
}

const dosDigitos = (n) => String(n).padStart(2, '0')

// Mismo día: la hora "HH:mm"; el día anterior: "Ayer"; el mismo año: "7 oct"; otro año: "07/10/2025".
export function fechaDeMensaje(iso, ahora = new Date()) {
  if (!iso) return ''
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return ''

  const inicioDeHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())
  const inicioDeAyer = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() - 1)
  const inicioDeLaFecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate())

  if (inicioDeLaFecha.getTime() === inicioDeHoy.getTime()) {
    return `${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`
  }
  if (inicioDeLaFecha.getTime() === inicioDeAyer.getTime()) return 'Ayer'
  if (fecha.getFullYear() === ahora.getFullYear()) return `${fecha.getDate()} ${MESES[fecha.getMonth()]}`
  return `${dosDigitos(fecha.getDate())}/${dosDigitos(fecha.getMonth() + 1)}/${fecha.getFullYear()}`
}
