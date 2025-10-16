import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Componente de Loading para indicar operações em andamento.
 * Fornece feedback visual claro ao usuário durante carregamentos.
 */
export function Loading({ className, size = "default", text = "Carregando..." }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6", 
    lg: "h-8 w-8"
  }

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin", sizeClasses[size])} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  )
}

/**
 * Componente de Loading em tela cheia para operações maiores.
 */
export function LoadingScreen({ text = "Carregando..." }) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card p-6 rounded-lg shadow-lg border">
        <Loading size="lg" text={text} />
      </div>
    </div>
  )
}

/**
 * Componente de Loading inline para uso em botões.
 */
export function LoadingButton({ children, loading, ...props }) {
  return (
    <button {...props} disabled={loading || props.disabled}>
      {loading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          {children}
        </div>
      ) : (
        children
      )}
    </button>
  )
}
