import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/global.css'
import './styles/prescription.css'

console.log('[Renderer] boot started')

function showBootError(error: unknown): void {
  const message = error instanceof Error ? error.stack || error.message : String(error)

  document.body.innerHTML = `
    <div style="
      min-height: 100vh;
      padding: 40px;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #D8DEE8;
      color: #181613;
    ">
      <div style="
        max-width: 900px;
        background: #fff;
        border-radius: 16px;
        padding: 24px;
        border: 1px solid rgba(24,22,19,0.08);
        box-shadow: 0 20px 60px rgba(24,22,19,0.12);
      ">
        <h1 style="color: #C8173B; margin-bottom: 12px;">Darediya Dental Hub PMS failed to start</h1>
        <p style="margin-bottom: 16px;">The renderer crashed before the app could mount.</p>
        <pre style="
          white-space: pre-wrap;
          background: #fff2f2;
          border: 1px solid #fecaca;
          padding: 16px;
          border-radius: 12px;
          overflow: auto;
        ">${message}</pre>
      </div>
    </div>
  `
}

async function boot(): Promise<void> {
  window.addEventListener('error', (event) => {
    console.error('[Renderer] window error:', event.error || event.message)
  })

  window.addEventListener('unhandledrejection', (event) => {
    console.error('[Renderer] unhandled rejection:', event.reason)
  })

  try {
    const rootElement = document.getElementById('root')

    if (!rootElement) {
      throw new Error('Renderer root element not found')
    }

    const { default: App } = await import('./App')

    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )

    console.log('[Renderer] mounted')
  } catch (error) {
    console.error('[Renderer] failed to boot:', error)
    showBootError(error)
  }
}

void boot()
