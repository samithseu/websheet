import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Spreadsheet ErrorBoundary caught an unhandled error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleReturnHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    try {
      window.sessionStorage.clear();
    } catch {
      // Ignore storage clear error
    }
    window.location.href = window.location.origin + window.location.pathname;
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 p-4 font-sans text-zinc-900">
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl border border-zinc-200/90 p-6 flex flex-col gap-4 ring-1 ring-black/[0.04]">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h2 className="text-base font-semibold text-zinc-900 tracking-tight">
                Spreadsheet Display Error
              </h2>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              An unexpected error occurred while rendering the spreadsheet canvas. Your file is safe
              and has not been altered. You can reload the page or return to the home screen to open
              another workbook.
            </p>

            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex items-center gap-2 h-8 px-4 bg-blue-600 hover:bg-blue-700 border border-blue-600 text-white text-xs font-medium rounded-lg shadow-xs transition-all active:scale-[0.98] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleReturnHome}
                className="flex items-center gap-2 h-8 px-4 bg-white hover:bg-zinc-50 border border-zinc-200/90 text-zinc-700 text-xs font-medium rounded-lg shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
              >
                <Home className="w-3.5 h-3.5 text-zinc-500" />
                <span>Return to Home</span>
              </button>
            </div>

            {this.state.error && (
              <details className="mt-2 text-xs border border-zinc-200 rounded-xl p-3 bg-zinc-50 text-zinc-700">
                <summary className="font-medium cursor-pointer select-none text-zinc-600 hover:text-zinc-950">
                  Technical Details
                </summary>
                <pre className="mt-2 overflow-x-auto font-mono text-[11px] text-rose-600 whitespace-pre-wrap">
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo?.componentStack && (
                  <pre className="mt-1 overflow-x-auto font-mono text-[10px] text-zinc-500 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
