import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './feed/feed.css'
import { AppShell } from './mode/AppShell.jsx'
import { captureSignInFromUrl } from './account/auth.js'

// Before the app's hash routing runs: take sign-in tokens out of the URL and finish sign-in (M0.3).
captureSignInFromUrl()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppShell />
  </StrictMode>,
)
