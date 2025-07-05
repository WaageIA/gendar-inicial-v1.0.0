import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, DollarSign, TrendingUp, TrendingDown, Wallet, Receipt, Calendar as CalendarIcon, Edit, Trash2 } from 'lucide-react';
import { expenseService } from '@/services/expenseService';
import { financialService } from '@/services/financialService';
import AppointmentRevenue from '@/components/AppointmentRevenue';
import { Expense, FinancialTransaction, ExpenseCategory, PaymentMethod } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
const Financial = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [summary, setSummary] = useState<{
    income: number;
    expenses: number;
    profit: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: '' as ExpenseCategory,
    description: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    supplier: '',
    notes: ''
  });
  const [newTransaction, setNewTransaction] = useState({
    type: 'income' as 'income' | 'expense',
    amount: '',
    description: '',
    payment_method: '' as PaymentMethod,
    transaction_date: new Date().toISOString().split('T')[0],
    client_id: ''
  });
  useEffect(() => {
    loadData();
  }, []);
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [expensesResult, transactionsResult, summaryResult] = await Promise.all([expenseService.getExpenses(), financialService.getTransactions(), financialService.getFinancialSummary()]);
      if (expensesResult.error) {
        toast.error('Erro ao carregar despesas');
      } else {
        setExpenses(expensesResult.data);
      }
      if (transactionsResult.error) {
        toast.error('Erro ao carregar transações');
      } else {
        setTransactions(transactionsResult.data);
      }
      if (summaryResult.error) {
        toast.error('Erro ao carregar resumo financeiro');
      } else {
        setSummary(summaryResult.data);
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.category || !newExpense.description || !newExpense.amount) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    const {
      data,
      error
    } = await expenseService.createExpense({
      ...newExpense,
      amount: parseFloat(newExpense.amount),
      expense_date: new Date(newExpense.expense_date)
    } as Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at'>);
    if (!error) {
      setNewExpense({
        category: '' as ExpenseCategory,
        description: '',
        amount: '',
        expense_date: new Date().toISOString().split('T')[0],
        supplier: '',
        notes: ''
      });
      loadData();
    }
  };
  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransaction.amount || !newTransaction.description) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    const {
      data,
      error
    } = await financialService.createTransaction({
      ...newTransaction,
      amount: parseFloat(newTransaction.amount),
      transaction_date: new Date(newTransaction.transaction_date),
      client_id: newTransaction.client_id || 'unknown'
    } as Omit<FinancialTransaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>);
    if (!error) {
      setNewTransaction({
        type: 'income',
        amount: '',
        description: '',
        payment_method: '' as PaymentMethod,
        transaction_date: new Date().toISOString().split('T')[0],
        client_id: ''
      });
      loadData();
    }
  };
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  const categoryLabels = {
    esmaltes: 'Esmaltes',
    ferramentas: 'Ferramentas',
    equipamentos: 'Equipamentos',
    produtos_higiene: 'Produtos de Higiene',
    marketing: 'Marketing',
    aluguel: 'Aluguel',
    outros: 'Outros'
  };
  const paymentMethodLabels = {
    dinheiro: 'Dinheiro',
    pix: 'PIX',
    cartao_debito: 'Cartão de Débito',
    cartao_credito: 'Cartão de Crédito',
    transferencia: 'Transferência'
  };
  return <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold gold-text">Controle Financeiro</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarIcon className="h-4 w-4" />
            <span>{format(new Date(), 'PPP', {
              locale: ptBR
            })}</span>
          </div>
        </div>
        
        {/* Resumo Financeiro */}
        {summary && <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hoverable-gold">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Receita Total</p>
                    <p className="text-3xl font-bold text-completed">{formatCurrency(summary.income)}</p>
                    <p className="text-xs text-muted-foreground mt-1">Este mês</p>
                  </div>
                  <div className="p-3 bg-completed/20 rounded-full">
                    <TrendingUp className="h-8 w-8 text-completed" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hoverable-gold">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Despesas Totais</p>
                    <p className="text-3xl font-bold text-destructive">{formatCurrency(summary.expenses)}</p>
                    <p className="text-xs text-muted-foreground mt-1">Este mês</p>
                  </div>
                  <div className="p-3 bg-destructive/20 rounded-full">
                    <TrendingDown className="h-8 w-8 text-destructive" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hoverable-gold">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Lucro Líquido</p>
                    <p className={`text-3xl font-bold ${summary.profit >= 0 ? 'text-completed' : 'text-destructive'}`}>
                      {formatCurrency(summary.profit)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Este mês</p>
                  </div>
                  <div className={`p-3 rounded-full ${summary.profit >= 0 ? 'bg-completed/20' : 'bg-destructive/20'}`}>
                    <Wallet className={`h-8 w-8 ${summary.profit >= 0 ? 'text-completed' : 'text-destructive'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>}

        <Tabs defaultValue="appointment-revenue" className="space-y-6">
          <TabsList className="flex w-full justify-between items-center gap-2 bg-nail-light rounded-md p-2">
            <TabsTrigger value="appointment-revenue" className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-md hover:bg-nail transition text-slate-950 data-[state=active]:bg-nail-primary data-[state=active]:text-white data-[state=active]:font-semibold">
              <DollarSign className="h-4 w-4" />
              Receitas de Agendamentos
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-md hover:bg-nail transition text-slate-950 data-[state=active]:bg-nail-primary data-[state=active]:text-white data-[state=active]:font-semibold">
              <Receipt className="h-4 w-4" />
              Despesas
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-md hover:bg-nail transition text-slate-950 data-[state=active]:bg-nail-primary data-[state=active]:text-white data-[state=active]:font-semibold">
              <DollarSign className="h-4 w-4" />
              Todas as Transações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appointment-revenue" className="space-y-6">
            <AppointmentRevenue />
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6">
            {/* Adicionar Despesa */}
            <Card className="border-nail-secondary">
              <CardHeader className="bg-nail-light/50">
                <CardTitle className="flex items-center text-nail-dark">
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Nova Despesa
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleCreateExpense} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="category" className="text-nail-dark font-medium">Categoria *</Label>
                      <Select value={newExpense.category} onValueChange={value => setNewExpense({
                      ...newExpense,
                      category: value as ExpenseCategory
                    })}>
                        <SelectTrigger className="mt-1 border-nail-secondary focus:ring-nail-primary">
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(categoryLabels).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="amount" className="text-nail-dark font-medium">Valor *</Label>
                      <Input id="amount" type="number" step="0.01" placeholder="0,00" value={newExpense.amount} onChange={e => setNewExpense({
                      ...newExpense,
                      amount: e.target.value
                    })} className="mt-1 border-nail-secondary focus:ring-nail-primary" />
                    </div>
                    
                    <div>
                      <Label htmlFor="expense_date" className="text-nail-dark font-medium">Data</Label>
                      <Input id="expense_date" type="date" value={newExpense.expense_date} onChange={e => setNewExpense({
                      ...newExpense,
                      expense_date: e.target.value
                    })} className="mt-1 border-nail-secondary focus:ring-nail-primary" />
                    </div>
                    
                    <div>
                      <Label htmlFor="description" className="text-nail-dark font-medium">Descrição *</Label>
                      <Input id="description" placeholder="Descrição da despesa" value={newExpense.description} onChange={e => setNewExpense({
                      ...newExpense,
                      description: e.target.value
                    })} className="mt-1 border-nail-secondary focus:ring-nail-primary" />
                    </div>
                    
                    <div>
                      <Label htmlFor="supplier" className="text-nail-dark font-medium">Fornecedor</Label>
                      <Input id="supplier" placeholder="Nome do fornecedor" value={newExpense.supplier} onChange={e => setNewExpense({
                      ...newExpense,
                      supplier: e.target.value
                    })} className="mt-1 border-nail-secondary focus:ring-nail-primary" />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="notes" className="text-nail-dark font-medium">Observações</Label>
                    <Textarea id="notes" placeholder="Observações adicionais..." value={newExpense.notes} onChange={e => setNewExpense({
                    ...newExpense,
                    notes: e.target.value
                  })} className="mt-1 border-nail-secondary focus:ring-nail-primary" rows={3} />
                  </div>
                  
                  <Button type="submit" className="w-full nail-button">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Adicionar Despesa
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Lista de Despesas */}
            <Card className="border-nail-secondary">
              <CardHeader className="bg-nail-light/50">
                <CardTitle className="text-nail-dark">Despesas Recentes</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {expenses.length === 0 ? <div className="text-center py-12">
                    <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhuma despesa encontrada</p>
                  </div> : <div className="divide-y divide-nail-secondary">
                    {expenses.map(expense => <div key={expense.id} className="p-4 hover:bg-nail-light/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center space-x-3">
                              <p className="font-medium text-nail-dark">{expense.description}</p>
                              <Badge variant="outline" className="border-nail-primary text-nail-primary">
                                {categoryLabels[expense.category]}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                {format(expense.expense_date, 'PPP', {
                            locale: ptBR
                          })}
                              </span>
                              {expense.supplier && <span>Fornecedor: {expense.supplier}</span>}
                            </div>
                            {expense.notes && <p className="text-sm text-muted-foreground italic">
                                {expense.notes}
                              </p>}
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-destructive text-lg">
                              -{formatCurrency(expense.amount)}
                            </p>
                          </div>
                        </div>
                      </div>)}
                  </div>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            {/* Adicionar Transação */}
            <Card className="border-nail-secondary">
              <CardHeader className="bg-nail-light/50">
                <CardTitle className="flex items-center text-nail-dark">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Nova Transação
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleCreateTransaction} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="type" className="text-nail-dark font-medium">Tipo *</Label>
                      <Select value={newTransaction.type} onValueChange={value => setNewTransaction({
                      ...newTransaction,
                      type: value as 'income' | 'expense'
                    })}>
                        <SelectTrigger className="mt-1 border-nail-secondary focus:ring-nail-primary">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">Receita</SelectItem>
                          <SelectItem value="expense">Despesa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="transaction_amount" className="text-nail-dark font-medium">Valor *</Label>
                      <Input id="transaction_amount" type="number" step="0.01" placeholder="0,00" value={newTransaction.amount} onChange={e => setNewTransaction({
                      ...newTransaction,
                      amount: e.target.value
                    })} className="mt-1 border-nail-secondary focus:ring-nail-primary" />
                    </div>
                    
                    <div>
                      <Label htmlFor="transaction_date" className="text-nail-dark font-medium">Data</Label>
                      <Input id="transaction_date" type="date" value={newTransaction.transaction_date} onChange={e => setNewTransaction({
                      ...newTransaction,
                      transaction_date: e.target.value
                    })} className="mt-1 border-nail-secondary focus:ring-nail-primary" />
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor="transaction_description" className="text-nail-dark font-medium">Descrição *</Label>
                      <Input id="transaction_description" placeholder="Descrição da transação" value={newTransaction.description} onChange={e => setNewTransaction({
                      ...newTransaction,
                      description: e.target.value
                    })} className="mt-1 border-nail-secondary focus:ring-nail-primary" />
                    </div>
                    
                    <div>
                      <Label htmlFor="payment_method" className="text-nail-dark font-medium">Método de Pagamento</Label>
                      <Select value={newTransaction.payment_method} onValueChange={value => setNewTransaction({
                      ...newTransaction,
                      payment_method: value as PaymentMethod
                    })}>
                        <SelectTrigger className="mt-1 border-nail-secondary focus:ring-nail-primary">
                          <SelectValue placeholder="Selecione um método" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(paymentMethodLabels).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full nail-button">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Adicionar Transação
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Lista de Transações */}
            <Card className="border-nail-secondary">
              <CardHeader className="bg-nail-light/50">
                <CardTitle className="text-nail-dark">Transações Recentes</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {transactions.length === 0 ? <div className="text-center py-12">
                    <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhuma transação encontrada</p>
                  </div> : <div className="divide-y divide-nail-secondary">
                    {transactions.map(transaction => <div key={transaction.id} className="p-4 hover:bg-nail-light/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center space-x-3">
                              <p className="font-medium text-nail-dark">{transaction.description}</p>
                              <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'} className={transaction.type === 'income' ? 'bg-completed/20 text-completed border-completed/50' : ''}>
                                {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                {format(transaction.transaction_date, 'PPP', {
                            locale: ptBR
                          })}
                              </span>
                              {transaction.payment_method && <span>{paymentMethodLabels[transaction.payment_method]}</span>}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold text-lg ${transaction.type === 'income' ? 'text-completed' : 'text-destructive'}`}>
                              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </p>
                          </div>
                        </div>
                      </div>)}
                  </div>}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>;
};
export default Financial;