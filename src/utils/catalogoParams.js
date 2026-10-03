// Estado del catálogo en la URL (?pagina=2&marca=Toyota&orden=precio_asc...). Los nombres son los MISMOS que
// los parámetros de GET /api/publicaciones, así la URL se reenvía casi sin traducir y los links existentes
// (/autos?marca=..., /autos?precioMin=..&precioMax=.., /autos?busqueda=..) siguen funcionando.
// Todo es puro (sin React ni red) para poder testearlo con node:test.

// Se pueden repetir en la URL: ?marca=Toyota&marca=Ford (OR dentro de la lista).
export const FILTROS_LISTA = ['marca', 'modelo', 'color', 'transmision', 'tipo', 'zona', 'estado']
export const FILTROS_ESCALAR = ['busqueda', 'anioMin', 'anioMax', 'kmMax', 'precioMin', 'precioMax', 'ofertas', 'orden']

const CANTIDAD_BANDAS_PRECIO = 4

// Solo se leen los parámetros conocidos: cualquier otro (utm_source, etc.) se descarta, y una página
// ilegible, cero o negativa cae a 1. El backend vuelve a validar todo; esto solo ordena el estado del front.
export function leerFiltros(searchParams) {
  const pagina = Number.parseInt(searchParams.get('pagina') ?? '1', 10)
  const filtros = { pagina: Number.isFinite(pagina) && pagina > 1 ? pagina : 1 }
  FILTROS_LISTA.forEach((clave) => {
    filtros[clave] = searchParams.getAll(clave).filter((valor) => valor !== '')
  })
  FILTROS_ESCALAR.forEach((clave) => {
    filtros[clave] = searchParams.get(clave) ?? ''
  })
  return filtros
}

// Inversa de leerFiltros. La página 1 no se escribe (la URL "limpia" es la primera página).
export function aSearchParams(filtros) {
  const params = new URLSearchParams()
  FILTROS_LISTA.forEach((clave) => (filtros[clave] ?? []).forEach((valor) => params.append(clave, valor)))
  FILTROS_ESCALAR.forEach((clave) => {
    if (filtros[clave]) params.set(clave, filtros[clave])
  })
  if (filtros.pagina > 1) params.set('pagina', String(filtros.pagina))
  return params
}

// Cambiar un filtro o el orden cambia el conjunto de resultados: la página vieja ya no tiene sentido, vuelve a la 1.
export function conFiltro(filtros, clave, valor) {
  return { ...filtros, [clave]: valor, pagina: 1 }
}

export function alternarEnLista(filtros, clave, valor) {
  const actuales = filtros[clave] ?? []
  const nuevos = actuales.includes(valor) ? actuales.filter((v) => v !== valor) : [...actuales, valor]
  return conFiltro(filtros, clave, nuevos)
}

// Parámetros para GET /api/publicaciones. Un URLSearchParams serializa las listas con claves repetidas
// (marca=A&marca=B), que es lo que espera Spring; axios lo reenvía tal cual. `extra` suma lo que no vive
// en la URL del navegador (por ejemplo agenciaId en la página de una agencia).
export function paramsParaApi(filtros, extra = {}) {
  const params = aSearchParams({ ...filtros, pagina: 1 })
  params.set('pagina', String(filtros.pagina > 1 ? filtros.pagina : 1))
  Object.entries(extra).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== '') params.set(clave, String(valor))
  })
  return params
}

// Números del paginador: primera, última y la actual ±1; '…' donde se saltean páginas.
// Si el salto sería de una sola página se muestra el número en vez de los puntos suspensivos.
export function paginasVisibles(pagina, totalPaginas) {
  const total = Math.max(1, totalPaginas)
  const claves = new Set([1, total, pagina - 1, pagina, pagina + 1])
  const ordenadas = [...claves].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b)
  const resultado = []
  ordenadas.forEach((n, i) => {
    if (i > 0) {
      const anterior = ordenadas[i - 1]
      if (n - anterior === 2) resultado.push(anterior + 1)
      else if (n - anterior > 2) resultado.push('…')
    }
    resultado.push(n)
  })
  return resultado
}

// Bandas de "Ver rangos de precios" y de "Buscá por presupuesto" a partir del rango real del catálogo.
// Son consecutivas (el hasta de una es el desde de la siguiente), empiezan en el mínimo y terminan en el máximo.
export function bandasDePrecio(min, max) {
  if (min === null || min === undefined || max === null || max === undefined) return []
  const desdeMin = Number(min)
  const hastaMax = Number(max)
  if (!Number.isFinite(desdeMin) || !Number.isFinite(hastaMax) || hastaMax < desdeMin) return []
  if (hastaMax === desdeMin) return [{ desde: desdeMin, hasta: hastaMax }]

  const paso = (hastaMax - desdeMin) / CANTIDAD_BANDAS_PRECIO
  const corte = (i) => (i === CANTIDAD_BANDAS_PRECIO ? hastaMax : Math.round(desdeMin + paso * i))
  return Array.from({ length: CANTIDAD_BANDAS_PRECIO }, (_, i) => ({ desde: corte(i), hasta: corte(i + 1) }))
}
