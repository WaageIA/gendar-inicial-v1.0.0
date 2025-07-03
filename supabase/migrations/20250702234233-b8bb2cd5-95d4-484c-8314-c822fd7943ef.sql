
-- Corrigir as restrições de chave estrangeira para permitir exclusões em cascata

-- 1. Remover a restrição atual entre appointments e clients
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_client_id_fkey;

-- 2. Adicionar nova restrição com CASCADE para appointments -> clients
ALTER TABLE appointments 
ADD CONSTRAINT appointments_client_id_fkey 
FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

-- 3. Remover a restrição atual entre financial_transactions e appointments
ALTER TABLE financial_transactions DROP CONSTRAINT IF EXISTS financial_transactions_appointment_id_fkey;

-- 4. Adicionar nova restrição com CASCADE para financial_transactions -> appointments
ALTER TABLE financial_transactions 
ADD CONSTRAINT financial_transactions_appointment_id_fkey 
FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE;

-- 5. Remover a restrição atual entre financial_transactions e clients (se existir)
ALTER TABLE financial_transactions DROP CONSTRAINT IF EXISTS financial_transactions_client_id_fkey;

-- 6. Adicionar nova restrição com CASCADE para financial_transactions -> clients
ALTER TABLE financial_transactions 
ADD CONSTRAINT financial_transactions_client_id_fkey 
FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
