import { useLocation } from "react-router-dom"
import { Check, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Componente indicador de progresso para mostrar o andamento da prestação de contas.
 * Fornece feedback visual sobre qual etapa o usuário está e quais já foram concluídas.
 */
export function ProgressIndicator({ className }) {
  const location = useLocation()
  
  const steps = [
    { id: 'inicio', label: 'Início', path: '/' },
    { id: 'adiantamentos', label: 'Adiantamentos', path: '/adiantamentos' },
    { id: 'documentos', label: 'Documentos', path: '/documentos' },
    { id: 'passagens', label: 'Passagens', path: '/passagens' },
    { id: 'final', label: 'Finalização', path: '/final' }
  ]

  const getCurrentStepIndex = () => {
    const currentStep = steps.findIndex(step => step.path === location.pathname)
    return currentStep >= 0 ? currentStep : 0
  }

  const currentStepIndex = getCurrentStepIndex()

  // Não mostra na página de configuração de diárias
  if (location.pathname === '/configuracao-diarias') {
    return null
  }

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex
          const isCurrent = index === currentStepIndex
          const isUpcoming = index > currentStepIndex

          return (
            <div key={step.id} className="flex items-center">
              {/* Círculo do step */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200",
                    isCompleted && "bg-green-500 border-green-500 text-white",
                    isCurrent && "bg-blue-500 border-blue-500 text-white",
                    isUpcoming && "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Circle className="h-4 w-4 fill-current" />
                  )}
                </div>
                
                {/* Label do step */}
                <span
                  className={cn(
                    "mt-2 text-xs font-medium text-center transition-colors duration-200",
                    isCompleted && "text-green-600 dark:text-green-400",
                    isCurrent && "text-blue-600 dark:text-blue-400",
                    isUpcoming && "text-gray-400 dark:text-gray-500"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Linha conectora */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-4 transition-colors duration-200",
                    index < currentStepIndex && "bg-green-500",
                    index >= currentStepIndex && "bg-gray-300 dark:bg-gray-600"
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Versão compacta do indicador de progresso para dispositivos móveis.
 */
export function CompactProgressIndicator({ className }) {
  const location = useLocation()
  
  const steps = [
    { id: 'inicio', label: 'Início', path: '/' },
    { id: 'adiantamentos', label: 'Adiantamentos', path: '/adiantamentos' },
    { id: 'documentos', label: 'Documentos', path: '/documentos' },
    { id: 'passagens', label: 'Passagens', path: '/passagens' },
    { id: 'final', label: 'Finalização', path: '/final' }
  ]

  const getCurrentStepIndex = () => {
    const currentStep = steps.findIndex(step => step.path === location.pathname)
    return currentStep >= 0 ? currentStep : 0
  }

  const currentStepIndex = getCurrentStepIndex()
  const currentStep = steps[currentStepIndex]
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  // Não mostra na página de configuração de diárias
  if (location.pathname === '/configuracao-diarias') {
    return null
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {currentStep.label}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {currentStepIndex + 1} de {steps.length}
        </span>
      </div>
      
      {/* Barra de progresso */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
