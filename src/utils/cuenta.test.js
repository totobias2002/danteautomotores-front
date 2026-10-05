import test from 'node:test'
import assert from 'node:assert/strict'
import {
  evaluarAcceso,
  sanitizarDestino,
  destinoDeGate,
  destinoPostLogin,
  normalizarDni,
  esDniValido,
  validarTelefonoBasico,
  etiquetaFaltante,
} from './cuenta.js'

test('evaluarAcceso: sin usuario es anonimo', () => {
  assert.equal(evaluarAcceso(null), 'anonimo')
  assert.equal(evaluarAcceso(undefined), 'anonimo')
})

test('evaluarAcceso: un ADMIN es verificada aunque no tenga faltantes ni datos', () => {
  assert.equal(evaluarAcceso({ rol: 'ADMIN' }), 'verificada')
  assert.equal(evaluarAcceso({ rol: 'ADMIN', faltantes: ['DNI'] }), 'verificada')
})

test('evaluarAcceso: una sesion guardada antes de la fase (sin faltantes) es desconocida', () => {
  assert.equal(evaluarAcceso({ rol: 'COMPRADOR', nombre: 'Ana', email: 'ana@example.com' }), 'desconocida')
  assert.equal(evaluarAcceso({ rol: 'COMPRADOR', faltantes: null }), 'desconocida')
})

test('evaluarAcceso: faltantes vacio es verificada y con elementos es incompleta', () => {
  assert.equal(evaluarAcceso({ rol: 'COMPRADOR', faltantes: [] }), 'verificada')
  assert.equal(evaluarAcceso({ rol: 'COMPRADOR', faltantes: ['DNI'] }), 'incompleta')
  assert.equal(evaluarAcceso({ rol: 'COMPRADOR', faltantes: ['EMAIL_SIN_CONFIRMAR'] }), 'incompleta')
})

test('sanitizarDestino acepta rutas internas con query', () => {
  assert.equal(sanitizarDestino('/'), '/')
  assert.equal(sanitizarDestino('/publicaciones/7?x=1'), '/publicaciones/7?x=1')
  assert.equal(sanitizarDestino('/autos?marca=Ford'), '/autos?marca=Ford')
})

test('sanitizarDestino rechaza destinos externos, esquemas peligrosos y valores que no son texto', () => {
  for (const malo of ['//evil.com', 'https://evil.com', '/\\evil.com', 'javascript:alert(1)', '', null, undefined, 42, {}]) {
    assert.equal(sanitizarDestino(malo), '/', `debia rechazar ${JSON.stringify(malo)}`)
  }
})

test('destinoDeGate: un anonimo va al login y conserva la pagina de origen', () => {
  assert.deepEqual(destinoDeGate('anonimo', '/publicaciones/7?x=1'), {
    ruta: '/login',
    state: { from: '/publicaciones/7?x=1' },
  })
})

test('destinoDeGate: una cuenta incompleta va a completar-datos con el mismo from', () => {
  assert.deepEqual(destinoDeGate('incompleta', '/publicaciones/7?x=1'), {
    ruta: '/completar-datos',
    state: { from: '/publicaciones/7?x=1' },
  })
})

test('destinoDeGate: una cuenta verificada no tiene destino', () => {
  assert.deepEqual(destinoDeGate('verificada', '/autos'), { ruta: null, state: null })
})

test('destinoDeGate: un from externo se reemplaza por la raiz', () => {
  assert.deepEqual(destinoDeGate('anonimo', '//evil.com'), { ruta: '/login', state: { from: '/' } })
  assert.deepEqual(destinoDeGate('incompleta', 'https://evil.com/x'), { ruta: '/completar-datos', state: { from: '/' } })
})

test('destinoPostLogin: faltando apellido, telefono o DNI lleva a completar-datos conservando from', () => {
  for (const faltante of ['APELLIDO', 'TELEFONO', 'DNI']) {
    assert.deepEqual(destinoPostLogin({ rol: 'COMPRADOR', faltantes: [faltante] }, '/autos?marca=Ford'), {
      ruta: '/completar-datos',
      state: { from: '/autos?marca=Ford' },
    })
  }
})

test('destinoPostLogin: si solo falta confirmar el mail o no falta nada, va directo al from sanitizado', () => {
  assert.deepEqual(destinoPostLogin({ rol: 'COMPRADOR', faltantes: ['EMAIL_SIN_CONFIRMAR'] }, '/autos'), {
    ruta: '/autos',
    state: null,
  })
  assert.deepEqual(destinoPostLogin({ rol: 'COMPRADOR', faltantes: [] }, '/publicaciones/7'), {
    ruta: '/publicaciones/7',
    state: null,
  })
  assert.deepEqual(destinoPostLogin({ rol: 'COMPRADOR', faltantes: [] }, undefined), { ruta: '/', state: null })
  assert.deepEqual(destinoPostLogin({ rol: 'COMPRADOR', faltantes: [] }, '//evil.com'), { ruta: '/', state: null })
})

test('destinoPostLogin: el admin y una sesion sin lista de faltantes van directo al from', () => {
  assert.deepEqual(destinoPostLogin({ rol: 'ADMIN', faltantes: [] }, '/admin'), { ruta: '/admin', state: null })
  assert.deepEqual(destinoPostLogin({ rol: 'COMPRADOR' }, '/autos'), { ruta: '/autos', state: null })
})

test('normalizarDni quita puntos, espacios y guiones', () => {
  assert.equal(normalizarDni('30.123.456'), '30123456')
  assert.equal(normalizarDni(' 30 123 456 '), '30123456')
  assert.equal(normalizarDni('30-123-456'), '30123456')
  assert.equal(normalizarDni(null), '')
})

test('esDniValido acepta 7 y 8 digitos sin cero inicial y rechaza el resto', () => {
  assert.equal(esDniValido('30123456'), true)
  assert.equal(esDniValido('30.123.456'), true)
  assert.equal(esDniValido('9123456'), true)
  assert.equal(esDniValido('123456'), false)
  assert.equal(esDniValido('301234567'), false)
  assert.equal(esDniValido('01234567'), false)
  assert.equal(esDniValido('3012345a'), false)
  assert.equal(esDniValido(''), false)
})

test('validarTelefonoBasico acepta formatos argentinos comunes', () => {
  assert.equal(validarTelefonoBasico('011 15 1234-5678'), true)
  assert.equal(validarTelefonoBasico('+54 9 11 1234-5678'), true)
  assert.equal(validarTelefonoBasico('(11) 1234-5678'), true)
})

test('validarTelefonoBasico rechaza letras, numeros cortos y texto largo', () => {
  assert.equal(validarTelefonoBasico('abc'), false)
  assert.equal(validarTelefonoBasico('12345'), false)
  assert.equal(validarTelefonoBasico('x'.repeat(40)), false)
  assert.equal(validarTelefonoBasico('11 1234 5678 ext 9'), false)
  assert.equal(validarTelefonoBasico(null), false)
})

test('etiquetaFaltante da el texto para los cuatro codigos y devuelve el codigo en minuscula si no lo conoce', () => {
  assert.equal(etiquetaFaltante('APELLIDO'), 'apellido')
  assert.equal(etiquetaFaltante('TELEFONO'), 'teléfono')
  assert.equal(etiquetaFaltante('DNI'), 'DNI')
  assert.equal(etiquetaFaltante('EMAIL_SIN_CONFIRMAR'), 'confirmar tu mail')
  assert.equal(etiquetaFaltante('OTRO_DATO'), 'otro_dato')
})
