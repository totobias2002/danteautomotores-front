import test from 'node:test'
import assert from 'node:assert/strict'
import { armarLinkWhatsapp, WHATSAPP_PLACEHOLDER } from './whatsapp.js'

test('armarLinkWhatsapp usa wa.me con el número por defecto y el mensaje codificado', () => {
  const link = armarLinkWhatsapp('Hola, quería un auto & más')
  assert.equal(link, `https://wa.me/${WHATSAPP_PLACEHOLDER}?text=${encodeURIComponent('Hola, quería un auto & más')}`)
})

test('armarLinkWhatsapp deja solo los dígitos del número', () => {
  assert.ok(armarLinkWhatsapp('hola', '+54 9 11 2222-3333').startsWith('https://wa.me/5491122223333?'))
})
