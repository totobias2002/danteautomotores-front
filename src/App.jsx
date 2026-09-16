import AppRouter from './routes/AppRouter.jsx'
import Navbar from './components/Navbar.jsx'

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <AppRouter />
    </div>
  )
}

export default App
