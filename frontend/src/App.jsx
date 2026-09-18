import { useEffect } from 'react'
import { BrowserRouter, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AppRoutes from './AppRoutes'

// Global scroll restoration to ensure navigating to Home or any page resets scroll to top
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return null
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
          },
        }}
      />
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
