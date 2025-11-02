-- Drop existing policies if they exist to avoid conflicts
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Admins can view all users" ON users;
  DROP POLICY IF EXISTS "Admins can update all users" ON users;
  DROP POLICY IF EXISTS "Admins can delete users" ON users;
  DROP POLICY IF EXISTS "Admins can view all tests" ON tests_psicologicos;
  DROP POLICY IF EXISTS "Admins can create tests" ON tests_psicologicos;
  DROP POLICY IF EXISTS "Admins can update all tests" ON tests_psicologicos;
  DROP POLICY IF EXISTS "Admins can delete tests" ON tests_psicologicos;
END $$;

-- Create admin statistics view for easy access to general stats
CREATE OR REPLACE VIEW admin_statistics AS
SELECT 
  (SELECT COUNT(*) FROM users WHERE rol = 'paciente') as total_pacientes,
  (SELECT COUNT(*) FROM users WHERE rol = 'psicologo') as total_psicologos,
  (SELECT COUNT(*) FROM evaluaciones) as total_evaluaciones,
  (SELECT COUNT(*) FROM tests_psicologicos) as total_tests,
  (SELECT COUNT(*) FROM asignaciones_tests WHERE completado = true) as tests_completados,
  (SELECT COUNT(*) FROM asignaciones_tests WHERE completado = false) as tests_pendientes;

-- Function to check if user is administrator
CREATE OR REPLACE FUNCTION public.is_administrator(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = _user_id AND role = 'administrador'::app_role
  );
$$;

-- RLS policies for users table to allow admins
CREATE POLICY "Admins can view all users"
ON users
FOR SELECT
TO authenticated
USING (is_administrator(auth.uid()));

CREATE POLICY "Admins can update all users"
ON users
FOR UPDATE
TO authenticated
USING (is_administrator(auth.uid()))
WITH CHECK (is_administrator(auth.uid()));

CREATE POLICY "Admins can delete users"
ON users
FOR DELETE
TO authenticated
USING (is_administrator(auth.uid()));

-- RLS policies for tests_psicologicos to allow admins
CREATE POLICY "Admins can view all tests"
ON tests_psicologicos
FOR SELECT
TO authenticated
USING (is_administrator(auth.uid()));

CREATE POLICY "Admins can create tests"
ON tests_psicologicos
FOR INSERT
TO authenticated
WITH CHECK (is_administrator(auth.uid()));

CREATE POLICY "Admins can update all tests"
ON tests_psicologicos
FOR UPDATE
TO authenticated
USING (is_administrator(auth.uid()))
WITH CHECK (is_administrator(auth.uid()));

CREATE POLICY "Admins can delete tests"
ON tests_psicologicos
FOR DELETE
TO authenticated
USING (is_administrator(auth.uid()));