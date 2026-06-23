import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { TeamProvider } from './contexts/TeamContext'
import { ToastProvider } from './components/Toast'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout/DashboardLayout'

import Landing from './pages/Landing/Landing'
import DevTikTok from './pages/DevTikTok/DevTikTok'
import DevTikTokPost from './pages/DevTikTok/DevTikTokPost'
import DevTikTokMetrics from './pages/DevTikTok/DevTikTokMetrics'
import IntegrationsCallback from './pages/IntegrationsCallback/IntegrationsCallback'
import Login from './pages/Login/Login'
import Cadastro from './pages/Cadastro/Cadastro'
import EsqueciSenha from './pages/EsqueciSenha/EsqueciSenha'
import RedefinirSenha from './pages/RedefinirSenha/RedefinirSenha'
import DashboardHome from './pages/Dashboard/Home/DashboardHome'
import Posts from './pages/Dashboard/Posts/Posts'
import Composer from './pages/Dashboard/Posts/Composer'
import Equipes from './pages/Dashboard/Equipes/Equipes'
import Configuracoes from './pages/Dashboard/Configuracoes/Configuracoes'
import Suporte from './pages/Dashboard/Suporte/Suporte'
import PrivacyPolicy from './pages/Legal/PrivacyPolicy'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TeamProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/entrar" element={<Login />} />
                <Route path="/cadastro" element={<Cadastro />} />
                <Route path="/esqueci-senha" element={<EsqueciSenha />} />
                <Route path="/redefinir-senha" element={<RedefinirSenha />} />

                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<DashboardHome />} />
                  <Route path="posts" element={<Posts />} />
                  <Route path="posts/novo" element={<Composer />} />
                  <Route path="posts/:id/editar" element={<Composer />} />
                  <Route path="equipes" element={<Equipes />} />
                  <Route path="configuracoes" element={<Configuracoes />} />
                  <Route path="suporte" element={<Suporte />} />
                </Route>

                {/* Rotas de desenvolvimento — sem autenticação, acesso direto pela URL */}
                <Route path="/dev/tiktok" element={<DevTikTok />} />
                <Route path="/dev/tiktok/post" element={<DevTikTokPost />} />
                <Route path="/dev/tiktok/metrics" element={<DevTikTokMetrics />} />
                <Route path="/integrations/callback" element={<IntegrationsCallback />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </TeamProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
