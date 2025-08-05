-- =====================================================
-- CREATE FUNCTIONS AND TRIGGERS - Execute QUARTO
-- =====================================================

-- Function to automatically create customer profile after auth signup
CREATE OR REPLACE FUNCTION public.handle_new_customer()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create customer profile if email confirmation is not required or user is confirmed
    IF NEW.email_confirmed_at IS NOT NULL OR NEW.confirmation_sent_at IS NULL THEN
        INSERT INTO public.customers (auth_user_id, full_name, email)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
            NEW.email
        )
        ON CONFLICT (email) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_customer();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON public.services;
CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_professionals_updated_at ON public.professionals;
CREATE TRIGGER update_professionals_updated_at
    BEFORE UPDATE ON public.professionals
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_updated_at ON public.customers;
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_expenses_updated_at ON public.expenses;
CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON public.expenses
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_notifications_updated_at ON public.notifications;
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_financial_transactions_updated_at ON public.financial_transactions;
CREATE TRIGGER update_financial_transactions_updated_at
    BEFORE UPDATE ON public.financial_transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_customer_portal_settings_updated_at ON public.customer_portal_settings;
CREATE TRIGGER update_customer_portal_settings_updated_at
    BEFORE UPDATE ON public.customer_portal_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to sync business_slug with profiles table
CREATE OR REPLACE FUNCTION public.sync_business_slug_to_profiles()
RETURNS TRIGGER AS $$
BEGIN
    -- Update or insert into profiles table
    INSERT INTO public.profiles (user_id, business_name, business_slug, updated_at)
    VALUES (NEW.user_id, NEW.business_name, NEW.business_slug, NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        business_name = NEW.business_name,
        business_slug = NEW.business_slug,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to sync with profiles
DROP TRIGGER IF EXISTS sync_portal_settings_to_profiles ON public.customer_portal_settings;
CREATE TRIGGER sync_portal_settings_to_profiles
    AFTER INSERT OR UPDATE ON public.customer_portal_settings
    FOR EACH ROW EXECUTE FUNCTION public.sync_business_slug_to_profiles();