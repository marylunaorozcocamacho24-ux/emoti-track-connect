-- Drop the existing constraint
ALTER TABLE evaluaciones DROP CONSTRAINT tipo_prueba_valid;

-- Add updated constraint with all test types
ALTER TABLE evaluaciones ADD CONSTRAINT tipo_prueba_valid 
CHECK (tipo_prueba = ANY (ARRAY[
  'PHQ-2'::text, 
  'GAD-2'::text, 
  'PHQ-2+GAD-2'::text,
  'test_emocional_diario'::text
]));