import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

// TEMPORAL — BORRAR. Atajo para alternar entre la cuenta admin y la de comprador sin cerrar sesión cada vez.
// Cada vez que alguien inicia sesión, guarda su token en un lugar aparte según el rol (admin o usuario). Con las dos
// guardadas, el botón cambia de una a otra y recarga. Para sacarlo: borrar este archivo y su uso en App.jsx.
const CLAVE = 'dev_sesiones'

const leer = () => {
  try {
    return JSON.parse(localStorage.getItem(CLAVE)) || {}
  } catch {
    return {}
  }
}

export default function DevCambioDeCuenta() {
  const { usuario } = useAuth()
  const [sesiones, setSesiones] = useState(leer)
  const [abierto, setAbierto] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!usuario || !token) return
    const rol = usuario.rol === 'ADMIN' ? 'admin' : 'usuario'
    const actuales = leer()
    if (actuales[rol]?.token === token && actuales[rol]?.usuario?.email === usuario.email) return
    const nuevas = { ...actuales, [rol]: { token, usuario } }
    localStorage.setItem(CLAVE, JSON.stringify(nuevas))
    setSesiones(nuevas)
  }, [usuario])

  const cambiarA = (rol) => {
    const sesion = sesiones[rol]
    if (!sesion) return
    localStorage.setItem('token', sesion.token)
    localStorage.setItem('usuario', JSON.stringify(sesion.usuario))
    window.location.href = rol === 'admin' ? '/admin/mensajes' : '/mensajes'
  }

  const actual = usuario ? (usuario.rol === 'ADMIN' ? 'admin' : 'usuario') : null
  const etiquetas = { admin: 'Admin', usuario: 'Comprador' }

  return (
    <div className="fixed bottom-4 left-4 z-[60] text-xs">
      {abierto ? (
        <div className="w-60 rounded-xl border border-amber-400 bg-white p-3 shadow-xl">
          <div className="flex items-center justify-between">
            <p className="font-bold text-amber-700">DEV: cambiar de cuenta</p>
            <button type="button" onClick={() => setAbierto(false)} className="text-slate-500 hover:text-slate-700" aria-label="Cerrar">
              ✕
            </button>
          </div>
          <div className="mt-2 flex flex-col gap-2">
            {['admin', 'usuario'].map((rol) => (
              <button
                key={rol}
                type="button"
                disabled={!sesiones[rol] || actual === rol}
                onClick={() => cambiarA(rol)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-left font-semibold text-navy-dark transition hover:border-bronze disabled:opacity-50"
              >
                {etiquetas[rol]}
                {actual === rol ? ' (acá estás)' : ''}
                <span className="block text-[11px] font-normal text-slate-500">
                  {sesiones[rol] ? sesiones[rol].usuario.email : 'Iniciá sesión una vez con esta cuenta'}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAbierto(true)}
          className="rounded-full border border-amber-400 bg-amber-100 px-3 py-1.5 font-bold text-amber-800 shadow-lg"
        >
          DEV cuentas
        </button>
      )}
    </div>
  )
}
