import { destacadosMock } from './homeMock.js'
import { publicacionesMock, agenciaMock } from './agenciaMock.js'

// TODO: sacar esto cuando el backend esté levantado y probado. Estos datos
// extra (ubicación, tipo de auto, mecánica, color, oferta) son solo para
// poder probar los filtros de la página /autos mientras no tengamos el
// catálogo real; el backend debería traer estos campos en la publicación.
const ENRIQUECIMIENTO = {
  101: { ubicacion: 'CABA', tipoAuto: 'Sedán', mecanica: 'Automática', colorExterior: 'Blanco', oferta: false },
  102: { ubicacion: 'Zona Norte', tipoAuto: 'SUV', mecanica: 'Automática', colorExterior: 'Gris', oferta: true },
  103: { ubicacion: 'CABA', tipoAuto: 'Hatchback', mecanica: 'Manual', colorExterior: 'Rojo', oferta: false },
  104: { ubicacion: 'CABA', tipoAuto: 'SUV', mecanica: 'Automática', colorExterior: 'Negro', oferta: true },
  105: { ubicacion: 'Zona Oeste', tipoAuto: 'Sedán', mecanica: 'Automática', colorExterior: 'Azul', oferta: false },
  106: { ubicacion: 'Zona Sur', tipoAuto: 'Hatchback', mecanica: 'Manual', colorExterior: 'Blanco', oferta: false },
  1: { ubicacion: 'CABA', tipoAuto: 'Sedán', mecanica: 'Automática', colorExterior: 'Gris', oferta: false },
  2: { ubicacion: 'CABA', tipoAuto: 'Hatchback', mecanica: 'Manual', colorExterior: 'Negro', oferta: true },
  3: { ubicacion: 'CABA', tipoAuto: 'SUV', mecanica: 'Automática', colorExterior: 'Blanco', oferta: false },
  4: { ubicacion: 'CABA', tipoAuto: 'Hatchback', mecanica: 'Manual', colorExterior: 'Plata', oferta: false },
  5: { ubicacion: 'CABA', tipoAuto: 'Pickup', mecanica: 'Manual', colorExterior: 'Blanco', oferta: false },
  6: { ubicacion: 'CABA', tipoAuto: 'Sedán', mecanica: 'Manual', colorExterior: 'Rojo', oferta: true },
  7: { ubicacion: 'CABA', tipoAuto: 'Hatchback', mecanica: 'Manual', colorExterior: 'Azul', oferta: false },
  8: { ubicacion: 'CABA', tipoAuto: 'Utilitario', mecanica: 'Manual', colorExterior: 'Blanco', oferta: false },
}

const conExtras = (auto) => ({ ...auto, ...ENRIQUECIMIENTO[auto.id] })

export const catalogoMock = [
  ...destacadosMock.map(conExtras),
  ...publicacionesMock.map((p) => conExtras({ ...p, agenciaNombre: agenciaMock.nombre })),
]

export const ESTADO_LABELS = {
  DISPONIBLE: 'Disponible',
  RESERVADO: 'Reservado',
  VENDIDO: 'Vendido',
}

// Estadísticas de precio del catálogo: se usan tanto en los accesos rápidos
// del Home como en el filtro de precio de /autos (histograma, slider y
// "Ver rangos de precios"). Al ser catalogoMock estático alcanza con
// calcularlo una sola vez acá; con el backend real esto debería recalcularse
// con los datos que traiga la API.
const PRECIOS_CATALOGO = catalogoMock.map((a) => a.precio)
export const PRECIO_MIN = Math.min(...PRECIOS_CATALOGO)
export const PRECIO_MAX = Math.max(...PRECIOS_CATALOGO)

export const CANTIDAD_BINS_PRECIO = 16
const ANCHO_BIN_PRECIO = (PRECIO_MAX - PRECIO_MIN) / CANTIDAD_BINS_PRECIO || 1
export const HISTOGRAMA_PRECIOS = Array.from({ length: CANTIDAD_BINS_PRECIO }, (_, i) => {
  const desde = PRECIO_MIN + i * ANCHO_BIN_PRECIO
  const hasta = desde + ANCHO_BIN_PRECIO
  const esUltimo = i === CANTIDAD_BINS_PRECIO - 1
  const cantidad = PRECIOS_CATALOGO.filter((p) => (esUltimo ? p >= desde && p <= hasta : p >= desde && p < hasta)).length
  return { desde, hasta, cantidad }
})
export const MAX_CANTIDAD_BIN_PRECIO = Math.max(...HISTOGRAMA_PRECIOS.map((b) => b.cantidad), 1)

const PASO_BANDA_PRECIO = (PRECIO_MAX - PRECIO_MIN) / 4
export const BANDAS_PRECIO = [0, 1, 2, 3].map((i) => ({
  desde: Math.round(PRECIO_MIN + PASO_BANDA_PRECIO * i),
  hasta: i === 3 ? PRECIO_MAX : Math.round(PRECIO_MIN + PASO_BANDA_PRECIO * (i + 1)),
}))
