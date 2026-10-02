import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

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
    console.error('Spreadsheet ErrorBoundary caught an unhandled error:', error, errorInfo);
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
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 p-4 font-sans text-slate-800">
          <div className="max-w-lg w-full bg-white rounded-xl shadow-lg border border-slate-200 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2 bg-red-50 rounded-lg shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Spreadsheet Display Error
              </h2>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              An unexpected error occurred while rendering the spreadsheet canvas.
              Your file is safe and has not been altered. You can reload the page or return
              to the home screen to open another workbook.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Reload Page
              </button>

              <button
                type="button"
                onClick={this.handleReturnHome}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-slate-200"
              >
                <Home className="w-4 h-4" />
                Return to Home
              </button>
            </div>

            {this.state.error && (
              <details className="mt-2 text-xs border border-slate-200 rounded-lg p-3 bg-slate-50 text-slate-700">
                <summary className="font-semibold cursor-pointer select-none text-slate-600 hover:text-slate-900">
                  Technical Details
                </summary>
                <pre className="mt-2 overflow-x-auto font-mono text-[11px] text-red-700 whitespace-pre-wrap">
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo?.componentStack && (
                  <pre className="mt-1 overflow-x-auto font-mono text-[10px] text-slate-500 whitespace-pre-wrap">
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
