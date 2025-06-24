
-- Crear una restricción única para user_id y process_number en la tabla process_data
ALTER TABLE public.process_data 
ADD CONSTRAINT process_data_user_process_unique 
UNIQUE (user_id, process_number);
