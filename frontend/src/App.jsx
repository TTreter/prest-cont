import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import TelaInicial from './components/TelaInicial'
import TelaConfiguracaoDiarias from './components/TelaConfiguracaoDiarias'
import TelaAdiantamentos from './components/TelaAdiantamentos'
import TelaDocumentos from './components/TelaDocumentos'
import TelaPassagens from './components/TelaPassagens'
import TelaFinal from './components/TelaFinal'
import './App.css'

function App() {
  const [prestacaoId, setPrestacaoId] = useState(null)

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-blue-900 text-white p-4 shadow-lg">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold">Câmara Municipal de Município Exemplo</h1>
            <p className="text-blue-200">Sistema de Prestação de Contas de Diárias</p>
          </div>
        </header>
        
        <main className="container mx-auto p-4">
          <Routes>
            <Route 
              path="/" 
              element={<TelaInicial setPrestacaoId={setPrestacaoId} />} 
            />
            <Route 
              path="/configuracao-diarias" 
              element={<TelaConfiguracaoDiarias />} 
            />
            <Route 
              path="/adiantamentos" 
              element={<TelaAdiantamentos prestacaoId={prestacaoId} />} 
            />
            <Route 
              path="/documentos" 
              element={<TelaDocumentos prestacaoId={prestacaoId} />} 
            />
            <Route 
              path="/passagens" 
              element={<TelaPassagens prestacaoId={prestacaoId} />} 
            />
            <Route 
              path="/final" 
              element={<TelaFinal prestacaoId={prestacaoId} />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
