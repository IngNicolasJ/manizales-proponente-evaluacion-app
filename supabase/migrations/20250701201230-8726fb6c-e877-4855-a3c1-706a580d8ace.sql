-- Corregir la política RLS para process_data que tiene un error en la referencia
DROP POLICY IF EXISTS "Users can view their own or shared process data" ON public.process_data;
CREATE POLICY "Users can view their own or shared process data" 
  ON public.process_data 
  FOR SELECT 
  USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.process_access 
      WHERE process_access.process_data_id = process_data.id AND process_access.user_id = auth.uid()
    )
  );