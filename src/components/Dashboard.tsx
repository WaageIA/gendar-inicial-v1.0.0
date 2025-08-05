
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TodaySchedule from '@/components/TodaySchedule';
import QuickActions from '@/components/QuickActions';
import TopClients from '@/components/TopClients';
import AppointmentRevenue from '@/components/AppointmentRevenue';
import { useAppointments } from '@/hooks/use-appointments';
import { useAppState } from '@/contexts/AppStateContext';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import AppointmentDialog from '@/components/AppointmentDialog';
import { Client } from '@/types';
import { toast } from 'sonner';

const Dashboard: React.FC = () => {
  const { state } = useAppState();
  const { 
    appointments, 
    todayAppointments,
    loading: appointmentsLoading,
    changeAppointmentStatus,
    createAppointment,
    refreshAppointments
  } = useAppointments();
  
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | undefined>(undefined);

  console.log('[Dashboard] Estado atual:', {
    clients: state.clients.length,
    appointments: appointments.length,
    todayAppointments: todayAppointments.length,
    loading: state.loading.clients || appointmentsLoading
  });

  console.log('[Dashboard] Agendamentos de hoje detalhados:', todayAppointments.map(app => ({
    id: app.id,
    clientName: app.clientName,
    service: app.service,
    date: app.date,
    status: app.status
  })));

  // Debug: Show all appointments for debugging
  console.log('[Dashboard] Todos os agendamentos:', appointments.map(app => ({
    id: app.id,
    clientName: app.clientName,
    service: app.service,
    date: app.date,
    status: app.status,
    isToday: new Date(app.date).toDateString() === new Date().toDateString()
  })));

  if (state.loading.clients || appointmentsLoading) {
    return <LoadingState />;
  }

  if (state.errors.clients) {
    return <ErrorState message={state.errors.clients} onRetry={() => window.location.reload()} />;
  }

  const handleOpenAppointmentDialog = () => {
    console.log('[Dashboard] Abrindo diálogo de agendamento');
    setAppointmentDialogOpen(true);
  };

  const handleCancelAppointment = async (appointment: Appointment) => {
    console.log('[Dashboard] Cancelando agendamento:', appointment.id);
    await changeAppointmentStatus(appointment, 'cancelled');
    await refreshAppointments();
  };

  const handleCompleteAppointment = async (appointment: Appointment) => {
    console.log('[Dashboard] Concluindo agendamento:', appointment.id);
    await changeAppointmentStatus(appointment, 'completed');
    await refreshAppointments();
  };

  const handleSaveAppointment = async (appointmentData: Omit<Appointment, 'id'>) => {
    console.log('[Dashboard] Salvando novo agendamento:', appointmentData);
    
    try {
      const result = await createAppointment(appointmentData);
      if (result) {
        toast.success('Agendamento criado com sucesso!');
        await refreshAppointments();
        setAppointmentDialogOpen(false);
        setSelectedClient(undefined);
      } else {
        toast.error('Erro ao criar agendamento');
      }
    } catch (error) {
      console.error('[Dashboard] Erro ao criar agendamento:', error);
      toast.error('Erro ao criar agendamento');
    }
  };

  const handleClientSelect = (client: Client) => {
    console.log('[Dashboard] Cliente selecionado para agendamento:', client.name);
    setSelectedClient(client);
    setAppointmentDialogOpen(true);
  };

  // Debug: Add a test appointment if no appointments exist
  const handleAddTestAppointment = () => {
    const testAppointment = {
      clientId: state.clients[0]?.id || 'test-client',
      clientName: state.clients[0]?.name || 'Cliente Teste',
      date: new Date(),
      service: 'Molde F1 Completo',
      duration: 60,
      status: 'scheduled' as const,
      price: 80.00,
      notes: 'Agendamento de teste'
    };
    
    handleSaveAppointment(testAppointment);
  };

  return (
    <div className="space-y-6">
      {/* Debug Section - Remove this in production */}
      {appointments.length === 0 && (
        <Card className="border-dashed border-2 border-yellow-300 bg-yellow-50">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-yellow-800 mb-2">
                Nenhum agendamento encontrado. Clique no botão abaixo para adicionar um agendamento de teste:
              </p>
              <button 
                onClick={handleAddTestAppointment}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
              >
                Adicionar Agendamento de Teste
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TodaySchedule 
            appointments={todayAppointments}
            onCancel={handleCancelAppointment}
            onComplete={handleCompleteAppointment}
          />
          <AppointmentRevenue />
        </div>
        
        <div className="space-y-6">
          <QuickActions 
            onOpenAppointmentDialog={handleOpenAppointmentDialog}
          />
          <TopClients 
            clients={state.clients}
            onClientSelect={handleClientSelect}
          />
        </div>
      </div>

      <AppointmentDialog
        open={appointmentDialogOpen}
        onOpenChange={setAppointmentDialogOpen}
        client={selectedClient}
        onSave={handleSaveAppointment}
      />
    </div>
  );
};

export default Dashboard;
