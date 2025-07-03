
import { supabase } from '@/integrations/supabase/client';
import { Client, LoyaltyLevel } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

export const clientService = {
  // Get all clients for the current user
  async getClients() {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        return { data: [], error: 'Usuário não autenticado' };
      }

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clients:', error);
        return { data: [], error: error.message };
      }

      // Convert date strings to Date objects
      const clients = data.map(client => ({
        ...client,
        createdAt: new Date(client.created_at),
        id: client.id
      })) as Client[];

      return { data: clients, error: null };
    } catch (error: any) {
      console.error('Error in getClients:', error);
      return { data: [], error: error.message };
    }
  },

  // Create a new client
  async createClient(client: Omit<Client, 'id' | 'createdAt' | 'user_id'>) {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        return { data: null, error: 'Usuário não autenticado' };
      }

      // Ensure loyaltyLevel is a valid LoyaltyLevel
      const loyaltyLevel: LoyaltyLevel = (client.loyaltyLevel || 'Bronze') as LoyaltyLevel;

      const { data, error } = await supabase.from('clients').insert({
        name: client.name,
        phone: client.phone,
        email: client.email,
        rating: client.rating,
        notes: client.notes || null,
        indicated_by: client.indicatedBy || null,
        indicated_by_name: client.indicatedByName || null,
        loyalty_points: client.loyaltyPoints || 0,
        loyalty_level: loyaltyLevel,
        user_id: userData.user.id
      }).select().single();

      if (error) {
        console.error('Error creating client:', error);
        return { data: null, error: error.message };
      }

      // Convert to Client type
      const newClient: Client = {
        id: data.id,
        name: data.name,
        phone: data.phone,
        email: data.email,
        rating: data.rating,
        notes: data.notes,
        createdAt: new Date(data.created_at),
        indicatedBy: data.indicated_by,
        indicatedByName: data.indicated_by_name,
        loyaltyPoints: data.loyalty_points,
        loyaltyLevel: data.loyalty_level as LoyaltyLevel,
        user_id: data.user_id
      };

      toast.success('Cliente criado com sucesso!');
      return { data: newClient, error: null };
    } catch (error: any) {
      console.error('Error in createClient:', error);
      toast.error('Erro ao criar cliente');
      return { data: null, error: error.message };
    }
  },

  // Update a client
  async updateClient(client: Client) {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        return { data: null, error: 'Usuário não autenticado' };
      }

      // Ensure loyaltyLevel is a valid LoyaltyLevel
      const loyaltyLevel: LoyaltyLevel = client.loyaltyLevel as LoyaltyLevel;

      const { data, error } = await supabase
        .from('clients')
        .update({
          name: client.name,
          phone: client.phone,
          email: client.email,
          rating: client.rating,
          notes: client.notes,
          indicated_by: client.indicatedBy,
          indicated_by_name: client.indicatedByName,
          loyalty_points: client.loyaltyPoints,
          loyalty_level: loyaltyLevel
        })
        .eq('id', client.id)
        .eq('user_id', userData.user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating client:', error);
        return { data: null, error: error.message };
      }

      // Convert to Client type
      const updatedClient: Client = {
        id: data.id,
        name: data.name,
        phone: data.phone,
        email: data.email,
        rating: data.rating,
        notes: data.notes,
        createdAt: new Date(data.created_at),
        indicatedBy: data.indicated_by,
        indicatedByName: data.indicated_by_name,
        loyaltyPoints: data.loyalty_points,
        loyaltyLevel: data.loyalty_level as LoyaltyLevel,
        user_id: data.user_id
      };

      toast.success('Cliente atualizado com sucesso!');
      return { data: updatedClient, error: null };
    } catch (error: any) {
      console.error('Error in updateClient:', error);
      toast.error('Erro ao atualizar cliente');
      return { data: null, error: error.message };
    }
  },

  // Delete a client
  async deleteClient(id: string) {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        return { error: 'Usuário não autenticado' };
      }

      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)
        .eq('user_id', userData.user.id);

      if (error) {
        console.error('Error deleting client:', error);
        return { error: error.message };
      }

      toast.success('Cliente excluído com sucesso!');
      return { error: null };
    } catch (error: any) {
      console.error('Error in deleteClient:', error);
      toast.error('Erro ao excluir cliente');
      return { error: error.message };
    }
  },

  // Migrate clients from localStorage to Supabase
  async migrateClientsFromLocalStorage() {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        return { error: 'Usuário não autenticado' };
      }

      // Get clients from localStorage
      const savedClients = localStorage.getItem('nail-clients');
      if (!savedClients) {
        return { error: null, message: 'Nenhum cliente para migrar' };
      }

      const clients = JSON.parse(savedClients) as Client[];
      if (clients.length === 0) {
        return { error: null, message: 'Nenhum cliente para migrar' };
      }

      // Prepare clients for insert
      const clientsToInsert = clients.map(client => ({
        name: client.name,
        phone: client.phone,
        email: client.email,
        rating: client.rating,
        notes: client.notes || null,
        indicated_by: client.indicatedBy || null,
        indicated_by_name: client.indicatedByName || null,
        loyalty_points: client.loyaltyPoints || 0,
        loyalty_level: client.loyaltyLevel || 'Bronze',
        user_id: userData.user.id,
        // Generate a new UUID to avoid conflicts, but keep it in a map for reference
        id: client.id // We'll preserve the original ID for reference in appointments
      }));

      // Insert all clients
      const { data, error } = await supabase
        .from('clients')
        .insert(clientsToInsert)
        .select();

      if (error) {
        console.error('Error migrating clients:', error);
        return { error: error.message };
      }

      toast.success(`${data.length} clientes migrados com sucesso!`);
      return { error: null, data };
    } catch (error: any) {
      console.error('Error in migrateClientsFromLocalStorage:', error);
      toast.error('Erro ao migrar clientes');
      return { error: error.message };
    }
  }
};
