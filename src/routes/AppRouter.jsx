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
import CompletarDatosPage from '../pages/CompletarDatosPage.jsx'
import OlvideContrasenaPage from '../pages/OlvideContrasenaPage.jsx'
import RestablecerContrasenaPage from '../pages/RestablecerContrasenaPage.jsx'
import ConfirmarEmailPage from '../pages/ConfirmarEmailPage.jsx'
import AdminDashboardPage from '../pages/admin/AdminDashboardPage.jsx'
import AdminSolicitudesVentaPage from '../pages/admin/AdminSolicitudesVentaPage.jsx'
import AdminMensajesPage from '../pages/admin/AdminMensajesPage.jsx'
import AdminPublicacionFormPage from '../pages/admin/AdminPublicacionFormPage.jsx'
import PerfilPage from '../pages/PerfilPage.jsx'
import MisMensajesPage from '../pages/MisMensajesPage.jsx'
import ConversacionPage from '../pages/ConversacionPage.jsx'
import PrivacidadPage from '../pages/PrivacidadPage.jsx'
import ProtectedRoute from '../components/ProtectedRoute.jsx'
import RutaVerificada from '../components/RutaVerificada.jsx'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/autos" element={<AutosPage />} />
      <Route path="/publicaciones/:id" element={<PublicacionDetallePage />} />
      <Route path="/agencias/:slug" element={<AgenciaPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegistroPage />} />
      <Route path="/olvide-contrasena" element={<OlvideContrasenaPage />} />
      <Route path="/restablecer-contrasena" element={<RestablecerContrasenaPage />} />
      <Route path="/confirmar-email" element={<ConfirmarEmailPage />} />
      <Route path="/creditos" element={<CreditosPage />} />
      <Route path="/privacidad" element={<PrivacidadPage />} />
      <Route
        path="/vender"
        element={
          <RutaVerificada>
            <VenderPage />
          </RutaVerificada>
        }
      />
      <Route
        path="/mensajes"
        element={
          <RutaVerificada>
            <MisMensajesPage />
          </RutaVerificada>
        }
      />
      <Route
        path="/mensajes/:id"
        element={
          <RutaVerificada>
            <ConversacionPage />
          </RutaVerificada>
        }
      />
      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <PerfilPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/favoritos"
        element={
          <ProtectedRoute>
            <FavoritosPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/completar-datos"
        element={
          <ProtectedRoute>
            <CompletarDatosPage />
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
      <Route
        path="/admin/mensajes"
        element={
          <ProtectedRoute soloAdmin>
            <AdminMensajesPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NoEncontradaPage />} />
    </Routes>
  )
}
