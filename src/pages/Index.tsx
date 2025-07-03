
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import { useAppState } from '@/contexts/AppStateContext';
import { Appointment } from '@/types';
import { toast } from 'sonner';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';

const IndexPage = () => {
  const { state, dispatch } = useAppState();
  
  const handleCancelAppointment = (appointment: Appointment) => {
    const updatedAppointment = { ...appointment, status: 'cancelled' as const };
    dispatch({ type: 'UPDATE_APPOINTMENT', appointment: updatedAppointment });
    
    // Update localStorage as backup
    const savedAppointments = localStorage.getItem('nail-appointments');
    if (savedAppointments) {
      const appointments = JSON.parse(savedAppointments);
      const updatedAppointments = appointments.map((app: Appointment) => 
        app.id === appointment.id ? updatedAppointment : app
      );
      localStorage.setItem('nail-appointments', JSON.stringify(updatedAppointments));
    }
    
    toast.success('Agendamento cancelado');
  };

  const handleCompleteAppointment = (appointment: Appointment) => {
    const updatedAppointment = { ...appointment, status: 'completed' as const };
    dispatch({ type: 'UPDATE_APPOINTMENT', appointment: updatedAppointment });
    
    // Update localStorage as backup
    const savedAppointments = localStorage.getItem('nail-appointments');
    if (savedAppointments) {
      const appointments = JSON.parse(savedAppointments);
      const updatedAppointments = appointments.map((app: Appointment) => 
        app.id === appointment.id ? updatedAppointment : app
      );
      localStorage.setItem('nail-appointments', JSON.stringify(updatedAppointments));
    }
    
    toast.success('Agendamento concluído');
  };

  // Show loading state while data is being loaded
  if (state.loading.clients || state.loading.appointments) {
    return (
      <Layout>
        <LoadingState type="dashboard" />
      </Layout>
    );
  }

  // Show error state if there are critical errors
  if (state.errors.clients || state.errors.appointments) {
    return (
      <Layout>
        <ErrorState
          title="Erro ao carregar dashboard"
          message="Não foi possível carregar os dados. Verifique sua conexão e tente novamente."
          onRetry={() => window.location.reload()}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
};

export default IndexPage;
