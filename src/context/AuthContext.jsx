import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { registrarManejadorSesionVencida } from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem('usuario')
    return guardado ? JSON.parse(guardado) : null
  })

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

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    guardarSesion(data)
  }

  const registrar = async (nombre, email, password, telefono) => {
    const { data } = await api.post('/auth/registro', { nombre, email, password, telefono })
    guardarSesion(data)
  }

  const guardarSesion = (data) => {
    localStorage.setItem('token', data.token)
    const usuarioData = { nombre: data.nombre, email: data.email, rol: data.rol }
    localStorage.setItem('usuario', JSON.stringify(usuarioData))
    setUsuario(usuarioData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setUsuario(null)
  }

  const esAdmin = usuario?.rol === 'ADMIN'

  return (
    <AuthContext.Provider value={{ usuario, esAdmin, login, registrar, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
