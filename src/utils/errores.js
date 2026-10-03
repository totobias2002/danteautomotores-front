// Lee el mensaje de error que devuelve el backend ({ "error": "...", "campos": { ... } }).
// Si la respuesta no trae ese campo usa el texto de respaldo; si no hay respuesta
// (error de red, o Tomcat cortó la conexión por un archivo enorme) avisa de eso.
export function mensajeDeError(err, fallback) {
  const data = err?.response?.data
  if (err?.response) {
    if (typeof data?.error === 'string' && data.error.trim() !== '') {
      const campos = data.campos
      // Los mensajes por campo ya vienen en español desde el backend; los nombres de las propiedades Java
      // (agenciaId, telefonoContacto) no le dicen nada al usuario, así que se muestran solo los mensajes.
      if (campos && typeof campos === 'object') {
        const mensajes = [...new Set(Object.values(campos))].filter((m) => typeof m === 'string' && m.trim() !== '')
        if (mensajes.length > 0) {
          return mensajes.map((m) => m.trim().replace(/\.$/, '')).join('. ') + '.'
        }
      }
      return data.error
    }
    return fallback
  }
  return 'No se pudo conectar con el servidor. Si estabas subiendo fotos, revisá que cada una pese menos de 10 MB.'
}
