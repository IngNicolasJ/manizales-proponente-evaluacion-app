
-- Primero, asegurémonos de que el usuario njz2612@gmail.com tenga rol de administrador
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'njz2612@gmail.com';

-- Si el perfil no existe, lo creamos
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
  id,
  'njz2612@gmail.com',
  'Nicolás Jaramillo Zuluaga',
  'admin'
FROM auth.users 
WHERE email = 'njz2612@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE email = 'njz2612@gmail.com'
);

-- Eliminar todas las políticas existentes de forma segura
DROP POLICY IF EXISTS "Users can view their own process data" ON public.process_data;
DROP POLICY IF EXISTS "Admins can view all process data" ON public.process_data;
DROP POLICY IF EXISTS "Users can manage their own proponents" ON public.proponents;
DROP POLICY IF EXISTS "Admins can view all proponents" ON public.proponents;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Políticas para process_data
CREATE POLICY "Users can manage their own process data" ON public.process_data
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all process data" ON public.process_data
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Políticas para proponents
CREATE POLICY "Users can manage their own proponents" ON public.proponents
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all proponents" ON public.proponents
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Políticas para profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Crear tabla para almacenar estadísticas y métricas del dashboard
CREATE TABLE IF NOT EXISTS public.evaluation_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  total_processes INTEGER NOT NULL DEFAULT 0,
  total_proponents INTEGER NOT NULL DEFAULT 0,
  avg_score DECIMAL,
  last_activity TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Habilitar RLS en evaluation_stats solo si la tabla existe
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'evaluation_stats') THEN
    ALTER TABLE public.evaluation_stats ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Crear políticas para evaluation_stats solo si no existen
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'evaluation_stats' AND policyname = 'Users can view their own stats') THEN
    EXECUTE 'CREATE POLICY "Users can view their own stats" ON public.evaluation_stats FOR SELECT USING (auth.uid() = user_id)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'evaluation_stats' AND policyname = 'Admins can view all stats') THEN
    EXECUTE 'CREATE POLICY "Admins can view all stats" ON public.evaluation_stats FOR SELECT USING (public.is_admin(auth.uid()))';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'evaluation_stats' AND policyname = 'Users can manage their own stats') THEN
    EXECUTE 'CREATE POLICY "Users can manage their own stats" ON public.evaluation_stats FOR ALL USING (auth.uid() = user_id)';
  END IF;
END $$;
