-- Client service category selected by the customer UI.
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS service_category text NOT NULL DEFAULT 'general';
