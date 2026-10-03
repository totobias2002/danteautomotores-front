// Única fuente de las etiquetas en español de los enums de la API (transmisión, tipo de carrocería, zona, estado)
// y del símbolo de moneda. La card, el detalle, los filtros y los formularios las importan de acá para no duplicarlas.

export const TRANSMISION = {
  MANUAL: 'Manual',
  AUTOMATICA: 'Automática',
}

export const TIPO_CARROCERIA = {
  SEDAN: 'Sedán',
  HATCHBACK: 'Hatchback',
  SUV: 'SUV',
  PICKUP: 'Pickup',
  UTILITARIO: 'Utilitario',
  COUPE: 'Coupé',
  MONOVOLUMEN: 'Monovolumen',
  FAMILIAR: 'Familiar',
}

export const COMBUSTIBLE = {
  NAFTA: 'Nafta',
  DIESEL: 'Diésel',
  GNC: 'GNC',
  HIBRIDO: 'Híbrido',
  ELECTRICO: 'Eléctrico',
}

export const CONDICION = {
  EXCELENTE: 'Excelente',
  MUY_BUENO: 'Muy bueno',
  BUENO: 'Bueno',
  REGULAR: 'Regular',
}

export const ZONA = {
  CABA: 'CABA',
  ZONA_NORTE: 'Zona Norte',
  ZONA_SUR: 'Zona Sur',
  ZONA_OESTE: 'Zona Oeste',
  INTERIOR: 'Interior',
}

export const ESTADO = {
  DISPONIBLE: { texto: 'Disponible', clase: 'bg-emerald-50 text-emerald-700' },
  RESERVADO: { texto: 'Reservado', clase: 'bg-amber-100 text-amber-800' },
  VENDIDO: { texto: 'Vendido', clase: 'bg-slate-200 text-slate-700' },
}

export const simboloMoneda = (moneda) => (moneda === 'USD' ? 'US$' : '$')

// Convierte un mapa { VALOR: 'Etiqueta' } en las opciones de un select, en el orden del objeto.
export const opcionesDe = (mapa) => Object.entries(mapa).map(([value, label]) => ({ value, label }))
