-- Ensure psychologist access code is unique and easy to index
-- Use a partial unique index to allow multiple NULL values
DO $$
BEGIN
	IF to_regclass('public.users') IS NOT NULL THEN
		-- Create partial unique index only if table exists
		CREATE UNIQUE INDEX IF NOT EXISTS users_codigo_psicologo_unique
		ON public.users (codigo_psicologo)
		WHERE codigo_psicologo IS NOT NULL;
	END IF;
END $$;
