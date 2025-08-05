-- =====================================================
-- CREATE RLS POLICIES - Execute TERCEIRO
-- =====================================================

-- Profiles policies
CREATE POLICY "Users can manage their own profile" ON public.profiles
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view profiles by business_slug" ON public.profiles
    FOR SELECT
    USING (business_slug IS NOT NULL);

-- Clients policies
CREATE POLICY "Users can manage their own clients" ON public.clients
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Services policies
CREATE POLICY "Users can manage their own services" ON public.services
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view services for scheduling" ON public.services
    FOR SELECT
    USING (true);

-- Professionals policies
CREATE POLICY "Users can manage their own professionals" ON public.professionals
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view professionals for scheduling" ON public.professionals
    FOR SELECT
    USING (true);

-- Customers policies
CREATE POLICY "Customers can view and manage their own data" ON public.customers
    FOR ALL
    USING (auth.uid() = auth_user_id)
    WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Authenticated users (admins) can see customer data" ON public.customers
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Appointments policies
CREATE POLICY "Users can manage their own appointments" ON public.appointments
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Customers can view their own appointments" ON public.appointments
    FOR SELECT
    USING (auth.uid() = (SELECT auth_user_id FROM public.customers WHERE id = appointments.customer_id));

CREATE POLICY "Customers can manage their own appointments" ON public.appointments
    FOR UPDATE
    USING (auth.uid() = (SELECT auth_user_id FROM public.customers WHERE id = appointments.customer_id))
    WITH CHECK (auth.uid() = (SELECT auth_user_id FROM public.customers WHERE id = appointments.customer_id));

CREATE POLICY "Allow public appointment creation" ON public.appointments
    FOR INSERT
    WITH CHECK (true);

-- Expenses policies
CREATE POLICY "Users can manage their own expenses" ON public.expenses
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can manage their own notifications" ON public.notifications
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Financial transactions policies
CREATE POLICY "Users can manage their own transactions" ON public.financial_transactions
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Customer portal settings policies
CREATE POLICY "Users can manage their own portal settings" ON public.customer_portal_settings
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);