import { DigitalBusinessCard } from '@/types';
import { supabase } from '@/integrations/supabase/client-enhanced';

const TABLE_NAME = 'digital_business_cards'; // Nome da tabela no Supabase

export const digitalBusinessCardService = {
  async getCardSettings(): Promise<{ data: DigitalBusinessCard | null; error: any }> {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        return { data: null, error: userError || new Error('Usuário não autenticado.') };
      }

      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('user_id', userData.user.id)
        .eq('id', 'default') // Busca o cartão padrão do usuário
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = "no rows found"
        throw error;
      }

      return { data: data as DigitalBusinessCard, error: null };
    } catch (error) {
      console.error('Erro ao buscar configurações do cartão digital:', error);
      return { data: null, error };
    }
  },

  async saveCardSettings(settings: DigitalBusinessCard): Promise<{ data: DigitalBusinessCard | null; error: any }> {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        return { data: null, error: userError || new Error('Usuário não autenticado.') };
      }

      const settingsToSave = {
        ...settings,
        user_id: userData.user.id, // Adiciona o user_id ao objeto a ser salvo
      };

      const { data, error } = await supabase
        .from(TABLE_NAME)
        .upsert(settingsToSave, { onConflict: 'user_id,id' }) // Usa a chave primária composta para upsert
        .single();

      if (error) {
        throw error;
      }

      return { data: data as DigitalBusinessCard, error: null };
    } catch (error) {
      console.error('Erro ao salvar configurações do cartão digital:', error);
      return { data: null, error };
    }
  },

  // Funções de placeholder para geração de QR Code e URL
  async generateQrCode(cardUrl: string): Promise<string | null> {
    // Em um ambiente real, isso seria feito no backend ou com uma API de QR Code
    // Por enquanto, um serviço público simples:
    if (!cardUrl) return null;
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(cardUrl)}`;
  },

  async generateCardUrl(cardId: string): Promise<string> {
    // A URL pública onde o cartão será acessível.
    // Ex: https://seusite.com/card/default
    return `${window.location.origin}/card/${cardId}`;
  }
};