
-- Add price column to appointments table
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0;

-- Update the price column to not be nullable and set a proper default
ALTER TABLE public.appointments 
ALTER COLUMN price SET NOT NULL;

-- Add a comment to document the price field
COMMENT ON COLUMN public.appointments.price IS 'Service price for this appointment in currency units';
