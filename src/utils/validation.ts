
import { z } from 'zod';

// Schema para Cliente
export const clientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  birthDate: z.string().optional(),
  rating: z.number().min(1).max(5),
  notes: z.string().optional(),
  indicatedBy: z.string().optional(),
});

// Schema para Agendamento
export const appointmentSchema = z.object({
  clientId: z.string().uuid('ID do cliente inválido'),
  clientName: z.string().min(2, 'Nome do cliente obrigatório'),
  date: z.date({ required_error: 'Data é obrigatória' }),
  service: z.string().min(2, 'Serviço obrigatório'),
  duration: z.number().min(15, 'Duração mínima de 15 minutos'),
  price: z.number().min(0, 'Preço deve ser positivo'),
  notes: z.string().optional(),
});

// Schema para Transação Financeira
export const financialTransactionSchema = z.object({
  amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
  description: z.string().min(2, 'Descrição obrigatória'),
  type: z.enum(['income', 'expense'], { required_error: 'Tipo obrigatório' }),
  paymentMethod: z.string().optional(),
  transactionDate: z.date({ required_error: 'Data obrigatória' }),
  clientId: z.string().uuid().optional(),
  appointmentId: z.string().uuid().optional(),
});

// Schema para Despesa
export const expenseSchema = z.object({
  amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
  description: z.string().min(2, 'Descrição obrigatória'),
  category: z.string().min(2, 'Categoria obrigatória'),
  supplier: z.string().optional(),
  expenseDate: z.date({ required_error: 'Data obrigatória' }),
  notes: z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;
export type AppointmentFormData = z.infer<typeof appointmentSchema>;
export type FinancialTransactionFormData = z.infer<typeof financialTransactionSchema>;
export type ExpenseFormData = z.infer<typeof expenseSchema>;
