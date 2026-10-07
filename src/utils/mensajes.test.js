import test from 'node:test'
import assert from 'node:assert/strict'
import { etiquetaTipo, extracto, fechaDeMensaje, horaYFecha, textoContador } from './mensajes.js'

// Las fechas se arman con componentes locales (y se pasan como ISO) para que los tests pasen en cualquier zona horaria.
const local = (anio, mes, dia, hora = 0, minuto = 0) => new Date(anio, mes - 1, dia, hora, minuto)
const iso = (fecha) => fecha.toISOString()

test('etiquetaTipo: compra y cotización, y vacío para un tipo desconocido', () => {
  assert.equal(etiquetaTipo('COMPRA'), 'Compra')
  assert.equal(etiquetaTipo('COTIZACION'), 'Cotización')
  assert.equal(etiquetaTipo('OTRO'), '')
  assert.equal(etiquetaTipo(undefined), '')
})

test('extracto: un texto corto queda igual y uno largo se corta con puntos suspensivos dentro del máximo', () => {
  assert.equal(extracto('Hola'), 'Hola')
  assert.equal(extracto('  Hola  '), 'Hola')
  const largo = 'a'.repeat(200)
  const corto = extracto(largo, 120)
  assert.equal(corto.length, 120)
  assert.ok(corto.endsWith('...'))
  assert.equal(extracto('a'.repeat(120), 120), 'a'.repeat(120))
})

test('extracto: no deja un espacio antes de los puntos suspensivos y tolera valores que no son texto', () => {
  assert.equal(extracto('hola mundo cruel', 14), 'hola mundo...')
  assert.equal(extracto(null), '')
  assert.equal(extracto(undefined), '')
})

test('fechaDeMensaje: el mismo día muestra la hora HH:mm', () => {
  const ahora = local(2026, 10, 7, 18, 30)
  assert.equal(fechaDeMensaje(iso(local(2026, 10, 7, 9, 5)), ahora), '09:05')
  assert.equal(fechaDeMensaje(iso(local(2026, 10, 7, 0, 0)), ahora), '00:00')
})

test('fechaDeMensaje: el día anterior muestra Ayer, incluso cruzando de mes', () => {
  assert.equal(fechaDeMensaje(iso(local(2026, 10, 6, 23, 59)), local(2026, 10, 7, 0, 1)), 'Ayer')
  assert.equal(fechaDeMensaje(iso(local(2026, 9, 30, 12, 0)), local(2026, 10, 1, 8, 0)), 'Ayer')
})

test('fechaDeMensaje: el mismo año muestra día y mes abreviado', () => {
  const ahora = local(2026, 10, 7, 12, 0)
  assert.equal(fechaDeMensaje(iso(local(2026, 10, 5, 12, 0)), ahora), '5 oct')
  assert.equal(fechaDeMensaje(iso(local(2026, 1, 20, 12, 0)), ahora), '20 ene')
})

test('fechaDeMensaje: otro año muestra dd/mm/aaaa', () => {
  const ahora = local(2026, 10, 7, 12, 0)
  assert.equal(fechaDeMensaje(iso(local(2025, 10, 7, 12, 0)), ahora), '07/10/2025')
  assert.equal(fechaDeMensaje(iso(local(2025, 12, 31, 23, 0)), local(2026, 1, 1, 10, 0)), 'Ayer')
})

test('fechaDeMensaje: una fecha vacía o inválida da texto vacío', () => {
  assert.equal(fechaDeMensaje(null), '')
  assert.equal(fechaDeMensaje('no es una fecha'), '')
})

test('horaYFecha: hoy muestra solo la hora', () => {
  const ahora = local(2026, 10, 7, 18, 30)
  assert.equal(horaYFecha(iso(local(2026, 10, 7, 14, 32)), ahora), '14:32')
  assert.equal(horaYFecha(iso(local(2026, 10, 7, 0, 5)), ahora), '00:05')
})

test('horaYFecha: otro día del mismo año muestra día, mes abreviado y hora', () => {
  const ahora = local(2026, 10, 7, 12, 0)
  assert.equal(horaYFecha(iso(local(2026, 10, 6, 23, 59)), ahora), '6 oct 23:59')
  assert.equal(horaYFecha(iso(local(2026, 1, 20, 9, 7)), ahora), '20 ene 09:07')
})

test('horaYFecha: otro año muestra dd/mm/aaaa y la hora', () => {
  const ahora = local(2026, 10, 7, 12, 0)
  assert.equal(horaYFecha(iso(local(2025, 10, 7, 14, 32)), ahora), '07/10/2025 14:32')
  assert.equal(horaYFecha(iso(local(2025, 12, 31, 23, 0)), local(2026, 1, 1, 10, 0)), '31/12/2025 23:00')
})

test('horaYFecha: el mismo día y mes de otro año no se toma por hoy', () => {
  assert.equal(horaYFecha(iso(local(2025, 10, 7, 14, 32)), local(2026, 10, 7, 18, 0)), '07/10/2025 14:32')
})

test('horaYFecha: una fecha vacía o inválida da texto vacío', () => {
  assert.equal(horaYFecha(null), '')
  assert.equal(horaYFecha(undefined), '')
  assert.equal(horaYFecha('no es una fecha'), '')
})

test('textoContador: vacío si es cero, el número del 1 al 9 y "9+" desde 10', () => {
  assert.equal(textoContador(0), '')
  assert.equal(textoContador(1), '1')
  assert.equal(textoContador(9), '9')
  assert.equal(textoContador(10), '9+')
  assert.equal(textoContador(250), '9+')
})

test('textoContador: tolera valores que no son un conteo', () => {
  assert.equal(textoContador(undefined), '')
  assert.equal(textoContador(null), '')
  assert.equal(textoContador(-3), '')
  assert.equal(textoContador('x'), '')
  assert.equal(textoContador('4'), '4')
})
