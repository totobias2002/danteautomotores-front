import test from 'node:test'
import assert from 'node:assert/strict'
import { urlMiniatura, TRANSFORMACION_CARD, TRANSFORMACION_MINIATURA } from './cloudinary.js'

const FOTO = 'https://res.cloudinary.com/demo/image/upload/v123/danteautomotores/publicaciones/auto.jpg'

test('urlMiniatura inserta la transformación después de /image/upload/', () => {
  assert.equal(
    urlMiniatura(FOTO, TRANSFORMACION_CARD),
    `https://res.cloudinary.com/demo/image/upload/${TRANSFORMACION_CARD}/v123/danteautomotores/publicaciones/auto.jpg`,
  )
})

test('urlMiniatura usa la miniatura por defecto', () => {
  assert.ok(urlMiniatura(FOTO).includes(`/image/upload/${TRANSFORMACION_MINIATURA}/`))
})

test('urlMiniatura no vuelve a transformar una URL que ya la tiene', () => {
  const ya = urlMiniatura(FOTO, TRANSFORMACION_CARD)
  assert.equal(urlMiniatura(ya, TRANSFORMACION_CARD), ya)
})

test('urlMiniatura deja igual lo que no es una foto de Cloudinary', () => {
  assert.equal(urlMiniatura('https://otro.com/image/upload/auto.jpg'), 'https://otro.com/image/upload/auto.jpg')
  assert.equal(
    urlMiniatura('https://res.cloudinary.com.otro.com/image/upload/auto.jpg'),
    'https://res.cloudinary.com.otro.com/image/upload/auto.jpg',
  )
  assert.equal(urlMiniatura('no es una url'), 'no es una url')
})

test('urlMiniatura devuelve tal cual los valores vacíos o que no son texto', () => {
  assert.equal(urlMiniatura(''), '')
  assert.equal(urlMiniatura(null), null)
  assert.equal(urlMiniatura(undefined), undefined)
})
