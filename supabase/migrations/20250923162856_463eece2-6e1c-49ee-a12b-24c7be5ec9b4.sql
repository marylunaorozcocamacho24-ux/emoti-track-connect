-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sugerencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertas ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Create RLS policies for evaluaciones table
CREATE POLICY "Patients can view their own evaluations" ON public.evaluaciones
  FOR SELECT USING (auth.uid()::text = paciente_id::text);

CREATE POLICY "Patients can create their own evaluations" ON public.evaluaciones
  FOR INSERT WITH CHECK (auth.uid()::text = paciente_id::text);

CREATE POLICY "Psychologists can view their patients evaluations" ON public.evaluaciones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id::text = auth.uid()::text 
      AND rol = 'psicologo'
      AND codigo_psicologo = (
        SELECT codigo_psicologo FROM public.users WHERE id = paciente_id
      )
    )
  );

-- Create RLS policies for notas table
CREATE POLICY "Patients can view their own notes" ON public.notas
  FOR SELECT USING (auth.uid()::text = paciente_id::text);

CREATE POLICY "Patients can create their own notes" ON public.notas
  FOR INSERT WITH CHECK (auth.uid()::text = paciente_id::text);

CREATE POLICY "Psychologists can view and create notes for their patients" ON public.notas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id::text = auth.uid()::text 
      AND rol = 'psicologo'
      AND codigo_psicologo = (
        SELECT codigo_psicologo FROM public.users WHERE id = paciente_id
      )
    )
  );

-- Create RLS policies for sugerencias table
CREATE POLICY "Patients can view their own suggestions" ON public.sugerencias
  FOR SELECT USING (auth.uid()::text = paciente_id::text);

CREATE POLICY "Psychologists can create suggestions for their patients" ON public.sugerencias
  FOR INSERT WITH CHECK (
    auth.uid()::text = psicologo_id::text AND
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id::text = auth.uid()::text 
      AND rol = 'psicologo'
    )
  );

CREATE POLICY "Psychologists can view suggestions for their patients" ON public.sugerencias
  FOR SELECT USING (
    auth.uid()::text = psicologo_id::text OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id::text = auth.uid()::text 
      AND rol = 'psicologo'
      AND codigo_psicologo = (
        SELECT codigo_psicologo FROM public.users WHERE id = paciente_id
      )
    )
  );

-- Create RLS policies for alertas table
CREATE POLICY "Patients can view their own alerts" ON public.alertas
  FOR SELECT USING (auth.uid()::text = paciente_id::text);

CREATE POLICY "Psychologists can view alerts for their patients" ON public.alertas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id::text = auth.uid()::text 
      AND rol = 'psicologo'
      AND codigo_psicologo = (
        SELECT codigo_psicologo FROM public.users WHERE id = paciente_id
      )
    )
  );

CREATE POLICY "System can create alerts" ON public.alertas
  FOR INSERT WITH CHECK (true);

-- Add missing columns to users table for better patient management
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS edad INTEGER;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS genero TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS especialidad TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS numero_licencia TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS institucion TEXT;