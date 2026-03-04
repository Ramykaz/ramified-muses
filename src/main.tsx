import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ContentProvider } from './hooks/ContentContext'
import App from './App.tsx'
import './index.css'
import './styles/globals.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ContentProvider>
      <App />
    </ContentProvider>
  </StrictMode>,
)
