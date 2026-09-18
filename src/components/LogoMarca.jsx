// Logos oficiales tomados de Wikimedia Commons (dominio público / uso de marca para
// identificar qué marcas se venden, práctica habitual en sitios de concesionarias).
export const LOGOS = {
  Toyota: 'https://upload.wikimedia.org/wikipedia/commons/7/78/Toyota_Logo.svg',
  Volkswagen: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Volkswagen_logo_2019.svg',
  Jeep: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Jeep_logo.svg',
  Chevrolet: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Chevrolet_bowtie_2023.svg',
  Ford: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Ford_logo_flat.svg',
  Fiat: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Fiat_logo.svg',
  Peugeot: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Peugeot_Logo.svg',
  Renault: 'https://upload.wikimedia.org/wikipedia/commons/0/09/2021_Renault_Group_logo.svg',
  BMW: 'https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg',
}

// Todos los logos entran en la misma caja (mismo alto/ancho), así ninguno se ve
// más grande o más chico que el resto sin importar la relación de aspecto original.
export default function LogoMarca({ marca }) {
  const src = LOGOS[marca]

  return (
    <div
      className="flex h-20 w-32 shrink-0 items-center justify-center rounded-2xl transition-all duration-200 ease-out hover:scale-110 hover:bg-bronze/5 hover:shadow-md hover:shadow-navy/5"
      title={marca}
    >
      {src ? (
        <img
          src={src}
          alt={marca}
          loading="lazy"
          className="max-h-12 max-w-[75%] object-contain grayscale-[35%] opacity-80 transition duration-200 ease-out hover:grayscale-0 hover:opacity-100"
        />
      ) : (
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy/5 text-[10px] font-bold text-bronze">
          {marca.charAt(0)}
        </span>
      )}
    </div>
  )
}
