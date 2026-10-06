import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { registrarManejadorCuentaNoVerificada, registrarManejadorSesionVencida } from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(() => {
    // Un valor corrupto (editado a mano, escritura cortada) no debe tirar abajo toda la app: se descarta la sesión.
    try {
      const guardado = localStorage.getItem('usuario')
      return guardado ? JSON.parse(guardado) : null
    } catch {
      localStorage.removeItem('usuario')
      localStorage.removeItem('token')
      return null
    }
  })
  const refrescandoPorGate = useRef(false)

  // Guarda en el estado y en localStorage solo lo no sensible. Nunca se guarda el DNI ni el teléfono:
  // solo qué datos faltan. Una sesión anterior a la Fase 3 no trae estos campos.
  const guardarUsuario = (data) => {
    const usuarioData = {
      nombre: data.nombre,
      apellido: data.apellido,
      email: data.email,
      rol: data.rol,
      emailConfirmado: data.emailConfirmado,
      cuentaVerificada: data.cuentaVerificada,
      faltantes: data.faltantes,
    }
    localStorage.setItem('usuario', JSON.stringify(usuarioData))
    setUsuario(usuarioData)
    return usuarioData
  }

  const guardarSesion = (data) => {
    localStorage.setItem('token', data.token)
    return guardarUsuario(data)
  }

  // Pide la cuenta al servidor y actualiza la sesión. Devuelve el perfil completo (con DNI y teléfono)
  // para que la pantalla que lo pidió lo use en su estado, sin guardarlo en el navegador.
  const refrescarUsuario = async () => {
    const { data } = await api.get('/usuarios/me')
    guardarUsuario(data)
    return data
  }

  // Sesión vencida (401 fuera de /auth/*): se limpia la sesión y se lleva a /login,
  // recordando la página de origen para volver después de ingresar.
  useEffect(() => {
    registrarManejadorSesionVencida(() => {
      logout()
      if (window.location.pathname === '/login') return
      navigate('/login', {
        replace: true,
        state: { from: window.location.pathname + window.location.search, sesionVencida: true },
      })
    })
    return () => registrarManejadorSesionVencida(null)
  }, [navigate])

  // El back rechazó una acción por cuenta sin verificar: se refresca la cuenta y se lleva a Completá tus datos.
  useEffect(() => {
    registrarManejadorCuentaNoVerificada(async () => {
      if (refrescandoPorGate.current) return
      refrescandoPorGate.current = true
      try {
        await refrescarUsuario().catch(() => {})
        if (window.location.pathname === '/completar-datos') return
        navigate('/completar-datos', {
          state: { from: window.location.pathname + window.location.search },
        })
      } finally {
        refrescandoPorGate.current = false
      }
    })
    return () => registrarManejadorCuentaNoVerificada(null)
  }, [navigate])

  // Una sesión iniciada antes de la fase no tiene la lista de faltantes: se rehidrata desde el servidor.
  // Si el token venció, el interceptor del 401 ya cierra la sesión.
  useEffect(() => {
    if (localStorage.getItem('token') && usuario && !Array.isArray(usuario.faltantes)) {
      refrescarUsuario().catch(() => {})
    }
  }, [])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    return guardarSesion(data)
  }

  // Recibe {nombre, apellido, email, password, telefono, dni}; el DNI y el teléfono viajan al back y no se guardan.
  const registrar = async ({ nombre, apellido, email, password, telefono, dni }) => {
    const { data } = await api.post('/auth/registro', { nombre, apellido, email, password, telefono, dni })
    return guardarSesion(data)
  }

  // El front nunca decide la identidad: manda el ID token de Google al back, que lo verifica.
  const loginConGoogle = async (credential) => {
    const { data } = await api.post('/auth/google', { credential })
    return guardarSesion(data)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setUsuario(null)
  }

  const esAdmin = usuario?.rol === 'ADMIN'

  return (
    <AuthContext.Provider value={{ usuario, esAdmin, login, loginConGoogle, registrar, logout, guardarSesion, refrescarUsuario }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
