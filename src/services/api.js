import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
})

// Lo registra AuthProvider: limpia la sesión y lleva a /login cuando el token venció.
let manejadorSesionVencida = null

export const registrarManejadorSesionVencida = (fn) => {
  manejadorSesionVencida = fn
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  // Un Bearer viejo no debe viajar al login ni al registro: ahí no hace falta y puede romperlos.
  if (token && !config.url?.startsWith('/auth/')) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // Un 401 de /auth/* es "credenciales incorrectas", no una sesión vencida.
    // El chequeo del token evita que varios 401 simultáneos disparen más de una redirección:
    // logout() borra el token de forma síncrona, así que solo el primero encuentra token.
    if (
      error.response?.status === 401 &&
      !error.config?.url?.startsWith('/auth/') &&
      localStorage.getItem('token')
    ) {
      manejadorSesionVencida?.()
    }
    return Promise.reject(error)
  },
)

export default api
