import { useState, useEffect } from 'react'

// Breakpoints padrão do Tailwind CSS
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
}

/**
 * Hook para detectar o tamanho da tela e fornecer informações de responsividade.
 * @returns {Object} Objeto contendo informações sobre o tamanho da tela atual.
 */
export function useResponsive() {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  })

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    // Adiciona o listener de resize
    window.addEventListener('resize', handleResize)
    
    // Define o tamanho inicial
    handleResize()

    // Cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Determina o breakpoint atual
  const getCurrentBreakpoint = () => {
    const { width } = screenSize
    if (width >= breakpoints['2xl']) return '2xl'
    if (width >= breakpoints.xl) return 'xl'
    if (width >= breakpoints.lg) return 'lg'
    if (width >= breakpoints.md) return 'md'
    if (width >= breakpoints.sm) return 'sm'
    return 'xs'
  }

  const currentBreakpoint = getCurrentBreakpoint()

  return {
    // Tamanho da tela
    width: screenSize.width,
    height: screenSize.height,
    
    // Breakpoint atual
    breakpoint: currentBreakpoint,
    
    // Helpers para verificar tamanhos específicos
    isMobile: screenSize.width < breakpoints.md,
    isTablet: screenSize.width >= breakpoints.md && screenSize.width < breakpoints.lg,
    isDesktop: screenSize.width >= breakpoints.lg,
    
    // Helpers para breakpoints específicos
    isXs: currentBreakpoint === 'xs',
    isSm: currentBreakpoint === 'sm',
    isMd: currentBreakpoint === 'md',
    isLg: currentBreakpoint === 'lg',
    isXl: currentBreakpoint === 'xl',
    is2Xl: currentBreakpoint === '2xl',
    
    // Helpers para verificar se é maior ou igual a um breakpoint
    isSmUp: screenSize.width >= breakpoints.sm,
    isMdUp: screenSize.width >= breakpoints.md,
    isLgUp: screenSize.width >= breakpoints.lg,
    isXlUp: screenSize.width >= breakpoints.xl,
    is2XlUp: screenSize.width >= breakpoints['2xl']
  }
}
