// Reglas puras de acceso de una cuenta (gate de login y de cuenta verificada). Sin dependencias de React.
// El front es una cortesía de UX: la autoridad es el back, que responde 403 CUENTA_NO_VERIFICADA.

// Datos que se piden en "Completá tus datos"; confirmar el mail se recuerda con el aviso y no corta el ingreso.
const DATOS_A_COMPLETAR = ['APELLIDO', 'TELEFONO', 'DNI']

const ETIQUETAS_FALTANTES = {
  APELLIDO: 'apellido',
  TELEFONO: 'teléfono',
  DNI: 'DNI',
  EMAIL_SIN_CONFIRMAR: 'confirmar tu mail',
}

// 'anonimo' | 'desconocida' | 'incompleta' | 'verificada'.
// Una sesión guardada por la versión anterior no trae `faltantes`: se trata como desconocida y se refresca /usuarios/me.
export function evaluarAcceso(usuario) {
  if (!usuario) return 'anonimo'
  if (usuario.rol === 'ADMIN') return 'verificada'
  if (!Array.isArray(usuario.faltantes)) return 'desconocida'
  return usuario.faltantes.length === 0 ? 'verificada' : 'incompleta'
}

// Solo se vuelve a rutas internas de la app: nunca a una URL externa, a "//host" ni a "/\host".
export function sanitizarDestino(origen) {
  return typeof origen === 'string' && origen.startsWith('/') && !origen.startsWith('//') && !origen.startsWith('/\\')
    ? origen
    : '/'
}

// A dónde llevar a quien no puede operar. `desde` es la ruta actual con su query.
export function destinoDeGate(estado, desde) {
  const from = sanitizarDestino(desde)
  if (estado === 'anonimo') return { ruta: '/login', state: { from } }
  if (estado === 'incompleta') return { ruta: '/completar-datos', state: { from } }
  return { ruta: null, state: null }
}

// Adónde ir apenas se ingresa: a Completá tus datos si faltan apellido, teléfono o DNI (D-07);
// si solo falta confirmar el mail o no falta nada, directo al origen.
export function destinoPostLogin(usuario, from) {
  const destino = sanitizarDestino(from)
  const faltantes = Array.isArray(usuario?.faltantes) ? usuario.faltantes : []
  if (usuario?.rol !== 'ADMIN' && faltantes.some((dato) => DATOS_A_COMPLETAR.includes(dato))) {
    return { ruta: '/completar-datos', state: { from: destino } }
  }
  return { ruta: destino, state: null }
}

// Quita puntos, espacios y guiones: '30.123.456' -> '30123456'.
export function normalizarDni(texto) {
  return typeof texto === 'string' ? texto.replace(/[.\s-]/g, '') : ''
}

// 7 u 8 dígitos sin cero inicial. Validación liviana: el back es la fuente de verdad.
export function esDniValido(texto) {
  return /^[1-9]\d{6,7}$/.test(normalizarDni(texto))
}

// Validación liviana (10 a 13 dígitos tras limpiar, solo con separadores habituales); el back valida el número de verdad.
export function validarTelefonoBasico(texto) {
  if (typeof texto !== 'string') return false
  const limpio = texto.trim()
  if (!/^[\d\s+()\-.]+$/.test(limpio)) return false
  const digitos = limpio.replace(/\D/g, '').length
  return digitos >= 10 && digitos <= 13
}

export function etiquetaFaltante(codigo) {
  return ETIQUETAS_FALTANTES[codigo] || String(codigo).toLowerCase()
}
