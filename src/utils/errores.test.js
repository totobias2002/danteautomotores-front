import test from 'node:test'
import assert from 'node:assert/strict'
import { mensajeDeError } from './errores.js'

const conRespuesta = (data) => ({ response: { data } })

test('mensajeDeError devuelve el error del back', () => {
  assert.equal(mensajeDeError(conRespuesta({ error: 'Credenciales inválidas.' }), 'x'), 'Credenciales inválidas.')
})

test('mensajeDeError prefiere los mensajes por campo, sin repetir y sin los nombres de las propiedades', () => {
  const err = conRespuesta({
    error: 'La solicitud tiene datos inválidos.',
    campos: { marca: 'La marca es obligatoria.', modelo: 'El modelo es obligatorio', otro: 'La marca es obligatoria.' },
  })
  assert.equal(mensajeDeError(err, 'x'), 'La marca es obligatoria. El modelo es obligatorio.')
})

test('mensajeDeError usa el respaldo si la respuesta no trae error', () => {
  assert.equal(mensajeDeError(conRespuesta({}), 'Algo falló'), 'Algo falló')
  assert.equal(mensajeDeError(conRespuesta({ error: '   ' }), 'Algo falló'), 'Algo falló')
  assert.equal(mensajeDeError(conRespuesta(undefined), 'Algo falló'), 'Algo falló')
})

test('mensajeDeError avisa de la conexión cuando no hay respuesta', () => {
  assert.match(mensajeDeError(new Error('Network Error'), 'x'), /No se pudo conectar con el servidor/)
  assert.match(mensajeDeError(undefined, 'x'), /No se pudo conectar con el servidor/)
})
