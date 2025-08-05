import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { LoadingState } from '@/components/common/LoadingState';

interface ProtectedCustomerRouteProps {
  children: React.ReactNode;
}

export const ProtectedCustomerRoute: React.FC<ProtectedCustomerRouteProps> = ({ children }) => {
  const { user, customer, loading } = useCustomerAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState message="Verificando autenticação..." />
      </div>
    );
  }

  if (!user || !customer) {
    // Redirect to login with return URL
    return (
      <Navigate 
        to="/cliente/login" 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  return <>{children}</>;
};