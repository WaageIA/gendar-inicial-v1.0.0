
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorState } from '@/components/common/ErrorState';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <ErrorState
            title="Erro na Aplicação"
            message="Ocorreu um erro inesperado. A página será recarregada automaticamente."
            onRetry={() => {
              this.setState({ hasError: false, error: undefined });
              window.location.reload();
            }}
            showHomeButton
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
