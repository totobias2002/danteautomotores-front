import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { destinoDeGate, evaluarAcceso } from '../utils/cuenta.js'

// Gate de los botones que exigen cuenta verificada (comprar, cotizar, consultar).
// exigir(accion) ejecuta la acción si se puede operar; si no, lleva al login o a Completá tus datos
// y recuerda la página actual para volver. Devuelve true si la acción se ejecutó.
// Es una cortesía de UX: el 403 CUENTA_NO_VERIFICADA del back es la autoridad.
export default function useExigirCuenta() {
  const { usuario, refrescarUsuario } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  return async function exigir(accion) {
    const desde = location.pathname + location.search
    let estado = evaluarAcceso(usuario)

    if (estado === 'desconocida') {
      try {
        estado = evaluarAcceso(await refrescarUsuario())
      } catch {
        // Sin poder confirmar la cuenta no se opera; si la sesión venció, el interceptor del 401 ya redirigió.
        return false
      }
    }

    const { ruta, state } = destinoDeGate(estado, desde)
    if (ruta) {
      navigate(ruta, { state })
      return false
    }

    await accion?.()
    return true
  }
}
