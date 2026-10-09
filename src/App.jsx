import AppRouter from './routes/AppRouter.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import BannerCuentaIncompleta from './components/BannerCuentaIncompleta.jsx'
import BotonFlotanteWhatsapp from './components/BotonFlotanteWhatsapp.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import DevCambioDeCuenta from './components/DevCambioDeCuenta.jsx' // TEMPORAL: borrar

function App() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollToTop />
      <Navbar />
      <BannerCuentaIncompleta />
      <div className="flex-1">
        <AppRouter />
      </div>
      <Footer />
      <BotonFlotanteWhatsapp />
      {/* TEMPORAL: borrar. Solo en desarrollo: en producción los clientes no deben ver este atajo. */}
      {import.meta.env.DEV && <DevCambioDeCuenta />}
    </div>
  )
}

export default App
