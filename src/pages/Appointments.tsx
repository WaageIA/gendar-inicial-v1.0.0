
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import AppointmentCard from '@/components/AppointmentCard';
import AppointmentCalendar from '@/components/AppointmentCalendar';
import DeleteAppointmentDialog from '@/components/DeleteAppointmentDialog';
import AppointmentStats from '@/components/AppointmentStats';
import { Client, Appointment } from '@/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import LoyaltySystem from '@/components/LoyaltySystem';
import { useAppointments } from '@/hooks/use-appointments';

const Appointments = () => {
  console.log('[Agendamentos] Inicializando página de agendamentos');
  
  const [clients, setClients] = useState<Client[]>(() => {
    const savedClients = localStorage.getItem('nail-clients');
    return savedClients ? JSON.parse(savedClients) : [];
  });
  
  const {
    appointments,
    todayAppointments,
    upcomingAppointments,
    pastAppointments,
    completedAppointments,
    cancelledAppointments,
    loading,
    changeAppointmentStatus,
    refreshAppointments
  } = useAppointments();
  
  const [filter, setFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClient, setSelectedClient] = useState<Client | undefined>(undefined);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeTab, setActiveTab] = useState<'list' | 'calendar' | 'loyalty'>('list');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  
  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const handleCancelAppointment = async (appointment: Appointment) => {
    console.log('[Agendamentos] Cancelando agendamento:', appointment.id);
    await changeAppointmentStatus(appointment, 'cancelled');
  };

  const handleCompleteAppointment = async (appointment: Appointment) => {
    console.log('[Agendamentos] Concluindo agendamento:', appointment.id);
    await changeAppointmentStatus(appointment, 'completed');
  };

  const handleDeleteAppointment = (appointment: Appointment) => {
    console.log('[Agendamentos] Preparando exclusão do agendamento:', appointment.id);
    setAppointmentToDelete(appointment);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteAppointment = async () => {
    if (!appointmentToDelete) return;
    
    console.log('[Agendamentos] Confirmando exclusão do agendamento:', appointmentToDelete.id);
    
    try {
      // Se estamos usando Supabase, usar o serviço
      if (window.location.hostname !== 'localhost') {
        const { appointmentService } = await import('@/services/appointmentService');
        const { error } = await appointmentService.deleteAppointment(appointmentToDelete.id);
        if (error) {
          console.error('[Agendamentos] Erro ao excluir agendamento:', error);
          toast.error('Erro ao excluir agendamento');
          return;
        }
        await refreshAppointments();
      } else {
        // Fallback para localStorage
        const savedAppointments = localStorage.getItem('nail-appointments');
        if (savedAppointments) {
          const appointmentsList = JSON.parse(savedAppointments);
          const updatedAppointments = appointmentsList.filter((app: Appointment) => app.id !== appointmentToDelete.id);
          localStorage.setItem('nail-appointments', JSON.stringify(updatedAppointments));
        }
        // Refresh da página para atualizar a lista
        window.location.reload();
      }
      
      toast.success('Agendamento excluído com sucesso!');
      console.log('[Agendamentos] Agendamento excluído com sucesso');
    } catch (error) {
      console.error('[Agendamentos] Erro ao excluir agendamento:', error);
      toast.error('Erro ao excluir agendamento');
    } finally {
      setDeleteDialogOpen(false);
      setAppointmentToDelete(null);
    }
  };
  
  const handleClientSelect = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    setSelectedClient(client);
    console.log('[Agendamentos] Cliente selecionado:', client?.name);
  };
  
  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'all') return true;
    if (filter === 'scheduled') return appointment.status === 'scheduled';
    if (filter === 'completed') return appointment.status === 'completed';
    if (filter === 'cancelled') return appointment.status === 'cancelled';
    return true;
  });
  
  // Sort by date (most recent first)
  const sortedAppointments = [...filteredAppointments].sort((a, b) => 
    b.date.getTime() - a.date.getTime()
  );

  const getAppointmentStats = () => {
    console.log('[Agendamentos] Calculando estatísticas dos agendamentos');
    const scheduled = appointments.filter(app => app.status === 'scheduled').length;
    const completed = appointments.filter(app => app.status === 'completed').length;
    const cancelled = appointments.filter(app => app.status === 'cancelled').length;
    
    const stats = { scheduled, completed, cancelled, total: appointments.length };
    console.log('[Agendamentos] Estatísticas calculadas:', stats);
    return stats;
  };
  
  const stats = getAppointmentStats();

  if (loading) {
    console.log('[Agendamentos] Carregando agendamentos...');
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg animate-fade-in">Carregando agendamentos...</div>
        </div>
      </Layout>
    );
  }

  console.log('[Agendamentos] Renderizando página com', appointments.length, 'agendamentos');

  return (
    <Layout>
      <div className="space-y-8">
        <div className="px-4">
          <h1 className="text-3xl font-bold text-nail-primary">Agendamentos</h1>
        </div>
        
        <AppointmentStats stats={stats} />
        
        {isMobile && (
          <div className="flex border-b border-nail-secondary mb-6 mx-4">
            <button 
              className={`flex-1 py-2 px-4 text-center text-sm font-medium ${activeTab === 'list' ? 'border-b-2 border-nail-primary text-nail-primary' : 'text-gray-500'}`}
              onClick={() => setActiveTab('list')}
            >
              Lista
            </button>
            <button 
              className={`flex-1 py-2 px-4 text-center text-sm font-medium ${activeTab === 'calendar' ? 'border-b-2 border-nail-primary text-nail-primary' : 'text-gray-500'}`}
              onClick={() => setActiveTab('calendar')}
            >
              Calendário
            </button>
            <button 
              className={`flex-1 py-2 px-4 text-center text-sm font-medium ${activeTab === 'loyalty' ? 'border-b-2 border-nail-primary text-nail-primary' : 'text-gray-500'}`}
              onClick={() => setActiveTab('loyalty')}
            >
              Fidelidade
            </button>
          </div>
        )}
        
        <div className={`grid grid-cols-1 ${!isMobile ? 'md:grid-cols-3 gap-8' : 'gap-6'} px-4`}>
          {/* Lista de Agendamentos */}
          {(!isMobile || activeTab === 'list') && (
            <div className={`space-y-6 ${!isMobile ? 'md:col-span-2' : ''}`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-nail-dark">Lista de Agendamentos</h2>
                
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] nail-input">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Agendamentos</SelectItem>
                    <SelectItem value="scheduled">Agendados</SelectItem>
                    <SelectItem value="completed">Concluídos</SelectItem>
                    <SelectItem value="cancelled">Cancelados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                {sortedAppointments.length > 0 ? (
                  sortedAppointments.map((appointment, index) => (
                    <div 
                      key={appointment.id}
                      style={{ animationDelay: `${index * 50}ms` }}
                      className="animate-fade-in"
                    >
                      <AppointmentCard
                        appointment={appointment}
                        onCancelClick={handleCancelAppointment}
                        onCompleteClick={handleCompleteAppointment}
                        onDeleteClick={handleDeleteAppointment}
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <p className="text-muted-foreground">Nenhum agendamento encontrado.</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className={`space-y-6 ${!isMobile ? '' : activeTab !== 'list' ? 'block' : 'hidden'}`}>
            {(!isMobile || activeTab === 'calendar') && (
              <AppointmentCalendar 
                appointments={appointments}
                onDaySelect={setSelectedDate}
                selectedDate={selectedDate}
              />
            )}
            
            {(!isMobile || activeTab === 'loyalty') && (
              <>
                <div className="mb-4">
                  <label htmlFor="client-select" className="block text-sm font-medium mb-2">
                    Selecione um cliente para ver pontos de fidelidade
                  </label>
                  <Select onValueChange={handleClientSelect}>
                    <SelectTrigger className="w-full nail-input">
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <LoyaltySystem 
                  client={selectedClient} 
                  appointments={appointments}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <DeleteAppointmentDialog
        appointment={appointmentToDelete}
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setAppointmentToDelete(null);
        }}
        onConfirm={confirmDeleteAppointment}
      />
    </Layout>
  );
};

export default Appointments;
