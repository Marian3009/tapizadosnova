import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[hsl(40,25%,97%)] px-4 text-center">
          <div className="space-y-2">
            <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[hsl(222,17%,20%)]">
              Algo salió mal
            </h1>
            <p className="text-[hsl(222,10%,40%)]">
              Ha ocurrido un error inesperado. Por favor recarga la página.
            </p>
            {this.state.message && (
              <p className="mt-2 rounded-md bg-white px-4 py-2 font-mono text-xs text-red-600 shadow-sm">
                {this.state.message}
              </p>
            )}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl bg-[hsl(39,44%,59%)] px-8 py-3 font-semibold text-white shadow-md transition hover:bg-[hsl(39,44%,50%)]"
          >
            Recargar página
          </button>
          <a
            href="/"
            className="text-sm text-[hsl(222,10%,40%)] underline hover:text-[hsl(222,17%,20%)]"
          >
            Volver al inicio
          </a>
        </div>
      );
    }

    return this.props.children;
  }
}
