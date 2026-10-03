import test from 'node:test'
import assert from 'node:assert/strict'
import {
  leerFiltros,
  aSearchParams,
  conFiltro,
  alternarEnLista,
  paramsParaApi,
  paginasVisibles,
  bandasDePrecio,
} from './catalogoParams.js'

test('leerFiltros lee listas repetidas, pagina y orden, y deja vacío lo no pedido', () => {
  const filtros = leerFiltros(new URLSearchParams('marca=Toyota&marca=Ford&pagina=3&orden=precio_asc'))
  assert.deepEqual(filtros.marca, ['Toyota', 'Ford'])
  assert.equal(filtros.pagina, 3)
  assert.equal(filtros.orden, 'precio_asc')
  assert.deepEqual(filtros.modelo, [])
  assert.deepEqual(filtros.zona, [])
  assert.equal(filtros.busqueda, '')
  assert.equal(filtros.precioMin, '')
})

test('ida y vuelta conserva listas repetidas, orden y pagina', () => {
  const params = new URLSearchParams('marca=Toyota&marca=Ford&pagina=3&orden=precio_asc')
  assert.equal(aSearchParams(leerFiltros(params)).toString(), 'marca=Toyota&marca=Ford&orden=precio_asc&pagina=3')
})

test('una pagina ilegible, cero o negativa cae a 1 y la pagina 1 no se escribe', () => {
  for (const crudo of ['abc', '0', '-2', '']) {
    assert.equal(leerFiltros(new URLSearchParams(`pagina=${crudo}`)).pagina, 1, `pagina=${crudo}`)
  }
  assert.equal(aSearchParams(leerFiltros(new URLSearchParams('pagina=1&marca=Fiat'))).toString(), 'marca=Fiat')
})

test('los parametros desconocidos se descartan', () => {
  const filtros = leerFiltros(new URLSearchParams('utm_source=mail&marca=Fiat&size=1000&sort=admin.email'))
  assert.equal(aSearchParams(filtros).toString(), 'marca=Fiat')
  assert.equal('utm_source' in filtros, false)
  assert.equal('size' in filtros, false)
})

test('conFiltro cambia el valor y vuelve a la pagina 1; alternarEnLista agrega y saca', () => {
  const base = leerFiltros(new URLSearchParams('marca=Toyota&orden=precio_asc&pagina=4'))

  const reordenado = conFiltro(base, 'orden', 'km_asc')
  assert.equal(reordenado.orden, 'km_asc')
  assert.equal(reordenado.pagina, 1)
  assert.equal(base.pagina, 4, 'no muta el original')

  const conFiat = alternarEnLista(base, 'marca', 'Fiat')
  assert.deepEqual(conFiat.marca, ['Toyota', 'Fiat'])
  assert.equal(conFiat.pagina, 1)

  const sinFiat = alternarEnLista(conFiat, 'marca', 'Fiat')
  assert.deepEqual(sinFiat.marca, ['Toyota'])
  assert.equal(sinFiat.pagina, 1)
  assert.deepEqual(base.marca, ['Toyota'], 'no muta el original')
})

test('paramsParaApi repite las claves de las listas, omite vacios y suma los extra', () => {
  const filtros = leerFiltros(new URLSearchParams('marca=Toyota&marca=Ford&precioMax=20000000&pagina=2'))
  const params = paramsParaApi(filtros, { agenciaId: 7 })
  assert.deepEqual(params.getAll('marca'), ['Toyota', 'Ford'])
  assert.equal(params.get('precioMax'), '20000000')
  assert.equal(params.get('pagina'), '2')
  assert.equal(params.get('agenciaId'), '7')
  assert.equal(params.has('busqueda'), false)
  assert.equal(params.has('orden'), false)
  assert.equal(params.has('modelo'), false)
  assert.match(params.toString(), /marca=Toyota&marca=Ford/)

  assert.equal(paramsParaApi(leerFiltros(new URLSearchParams(''))).get('pagina'), '1')
  assert.equal(paramsParaApi(filtros, { agenciaId: '' }).has('agenciaId'), false)
})

test('paginasVisibles muestra primera, ultima, actual +-1 y puntos suspensivos', () => {
  assert.deepEqual(paginasVisibles(1, 1), [1])
  assert.deepEqual(paginasVisibles(1, 3), [1, 2, 3])
  assert.deepEqual(paginasVisibles(5, 10), [1, '…', 4, 5, 6, '…', 10])
  assert.deepEqual(paginasVisibles(1, 10), [1, 2, '…', 10])
  assert.deepEqual(paginasVisibles(10, 10), [1, '…', 9, 10])
  // un salto de una sola pagina se muestra como numero, no como "…"
  assert.deepEqual(paginasVisibles(4, 10), [1, 2, 3, 4, 5, '…', 10])
})

test('bandasDePrecio arma 4 bandas consecutivas entre el minimo y el maximo', () => {
  const bandas = bandasDePrecio(15600000, 47500000)
  assert.equal(bandas.length, 4)
  assert.equal(bandas[0].desde, 15600000)
  assert.equal(bandas[3].hasta, 47500000)
  for (let i = 1; i < bandas.length; i++) assert.equal(bandas[i].desde, bandas[i - 1].hasta)
  bandas.forEach((b) => {
    assert.ok(Number.isInteger(b.desde) && Number.isInteger(b.hasta))
    assert.ok(b.hasta > b.desde)
  })
})

test('bandasDePrecio con un solo precio da una banda y sin rango da ninguna', () => {
  assert.deepEqual(bandasDePrecio(9000000, 9000000), [{ desde: 9000000, hasta: 9000000 }])
  assert.deepEqual(bandasDePrecio(null, null), [])
  assert.deepEqual(bandasDePrecio(undefined, 5), [])
})
