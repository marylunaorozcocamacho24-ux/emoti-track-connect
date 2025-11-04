-- Secure function to link the current patient to a psychologist code
CREATE OR REPLACE FUNCTION public.link_patient_to_psychologist(_code text, _age integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _is_valid boolean;
BEGIN
  -- Validate code belongs to a psychologist
  SELECT EXISTS (
    SELECT 1 FROM users u
    JOIN user_roles r ON r.user_id = u.id
    WHERE u.codigo_psicologo = _code
      AND r.role = 'psicologo'::app_role
  ) INTO _is_valid;

  IF NOT _is_valid THEN
    RETURN false;
  END IF;

  -- Update current user's profile to link code and set age if provided
  UPDATE users
  SET codigo_psicologo = _code,
      edad = COALESCE(_age, edad)
  WHERE id = auth.uid();

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.link_patient_to_psychologist(text, integer) TO authenticated;
