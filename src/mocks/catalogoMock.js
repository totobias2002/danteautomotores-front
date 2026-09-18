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
