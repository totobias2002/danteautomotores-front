import AppRouter from './routes/AppRouter.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import BannerCuentaIncompleta from './components/BannerCuentaIncompleta.jsx'
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
      <DevCambioDeCuenta /> {/* TEMPORAL: borrar */}
    </div>
  )
}

export default App
