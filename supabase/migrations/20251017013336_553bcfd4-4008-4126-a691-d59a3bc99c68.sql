-- Add proxima_cita field to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS proxima_cita timestamp with time zone;

-- Add comment to explain the field
COMMENT ON COLUMN public.users.proxima_cita IS 'Fecha y hora de la próxima cita programada con el psicólogo';