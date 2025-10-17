-- Add diagnostico field to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS diagnostico text;

-- Add comment to explain the field
COMMENT ON COLUMN public.users.diagnostico IS 'Diagnóstico clínico del paciente asignado por el psicólogo';