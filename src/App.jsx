import AppRouter from './routes/AppRouter.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'

function App() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollToTop />
      <Navbar />
      <div className="flex-1">
        <AppRouter />
      </div>
      <Footer />
    </div>
  )
}

export default App
