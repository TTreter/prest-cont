import * as React from "react"

// Define o ponto de interrupção para considerar um dispositivo como móvel.
const MOBILE_BREAKPOINT = 768

/**
 * Hook personalizado para detectar se a tela é de um dispositivo móvel.
 * @returns {boolean} True se a tela for menor que o MOBILE_BREAKPOINT, False caso contrário.
 */
export function useIsMobile() {
  // Estado para armazenar se o dispositivo é móvel.
  const [isMobile, setIsMobile] = React.useState(undefined)

  React.useEffect(() => {
    // Cria um MediaQueryList para observar mudanças na largura da janela.
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Função de callback para atualizar o estado quando a largura da janela muda.
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Adiciona o listener para observar as mudanças.
    mql.addEventListener("change", onChange)
    // Define o estado inicial.
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    // Função de limpeza para remover o listener quando o componente é desmontado.
    return () => mql.removeEventListener("change", onChange);
  }, []) // O array vazio garante que o efeito só é executado uma vez (no montagem).

  // Retorna o estado de isMobile, garantindo que seja um booleano.
  return !!isMobile
}

