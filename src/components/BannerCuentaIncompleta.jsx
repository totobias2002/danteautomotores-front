import { useAuth } from '../context/AuthContext.jsx'

const ETIQUETAS = {
  APELLIDO: 'apellido',
  TELEFONO: 'teléfono',
  DNI: 'DNI',
  EMAIL_SIN_CONFIRMAR: 'confirmar tu mail',
}

// Aviso para un comprador con la cuenta incompleta. Es una cortesía de UX: la autoridad es el back,
// que rechaza comprar, cotizar o consultar con una cuenta sin verificar.
export default function BannerCuentaIncompleta() {
  const { usuario, esAdmin } = useAuth()
  const faltantes = usuario?.faltantes

  if (!usuario || esAdmin || !Array.isArray(faltantes) || faltantes.length === 0) return null

  const lista = faltantes.map((dato) => ETIQUETAS[dato] || String(dato).toLowerCase()).join(', ')

  return (
    <div role="status" className="border-b border-amber-200 bg-amber-50 px-6 py-3 text-center text-sm font-semibold text-amber-800">
      Te faltan datos para poder comprar y cotizar: {lista}
    </div>
  )
}
