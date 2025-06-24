
-- Crear tabla de perfiles de usuario
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Crear tabla para almacenar datos de procesos por usuario
CREATE TABLE public.process_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  process_name TEXT NOT NULL,
  process_number TEXT NOT NULL,
  closing_date DATE NOT NULL,
  experience JSONB NOT NULL,
  scoring_criteria JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Crear tabla para almacenar proponentes por usuario
CREATE TABLE public.proponents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  process_data_id UUID NOT NULL REFERENCES public.process_data ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_plural BOOLEAN NOT NULL DEFAULT FALSE,
  partners JSONB,
  rup JSONB NOT NULL,
  scoring JSONB NOT NULL,
  requirements JSONB NOT NULL,
  contractors JSONB NOT NULL DEFAULT '[]',
  total_score DECIMAL NOT NULL DEFAULT 0,
  needs_subsanation BOOLEAN NOT NULL DEFAULT FALSE,
  subsanation_details TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.process_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proponents ENABLE ROW LEVEL SECURITY;

-- Función para verificar si un usuario es administrador
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- Políticas RLS para profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas RLS para process_data
CREATE POLICY "Users can view their own process data" ON public.process_data
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all process data" ON public.process_data
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Políticas RLS para proponents
CREATE POLICY "Users can manage their own proponents" ON public.proponents
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all proponents" ON public.proponents
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Trigger para crear perfil automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insertar usuario administrador (reemplaza 'tu-email@ejemplo.com' con tu email real)
-- Nota: Primero debes registrarte en la app, luego ejecutar esta consulta reemplazando el email
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'tu-email@ejemplo.com';
