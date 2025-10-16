import { useState, useEffect, createContext, useContext } from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

// Contexto para gerenciar toasts globalmente
const ToastContext = createContext()

/**
 * Provider para gerenciar toasts na aplicação.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  // Função para adicionar um novo toast
  const addToast = (toast) => {
    const id = Date.now()
    const newToast = { id, ...toast }
    setToasts(prev => [...prev, newToast])

    // Remove automaticamente após o tempo especificado
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration || 5000)
    }
  }

  // Função para remover um toast
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

/**
 * Hook para usar toasts.
 */
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast deve ser usado dentro de ToastProvider")
  }

  const { addToast } = context

  return {
    toast: (options) => addToast(options),
    success: (message, options = {}) => addToast({ 
      type: "success", 
      title: "Sucesso", 
      message, 
      ...options 
    }),
    error: (message, options = {}) => addToast({ 
      type: "error", 
      title: "Erro", 
      message, 
      ...options 
    }),
    warning: (message, options = {}) => addToast({ 
      type: "warning", 
      title: "Atenção", 
      message, 
      ...options 
    }),
    info: (message, options = {}) => addToast({ 
      type: "info", 
      title: "Informação", 
      message, 
      ...options 
    })
  }
}

/**
 * Container que renderiza todos os toasts.
 */
function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

/**
 * Componente individual de Toast.
 */
function Toast({ toast, onRemove }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animação de entrada
    setTimeout(() => setIsVisible(true), 10)
  }, [])

  const handleRemove = () => {
    setIsVisible(false)
    setTimeout(() => onRemove(toast.id), 300)
  }

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  }

  const colors = {
    success: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200",
    error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
    warning: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200",
    info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200"
  }

  const Icon = icons[toast.type] || Info

  return (
    <div
      className={cn(
        "p-4 rounded-lg border shadow-lg transition-all duration-300 transform",
        colors[toast.type] || colors.info,
        isVisible 
          ? "translate-x-0 opacity-100" 
          : "translate-x-full opacity-0"
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          {toast.title && (
            <h4 className="font-medium text-sm">{toast.title}</h4>
          )}
          {toast.message && (
            <p className="text-sm mt-1 opacity-90">{toast.message}</p>
          )}
        </div>
        <button
          onClick={handleRemove}
          className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
