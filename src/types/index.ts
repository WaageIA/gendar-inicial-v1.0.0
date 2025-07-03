
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';
export type LoyaltyLevel = 'Bronze' | 'Prata' | 'Ouro' | 'Diamante';
export type NotificationType = 'maintenance_reminder' | 'follow_up' | 'birthday' | 'promotion';
export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'cancelled';
export type ExpenseCategory = 'esmaltes' | 'ferramentas' | 'equipamentos' | 'produtos_higiene' | 'marketing' | 'aluguel' | 'outros';
export type TransactionType = 'income' | 'expense';
export type PaymentMethod = 'dinheiro' | 'pix' | 'cartao_debito' | 'cartao_credito' | 'transferencia';

export interface Client {
  id: string;
  user_id?: string;
  name: string;
  phone: string;
  email: string;
  rating: number;
  notes?: string;
  createdAt: Date;
  birthDate?: string;
  indicatedBy?: string;
  indicatedByName?: string;
  loyaltyPoints?: number;
  loyaltyLevel?: LoyaltyLevel;
}

export interface Appointment {
  id: string;
  user_id?: string;
  clientId: string;
  clientName: string;
  date: Date;
  service: string;
  duration: number;
  status: AppointmentStatus;
  notes?: string;
  location?: string;
  price?: number;
}

export interface Notification {
  id: string;
  user_id?: string;
  client_id: string;
  client_name: string;
  appointment_id?: string;
  type: NotificationType;
  template_message: string;
  scheduled_for: Date;
  sent_at?: Date;
  status: NotificationStatus;
  n8n_workflow_execution_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Expense {
  id: string;
  user_id?: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  expense_date: Date;
  supplier?: string;
  receipt_url?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface FinancialTransaction {
  id: string;
  user_id?: string;
  appointment_id?: string;
  client_id: string;
  type: TransactionType;
  amount: number;
  description: string;
  payment_method?: PaymentMethod;
  transaction_date: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Service {
  id: string;
  user_id?: string;
  name: string;
  price: number;
  created_at: Date;
  updated_at: Date;
}
