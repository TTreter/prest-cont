import { Home } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { 
  Breadcrumb, 
  BreadcrumbList, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb"

/**
 * Componente de navegação breadcrumb personalizado para a aplicação.
 * Utiliza os componentes base do shadcn/ui para consistência visual.
 */
export function NavigationBreadcrumb({ className }) {
  const location = useLocation()
  
  const routeMap = {
    '/': { label: 'Início', icon: Home },
    '/configuracao-diarias': { label: 'Configuração de Diárias' },
    '/adiantamentos': { label: 'Adiantamentos' },
    '/documentos': { label: 'Documentos' },
    '/passagens': { label: 'Passagens' },
    '/final': { label: 'Finalização' }
  }

  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean)
    const breadcrumbs = []

    // Sempre inclui a página inicial
    breadcrumbs.push({
      label: 'Início',
      href: '/',
      icon: Home,
      current: location.pathname === '/'
    })

    // Adiciona segmentos baseados na rota atual
    let currentPath = ''
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const route = routeMap[currentPath]
      
      if (route) {
        const isLast = index === pathSegments.length - 1
        breadcrumbs.push({
          label: route.label,
          href: isLast ? undefined : currentPath,
          icon: route.icon,
          current: isLast
        })
      }
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  // Não mostra breadcrumb na página inicial
  if (location.pathname === '/') {
    return null
  }

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {breadcrumbs.map((item, index) => (
          <div key={item.href || index} className="flex items-center">
            <BreadcrumbItem>
              {item.current ? (
                <BreadcrumbPage className="flex items-center gap-1">
                  {item.icon && <item.icon className="h-4 w-4" />}
                  {item.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link 
                    to={item.href}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    {item.icon && <item.icon className="h-4 w-4" />}
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            
            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
