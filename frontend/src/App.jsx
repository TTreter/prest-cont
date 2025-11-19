import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, lazy, Suspense } from 'react'

// Lazy loading dos componentes de tela para otimizar o bundle
const TelaInicial = lazy(() => import('./components/TelaInicial'))
const TelaConfiguracaoDiarias = lazy(() => import('./components/TelaConfiguracaoDiarias'))
const TelaAdiantamentos = lazy(() => import('./components/TelaAdiantamentos'))
const TelaDocumentos = lazy(() => import('./components/TelaDocumentos'))
const TelaPassagens = lazy(() => import('./components/TelaPassagens'))
const TelaFinal = lazy(() => import('./components/TelaFinal'))
const Login = lazy(() => import('./components/Login'))

// Importa os componentes de tema e notificações.
import { ThemeProvider } from './components/theme-provider'
import { ThemeToggle } from './components/theme-toggle'
import { ToastProvider } from './components/ui/toast'
import { NavigationBreadcrumb } from './components/navigation-breadcrumb'
import { ProgressIndicator, CompactProgressIndicator } from './components/progress-indicator'
import { Button } from './components/ui/button'

// Importa hooks e serviços.
import { useResponsive } from './hooks/use-responsive'
import authService from './services/authService'

import './App.css'

/**
 * Componente principal da aplicação com suporte a temas e responsividade.
 */
function AppContent() {
  // Estado para armazenar o ID da prestação de contas, passado entre as telas.
  const [prestacaoId, setPrestacaoId] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Hook para detectar responsividade
  const { isMobile } = useResponsive()

  // Verificar autenticação ao montar o componente
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated()
      setIsAuthenticated(authenticated)
      if (authenticated) {
        const userData = authService.getUser()
        setUser(userData)
      }
      setLoading(false)
    }
    checkAuth()
  }, [])

  // Função para lidar com login bem-sucedido
  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
    const userData = authService.getUser()
    setUser(userData)
  }

  // Função para lidar com logout
  const handleLogout = () => {
    authService.logout()
    setIsAuthenticated(false)
    setUser(null)
    setPrestacaoId(null)
  }

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    )
  }

  // Se não estiver autenticado, mostrar tela de login
  if (!isAuthenticated) {
    return (
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando...</p>
          </div>
        </div>
      }>
        <Login onLoginSuccess={handleLoginSuccess} />
      </Suspense>
    )
  }

  // Componente de loading para Suspense
  const LoadingFallback = () => (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm">Carregando...</p>
      </div>
    </div>
  )

  return (
    // Configura o roteamento da aplicação usando React Router.
    <Router>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
        {/* Cabeçalho da aplicação com suporte a temas e responsividade */}
        <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 dark:from-blue-800 dark:via-blue-900 dark:to-indigo-900 text-white shadow-xl">
          <div className="container mx-auto px-4 py-5">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex-1">
                <h1 className={`font-bold tracking-tight ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                  Câmara Municipal de Município Exemplo
                </h1>
                <p className={`text-blue-50 font-medium ${isMobile ? 'text-sm' : 'text-base'}`}>
                  Sistema de Prestação de Contas de Diárias
                </p>
              </div>
              {/* Informações do usuário e controles */}
              <div className="flex items-center gap-3">
                {user && (
                  <div className="text-right mr-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                    <p className="text-sm font-semibold">{user.username}</p>
                    <p className="text-xs text-blue-50">{user.email}</p>
                  </div>
                )}
                <ThemeToggle />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm font-medium transition-all duration-300 hover:scale-105"
                >
                  Sair
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Área de navegação e progresso */}
        <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            {/* Breadcrumb para desktop */}
            {!isMobile && (
              <NavigationBreadcrumb className="mb-4" />
            )}
            
            {/* Indicador de progresso */}
            {isMobile ? (
              <CompactProgressIndicator />
            ) : (
              <ProgressIndicator />
            )}
          </div>
        </div>
        
        {/* Conteúdo principal da aplicação, onde as rotas são renderizadas. */}
        <main className="container mx-auto px-4 py-6">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Rota para a tela inicial. */}
              <Route 
                path="/" 
                element={isAuthenticated ? <TelaInicial setPrestacaoId={setPrestacaoId} /> : <Navigate to="/login" />} 
              />
              {/* Rota para a tela de configuração de diárias. */}
              <Route 
                path="/configuracao-diarias" 
                element={isAuthenticated ? <TelaConfiguracaoDiarias /> : <Navigate to="/login" />} 
              />
              {/* Rota para a tela de adiantamentos, passando o ID da prestação. */}
              <Route 
                path="/adiantamentos" 
                element={isAuthenticated ? <TelaAdiantamentos prestacaoId={prestacaoId} /> : <Navigate to="/login" />} 
              />
              {/* Rota para a tela de documentos, passando o ID da prestação. */}
              <Route 
                path="/documentos" 
                element={isAuthenticated ? <TelaDocumentos prestacaoId={prestacaoId} /> : <Navigate to="/login" />} 
              />
              {/* Rota para a tela de passagens, passando o ID da prestação. */}
              <Route 
                path="/passagens" 
                element={isAuthenticated ? <TelaPassagens prestacaoId={prestacaoId} /> : <Navigate to="/login" />} 
              />
              {/* Rota para a tela final, passando o ID da prestação. */}
              <Route 
                path="/final" 
                element={isAuthenticated ? <TelaFinal prestacaoId={prestacaoId} /> : <Navigate to="/login" />} 
              />
              {/* Rota de login */}
              <Route 
                path="/login" 
                element={!isAuthenticated ? <Login onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/" />} 
              />
            </Routes>
          </Suspense>
        </main>

        {/* Rodapé da aplicação */}
        <footer className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 border-t border-gray-200 dark:border-gray-700 mt-auto">
          <div className="container mx-auto px-4 py-6">
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              <p className="font-semibold">© 2024 Câmara Municipal de Município Exemplo</p>
              <p className="mt-1 text-xs">Sistema de Prestação de Contas de Diárias</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  )
}

function App() {
  return (
    // Envolve a aplicação com os providers necessários.
    <ThemeProvider defaultTheme="dark" storageKey="prestacao-contas-theme">
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App
