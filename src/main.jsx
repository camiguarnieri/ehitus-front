import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material'
import { ehitusTheme } from './theme/theme'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={ehitusTheme}>
      <App />
    </ThemeProvider>
  </StrictMode>,
)