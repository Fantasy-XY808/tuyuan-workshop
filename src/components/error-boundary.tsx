import { Component, type ReactNode } from "react"

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error) {
    console.error("[ErrorBoundary]", error)
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="p-8 text-center space-y-2">
          <p className="text-lg font-bold text-destructive">出错了</p>
          <pre className="text-sm text-muted-foreground whitespace-pre-wrap max-w-lg mx-auto">
            {this.state.error.message}
          </pre>
          <button
            className="text-sm text-primary underline underline-offset-4"
            onClick={() => this.setState({ error: null })}
          >
            重试
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
