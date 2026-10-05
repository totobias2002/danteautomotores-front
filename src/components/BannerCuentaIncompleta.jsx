import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { etiquetaFaltante, evaluarAcceso } from '../utils/cuenta.js'

// Aviso para un comprador con la cuenta incompleta. Es una cortesía de UX: la autoridad es el back,
// que rechaza comprar, cotizar o consultar con una cuenta sin verificar.
export default function BannerCuentaIncompleta() {
  const { usuario, esAdmin } = useAuth()
  const location = useLocation()

  if (esAdmin || evaluarAcceso(usuario) !== 'incompleta' || location.pathname === '/completar-datos') return null

  const lista = usuario.faltantes.map(etiquetaFaltante).join(', ')
  const from = location.pathname + location.search

  return (
    <div role="status" className="border-b border-amber-200 bg-amber-50 px-6 py-3 text-center text-sm font-semibold text-amber-800">
      Te faltan datos para poder comprar y cotizar: {lista}.{' '}
      <Link to="/completar-datos" state={{ from }} className="font-bold underline hover:text-bronze">
        Completá tus datos
      </Link>
    </div>
  )
}
