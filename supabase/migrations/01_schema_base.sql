-- =====================================================
-- SCHEMA BASE - Execute PRIMEIRO
-- =====================================================

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

-- Create profiles table FIRST (needed for business_slug)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    business_name VARCHAR(255),
    business_slug VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create clients table
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    rating INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    birth_date DATE,
    indicated_by UUID REFERENCES public.clients(id),
    indicated_by_name TEXT,
    loyalty_points INT DEFAULT 0,
    loyalty_level public.loyalty_level DEFAULT 'Bronze'::public.loyalty_level
);

-- Create services table
CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    duration INTEGER DEFAULT 60,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create professionals table
CREATE TABLE public.professionals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create customers table (for public portal)
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    professional_id UUID REFERENCES public.professionals(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    service TEXT NOT NULL,
    duration INT DEFAULT 60,
    status public.appointment_status DEFAULT 'scheduled'::public.appointment_status,
    notes TEXT,
    location TEXT,
    price NUMERIC(10, 2) DEFAULT 0
);

-- Create expenses table
CREATE TABLE public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category public.expense_category,
    description TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    expense_date DATE NOT NULL,
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
    client_name TEXT NOT NULL,
    type public.notification_type NOT NULL,
    template_message TEXT NOT NULL,
    scheduled_for TIMESTAMPTZ NOT NULL,
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
    type public.transaction_type NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    description TEXT NOT NULL,
    payment_method public.payment_method,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create customer_portal_settings table
CREATE TABLE public.customer_portal_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    enabled BOOLEAN DEFAULT true,
    business_name VARCHAR(255) NOT NULL,
    business_slug VARCHAR(255) NOT NULL,
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#3b82f6',
    secondary_color VARCHAR(7) DEFAULT '#1e40af',
    allow_cancellation BOOLEAN DEFAULT true,
    cancellation_hours_limit INTEGER DEFAULT 24,
    allow_rescheduling BOOLEAN DEFAULT true,
    reschedule_hours_limit INTEGER DEFAULT 24,
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    welcome_message TEXT,
    terms_url TEXT,
    privacy_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_business_slug ON public.profiles(business_slug);
CREATE INDEX idx_clients_user_id ON public.clients(user_id);
CREATE INDEX idx_services_user_id ON public.services(user_id);
CREATE INDEX idx_professionals_user_id ON public.professionals(user_id);
CREATE INDEX idx_customers_auth_user_id ON public.customers(auth_user_id);
CREATE INDEX idx_customers_email ON public.customers(email);
CREATE INDEX idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX idx_appointments_customer_id ON public.appointments(customer_id);
CREATE INDEX idx_appointments_date ON public.appointments(date);
CREATE INDEX idx_customer_portal_settings_user_id ON public.customer_portal_settings(user_id);
CREATE INDEX idx_customer_portal_settings_business_slug ON public.customer_portal_settings(business_slug);