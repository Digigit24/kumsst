
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: any | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: any): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: any, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorMessage =
        this.state.error?.message ||
        (typeof this.state.error === 'string'
          ? this.state.error
          : 'An unexpected error occurred');

      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
          <div className="w-full max-w-lg mx-auto text-center">
            {/* Icon */}
            <div className="mx-auto rounded-full bg-destructive/10 p-5 w-fit mb-6">
              <svg
                className="w-10 h-10 text-destructive"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            {/* Title & Description */}
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              Something went wrong
            </h1>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              An error occurred while rendering this page. You can try again or
              go back to the home page.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-sm font-medium rounded-md text-foreground hover:bg-muted transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Go Home
              </button>
              <button
                onClick={this.handleReload}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
              >
                Reload Page
              </button>
            </div>

            {/* Error Details */}
            <details className="text-left bg-muted/50 rounded-lg border border-border/60 overflow-hidden">
              <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground select-none">
                Error Details
              </summary>
              <div className="px-4 pb-4 space-y-3">
                <div className="rounded bg-background p-3 border border-border/40">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Error Message</p>
                  <pre className="text-xs font-mono text-destructive whitespace-pre-wrap break-words">
                    {errorMessage}
                  </pre>
                </div>

                {this.state.error?.errors && (
                  <div className="rounded bg-background p-3 border border-border/40">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Error Data</p>
                    <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap break-words max-h-32 overflow-auto">
                      {JSON.stringify(this.state.error.errors, null, 2)}
                    </pre>
                  </div>
                )}

                {this.state.errorInfo?.componentStack && (
                  <div className="rounded bg-background p-3 border border-border/40">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Component Stack</p>
                    <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap break-words max-h-32 overflow-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
