-- Datos de lectura para el seguimiento de proyectos en Sprint 5.
-- La lectura de registros de seguimiento se delega en RLS de proyectos:
-- solo se ven filas cuyo proyecto padre resulta visible para el usuario.
-- Esa política exige pertenencia a usuarios_cliente y membresía en
-- miembros_proyecto; los administradores se reconocen con el helper existente.

CREATE TYPE public.estado_hito_proyecto AS ENUM (
  'pendiente',
  'en_progreso',
  'completado'
);

REVOKE ALL ON TYPE public.estado_hito_proyecto
  FROM PUBLIC, anon, authenticated;
GRANT USAGE ON TYPE public.estado_hito_proyecto TO authenticated;

CREATE TABLE public.hitos_proyecto (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  proyecto_id uuid NOT NULL
    REFERENCES public.proyectos (id) ON DELETE CASCADE,
  nombre text NOT NULL,
  descripcion text,
  estado public.estado_hito_proyecto NOT NULL DEFAULT 'pendiente',
  fecha_prevista date,
  fecha_completada date,
  orden integer NOT NULL DEFAULT 0,
  creado_en timestamptz NOT NULL DEFAULT pg_catalog.now(),
  actualizado_en timestamptz NOT NULL DEFAULT pg_catalog.now(),
  CONSTRAINT hitos_proyecto_nombre_no_vacio
    CHECK (pg_catalog.length(pg_catalog.btrim(nombre)) > 0),
  CONSTRAINT hitos_proyecto_orden_no_negativo
    CHECK (orden >= 0),
  CONSTRAINT hitos_proyecto_fecha_coherente_con_estado
    CHECK (
      fecha_completada IS NULL
      OR estado = 'completado'::public.estado_hito_proyecto
    )
);

COMMENT ON CONSTRAINT hitos_proyecto_fecha_coherente_con_estado
  ON public.hitos_proyecto IS
  'Una fecha completada requiere estado completado; el estado puede completarse sin fecha conocida.';

CREATE TABLE public.actualizaciones_proyecto (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  proyecto_id uuid NOT NULL
    REFERENCES public.proyectos (id) ON DELETE CASCADE,
  titulo text NOT NULL,
  contenido text NOT NULL,
  creado_por uuid NOT NULL REFERENCES public.perfiles (id),
  creado_en timestamptz NOT NULL DEFAULT pg_catalog.now(),
  actualizado_en timestamptz NOT NULL DEFAULT pg_catalog.now(),
  CONSTRAINT actualizaciones_proyecto_titulo_no_vacio
    CHECK (pg_catalog.length(pg_catalog.btrim(titulo)) > 0),
  CONSTRAINT actualizaciones_proyecto_contenido_no_vacio
    CHECK (pg_catalog.length(pg_catalog.btrim(contenido)) > 0)
);

CREATE INDEX hitos_proyecto_proyecto_orden_idx
  ON public.hitos_proyecto (proyecto_id, orden);

CREATE INDEX actualizaciones_proyecto_proyecto_creado_idx
  ON public.actualizaciones_proyecto (proyecto_id, creado_en DESC);

CREATE TRIGGER al_actualizar_hito_proyecto_establecer_fecha
  BEFORE UPDATE ON public.hitos_proyecto
  FOR EACH ROW
  EXECUTE FUNCTION privado.establecer_actualizado_en_proyecto();

CREATE TRIGGER al_actualizar_actualizacion_proyecto_establecer_fecha
  BEFORE UPDATE ON public.actualizaciones_proyecto
  FOR EACH ROW
  EXECUTE FUNCTION privado.establecer_actualizado_en_proyecto();

ALTER TABLE public.hitos_proyecto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actualizaciones_proyecto ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.hitos_proyecto FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.actualizaciones_proyecto
  FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.hitos_proyecto TO authenticated;
GRANT SELECT ON TABLE public.actualizaciones_proyecto TO authenticated;

CREATE POLICY hitos_proyecto_leer_administrador_o_proyecto_autorizado
  ON public.hitos_proyecto
  FOR SELECT
  TO authenticated
  USING (
    privado.es_usuario_administrador()
    OR EXISTS (
      SELECT 1
      FROM public.proyectos AS proyecto
      WHERE proyecto.id = hitos_proyecto.proyecto_id
    )
  );

CREATE POLICY actualizaciones_proyecto_leer_administrador_o_proyecto_autorizado
  ON public.actualizaciones_proyecto
  FOR SELECT
  TO authenticated
  USING (
    privado.es_usuario_administrador()
    OR EXISTS (
      SELECT 1
      FROM public.proyectos AS proyecto
      WHERE proyecto.id = actualizaciones_proyecto.proyecto_id
    )
  );
