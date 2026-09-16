import { useParams } from 'react-router-dom'

export default function PublicacionDetallePage() {
  const { id } = useParams()

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <p className="text-gray-500">Detalle de la publicación #{id} (por implementar)</p>
    </main>
  )
}
