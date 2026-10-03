// El panel muestra miniaturas de 80x60 px; sin transformación se descargaría la foto completa de
// cada auto en cada fila. 160x120 cubre pantallas de densidad 2x, y q_auto,f_auto deja que
// Cloudinary elija la calidad y el formato más livianos que soporte el navegador.
export const TRANSFORMACION_MINIATURA = 'c_fill,w_160,h_120,q_auto,f_auto'

const MARCA_SUBIDA = '/image/upload/'

// Inserta la transformación de Cloudinary en la URL de una foto. Solo toca imágenes de
// res.cloudinary.com: cualquier otra URL (o un valor inválido) vuelve igual que entró.
export function urlMiniatura(url, transformacion = TRANSFORMACION_MINIATURA) {
  if (typeof url !== 'string' || url.trim() === '') return url

  let parseada
  try {
    parseada = new URL(url)
  } catch {
    return url
  }

  // Igualdad estricta del host: un dominio como res.cloudinary.com.otro.com no debe reescribirse.
  if (parseada.hostname !== 'res.cloudinary.com' || !parseada.pathname.includes(MARCA_SUBIDA)) {
    return url
  }

  const despuesDeSubida = parseada.pathname.slice(parseada.pathname.indexOf(MARCA_SUBIDA) + MARCA_SUBIDA.length)
  if (despuesDeSubida.split('/')[0] === transformacion) return url

  // Se reemplaza sobre el string original (no sobre URL.toString()) para no re-codificar
  // la versión, el public_id ni la extensión.
  return url.replace(MARCA_SUBIDA, `${MARCA_SUBIDA}${transformacion}/`)
}
