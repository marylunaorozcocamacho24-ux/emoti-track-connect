-- Crear tabla para tests psicológicos creados por psicólogos
CREATE TABLE public.tests_psicologicos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  psicologo_id uuid NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  activo boolean DEFAULT true,
  -- Campo preparado para IA
  config_ia jsonb DEFAULT '{}'::jsonb
);

-- Crear tabla para preguntas de tests
CREATE TABLE public.preguntas_test (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id uuid NOT NULL REFERENCES public.tests_psicologicos(id) ON DELETE CASCADE,
  orden integer NOT NULL,
  texto text NOT NULL,
  tipo text NOT NULL DEFAULT 'likert', -- likert, texto_libre, multiple_choice
  opciones jsonb DEFAULT '[]'::jsonb, -- Para opciones de likert o multiple choice
  created_at timestamp with time zone DEFAULT now()
);

-- Crear tabla para asignaciones de tests a pacientes
CREATE TABLE public.asignaciones_tests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id uuid NOT NULL REFERENCES public.tests_psicologicos(id) ON DELETE CASCADE,
  paciente_id uuid NOT NULL,
  psicologo_id uuid NOT NULL,
  fecha_asignacion timestamp with time zone DEFAULT now(),
  fecha_limite timestamp with time zone,
  completado boolean DEFAULT false,
  fecha_completado timestamp with time zone,
  observaciones_psicologo text,
  -- Campo preparado para análisis IA
  analisis_ia jsonb DEFAULT '{}'::jsonb
);

-- Crear tabla para respuestas de pacientes
CREATE TABLE public.respuestas_tests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asignacion_id uuid NOT NULL REFERENCES public.asignaciones_tests(id) ON DELETE CASCADE,
  pregunta_id uuid NOT NULL REFERENCES public.preguntas_test(id) ON DELETE CASCADE,
  paciente_id uuid NOT NULL,
  respuesta text NOT NULL,
  valor_numerico integer, -- Para respuestas likert
  created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.tests_psicologicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preguntas_test ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asignaciones_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.respuestas_tests ENABLE ROW LEVEL SECURITY;

-- RLS para tests_psicologicos
CREATE POLICY "Psychologists can create their own tests"
ON public.tests_psicologicos
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = psicologo_id 
  AND is_psychologist(auth.uid())
);

CREATE POLICY "Psychologists can view their own tests"
ON public.tests_psicologicos
FOR SELECT
TO authenticated
USING (
  auth.uid() = psicologo_id 
  AND is_psychologist(auth.uid())
);

CREATE POLICY "Psychologists can update their own tests"
ON public.tests_psicologicos
FOR UPDATE
TO authenticated
USING (
  auth.uid() = psicologo_id 
  AND is_psychologist(auth.uid())
);

-- RLS para preguntas_test
CREATE POLICY "Psychologists can manage questions for their tests"
ON public.preguntas_test
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tests_psicologicos t
    WHERE t.id = preguntas_test.test_id
    AND t.psicologo_id = auth.uid()
    AND is_psychologist(auth.uid())
  )
);

CREATE POLICY "Patients can view questions for assigned tests"
ON public.preguntas_test
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.asignaciones_tests a
    WHERE a.test_id = preguntas_test.test_id
    AND a.paciente_id = auth.uid()
  )
);

-- RLS para asignaciones_tests
CREATE POLICY "Psychologists can create assignments for their patients"
ON public.asignaciones_tests
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = psicologo_id 
  AND is_psychologist(auth.uid())
  AND psychologist_has_patient(auth.uid(), paciente_id)
);

CREATE POLICY "Psychologists can view assignments for their patients"
ON public.asignaciones_tests
FOR SELECT
TO authenticated
USING (
  (auth.uid() = psicologo_id AND is_psychologist(auth.uid()))
  OR auth.uid() = paciente_id
);

CREATE POLICY "Psychologists can update assignments for their patients"
ON public.asignaciones_tests
FOR UPDATE
TO authenticated
USING (
  auth.uid() = psicologo_id 
  AND is_psychologist(auth.uid())
  AND psychologist_has_patient(auth.uid(), paciente_id)
);

CREATE POLICY "Patients can update completion status"
ON public.asignaciones_tests
FOR UPDATE
TO authenticated
USING (auth.uid() = paciente_id)
WITH CHECK (auth.uid() = paciente_id);

-- RLS para respuestas_tests
CREATE POLICY "Patients can create their own responses"
ON public.respuestas_tests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = paciente_id);

CREATE POLICY "Patients can view their own responses"
ON public.respuestas_tests
FOR SELECT
TO authenticated
USING (auth.uid() = paciente_id);

CREATE POLICY "Psychologists can view responses from their patients"
ON public.respuestas_tests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.asignaciones_tests a
    WHERE a.id = respuestas_tests.asignacion_id
    AND a.psicologo_id = auth.uid()
    AND is_psychologist(auth.uid())
  )
);

-- Crear índices para mejorar rendimiento
CREATE INDEX idx_tests_psicologo ON public.tests_psicologicos(psicologo_id);
CREATE INDEX idx_preguntas_test ON public.preguntas_test(test_id);
CREATE INDEX idx_asignaciones_paciente ON public.asignaciones_tests(paciente_id);
CREATE INDEX idx_asignaciones_psicologo ON public.asignaciones_tests(psicologo_id);
CREATE INDEX idx_respuestas_asignacion ON public.respuestas_tests(asignacion_id);

-- Crear función para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para updated_at
CREATE TRIGGER update_tests_psicologicos_updated_at
BEFORE UPDATE ON public.tests_psicologicos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();