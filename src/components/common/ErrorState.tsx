
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showHomeButton?: boolean;
  className?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Algo deu errado',
  message = 'Ocorreu um erro inesperado. Tente novamente.',
  onRetry,
  showHomeButton = false,
  className = '',
}) => {
  const navigate = useNavigate();

  return (
    <Card className={`mx-auto max-w-md ${className}`}>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-nail-dark">{title}</h3>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
          
          <div className="flex gap-2 pt-2">
            {onRetry && (
              <Button 
                onClick={onRetry}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Tentar Novamente
              </Button>
            )}
            
            {showHomeButton && (
              <Button 
                onClick={() => navigate('/')}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Voltar ao Início
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ErrorState;
