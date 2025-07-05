
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Variantes de cores padronizadas
export const colorVariants = {
  primary: 'bg-nail-primary text-white',
  secondary: 'bg-nail-secondary text-nail-dark',
  success: 'bg-completed text-white',
  warning: 'bg-yellow-500 text-white',
  danger: 'bg-destructive text-white',
  info: 'bg-blue-500 text-white',
} as const;

// Componente de Card padronizado
interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  variant?: keyof typeof colorVariants;
  className?: string;
  style?: React.CSSProperties;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon,
  variant = 'primary',
  className,
  style
}) => {
  return (
    <Card className={cn('nail-card hover:shadow-lg transition-all duration-300', className)} style={style}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {icon && (
            <div className={cn('p-3 rounded-full', colorVariants[variant])}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Badge de status padronizado
interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant = 'default' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
  };

  return (
    <Badge className={cn('text-xs font-medium', variants[variant])}>
      {status}
    </Badge>
  );
};

// Botão padronizado com variantes
interface ActionButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  className,
  disabled
}) => {
  const variants = {
    primary: 'nail-button',
    secondary: 'nail-secondary-button',
    outline: 'border border-nail-primary text-nail-primary hover:bg-nail-primary hover:text-white',
    ghost: 'text-nail-primary hover:bg-nail-light',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={cn(variants[variant], sizes[size], className)}
    >
      {children}
    </Button>
  );
};
