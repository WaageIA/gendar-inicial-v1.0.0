
import { useCallback } from 'react';
import { useAppState } from '@/contexts/AppStateContext';
import { FinancialTransaction, Expense } from '@/types';
import { financialService } from '@/services/financialService';
import { expenseService } from '@/services/expenseService';
import { toast } from 'sonner';

export const useFinancial = () => {
  const { state, dispatch, actions } = useAppState();

  const transactions = state.transactions;
  const expenses = state.expenses;
  const loading = {
    transactions: state.loading.transactions,
    expenses: state.loading.expenses,
  };
  const errors = {
    transactions: state.errors.transactions,
    expenses: state.errors.expenses,
  };

  const createTransaction = useCallback(async (transactionData: Omit<FinancialTransaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await financialService.createTransaction(transactionData);
      
      if (!error && data) {
        dispatch({ type: 'ADD_TRANSACTION', transaction: data });
        toast.success('Transação criada com sucesso!');
        return data;
      } else {
        throw new Error(error || 'Erro ao criar transação');
      }
    } catch (error) {
      toast.error('Erro ao criar transação');
      throw error;
    }
  }, [dispatch]);

  const createExpense = useCallback(async (expenseData: Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await expenseService.createExpense(expenseData);
      
      if (!error && data) {
        dispatch({ type: 'ADD_EXPENSE', expense: data });
        toast.success('Despesa criada com sucesso!');
        return data;
      } else {
        throw new Error(error || 'Erro ao criar despesa');
      }
    } catch (error) {
      toast.error('Erro ao criar despesa');
      throw error;
    }
  }, [dispatch]);

  const getFinancialSummary = useCallback(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const totalExpenses = expenses
      .reduce((sum, e) => sum + Number(e.amount), 0);
    
    const totalTransactionExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const totalAllExpenses = totalExpenses + totalTransactionExpenses;
    const netProfit = totalIncome - totalAllExpenses;
    
    return {
      totalIncome,
      totalExpenses: totalAllExpenses,
      netProfit,
      transactionCount: transactions.length,
      expenseCount: expenses.length,
    };
  }, [transactions, expenses]);

  const getIncomeByPeriod = useCallback((startDate: Date, endDate: Date) => {
    return transactions
      .filter(t => 
        t.type === 'income' && 
        new Date(t.transaction_date) >= startDate && 
        new Date(t.transaction_date) <= endDate
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions]);

  const getExpensesByCategory = useCallback(() => {
    const categoryTotals: Record<string, number> = {};
    
    expenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + Number(expense.amount);
    });
    
    return Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount,
    }));
  }, [expenses]);

  const getRecentTransactions = useCallback((limit = 10) => {
    return [...transactions]
      .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
      .slice(0, limit);
  }, [transactions]);

  const refreshTransactions = actions.refreshTransactions;
  const refreshExpenses = actions.refreshExpenses;

  return {
    transactions,
    expenses,
    loading,
    errors,
    createTransaction,
    createExpense,
    getFinancialSummary,
    getIncomeByPeriod,
    getExpensesByCategory,
    getRecentTransactions,
    refreshTransactions,
    refreshExpenses,
  };
};
