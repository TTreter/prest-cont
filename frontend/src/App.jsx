import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState } from 'react'

// Importa os componentes de tela da aplicação.
import TelaInicial from './components/TelaInicial'
import TelaConfiguracaoDiarias from './components/TelaConfiguracaoDiarias'
import TelaAdiantamentos from './components/TelaAdiantamentos'
import TelaDocumentos from './components/TelaDocumentos'
import TelaPassagens from './components/TelaPassagens'
import TelaFinal from './components/TelaFinal'

// Importa os componentes de tema.
import { ThemeProvider } from './components/theme-provider'
import { ThemeToggle } from './components/theme-toggle'

import './App.css'

function App() {
  // Estado para armazenar o ID da prestação de contas, passado entre as telas.
  const [prestacaoId, setPrestacaoId] = useState(null)

  return (
    // Envolve a aplicação com o ThemeProvider para gerenciar temas.
    <ThemeProvider defaultTheme="dark" storageKey="prestacao-contas-theme">
      {/* Configura o roteamento da aplicação usando React Router. */}
      <Router>
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
          {/* Cabeçalho da aplicação com suporte a temas */}
          <header className="bg-blue-600 dark:bg-blue-700 text-white p-4 shadow-lg">
            <div className="container mx-auto flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">Câmara Municipal de Município Exemplo</h1>
                <p className="text-blue-100">Sistema de Prestação de Contas de Diárias</p>
              </div>
              {/* Botão para alternar tema */}
              <ThemeToggle />
            </div>
          </header>
          
          {/* Conteúdo principal da aplicação, onde as rotas são renderizadas. */}
          <main className="container mx-auto p-4">
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
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
