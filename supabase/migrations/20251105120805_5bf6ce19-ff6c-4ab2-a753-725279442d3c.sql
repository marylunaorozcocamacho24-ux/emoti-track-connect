-- Create table for clinical history templates
CREATE TABLE public.plantillas_historia_clinica (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  enfoque_terapeutico TEXT,
  descripcion TEXT,
  estructura JSONB NOT NULL DEFAULT '[]'::jsonb,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.plantillas_historia_clinica ENABLE ROW LEVEL SECURITY;

-- RLS Policies for plantillas_historia_clinica
CREATE POLICY "Admins can manage all clinical history templates"
ON public.plantillas_historia_clinica
FOR ALL
TO authenticated
USING (is_administrator(auth.uid()))
WITH CHECK (is_administrator(auth.uid()));

CREATE POLICY "Psychologists can view active templates"
ON public.plantillas_historia_clinica
FOR SELECT
TO authenticated
USING (activo = true AND is_psychologist(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_plantillas_historia_clinica_updated_at
BEFORE UPDATE ON public.plantillas_historia_clinica
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();