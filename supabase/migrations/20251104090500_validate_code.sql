-- Function to validate a psychologist access code without exposing users table
CREATE OR REPLACE FUNCTION public.is_valid_psychologist_code(_code text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users u
    JOIN user_roles r ON r.user_id = u.id
    WHERE u.codigo_psicologo = _code
      AND r.role = 'psicologo'::app_role
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_valid_psychologist_code(text) TO authenticated;
