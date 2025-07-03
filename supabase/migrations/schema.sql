
-- Create custom enum types
CREATE TYPE public.appointment_status AS ENUM (
    'scheduled',
    'completed',
    'cancelled'
);

CREATE TYPE public.loyalty_level AS ENUM (
    'Bronze',
    'Prata',
    'Ouro',
    'Diamante'
);

CREATE TYPE public.notification_type AS ENUM (
    'maintenance_reminder',
    'follow_up',
    'birthday',
    'promotion'
);

CREATE TYPE public.notification_status AS ENUM (
    'pending',
    'sent',
    'failed',
    'cancelled'
);

CREATE TYPE public.expense_category AS ENUM (
    'esmaltes',
    'ferramentas',
    'equipamentos',
    'produtos_higiene',
    'marketing',
    'aluguel',
    'outros'
);

CREATE TYPE public.transaction_type AS ENUM (
    'income',
    'expense'
);

CREATE TYPE public.payment_method AS ENUM (
    'dinheiro',
    'pix',
    'cartao_debito',
    'cartao_credito',
    'transferencia'
);

-- Create clients table
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    rating INT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    birth_date DATE,
    indicated_by UUID REFERENCES public.clients(id),
    indicated_by_name TEXT,
    loyalty_points INT DEFAULT 0,
    loyalty_level public.loyalty_level DEFAULT 'Bronze'::public.loyalty_level
);

-- Create appointments table
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    client_name TEXT,
    date TIMESTAMPTZ NOT NULL,
    service TEXT,
    duration INT,
    status public.appointment_status DEFAULT 'scheduled'::public.appointment_status,
    notes TEXT,
    location TEXT,
    price NUMERIC(10, 2)
);

-- Create expenses table
CREATE TABLE public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category public.expense_category,
    description TEXT,
    amount NUMERIC(10, 2),
    expense_date DATE,
    supplier TEXT,
    receipt_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
    type public.notification_type,
    template_message TEXT,
    scheduled_for TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    status public.notification_status DEFAULT 'pending'::public.notification_status,
    n8n_workflow_execution_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create financial_transactions table
CREATE TABLE public.financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    type public.transaction_type,
    amount NUMERIC(10, 2),
    description TEXT,
    payment_method public.payment_method,
    transaction_date DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies to restrict access to data based on user_id
CREATE POLICY "Enable all access for users based on user_id" ON public.clients FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Enable all access for users based on user_id" ON public.appointments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Enable all access for users based on user_id" ON public.expenses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Enable all access for users based on user_id" ON public.notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Enable all access for users based on user_id" ON public.financial_transactions FOR ALL USING (auth.uid() = user_id);
