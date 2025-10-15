-- Fix the security definer view issue
-- Replace SECURITY DEFINER view with a function that enforces RLS

DROP VIEW IF EXISTS public.psychologist_patients;

-- Create a function instead of a view to avoid SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_psychologist_patients()
RETURNS TABLE (
  id uuid,
  nombre text,
  edad integer,
  genero text,
  codigo_psicologo text
)
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  SELECT 
    u.id,
    u.nombre,
    u.edad,
    u.genero,
    u.codigo_psicologo
  FROM users u
  WHERE public.is_psychologist(auth.uid())
  AND u.codigo_psicologo = public.get_user_psychologist_code(auth.uid())
  AND (SELECT role FROM user_roles WHERE user_id = u.id) = 'paciente'::app_role;
$$;