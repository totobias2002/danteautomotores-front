import { useParams } from 'react-router-dom'

export default function AgenciaPage() {
  const { slug } = useParams()

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <p className="text-gray-500">Página de la agencia "{slug}" (por implementar)</p>
    </main>
  )
}
