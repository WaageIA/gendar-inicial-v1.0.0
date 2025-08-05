
import { supabase } from '@/integrations/supabase/client-enhanced';
import { FinancialTransaction, TransactionType, PaymentMethod } from '@/types';
import { toast } from 'sonner';

export const financialService = {
  async getTransactions() {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        return { data: [], error: 'Usuário não autenticado' };
      }

      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('user_id', userData.user.id) // SECURITY FIX: Filter by user_id
        .order('transaction_date', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
        return { data: [], error: error.message };
      }

      const transactions = data.map(transaction => ({
        ...transaction,
        type: transaction.type as TransactionType,
        payment_method: transaction.payment_method as PaymentMethod,
        transaction_date: new Date(transaction.transaction_date),
        created_at: new Date(transaction.created_at),
        updated_at: new Date(transaction.updated_at),
      })) as FinancialTransaction[];

      return { data: transactions, error: null };
    } catch (error: any) {
      console.error('Error in getTransactions:', error);
      return { data: [], error: error.message };
    }
  },

  async createTransaction(transaction: Omit<FinancialTransaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        return { data: null, error: 'Usuário não autenticado' };
      }

      const { data, error } = await supabase.from('financial_transactions').insert({
        appointment_id: transaction.appointment_id || null,
        client_id: transaction.client_id,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        payment_method: transaction.payment_method || null,
        transaction_date: transaction.transaction_date.toISOString().split('T')[0],
        user_id: userData.user.id
      }).select().single();

      if (error) {
        console.error('Error creating transaction:', error);
        return { data: null, error: error.message };
      }

      const newTransaction: FinancialTransaction = {
        ...data,
        type: data.type as TransactionType,
        payment_method: data.payment_method as PaymentMethod,
        transaction_date: new Date(data.transaction_date),
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
      };

      toast.success('Transação criada com sucesso!');
      return { data: newTransaction, error: null };
    } catch (error: any) {
      console.error('Error in createTransaction:', error);
      toast.error('Erro ao criar transação');
      return { data: null, error: error.message };
    }
  },

  async getFinancialSummary(startDate?: Date, endDate?: Date) {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        return { data: null, error: 'Usuário não autenticado' };
      }

      let query = supabase
        .from('financial_transactions')
        .select('type, amount, transaction_date')
        .eq('user_id', userData.user.id);

      if (startDate) {
        query = query.gte('transaction_date', startDate.toISOString().split('T')[0]);
      }

      if (endDate) {
        query = query.lte('transaction_date', endDate.toISOString().split('T')[0]);
      }

      const { data: transactions, error } = await query;

      if (error) {
        console.error('Error fetching financial summary:', error);
        return { data: null, error: error.message };
      }

      const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const profit = income - expenses;

      return {
        data: {
          income,
          expenses,
          profit,
          transactionCount: transactions.length
        },
        error: null
      };
    } catch (error: any) {
      console.error('Error in getFinancialSummary:', error);
      return { data: null, error: error.message };
    }
  }
};
