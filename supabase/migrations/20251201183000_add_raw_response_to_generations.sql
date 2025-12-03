-- Add raw_response column to store provider responses
ALTER TABLE public.generations
ADD COLUMN IF NOT EXISTS raw_response jsonb;
