-- Fix search_path for the get_psychologist_patients function
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
SET search_path = public
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