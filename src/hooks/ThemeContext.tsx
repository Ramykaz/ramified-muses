import React, { createContext, useContext, useState, useEffect } from 'react'

export type Theme = 'day' | 'night'

function normalizeTheme(value: string | null): Theme {
  return value === 'night' ? 'night' : 'day'
}

interface ThemeCtx {
  theme: Theme
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeCtx>({ theme: 'day', setTheme: () => {} })

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() =>
    normalizeTheme(localStorage.getItem('rm_theme')),
  )

  const setTheme = (t: Theme) => {
    const next = normalizeTheme(t)
    setThemeState(next)
    localStorage.setItem('rm_theme', next)
  }

  // Apply data-theme attribute to <html> so CSS vars take effect everywhere
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
