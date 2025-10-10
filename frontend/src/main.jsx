import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Cria a raiz da aplicação React e renderiza o componente principal (App).
createRoot(document.getElementById('root')).render(
  // StrictMode é uma ferramenta para destacar problemas potenciais em uma aplicação React.
  <StrictMode>
    <App />
  </StrictMode>,
)

