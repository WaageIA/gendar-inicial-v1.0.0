import React, { useState } from 'react';
import Layout from '@/components/Layout';
import ClientsManager from '@/components/ClientsManager';
import ClientForm from '@/components/ClientForm';
import AppointmentDialog from '@/components/AppointmentDialog';
import DeleteClientDialog from '@/components/DeleteClientDialog';
import WhatsAppReminderDialog from '@/components/WhatsAppReminderDialog';
import { Client, Appointment } from '@/types';
import { useClients } from '@/hooks/useClients';
import { useAppointments } from '@/hooks/use-appointments';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { toast } from 'sonner';
const Clients = () => {
  const {
    clients,
    loading,
    error,
    createClient,
    updateClient,
    deleteClient
  } = useClients();
  const {
    createAppointment,
    refreshAppointments
  } = useAppointments();
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | undefined>();
  const [clientToSchedule, setClientToSchedule] = useState<Client | undefined>();
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [clientForWhatsApp, setClientForWhatsApp] = useState<Client | null>(null);
  const handleSaveClient = async (clientData: Client) => {
    // Convert "none" value to empty string for indicatedBy
    const processedClientData = {
      ...clientData,
      indicatedBy: clientData.indicatedBy === 'none' ? undefined : clientData.indicatedBy,
      indicatedByName: clientData.indicatedBy === 'none' ? undefined : clientData.indicatedByName
    };
    try {
      if (clientToEdit) {
        await updateClient(processedClientData);
      } else {
        await createClient(processedClientData);
      }
      setIsAddingClient(false);
      setClientToEdit(undefined);
    } catch (error) {
      console.error('Error saving client:', error);
    }
  };
  const handleDeleteClient = async () => {
    if (!clientToDelete) return;
    try {
      await deleteClient(clientToDelete.id);
      setClientToDelete(null);
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };
  const handleSaveAppointment = async (appointmentData: Omit<Appointment, 'id' | 'user_id'>) => {
    console.log('[Clients] Salvando novo agendamento:', appointmentData);
    try {
      const result = await createAppointment(appointmentData);
      if (result) {
        toast.success('Agendamento criado com sucesso!');
        await refreshAppointments();
        setClientToSchedule(undefined);
      } else {
        toast.error('Erro ao criar agendamento');
      }
    } catch (error) {
      console.error('[Clients] Erro ao criar agendamento:', error);
      toast.error('Erro ao criar agendamento');
    }
  };
  if (loading) {
    return <Layout>
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-nail-primary">Clientes</h1>
          </div>
          <LoadingState type="list" count={6} />
        </div>
      </Layout>;
  }
  if (error) {
    return <Layout>
        <div className="space-y-8">
          <h1 className="text-3xl font-bold text-nail-primary">Clientes</h1>
          <ErrorState title="Erro ao carregar clientes" message="Não foi possível carregar a lista de clientes. Verifique sua conexão." onRetry={() => window.location.reload()} />
        </div>
      </Layout>;
  }
  return <Layout>
      <div className="space-y-8">
        
        
        <ClientsManager clients={clients} appointments={[]} onAddClient={() => {
        setClientToEdit(undefined);
        setIsAddingClient(true);
      }} onEditClient={client => {
        setClientToEdit(client);
        setIsAddingClient(true);
      }} onScheduleAppointment={client => {
        console.log('[Clients] Cliente selecionado para agendamento:', client.name);
        setClientToSchedule(client);
      }} onDeleteClient={client => {
        setClientToDelete(client);
      }} onWhatsAppReminder={client => {
        setClientForWhatsApp(client);
      }} />
        
        <ClientForm open={isAddingClient} onOpenChange={setIsAddingClient} client={clientToEdit} onSave={handleSaveClient} clients={clients} />
        
        <AppointmentDialog open={!!clientToSchedule} onOpenChange={open => !open && setClientToSchedule(undefined)} client={clientToSchedule} onSave={handleSaveAppointment} />
        
        <DeleteClientDialog client={clientToDelete} open={!!clientToDelete} onOpenChange={open => !open && setClientToDelete(null)} onDeleted={handleDeleteClient} />
        
        <WhatsAppReminderDialog client={clientForWhatsApp} open={!!clientForWhatsApp} onOpenChange={open => !open && setClientForWhatsApp(null)} />
      </div>
    </Layout>;
};
export default Clients;