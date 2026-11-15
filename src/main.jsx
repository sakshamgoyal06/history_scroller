import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './feed/feed.css'
import { AppShell } from './mode/AppShell.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppShell />
  </StrictMode>,
)
