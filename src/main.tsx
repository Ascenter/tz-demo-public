import './app/bootReset' // must run before the store loads (?reset=1, standalone detection)
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App'
import { installTestHook } from './app/testHook'

installTestHook()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
