import { Routes, Route } from 'react-router-dom'
import HomePage from '../pages/HomePage.jsx'
import AutosPage from '../pages/AutosPage.jsx'
import PublicacionDetallePage from '../pages/PublicacionDetallePage.jsx'
import AgenciaPage from '../pages/AgenciaPage.jsx'
import LoginPage from '../pages/LoginPage.jsx'
import RegistroPage from '../pages/RegistroPage.jsx'
import FavoritosPage from '../pages/FavoritosPage.jsx'
import CreditosPage from '../pages/CreditosPage.jsx'
import NoEncontradaPage from '../pages/NoEncontradaPage.jsx'
import VenderPage from '../pages/VenderPage.jsx'
import AdminDashboardPage from '../pages/admin/AdminDashboardPage.jsx'
import AdminSolicitudesVentaPage from '../pages/admin/AdminSolicitudesVentaPage.jsx'
import AdminPublicacionFormPage from '../pages/admin/AdminPublicacionFormPage.jsx'
import ProtectedRoute from '../components/ProtectedRoute.jsx'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/autos" element={<AutosPage />} />
      <Route path="/publicaciones/:id" element={<PublicacionDetallePage />} />
      <Route path="/agencias/:slug" element={<AgenciaPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegistroPage />} />
      <Route path="/creditos" element={<CreditosPage />} />
      <Route path="/vender" element={<VenderPage />} />
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
      <Route
        path="/admin/publicaciones/:id/editar"
        element={
          <ProtectedRoute soloAdmin>
            <AdminPublicacionFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/solicitudes-venta"
        element={
          <ProtectedRoute soloAdmin>
            <AdminSolicitudesVentaPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NoEncontradaPage />} />
    </Routes>
  )
}
