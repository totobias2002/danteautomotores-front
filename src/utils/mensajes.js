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

// Fecha y hora de un mensaje dentro del hilo. Hoy: "14:32"; otro día del mismo año: "7 oct 14:32"; otro año:
// "07/10/2025 14:32". Siempre en la hora local del navegador.
export function horaYFecha(iso, ahora = new Date()) {
  if (!iso) return ''
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return ''

  const hora = `${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`
  const mismoDia =
    fecha.getFullYear() === ahora.getFullYear() &&
    fecha.getMonth() === ahora.getMonth() &&
    fecha.getDate() === ahora.getDate()
  if (mismoDia) return hora
  if (fecha.getFullYear() === ahora.getFullYear()) return `${fecha.getDate()} ${MESES[fecha.getMonth()]} ${hora}`
  return `${dosDigitos(fecha.getDate())}/${dosDigitos(fecha.getMonth() + 1)}/${fecha.getFullYear()} ${hora}`
}

// Solo la hora "HH:mm" de un mensaje, en la hora local del navegador.
export function soloHora(iso) {
  if (!iso) return ''
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return ''
  return `${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`
}

// Título del separador de día dentro del hilo: "Hoy", "Ayer", "7 de octubre" o con año si es de otro año.
const MESES_LARGOS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
export function etiquetaDeDia(iso, ahora = new Date()) {
  if (!iso) return ''
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return ''
  const inicio = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  if (inicio(fecha) === inicio(ahora)) return 'Hoy'
  if (inicio(fecha) === inicio(new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() - 1))) return 'Ayer'
  const base = `${fecha.getDate()} de ${MESES_LARGOS[fecha.getMonth()]}`
  return fecha.getFullYear() === ahora.getFullYear() ? base : `${base} de ${fecha.getFullYear()}`
}

// Texto del círculo de no leídos: vacío si no hay, el número del 1 al 9 y "9+" desde 10 (cabe en el círculo).
export function textoContador(cantidad) {
  const n = Number(cantidad)
  if (!Number.isFinite(n) || n <= 0) return ''
  return n > 9 ? '9+' : String(Math.floor(n))
}

// ---- Filtros de la bandeja del admin (viven en la URL: se pueden compartir y recargar) ----

const TIPOS_DE_BANDEJA = ['COMPRA', 'COTIZACION']
const ESTADOS_DE_BANDEJA = ['ABIERTA', 'CERRADA', 'TODAS']
const ESTADO_POR_DEFECTO = 'ABIERTA'

// Lee los filtros de la URL. Todo valor desconocido, ilegible, cero o negativo vuelve al valor por defecto: tipo vacío
// (todos), estado ABIERTA, "solo no leídas" apagado y página 1.
export function leerFiltrosBandeja(searchParams) {
  const tipoLeido = searchParams.get('tipo')
  const estadoLeido = searchParams.get('estado')
  const paginaLeida = Number(searchParams.get('pagina'))
  return {
    tipo: TIPOS_DE_BANDEJA.includes(tipoLeido) ? tipoLeido : '',
    estado: ESTADOS_DE_BANDEJA.includes(estadoLeido) ? estadoLeido : ESTADO_POR_DEFECTO,
    soloNoLeidas: searchParams.get('soloNoLeidas') === 'true',
    // Los mensajes de un solo auto (link "Mensajes" del panel): un id entero positivo o nada.
    publicacionId: /^[1-9]\d{0,9}$/.test(searchParams.get('publicacionId') ?? '') ? searchParams.get('publicacionId') : '',
    pagina: Number.isInteger(paginaLeida) && paginaLeida >= 1 ? paginaLeida : 1,
  }
}

// Los parámetros de la URL sin los valores por defecto: una bandeja sin filtros tiene la URL limpia.
export function paramsDeBandeja(filtros) {
  const params = {}
  if (filtros.tipo) params.tipo = filtros.tipo
  if (filtros.estado && filtros.estado !== ESTADO_POR_DEFECTO) params.estado = filtros.estado
  if (filtros.soloNoLeidas) params.soloNoLeidas = 'true'
  if (filtros.publicacionId) params.publicacionId = filtros.publicacionId
  if (filtros.pagina > 1) params.pagina = String(filtros.pagina)
  return params
}

// Lo que viaja al back: "TODAS" no manda estado (el back sin estado devuelve todas), y los filtros apagados no viajan.
export function paramsParaApi(filtros) {
  const params = { pagina: filtros.pagina }
  if (filtros.tipo) params.tipo = filtros.tipo
  if (filtros.estado && filtros.estado !== 'TODAS') params.estado = filtros.estado
  if (filtros.soloNoLeidas) params.soloNoLeidas = true
  if (filtros.publicacionId) params.publicacionId = Number(filtros.publicacionId)
  return params
}
