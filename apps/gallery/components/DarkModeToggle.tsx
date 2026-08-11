'use client'

import { useEffect, useState } from 'react'

function getCurrentTheme(): 'light' | 'dark' {
  const explicit = document.documentElement.dataset.theme
  if (explicit === 'light' || explicit === 'dark') return explicit
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function DarkModeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null)

  useEffect(() => {
    setTheme(getCurrentTheme())
  }, [])

  function toggle() {
    const next = getCurrentTheme() === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    localStorage.setItem('theme', next)
    setTheme(next)
  }

  return (
    <button type="button" className="button" onClick={toggle} aria-label="Toggle dark mode">
      {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
    </button>
  )
}
