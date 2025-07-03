
import { useCallback } from 'react';
import { useAppState } from '@/contexts/AppStateContext';
import { Client } from '@/types';
import { clientService } from '@/services/clientService';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export const useClients = () => {
  const { state, dispatch, actions } = useAppState();

  const clients = state.clients;
  const loading = state.loading.clients;
  const error = state.errors.clients;

  const createClient = useCallback(async (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    try {
      const newClient: Client = {
        ...clientData,
        id: uuidv4(),
        createdAt: new Date(),
        loyaltyPoints: 0,
        loyaltyLevel: 'Bronze',
      };

      // Try Supabase first
      const { data, error } = await clientService.createClient(newClient);
      
      if (!error && data) {
        dispatch({ type: 'ADD_CLIENT', client: data });
        toast.success('Cliente criado com sucesso!');
        return data;
      } else {
        // Fallback to localStorage
        dispatch({ type: 'ADD_CLIENT', client: newClient });
        const updatedClients = [...clients, newClient];
        localStorage.setItem('nail-clients', JSON.stringify(updatedClients));
        toast.success('Cliente criado com sucesso!');
        return newClient;
      }
    } catch (error) {
      toast.error('Erro ao criar cliente');
      throw error;
    }
  }, [clients, dispatch]);

  const updateClient = useCallback(async (clientData: Client) => {
    try {
      // Try Supabase first
      const { data, error } = await clientService.updateClient(clientData);
      
      if (!error && data) {
        dispatch({ type: 'UPDATE_CLIENT', client: data });
        toast.success('Cliente atualizado com sucesso!');
        return data;
      } else {
        // Fallback to localStorage
        dispatch({ type: 'UPDATE_CLIENT', client: clientData });
        const updatedClients = clients.map(client => 
          client.id === clientData.id ? clientData : client
        );
        localStorage.setItem('nail-clients', JSON.stringify(updatedClients));
        toast.success('Cliente atualizado com sucesso!');
        return clientData;
      }
    } catch (error) {
      toast.error('Erro ao atualizar cliente');
      throw error;
    }
  }, [clients, dispatch]);

  const deleteClient = useCallback(async (clientId: string) => {
    try {
      // Try Supabase first
      const { error } = await clientService.deleteClient(clientId);
      
      if (!error) {
        dispatch({ type: 'DELETE_CLIENT', clientId });
        toast.success('Cliente excluído com sucesso!');
      } else {
        // Fallback to localStorage
        dispatch({ type: 'DELETE_CLIENT', clientId });
        const updatedClients = clients.filter(client => client.id !== clientId);
        localStorage.setItem('nail-clients', JSON.stringify(updatedClients));
        toast.success('Cliente excluído com sucesso!');
      }
    } catch (error) {
      toast.error('Erro ao excluir cliente');
      throw error;
    }
  }, [clients, dispatch]);

  const getClientById = useCallback((clientId: string) => {
    return clients.find(client => client.id === clientId);
  }, [clients]);

  const searchClients = useCallback((searchTerm: string) => {
    return clients.filter(client => 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm)
    );
  }, [clients]);

  const getTopClients = useCallback((limit = 5, appointments: any[] = []) => {
    return clients
      .map(client => {
        const clientAppointments = appointments.filter(
          app => app.clientId === client.id && app.status === 'completed'
        );
        const totalSpent = clientAppointments.reduce((sum, app) => sum + (app.price || 0), 0);
        return {
          ...client,
          stats: {
            appointmentCount: clientAppointments.length,
            totalSpent
          }
        };
      })
      .sort((a, b) => b.stats.totalSpent - a.stats.totalSpent)
      .slice(0, limit);
  }, [clients]);

  const refresh = actions.refreshClients;

  return {
    clients,
    loading,
    error,
    createClient,
    updateClient,
    deleteClient,
    getClientById,
    searchClients,
    getTopClients,
    refresh,
  };
};
