-- Crear tabla para planes de suscripción
CREATE TABLE IF NOT EXISTS public.planes_suscripcion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  descripcion text,
  duracion_dias integer NOT NULL DEFAULT 30,
  precio decimal(10,2) NOT NULL,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Crear tabla para suscripciones de psicólogos
CREATE TABLE IF NOT EXISTS public.suscripciones_psicologo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  psicologo_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES public.planes_suscripcion(id),
  estado text NOT NULL DEFAULT 'pendiente', -- activa, vencida, pendiente
  fecha_inicio timestamp with time zone,
  fecha_vencimiento timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Crear tabla para pagos
CREATE TABLE IF NOT EXISTS public.pagos_psicologo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  psicologo_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  suscripcion_id uuid REFERENCES public.suscripciones_psicologo(id),
  monto decimal(10,2) NOT NULL,
  estado text NOT NULL DEFAULT 'pendiente', -- aprobado, pendiente, rechazado
  metodo_pago text,
  comprobante_url text,
  fecha_pago timestamp with time zone DEFAULT now(),
  aprobado_por uuid REFERENCES auth.users(id),
  fecha_aprobacion timestamp with time zone,
  notas text,
  created_at timestamp with time zone DEFAULT now()
);

-- Agregar campo cuenta_activa a la tabla users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS cuenta_activa boolean DEFAULT true;

-- Enable RLS
ALTER TABLE public.planes_suscripcion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suscripciones_psicologo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos_psicologo ENABLE ROW LEVEL SECURITY;

-- Políticas para planes_suscripcion
CREATE POLICY "Admins can manage subscription plans"
  ON public.planes_suscripcion
  FOR ALL
  USING (is_administrator(auth.uid()))
  WITH CHECK (is_administrator(auth.uid()));

CREATE POLICY "Psychologists can view active plans"
  ON public.planes_suscripcion
  FOR SELECT
  USING (activo = true AND is_psychologist(auth.uid()));

-- Políticas para suscripciones_psicologo
CREATE POLICY "Admins can manage all subscriptions"
  ON public.suscripciones_psicologo
  FOR ALL
  USING (is_administrator(auth.uid()))
  WITH CHECK (is_administrator(auth.uid()));

CREATE POLICY "Psychologists can view their own subscription"
  ON public.suscripciones_psicologo
  FOR SELECT
  USING (auth.uid() = psicologo_id AND is_psychologist(auth.uid()));

-- Políticas para pagos_psicologo
CREATE POLICY "Admins can manage all payments"
  ON public.pagos_psicologo
  FOR ALL
  USING (is_administrator(auth.uid()))
  WITH CHECK (is_administrator(auth.uid()));

CREATE POLICY "Psychologists can view their own payments"
  ON public.pagos_psicologo
  FOR SELECT
  USING (auth.uid() = psicologo_id AND is_psychologist(auth.uid()));

CREATE POLICY "Psychologists can create their own payment records"
  ON public.pagos_psicologo
  FOR INSERT
  WITH CHECK (auth.uid() = psicologo_id AND is_psychologist(auth.uid()));

-- Trigger para actualizar updated_at
CREATE TRIGGER update_suscripciones_updated_at
  BEFORE UPDATE ON public.suscripciones_psicologo
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Función para aprobar pago y renovar suscripción
CREATE OR REPLACE FUNCTION public.aprobar_pago_y_renovar_suscripcion(
  _pago_id uuid,
  _admin_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _psicologo_id uuid;
  _suscripcion_id uuid;
  _plan_duracion integer;
  _nueva_fecha_vencimiento timestamp with time zone;
BEGIN
  -- Verificar que el usuario es administrador
  IF NOT is_administrator(_admin_id) THEN
    RAISE EXCEPTION 'Usuario no autorizado';
  END IF;

  -- Obtener información del pago
  SELECT psicologo_id, suscripcion_id
  INTO _psicologo_id, _suscripcion_id
  FROM pagos_psicologo
  WHERE id = _pago_id;

  -- Actualizar estado del pago
  UPDATE pagos_psicologo
  SET estado = 'aprobado',
      aprobado_por = _admin_id,
      fecha_aprobacion = now()
  WHERE id = _pago_id;

  -- Obtener duración del plan
  SELECT p.duracion_dias INTO _plan_duracion
  FROM suscripciones_psicologo s
  JOIN planes_suscripcion p ON s.plan_id = p.id
  WHERE s.id = _suscripcion_id;

  -- Calcular nueva fecha de vencimiento
  _nueva_fecha_vencimiento := now() + (_plan_duracion || ' days')::interval;

  -- Actualizar suscripción
  UPDATE suscripciones_psicologo
  SET estado = 'activa',
      fecha_inicio = COALESCE(fecha_inicio, now()),
      fecha_vencimiento = _nueva_fecha_vencimiento,
      updated_at = now()
  WHERE id = _suscripcion_id;

  -- Activar cuenta del psicólogo
  UPDATE users
  SET cuenta_activa = true
  WHERE id = _psicologo_id;

  RETURN true;
END;
$$;

-- Habilitar realtime para las tablas
ALTER PUBLICATION supabase_realtime ADD TABLE public.suscripciones_psicologo;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pagos_psicologo;

ALTER TABLE public.suscripciones_psicologo REPLICA IDENTITY FULL;
ALTER TABLE public.pagos_psicologo REPLICA IDENTITY FULL;

-- Insertar planes de ejemplo
INSERT INTO public.planes_suscripcion (nombre, descripcion, duracion_dias, precio, activo)
VALUES 
  ('Mensual', 'Plan mensual para psicólogos', 30, 29.99, true),
  ('Trimestral', 'Plan trimestral con descuento', 90, 79.99, true),
  ('Anual', 'Plan anual con mayor descuento', 365, 299.99, true)
ON CONFLICT DO NOTHING;