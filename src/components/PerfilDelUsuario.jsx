import { etiquetaFaltante } from '../utils/cuenta.js'

// "2026-03-15" (fecha sin hora) se muestra como "15/03/2026" sin pasar por Date: no hay corrimiento de zona horaria.
function fechaSinHora(iso) {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '')
  return partes ? `${partes[3]}/${partes[2]}/${partes[1]}` : ''
}

function Dato({ titulo, children }) {
  return (
    <div>
      <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{titulo}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-navy-dark">{children}</dd>
    </div>
  )
}

// Datos de contacto y de cuenta de un usuario, vistos por la agencia. Los usan la ficha (/admin/usuarios/:id) y el
// panel izquierdo de la conversación. `columnas` pasa los datos a dos columnas cuando hay lugar.
export default function PerfilDelUsuario({ ficha, columnas = false }) {
  const faltantes = Array.isArray(ficha?.faltantes) ? ficha.faltantes : []

  return (
    <dl className={`grid gap-4 ${columnas ? 'sm:grid-cols-2' : ''}`}>
      <Dato titulo="Mail">
        <span className="break-all">{ficha.email}</span>
        <span
          className={`ml-2 rounded-full px-2.5 py-0.5 align-middle text-[11px] font-bold uppercase tracking-wider ${
            ficha.emailConfirmado ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}
        >
          {ficha.emailConfirmado ? 'confirmado' : 'sin confirmar'}
        </span>
      </Dato>
      <Dato titulo="Teléfono">
        {ficha.telefono ? (
          <a href={`tel:${ficha.telefono}`} className="text-bronze hover:underline">
            {ficha.telefono}
          </a>
        ) : (
          <span className="font-normal text-slate-500">Sin cargar</span>
        )}
      </Dato>
      <Dato titulo="DNI">{ficha.dni || <span className="font-normal text-slate-500">Sin cargar</span>}</Dato>
      <Dato titulo="Cliente desde">
        {fechaSinHora(ficha.fechaRegistro) || <span className="font-normal text-slate-500">Sin dato</span>}
      </Dato>
      <Dato titulo="Estado de la cuenta">
        {ficha.cuentaVerificada ? (
          <span className="text-emerald-700">Verificada</span>
        ) : (
          <span className="text-amber-700">Falta: {faltantes.map(etiquetaFaltante).join(', ') || 'completar datos'}</span>
        )}
      </Dato>
    </dl>
  )
}
