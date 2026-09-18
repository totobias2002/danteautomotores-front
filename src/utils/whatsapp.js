// TODO: reemplazar por el número real de WhatsApp de la agencia/empresa.
// Formato: código de país + número, sin espacios, guiones ni el "+". Ej: 5491122223333
export const WHATSAPP_PLACEHOLDER = '5491100000000'

export function armarLinkWhatsapp(mensaje, numero = WHATSAPP_PLACEHOLDER) {
  const numeroLimpio = numero.replace(/\D/g, '')
  return `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`
}
