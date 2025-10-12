import { createContext, useContext, useEffect, useState } from "react"

// Tipos de tema disponíveis
const themes = ["dark", "light", "system"]

// Contexto para o tema
const ThemeProviderContext = createContext({
  theme: "system",
  setTheme: () => null,
})

/**
 * Componente provedor de tema que gerencia o estado do tema da aplicação.
 * Utiliza localStorage para persistir a preferência do usuário.
 */
export function ThemeProvider({
  children,
  defaultTheme = "dark", // Modo escuro como padrão
  storageKey = "vite-ui-theme",
  ...props
}) {
  // Estado do tema atual
  const [theme, setTheme] = useState(
    () => (localStorage.getItem(storageKey)) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement

    // Remove todas as classes de tema existentes
    root.classList.remove("light", "dark")

    if (theme === "system") {
      // Se o tema for "system", usa a preferência do sistema
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    // Aplica o tema selecionado
    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme) => {
      // Salva a preferência no localStorage
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

/**
 * Hook para usar o contexto do tema.
 * @returns {Object} Objeto contendo o tema atual e função para alterá-lo.
 */
export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
