
-- Eliminar duplicados manteniendo solo el registro más reciente de cada proponente
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY user_id, process_data_id, name 
           ORDER BY updated_at DESC, created_at DESC
         ) as rn
  FROM public.proponents
)
DELETE FROM public.proponents 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Ahora crear el índice único
CREATE UNIQUE INDEX IF NOT EXISTS idx_proponents_user_process_name 
ON public.proponents (user_id, process_data_id, name);
