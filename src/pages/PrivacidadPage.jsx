// Borrador de la política de privacidad (D-20, Ley 25.326). El texto lo tiene que revisar un profesional antes de
// publicarse como definitivo; la inscripción de la base ante la AAIP es un pendiente de la agencia, fuera del código.
const TITULO_SECCION = 'text-lg font-bold text-navy-dark'
const TEXTO = 'mt-2 text-sm leading-relaxed text-slate-600'

export default function PrivacidadPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-bronze">Tus datos</p>
      <h1 className="mt-2 font-heading text-3xl text-navy-dark">Política de privacidad</h1>

      <p
        role="note"
        className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900"
      >
        Borrador: pendiente de revisión legal. Este texto puede cambiar cuando lo revise un profesional.
      </p>

      <div className="mt-8 flex flex-col gap-7">
        <section>
          <h2 className={TITULO_SECCION}>Quién es el responsable</h2>
          <p className={TEXTO}>
            El responsable de tus datos es Dante Automotores. El domicilio y el canal de contacto definitivos se publican
            con la versión revisada de esta política.
          </p>
        </section>

        <section>
          <h2 className={TITULO_SECCION}>Qué datos te pedimos</h2>
          <p className={TEXTO}>Tu nombre, tu apellido, tu mail, tu teléfono y tu DNI.</p>
        </section>

        <section>
          <h2 className={TITULO_SECCION}>Para qué los usamos</h2>
          <p className={TEXTO}>
            Para identificar a quien compra o cotiza un auto y para que la agencia pueda contactarte. La agencia confirma
            tu identidad en persona al cerrar la operación.
          </p>
        </section>

        <section>
          <h2 className={TITULO_SECCION}>Con quién los compartimos</h2>
          <p className={TEXTO}>
            Con los proveedores técnicos que hacen funcionar el sitio: Google, para el ingreso con tu cuenta; Brevo, para
            enviar los mails; Railway y Vercel, para el alojamiento; y Cloudinary, para las fotos. Algunos de ellos están
            en el exterior.
          </p>
        </section>

        <section>
          <h2 className={TITULO_SECCION}>Cuánto tiempo los guardamos</h2>
          <p className={TEXTO}>
            Mientras tu cuenta esté activa. El plazo definitivo de conservación se confirma con la versión revisada de esta
            política.
          </p>
        </section>

        <section>
          <h2 className={TITULO_SECCION}>Tus derechos</h2>
          <p className={TEXTO}>
            Podés pedir acceso a tus datos, que los corrijamos o que los eliminemos, y pedir la baja de tu cuenta. El canal
            para hacerlo se publica con la versión revisada de esta política. Mientras tanto, podés escribirnos por los
            medios de contacto de la agencia.
          </p>
        </section>

        <section>
          <h2 className={TITULO_SECCION}>Agencia de Acceso a la Información Pública</h2>
          <p className={TEXTO}>
            El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma
            gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto conforme
            lo establecido en el artículo 14, inciso 3 de la Ley Nº 25.326. La AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA,
            en su carácter de Órgano de Control de la Ley Nº 25.326, tiene la atribución de atender las denuncias y
            reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes
            en materia de protección de datos personales.
          </p>
          <p className="mt-2 text-xs text-slate-400">Este texto debe ser validado por un profesional.</p>
        </section>
      </div>
    </main>
  )
}
