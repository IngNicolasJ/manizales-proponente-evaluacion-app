
-- Agregar columnas para valor del contrato y salario mínimo a la tabla process_data
ALTER TABLE public.process_data 
ADD COLUMN total_contract_value NUMERIC DEFAULT 0,
ADD COLUMN minimum_salary NUMERIC DEFAULT 0;

-- Actualizar los valores existentes a 0 si no están definidos
UPDATE public.process_data 
SET total_contract_value = 0, minimum_salary = 0 
WHERE total_contract_value IS NULL OR minimum_salary IS NULL;
