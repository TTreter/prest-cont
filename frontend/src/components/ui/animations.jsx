import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

/**
 * Componente para animações de entrada (fade in).
 * Útil para criar transições suaves quando elementos aparecem na tela.
 */
export function FadeIn({ 
  children, 
  delay = 0, 
  duration = 300, 
  className,
  ...props 
}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={cn(
        "transition-all ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className
      )}
      style={{
        transitionDuration: `${duration}ms`
      }}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Componente para animações de deslizamento lateral.
 */
export function SlideIn({ 
  children, 
  direction = "left", 
  delay = 0, 
  duration = 300, 
  className,
  ...props 
}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  const getTransform = () => {
    if (isVisible) return "translate-x-0"
    
    switch (direction) {
      case "left": return "-translate-x-4"
      case "right": return "translate-x-4"
      default: return "-translate-x-4"
    }
  }

  return (
    <div
      className={cn(
        "transition-all ease-out",
        isVisible ? "opacity-100" : "opacity-0",
        getTransform(),
        className
      )}
      style={{
        transitionDuration: `${duration}ms`
      }}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Componente para animações de escala (zoom).
 */
export function ScaleIn({ 
  children, 
  delay = 0, 
  duration = 300, 
  className,
  ...props 
}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={cn(
        "transition-all ease-out",
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95",
        className
      )}
      style={{
        transitionDuration: `${duration}ms`
      }}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Componente para animações sequenciais de múltiplos elementos.
 */
export function StaggeredAnimation({ 
  children, 
  staggerDelay = 100, 
  className 
}) {
  return (
    <div className={className}>
      {Array.isArray(children) 
        ? children.map((child, index) => (
            <FadeIn key={index} delay={index * staggerDelay}>
              {child}
            </FadeIn>
          ))
        : <FadeIn>{children}</FadeIn>
      }
    </div>
  )
}

/**
 * Componente para efeitos de hover com animações.
 */
export function HoverCard({ 
  children, 
  className,
  hoverScale = true,
  hoverShadow = true,
  ...props 
}) {
  return (
    <div
      className={cn(
        "transition-all duration-200 ease-out",
        hoverScale && "hover:scale-105",
        hoverShadow && "hover:shadow-lg",
        "hover:-translate-y-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Componente para botões com animações de feedback.
 */
export function AnimatedButton({ 
  children, 
  onClick,
  className,
  ripple = true,
  ...props 
}) {
  const [ripples, setRipples] = useState([])

  const handleClick = (e) => {
    if (ripple) {
      const rect = e.currentTarget.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = e.clientX - rect.left - size / 2
      const y = e.clientY - rect.top - size / 2
      
      const newRipple = {
        x,
        y,
        size,
        id: Date.now()
      }
      
      setRipples(prev => [...prev, newRipple])
      
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id))
      }, 600)
    }
    
    onClick?.(e)
  }

  return (
    <button
      className={cn(
        "relative overflow-hidden transition-all duration-200",
        "hover:scale-105 active:scale-95",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
      
      {/* Efeito ripple */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full animate-ping"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            animationDuration: '600ms'
          }}
        />
      ))}
    </button>
  )
}

/**
 * Componente para skeleton loading com animação shimmer.
 */
export function SkeletonLoader({ 
  className,
  lines = 1,
  width = "100%",
  height = "1rem"
}) {
  return (
    <div className={cn("animate-pulse space-y-2", className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="bg-gray-200 dark:bg-gray-700 rounded shimmer"
          style={{
            width: Array.isArray(width) ? width[index] || width[0] : width,
            height: Array.isArray(height) ? height[index] || height[0] : height
          }}
        />
      ))}
    </div>
  )
}

/**
 * Componente para notificações com animação de entrada e saída.
 */
export function AnimatedNotification({ 
  show, 
  children, 
  position = "top-right",
  className 
}) {
  const getPositionClasses = () => {
    switch (position) {
      case "top-left": return "top-4 left-4"
      case "top-right": return "top-4 right-4"
      case "bottom-left": return "bottom-4 left-4"
      case "bottom-right": return "bottom-4 right-4"
      case "top-center": return "top-4 left-1/2 transform -translate-x-1/2"
      case "bottom-center": return "bottom-4 left-1/2 transform -translate-x-1/2"
      default: return "top-4 right-4"
    }
  }

  return (
    <div
      className={cn(
        "fixed z-50 transition-all duration-300 ease-out",
        show 
          ? "opacity-100 translate-y-0 scale-100" 
          : "opacity-0 -translate-y-2 scale-95 pointer-events-none",
        getPositionClasses(),
        className
      )}
    >
      {children}
    </div>
  )
}
