-- ============================================
-- SECURITY FIX: Implement Role-Based Access Control
-- ============================================

-- 1. Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('paciente', 'psicologo');

-- 2. Create user_roles table (separate from users to prevent privilege escalation)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, role)
);

-- 3. Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create security definer function to check roles (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- 5. RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING ((auth.uid())::text = (user_id)::text);

-- 6. Add INSERT policy for users table (required for registration)
CREATE POLICY "Users can insert their own profile on signup"
ON public.users FOR INSERT
WITH CHECK ((auth.uid())::text = (id)::text);

-- 7. Fix alertas INSERT policy - only patients can create their own alerts
DROP POLICY IF EXISTS "System can create alerts" ON public.alertas;
CREATE POLICY "Patients can create their own alerts"
ON public.alertas FOR INSERT
WITH CHECK ((auth.uid())::text = (paciente_id)::text);

-- 8. Create trigger function to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into users table
  INSERT INTO public.users (id, nombre, email, rol)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nombre', 'Usuario'),
    new.email,
    COALESCE(new.raw_user_meta_data->>'rol', 'paciente')
  );
  
  -- Insert role into user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    new.id,
    COALESCE((new.raw_user_meta_data->>'rol')::app_role, 'paciente'::app_role)
  );
  
  RETURN new;
END;
$$;

-- 9. Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. Add validation constraints for data integrity
ALTER TABLE public.users 
  ADD CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE public.users
  ADD CONSTRAINT edad_range CHECK (edad IS NULL OR (edad >= 0 AND edad <= 120));

ALTER TABLE public.evaluaciones
  ADD CONSTRAINT resultado_range CHECK (resultado_numerico >= 0 AND resultado_numerico <= 100);

-- 11. Add CHECK constraints for enum-like fields
ALTER TABLE public.alertas
  ADD CONSTRAINT tipo_alerta_valid CHECK (tipo_alerta IN ('ansiedad', 'depresion', 'crisis', 'evaluacion_alta'));

ALTER TABLE public.alertas
  ADD CONSTRAINT estado_valid CHECK (estado IN ('pendiente', 'resuelta'));

ALTER TABLE public.evaluaciones
  ADD CONSTRAINT tipo_prueba_valid CHECK (tipo_prueba IN ('PHQ-2', 'GAD-2', 'PHQ-2+GAD-2'));