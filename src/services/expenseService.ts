
import { supabase } from '@/integrations/supabase/client';
import { Expense, ExpenseCategory } from '@/types';
import { toast } from 'sonner';

export const expenseService = {
  async getExpenses() {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        return { data: [], error: 'Usuário não autenticado' };
      }

      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userData.user.id) // SECURITY FIX: Filter by user_id
        .order('expense_date', { ascending: false });

      if (error) {
        console.error('Error fetching expenses:', error);
        return { data: [], error: error.message };
      }

      const expenses = data.map(expense => ({
        ...expense,
        category: expense.category as ExpenseCategory,
        expense_date: new Date(expense.expense_date),
        created_at: new Date(expense.created_at),
        updated_at: new Date(expense.updated_at),
      })) as Expense[];

      return { data: expenses, error: null };
    } catch (error: any) {
      console.error('Error in getExpenses:', error);
      return { data: [], error: error.message };
    }
  },

  async createExpense(expense: Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        return { data: null, error: 'Usuário não autenticado' };
      }

      const { data, error } = await supabase.from('expenses').insert({
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        expense_date: expense.expense_date.toISOString().split('T')[0],
        supplier: expense.supplier || null,
        receipt_url: expense.receipt_url || null,
        notes: expense.notes || null,
        user_id: userData.user.id
      }).select().single();

      if (error) {
        console.error('Error creating expense:', error);
        return { data: null, error: error.message };
      }

      const newExpense: Expense = {
        ...data,
        category: data.category as ExpenseCategory,
        expense_date: new Date(data.expense_date),
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
      };

      toast.success('Despesa criada com sucesso!');
      return { data: newExpense, error: null };
    } catch (error: any) {
      console.error('Error in createExpense:', error);
      toast.error('Erro ao criar despesa');
      return { data: null, error: error.message };
    }
  },

  async updateExpense(expense: Expense) {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        return { data: null, error: 'Usuário não autenticado' };
      }

      const { data, error } = await supabase
        .from('expenses')
        .update({
          category: expense.category,
          description: expense.description,
          amount: expense.amount,
          expense_date: expense.expense_date.toISOString().split('T')[0],
          supplier: expense.supplier,
          receipt_url: expense.receipt_url,
          notes: expense.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', expense.id)
        .eq('user_id', userData.user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating expense:', error);
        return { data: null, error: error.message };
      }

      toast.success('Despesa atualizada com sucesso!');
      return { data, error: null };
    } catch (error: any) {
      console.error('Error in updateExpense:', error);
      toast.error('Erro ao atualizar despesa');
      return { data: null, error: error.message };
    }
  },

  async deleteExpense(id: string) {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        return { error: 'Usuário não autenticado' };
      }

      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', userData.user.id);

      if (error) {
        console.error('Error deleting expense:', error);
        return { error: error.message };
      }

      toast.success('Despesa excluída com sucesso!');
      return { error: null };
    } catch (error: any) {
      console.error('Error in deleteExpense:', error);
      toast.error('Erro ao excluir despesa');
      return { error: error.message };
    }
  }
};
