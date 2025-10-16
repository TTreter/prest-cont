import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { 
  Home, 
  Settings, 
  DollarSign, 
  FileText, 
  Plane, 
  CheckCircle, 
  Menu, 
  X 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Componente de navegação lateral para facilitar o acesso às diferentes telas.
 * Inclui versão responsiva com menu hambúrguer para dispositivos móveis.
 */
export function SidebarNavigation({ className, isMobile = false }) {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const navigationItems = [
    {
      label: 'Início',
      href: '/',
      icon: Home,
      description: 'Página inicial'
    },
    {
      label: 'Configurações',
      href: '/configuracao-diarias',
      icon: Settings,
      description: 'Configurar valores de diárias'
    },
    {
      label: 'Adiantamentos',
      href: '/adiantamentos',
      icon: DollarSign,
      description: 'Gerenciar adiantamentos'
    },
    {
      label: 'Documentos',
      href: '/documentos',
      icon: FileText,
      description: 'Anexar documentos'
    },
    {
      label: 'Passagens',
      href: '/passagens',
      icon: Plane,
      description: 'Registrar passagens'
    },
    {
      label: 'Finalização',
      href: '/final',
      icon: CheckCircle,
      description: 'Finalizar prestação'
    }
  ]

  const isCurrentPath = (href) => location.pathname === href

  if (isMobile) {
    return (
      <>
        {/* Botão do menu hambúrguer */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-50 bg-white dark:bg-gray-800 shadow-lg"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Sidebar móvel */}
        <div
          className={cn(
            "fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="p-6 pt-16">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Navegação
            </h2>
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const current = isCurrentPath(item.href)
                
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      current
                        ? "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <div>
                      <div>{item.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </>
    )
  }

  // Sidebar desktop
  return (
    <div className={cn("w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700", className)}>
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
          Navegação
        </h2>
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const current = isCurrentPath(item.href)
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  current
                    ? "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                <Icon className="h-5 w-5" />
                <div>
                  <div>{item.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {item.description}
                  </div>
                </div>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

/**
 * Componente de navegação rápida para ações comuns.
 */
export function QuickActions({ className }) {
  const quickActions = [
    {
      label: 'Nova Prestação',
      href: '/',
      icon: Home,
      variant: 'default'
    },
    {
      label: 'Configurações',
      href: '/configuracao-diarias',
      icon: Settings,
      variant: 'outline'
    }
  ]

  return (
    <div className={cn("flex gap-2", className)}>
      {quickActions.map((action) => {
        const Icon = action.icon
        
        return (
          <Button
            key={action.href}
            variant={action.variant}
            size="sm"
            asChild
            className="flex items-center gap-2"
          >
            <Link to={action.href}>
              <Icon className="h-4 w-4" />
              {action.label}
            </Link>
          </Button>
        )
      })}
    </div>
  )
}
