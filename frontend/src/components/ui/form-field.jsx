import { forwardRef } from "react"
import { AlertCircle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

/**
 * Componente FormField melhorado com validação visual e acessibilidade.
 * Fornece feedback visual claro sobre o estado de validação dos campos.
 */
export const FormField = forwardRef(({
  label,
  error,
  success,
  required,
  helpText,
  className,
  children,
  id,
  ...props
}, ref) => {
  const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`
  const errorId = `${fieldId}-error`
  const helpId = `${fieldId}-help`

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label do campo */}
      {label && (
        <Label 
          htmlFor={fieldId}
          className={cn(
            "text-sm font-medium",
            error && "text-red-600 dark:text-red-400",
            success && "text-green-600 dark:text-green-400"
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      {/* Container do campo com indicadores visuais */}
      <div className="relative">
        {children || (
          <Input
            ref={ref}
            id={fieldId}
            className={cn(
              "transition-colors",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500",
              success && "border-green-500 focus:border-green-500 focus:ring-green-500",
              (error || success) && "pr-10"
            )}
            aria-invalid={!!error}
            aria-describedby={cn(
              error && errorId,
              helpText && helpId
            )}
            {...props}
          />
        )}

        {/* Ícones de validação */}
        {(error || success) && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {error && (
              <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
            )}
            {success && (
              <CheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" />
            )}
          </div>
        )}
      </div>

      {/* Mensagem de erro */}
      {error && (
        <p 
          id={errorId}
          className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </p>
      )}

      {/* Texto de ajuda */}
      {helpText && !error && (
        <p 
          id={helpId}
          className="text-sm text-gray-600 dark:text-gray-400"
        >
          {helpText}
        </p>
      )}
    </div>
  )
})

FormField.displayName = "FormField"

/**
 * Componente para agrupar campos relacionados visualmente.
 */
export function FormGroup({ title, description, children, className }) {
  return (
    <div className={cn("space-y-4", className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}

/**
 * Componente para exibir resumo de erros do formulário.
 */
export function FormErrorSummary({ errors, className }) {
  const errorEntries = Object.entries(errors).filter(([_, error]) => error)
  
  if (errorEntries.length === 0) return null

  return (
    <div className={cn(
      "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4",
      className
    )}>
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
            Corrija os seguintes erros:
          </h3>
          <ul className="mt-2 text-sm text-red-700 dark:text-red-300 space-y-1">
            {errorEntries.map(([field, error]) => (
              <li key={field}>• {error}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
