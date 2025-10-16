import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState } from 'react'

// Importa os componentes de tela da aplicação.
import TelaInicial from './components/TelaInicial'
import TelaConfiguracaoDiarias from './components/TelaConfiguracaoDiarias'
import TelaAdiantamentos from './components/TelaAdiantamentos'
import TelaDocumentos from './components/TelaDocumentos'
import TelaPassagens from './components/TelaPassagens'
import TelaFinal from './components/TelaFinal'

// Importa os componentes de tema e notificações.
import { ThemeProvider } from './components/theme-provider'
import { ThemeToggle } from './components/theme-toggle'
import { ToastProvider } from './components/ui/toast'
import { NavigationBreadcrumb } from './components/navigation-breadcrumb'
import { ProgressIndicator, CompactProgressIndicator } from './components/progress-indicator'

// Importa hooks para responsividade.
import { useResponsive } from './hooks/use-responsive'

import './App.css'

/**
 * Componente principal da aplicação com suporte a temas e responsividade.
 */
function AppContent() {
  // Estado para armazenar o ID da prestação de contas, passado entre as telas.
  const [prestacaoId, setPrestacaoId] = useState(null)
  
  // Hook para detectar responsividade
  const { isMobile } = useResponsive()

  return (
    // Configura o roteamento da aplicação usando React Router.
    <Router>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
        {/* Cabeçalho da aplicação com suporte a temas e responsividade */}
        <header className="bg-blue-600 dark:bg-blue-700 text-white shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex-1">
                <h1 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                  Câmara Municipal de Município Exemplo
                </h1>
                <p className={`text-blue-100 ${isMobile ? 'text-sm' : 'text-base'}`}>
                  Sistema de Prestação de Contas de Diárias
                </p>
              </div>
              {/* Botão para alternar tema */}
              <div className="flex justify-end">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        {/* Área de navegação e progresso */}
        <div className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-3">
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
          <Routes>
            {/* Rota para a tela inicial. */}
            <Route 
              path="/" 
              element={<TelaInicial setPrestacaoId={setPrestacaoId} />} 
            />
            {/* Rota para a tela de configuração de diárias. */}
            <Route 
              path="/configuracao-diarias" 
              element={<TelaConfiguracaoDiarias />} 
            />
            {/* Rota para a tela de adiantamentos, passando o ID da prestação. */}
            <Route 
              path="/adiantamentos" 
              element={<TelaAdiantamentos prestacaoId={prestacaoId} />} 
            />
            {/* Rota para a tela de documentos, passando o ID da prestação. */}
            <Route 
              path="/documentos" 
              element={<TelaDocumentos prestacaoId={prestacaoId} />} 
            />
            {/* Rota para a tela de passagens, passando o ID da prestação. */}
            <Route 
              path="/passagens" 
              element={<TelaPassagens prestacaoId={prestacaoId} />} 
            />
            {/* Rota para a tela final, passando o ID da prestação. */}
            <Route 
              path="/final" 
              element={<TelaFinal prestacaoId={prestacaoId} />} 
            />
          </Routes>
        </main>

        {/* Rodapé da aplicação */}
        <footer className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
          <div className="container mx-auto px-4 py-6">
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              <p>© 2024 Câmara Municipal de Município Exemplo</p>
              <p className="mt-1">Sistema de Prestação de Contas de Diárias</p>
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
