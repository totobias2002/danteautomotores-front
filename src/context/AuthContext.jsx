import { createContext, useContext, useState } from 'react'
import api from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem('usuario')
    return guardado ? JSON.parse(guardado) : null
  })

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
