
-- Agregar columna para marcar procesos como compartidos
ALTER TABLE public.process_data 
ADD COLUMN is_shared BOOLEAN DEFAULT FALSE,
ADD COLUMN created_by_admin BOOLEAN DEFAULT FALSE;

-- Crear tabla para gestionar acceso de usuarios a procesos compartidos
CREATE TABLE public.process_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  process_data_id UUID REFERENCES public.process_data(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  granted_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(process_data_id, user_id)
);

-- Habilitar RLS en la nueva tabla
ALTER TABLE public.process_access ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios vean solo sus accesos
CREATE POLICY "Users can view their process access" 
  ON public.process_access 
  FOR SELECT 
  USING (user_id = auth.uid() OR granted_by = auth.uid());

-- Política para que solo admins puedan otorgar acceso
CREATE POLICY "Admins can grant process access" 
  ON public.process_access 
  FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));

-- Política para que solo admins puedan revocar acceso
CREATE POLICY "Admins can revoke process access" 
  ON public.process_access 
  FOR DELETE 
  USING (public.is_admin(auth.uid()));

-- Actualizar políticas de process_data para incluir acceso compartido
DROP POLICY IF EXISTS "Users can view their own process data" ON public.process_data;
CREATE POLICY "Users can view their own or shared process data" 
  ON public.process_data 
  FOR SELECT 
  USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.process_access 
      WHERE process_data_id = id AND user_id = auth.uid()
    )
  );

-- Actualizar políticas de proponents para incluir acceso compartido
DROP POLICY IF EXISTS "Users can view their own proponents" ON public.proponents;
CREATE POLICY "Users can view their own or shared proponents" 
  ON public.proponents 
  FOR SELECT 
  USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.process_access 
      WHERE process_data_id = proponents.process_data_id AND user_id = auth.uid()
    )
  );

-- Política para insertar proponentes en procesos compartidos
DROP POLICY IF EXISTS "Users can create their own proponents" ON public.proponents;
CREATE POLICY "Users can create proponents in their own or shared processes" 
  ON public.proponents 
  FOR INSERT 
  WITH CHECK (
    user_id = auth.uid() AND (
      EXISTS (SELECT 1 FROM public.process_data WHERE id = process_data_id AND user_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM public.process_access WHERE process_data_id = proponents.process_data_id AND user_id = auth.uid())
    )
  );

-- Política para actualizar proponentes en procesos compartidos
DROP POLICY IF EXISTS "Users can update their own proponents" ON public.proponents;
CREATE POLICY "Users can update proponents in their own or shared processes" 
  ON public.proponents 
  FOR UPDATE 
  USING (
    user_id = auth.uid() AND (
      EXISTS (SELECT 1 FROM public.process_data WHERE id = process_data_id AND user_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM public.process_access WHERE process_data_id = proponents.process_data_id AND user_id = auth.uid())
    )
  );

-- Política para eliminar proponentes en procesos compartidos
DROP POLICY IF EXISTS "Users can delete their own proponents" ON public.proponents;
CREATE POLICY "Users can delete proponents in their own or shared processes" 
  ON public.proponents 
  FOR DELETE 
  USING (
    user_id = auth.uid() AND (
      EXISTS (SELECT 1 FROM public.process_data WHERE id = process_data_id AND user_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM public.process_access WHERE process_data_id = proponents.process_data_id AND user_id = auth.uid())
    )
  );
