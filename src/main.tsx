import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { loadAudioManifest } from '@/lib/tts'
import './styles.css'

// Capacitor / file:// altında da çalışsın diye HashRouter kullanılıyor.
loadAudioManifest()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
