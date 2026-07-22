import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback: (retry: () => void) => ReactNode
}
interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }
  static getDerivedStateFromError(error: Error): State {
    return { error }
  }
  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('GVE render error:', error, info.componentStack)
  }
  render(): ReactNode {
    if (this.state.error) return this.props.fallback(() => this.setState({ error: null }))
    return this.props.children
  }
}
