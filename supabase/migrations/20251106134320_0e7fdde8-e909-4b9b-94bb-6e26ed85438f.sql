-- Enable realtime for tests_psicologicos table
ALTER TABLE public.tests_psicologicos REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tests_psicologicos;

-- Enable realtime for plantillas_historia_clinica table
ALTER TABLE public.plantillas_historia_clinica REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.plantillas_historia_clinica;