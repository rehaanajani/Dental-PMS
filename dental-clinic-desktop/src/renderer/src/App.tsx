import { Component, ErrorInfo, ReactNode } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'

interface State { hasError: boolean; error: Error | null }

class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }
  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info)
  }
  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, fontFamily: 'system-ui', color: '#C8173B' }}>
          <h2>Application Error</h2>
          <pre style={{ background: '#fff2f2', padding: 16, borderRadius: 8, whiteSpace: 'pre-wrap' }}>
            {this.state.error?.message}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App(): JSX.Element {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  )
}
