-- Modificar tests_psicologicos para permitir tests globales (del catálogo)
ALTER TABLE public.tests_psicologicos 
ALTER COLUMN psicologo_id DROP NOT NULL;

-- Actualizar políticas RLS para permitir que psicólogos vean tests globales
DROP POLICY IF EXISTS "Psychologists can view their own tests" ON public.tests_psicologicos;

CREATE POLICY "Psychologists can view their own tests and global tests" 
ON public.tests_psicologicos 
FOR SELECT 
USING (
  (auth.uid() = psicologo_id AND is_psychologist(auth.uid())) 
  OR 
  (psicologo_id IS NULL AND is_psychologist(auth.uid()))
);

-- Permitir que psicólogos vean preguntas de tests globales
DROP POLICY IF EXISTS "Patients can view questions for assigned tests" ON public.preguntas_test;
DROP POLICY IF EXISTS "Psychologists can manage questions for their tests" ON public.preguntas_test;

CREATE POLICY "Patients can view questions for assigned tests" 
ON public.preguntas_test 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM asignaciones_tests a
    WHERE a.test_id = preguntas_test.test_id 
    AND a.paciente_id = auth.uid()
  )
);

CREATE POLICY "Psychologists can view questions for their tests and global tests" 
ON public.preguntas_test 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM tests_psicologicos t
    WHERE t.id = preguntas_test.test_id 
    AND (
      (t.psicologo_id = auth.uid() AND is_psychologist(auth.uid()))
      OR
      (t.psicologo_id IS NULL AND is_psychologist(auth.uid()))
    )
  )
);

CREATE POLICY "Psychologists can manage questions for their own tests" 
ON public.preguntas_test 
FOR ALL 
USING (
  EXISTS (
    SELECT 1
    FROM tests_psicologicos t
    WHERE t.id = preguntas_test.test_id 
    AND t.psicologo_id = auth.uid() 
    AND is_psychologist(auth.uid())
  )
);

CREATE POLICY "Admins can manage all questions" 
ON public.preguntas_test 
FOR ALL 
USING (is_administrator(auth.uid()));

-- Agregar campos adicionales para la configuración de tests
ALTER TABLE public.tests_psicologicos 
ADD COLUMN IF NOT EXISTS objetivo TEXT,
ADD COLUMN IF NOT EXISTS poblacion TEXT,
ADD COLUMN IF NOT EXISTS metodo_aplicacion TEXT,
ADD COLUMN IF NOT EXISTS tiempo_estimado TEXT,
ADD COLUMN IF NOT EXISTS tipo_respuesta TEXT;