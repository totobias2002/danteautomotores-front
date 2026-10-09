import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from '../pages/HomePage.jsx'
import AutosPage from '../pages/AutosPage.jsx'
import PublicacionDetallePage from '../pages/PublicacionDetallePage.jsx'
import AgenciaPage from '../pages/AgenciaPage.jsx'
import LoginPage from '../pages/LoginPage.jsx'
import RegistroPage from '../pages/RegistroPage.jsx'
import FavoritosPage from '../pages/FavoritosPage.jsx'
import NoEncontradaPage from '../pages/NoEncontradaPage.jsx'
import ProtectedRoute from '../components/ProtectedRoute.jsx'
import RutaVerificada from '../components/RutaVerificada.jsx'

// Las pantallas de uso poco frecuente (cuenta, mensajes, admin) se bajan recién al entrar: el celular no carga todo de entrada.
const CreditosPage = lazy(() => import('../pages/CreditosPage.jsx'))
const VenderPage = lazy(() => import('../pages/VenderPage.jsx'))
const CompletarDatosPage = lazy(() => import('../pages/CompletarDatosPage.jsx'))
const OlvideContrasenaPage = lazy(() => import('../pages/OlvideContrasenaPage.jsx'))
const RestablecerContrasenaPage = lazy(() => import('../pages/RestablecerContrasenaPage.jsx'))
const ConfirmarEmailPage = lazy(() => import('../pages/ConfirmarEmailPage.jsx'))
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage.jsx'))
const AdminSolicitudesVentaPage = lazy(() => import('../pages/admin/AdminSolicitudesVentaPage.jsx'))
const AdminMensajesPage = lazy(() => import('../pages/admin/AdminMensajesPage.jsx'))
const AdminConversacionPage = lazy(() => import('../pages/admin/AdminConversacionPage.jsx'))
const AdminUsuarioPage = lazy(() => import('../pages/admin/AdminUsuarioPage.jsx'))
const AdminPublicacionFormPage = lazy(() => import('../pages/admin/AdminPublicacionFormPage.jsx'))
const PerfilPage = lazy(() => import('../pages/PerfilPage.jsx'))
const MisMensajesPage = lazy(() => import('../pages/MisMensajesPage.jsx'))
const ConversacionPage = lazy(() => import('../pages/ConversacionPage.jsx'))
const PrivacidadPage = lazy(() => import('../pages/PrivacidadPage.jsx'))

export default function AppRouter() {
  return (
    <Suspense fallback={<p className="py-24 text-center text-slate-500">Cargando...</p>}>
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
        <Route
          path="/admin/mensajes/:id"
          element={
            <ProtectedRoute soloAdmin>
              <AdminConversacionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/usuarios/:id"
          element={
            <ProtectedRoute soloAdmin>
              <AdminUsuarioPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NoEncontradaPage />} />
      </Routes>
    </Suspense>
  )
}
