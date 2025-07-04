-- Add process_type column to process_data table
ALTER TABLE public.process_data 
ADD COLUMN IF NOT EXISTS process_type TEXT DEFAULT 'licitacion';

-- Update existing records to have a default process_type
UPDATE public.process_data 
SET process_type = 'licitacion' 
WHERE process_type IS NULL;