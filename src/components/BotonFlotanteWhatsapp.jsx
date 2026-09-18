import { MessageCircle } from 'lucide-react'
import { armarLinkWhatsapp } from '../utils/whatsapp.js'

export default function BotonFlotanteWhatsapp({ mensaje = 'Hola, quería consultar por un auto.', numero }) {
  return (
    <a
      href={armarLinkWhatsapp(mensaje, numero)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      title="Escribinos por WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-black/25 transition hover:-translate-y-1 hover:shadow-2xl"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  )
}
