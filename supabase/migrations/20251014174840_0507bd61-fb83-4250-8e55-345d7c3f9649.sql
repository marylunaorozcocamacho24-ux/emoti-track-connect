-- ============================================
-- SECURITY FIX: Prevent Recursive RLS and Data Exposure
-- ============================================

-- 1. Create security definer functions to prevent recursive RLS
CREATE OR REPLACE FUNCTION public.get_user_psychologist_code(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT codigo_psicologo FROM users WHERE id = _user_id;
$$;

CREATE OR REPLACE FUNCTION public.is_psychologist(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = _user_id AND role = 'psicologo'::app_role
  );
$$;

CREATE OR REPLACE FUNCTION public.psychologist_has_patient(_psychologist_id uuid, _patient_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users p
    JOIN users pa ON p.codigo_psicologo = pa.codigo_psicologo
    WHERE p.id = _psychologist_id 
      AND pa.id = _patient_id
      AND EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = _psychologist_id AND role = 'psicologo'::app_role
      )
  );
$$;

-- 2. Update RLS policies to use security definer functions (prevents recursive queries)

-- Update evaluaciones policies
DROP POLICY IF EXISTS "Psychologists can view their patients evaluations" ON public.evaluaciones;
CREATE POLICY "Psychologists can view their patients evaluations"
ON public.evaluaciones FOR SELECT
USING (public.psychologist_has_patient(auth.uid(), paciente_id));

-- Update notas policies
DROP POLICY IF EXISTS "Psychologists can view and create notes for their patients" ON public.notas;
CREATE POLICY "Psychologists can view notes for their patients"
ON public.notas FOR SELECT
USING (
  (auth.uid())::text = (paciente_id)::text 
  OR public.psychologist_has_patient(auth.uid(), paciente_id)
);

CREATE POLICY "Psychologists can create notes for their patients"
ON public.notas FOR INSERT
WITH CHECK (
  (auth.uid())::text = (psicologo_id)::text 
  AND public.is_psychologist(auth.uid())
  AND public.psychologist_has_patient(auth.uid(), paciente_id)
);

-- Update sugerencias policies
DROP POLICY IF EXISTS "Psychologists can view suggestions for their patients" ON public.sugerencias;
CREATE POLICY "Psychologists can view suggestions for their patients"
ON public.sugerencias FOR SELECT
USING (
  (auth.uid())::text = (paciente_id)::text
  OR (
    (auth.uid())::text = (psicologo_id)::text 
    AND public.is_psychologist(auth.uid())
  )
);

DROP POLICY IF EXISTS "Psychologists can create suggestions for their patients" ON public.sugerencias;
CREATE POLICY "Psychologists can create suggestions for their patients"
ON public.sugerencias FOR INSERT
WITH CHECK (
  (auth.uid())::text = (psicologo_id)::text 
  AND public.is_psychologist(auth.uid())
  AND public.psychologist_has_patient(auth.uid(), paciente_id)
);

-- Update alertas policies
DROP POLICY IF EXISTS "Psychologists can view alerts for their patients" ON public.alertas;
CREATE POLICY "Psychologists can view alerts for their patients"
ON public.alertas FOR SELECT
USING (
  (auth.uid())::text = (paciente_id)::text
  OR public.psychologist_has_patient(auth.uid(), paciente_id)
);

-- 3. Restrict users table to only expose necessary fields
-- Users can only see their own full profile
-- Psychologists CANNOT query all users anymore

-- Update users SELECT policy to be more restrictive
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile"
ON public.users FOR SELECT
USING ((auth.uid())::text = (id)::text);

-- 4. Create a safe view for psychologists to see only their patients' basic info
CREATE OR REPLACE VIEW public.psychologist_patients AS
SELECT 
  u.id,
  u.nombre,
  u.edad,
  u.genero,
  u.codigo_psicologo
FROM users u
WHERE EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'psicologo'::app_role
)
AND u.codigo_psicologo = (
  SELECT codigo_psicologo FROM users WHERE id = auth.uid()
);

-- Grant access to the view
GRANT SELECT ON public.psychologist_patients TO authenticated;