
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      "https://fpvuxomxkjoewpgnhodw.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwdnV4b214a2pvZXdwZ25ob2R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0MzY1ODMsImV4cCI6MjA2MzAxMjU4M30.LuT1GB7yV4wX9nleSp0wL8dDM081CnVO6M4935qBZek"
    );

    const url = new URL(req.url);
    const endpoint = url.pathname.split('/').pop();

    if (endpoint === 'pending-notifications') {
      // Retorna clientes que precisam de lembrete de manutenção
      const fifteenDaysAgo = new Date();
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('*, clients(name, phone)')
        .eq('status', 'completed')
        .lt('date', fifteenDaysAgo.toISOString());

      if (error) {
        throw error;
      }

      // Verificar quais já têm notificação pendente
      const clientIds = appointments.map(apt => apt.client_id);
      const { data: existingNotifications } = await supabase
        .from('notifications')
        .select('client_id')
        .in('client_id', clientIds)
        .eq('type', 'maintenance_reminder')
        .in('status', ['pending', 'sent']);

      const existingClientIds = existingNotifications?.map(n => n.client_id) || [];
      
      const clientsNeedingReminder = appointments
        .filter(apt => !existingClientIds.includes(apt.client_id))
        .map(apt => ({
          client_id: apt.client_id,
          client_name: apt.client_name,
          appointment_id: apt.id,
          last_service_date: apt.date,
          service: apt.service
        }));

      return new Response(JSON.stringify(clientsNeedingReminder), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (endpoint === 'mark-notification-sent' && req.method === 'POST') {
      const { client_id, execution_id, message_sent } = await req.json();

      // Criar registro de notificação enviada
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          client_id,
          client_name: '', // Será preenchido pelo trigger ou atualizado depois
          type: 'maintenance_reminder',
          template_message: message_sent || 'Lembrete de manutenção enviado',
          scheduled_for: new Date().toISOString(),
          sent_at: new Date().toISOString(),
          status: 'sent',
          n8n_workflow_execution_id: execution_id
        });

      if (error) {
        throw error;
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (endpoint === 'financial-summary') {
      const { data: transactions, error } = await supabase
        .from('financial_transactions')
        .select('type, amount, transaction_date');

      if (error) {
        throw error;
      }

      const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return new Response(JSON.stringify({
        income,
        expenses,
        profit: income - expenses,
        transaction_count: transactions.length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Endpoint não encontrado' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in n8n-integration function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})
