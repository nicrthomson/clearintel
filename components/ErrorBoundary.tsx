"use client"

import { Component, ReactNode } from "react"
import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error) {
    console.error("Uncaught error:", error)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold">Something went wrong</h2>
            <p className="mt-2 text-muted-foreground">
              An error occurred while loading this page.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Button onClick={() => this.setState({ hasError: false })}>
                Try again
              </Button>
              <Button variant="outline" onClick={() => window.location.href = "/"}>
                Go home
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
