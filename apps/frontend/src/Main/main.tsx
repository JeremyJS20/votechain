import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import '../index.css'
import '../Infrastructure/i18n' // Initialize i18n

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <main className="min-h-screen bg-surface selection:bg-primary/10">
      <App />
    </main>
  </React.StrictMode>,
)
