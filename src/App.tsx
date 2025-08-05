import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from 'sonner';

import IndexPage from './pages/Index';
import Clients from './pages/Clients';
import Appointments from './pages/Appointments';
import Marketing from './pages/Marketing';
import Financial from './pages/Financial';
import Automation from './pages/Automation';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Settings from './pages/Settings';
import DigitalBusinessCardSettings from './pages/DigitalBusinessCardSettings';
import CustomerPortalSettings from './pages/CustomerPortalSettings';
import PublicScheduler from './pages/PublicScheduler';

// Customer pages
import LoginCliente from './pages/customer/LoginCliente';
import CadastroCliente from './pages/customer/CadastroCliente';
import MeusAgendamentos from './pages/customer/MeusAgendamentos';
import MinhasPreferencias from './pages/customer/MinhasPreferencias';

import { AuthProvider } from './contexts/AuthContext';
import { CustomerAuthProvider } from './contexts/CustomerAuthContext';
import { AppStateProvider } from './contexts/AppStateContext';
import ProtectedRoute from './components/ProtectedRoute';
import { ProtectedCustomerRoute } from './components/customer/ProtectedCustomerRoute';
import ErrorBoundary from './components/ui/error-boundary';
import DataMigration from './pages/DataMigration';

const queryClient = new QueryClient();

function AuthWrapper() {
  return (
    <AuthProvider>
      <CustomerAuthProvider>
        <AppStateProvider>
          <AppRoutes />
        </AppStateProvider>
      </CustomerAuthProvider>
    </AuthProvider>
  );
}

function AppRoutes() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Admin Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/migrate" element={
          <ProtectedRoute>
            <DataMigration />
          </ProtectedRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <IndexPage />
          </ProtectedRoute>
        } />
        <Route path="/clients" element={
          <ProtectedRoute>
            <Clients />
          </ProtectedRoute>
        } />
        <Route path="/appointments" element={
          <ProtectedRoute>
            <Appointments />
          </ProtectedRoute>
        } />
        <Route path="/financial" element={
          <ProtectedRoute>
            <Financial />
          </ProtectedRoute>
        } />
        <Route path="/marketing" element={
          <ProtectedRoute>
            <Marketing />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/settings/digital-card" element={
          <ProtectedRoute>
            <DigitalBusinessCardSettings />
          </ProtectedRoute>
        } />
        <Route path="/settings/customer-portal" element={
          <ProtectedRoute>
            <CustomerPortalSettings />
          </ProtectedRoute>
        } />

        {/* Public Routes */}
        <Route path="/agendar/:business_slug" element={<PublicScheduler />} />
        
        {/* Customer Routes */}
        <Route path="/:business_slug/cliente/login" element={<LoginCliente />} />
        <Route path="/cliente/cadastro" element={<CadastroCliente />} />
        <Route path="/cliente/minha-conta" element={
          <ProtectedCustomerRoute>
            <MeusAgendamentos />
          </ProtectedCustomerRoute>
        } />
        <Route path="/cliente/preferencias" element={
          <ProtectedCustomerRoute>
            <MinhasPreferencias />
          </ProtectedCustomerRoute>
        } />
        
        {/* Error Routes */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" />} />
      </Routes>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthWrapper />
      </BrowserRouter>
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  );
}

export default App;