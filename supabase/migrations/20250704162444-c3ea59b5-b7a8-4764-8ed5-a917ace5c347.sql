-- Corregir el tipo de proceso que se guardó incorrectamente como 'licitacion' cuando debería ser 'concurso'
-- basándose en el prefijo CM (Concurso de Méritos) del número de proceso
UPDATE process_data 
SET process_type = 'concurso' 
WHERE process_number = 'CM-024-2025' AND process_type = 'licitacion';