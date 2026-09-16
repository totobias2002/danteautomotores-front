import { Routes, Route } from 'react-router-dom'
import HomePage from '../pages/HomePage.jsx'
import PublicacionDetallePage from '../pages/PublicacionDetallePage.jsx'
import AgenciaPage from '../pages/AgenciaPage.jsx'
import LoginPage from '../pages/LoginPage.jsx'
import RegistroPage from '../pages/RegistroPage.jsx'
import FavoritosPage from '../pages/FavoritosPage.jsx'
import AdminDashboardPage from '../pages/admin/AdminDashboardPage.jsx'
import AdminPublicacionFormPage from '../pages/admin/AdminPublicacionFormPage.jsx'
import ProtectedRoute from '../components/ProtectedRoute.jsx'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/publicaciones/:id" element={<PublicacionDetallePage />} />
      <Route path="/agencias/:slug" element={<AgenciaPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegistroPage />} />
      <Route
        path="/favoritos"
        element={
          <ProtectedRoute>
            <FavoritosPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute soloAdmin>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/publicaciones/nueva"
        element={
          <ProtectedRoute soloAdmin>
            <AdminPublicacionFormPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
