-- Sprint 7A: sprints y tareas con lectura por RLS y escritura administrativa.

CREATE TYPE public.estado_sprint AS ENUM (
  'pendiente',
  'en_progreso',
  'completado'
);

CREATE TYPE public.estado_tarea AS ENUM (
  'pendiente',
  'en_progreso',
  'completado'
);

CREATE TYPE public.prioridad_tarea AS ENUM (
  'baja',
  'media',
  'alta'
);

REVOKE ALL ON TYPE
  public.estado_sprint,
  public.estado_tarea,
  public.prioridad_tarea
FROM PUBLIC, anon, authenticated;

GRANT USAGE ON TYPE
  public.estado_sprint,
  public.estado_tarea,
  public.prioridad_tarea
TO authenticated;

CREATE TABLE public.sprints (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  proyecto_id uuid NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  estado public.estado_sprint NOT NULL DEFAULT 'pendiente',
  posicion integer NOT NULL,
  fecha_inicio date,
  fecha_fin date,
  creado_en timestamptz NOT NULL DEFAULT pg_catalog.now(),
  actualizado_en timestamptz NOT NULL DEFAULT pg_catalog.now(),
  CONSTRAINT sprints_proyecto_id_fkey
    FOREIGN KEY (proyecto_id)
    REFERENCES public.proyectos (id)
    ON UPDATE RESTRICT
    ON DELETE CASCADE,
  CONSTRAINT sprints_nombre_no_vacio
    CHECK (pg_catalog.length(pg_catalog.btrim(nombre)) > 0),
  CONSTRAINT sprints_posicion_no_negativa
    CHECK (posicion >= 0),
  CONSTRAINT sprints_fechas_validas
    CHECK (
      fecha_inicio IS NULL
      OR fecha_fin IS NULL
      OR fecha_fin >= fecha_inicio
    ),
  CONSTRAINT sprints_proyecto_posicion_unica
    UNIQUE (proyecto_id, posicion)
    DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE public.tareas (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  sprint_id uuid NOT NULL,
  titulo text NOT NULL,
  descripcion text,
  estado public.estado_tarea NOT NULL DEFAULT 'pendiente',
  prioridad public.prioridad_tarea NOT NULL DEFAULT 'media',
  posicion integer NOT NULL,
  creado_en timestamptz NOT NULL DEFAULT pg_catalog.now(),
  actualizado_en timestamptz NOT NULL DEFAULT pg_catalog.now(),
  CONSTRAINT tareas_sprint_id_fkey
    FOREIGN KEY (sprint_id)
    REFERENCES public.sprints (id)
    ON UPDATE RESTRICT
    ON DELETE CASCADE,
  CONSTRAINT tareas_titulo_no_vacio
    CHECK (pg_catalog.length(pg_catalog.btrim(titulo)) > 0),
  CONSTRAINT tareas_posicion_no_negativa
    CHECK (posicion >= 0),
  CONSTRAINT tareas_sprint_posicion_unica
    UNIQUE (sprint_id, posicion)
    DEFERRABLE INITIALLY DEFERRED
);

-- Los índices únicos anteriores también cubren las consultas por padre y orden.
-- El parcial facilita contar las tareas completadas por sprint.
CREATE INDEX tareas_sprint_completadas_idx
  ON public.tareas (sprint_id)
  WHERE estado = 'completado'::public.estado_tarea;

CREATE TRIGGER al_actualizar_sprint_establecer_fecha
  BEFORE UPDATE ON public.sprints
  FOR EACH ROW
  EXECUTE FUNCTION privado.establecer_actualizado_en_proyecto();

CREATE TRIGGER al_actualizar_tarea_establecer_fecha
  BEFORE UPDATE ON public.tareas
  FOR EACH ROW
  EXECUTE FUNCTION privado.establecer_actualizado_en_proyecto();

REVOKE ALL ON TABLE public.sprints, public.tareas
  FROM PUBLIC, anon, authenticated;

GRANT SELECT ON TABLE public.sprints, public.tareas TO authenticated;

GRANT INSERT (
  proyecto_id,
  nombre,
  descripcion,
  estado,
  posicion,
  fecha_inicio,
  fecha_fin
)
ON TABLE public.sprints TO authenticated;

GRANT UPDATE (
  nombre,
  descripcion,
  estado,
  posicion,
  fecha_inicio,
  fecha_fin
)
ON TABLE public.sprints TO authenticated;

GRANT INSERT (
  sprint_id,
  titulo,
  descripcion,
  estado,
  prioridad,
  posicion
)
ON TABLE public.tareas TO authenticated;

GRANT UPDATE (
  titulo,
  descripcion,
  estado,
  prioridad,
  posicion
)
ON TABLE public.tareas TO authenticated;

ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tareas ENABLE ROW LEVEL SECURITY;

CREATE POLICY sprints_leer_administrador_o_proyecto_autorizado
  ON public.sprints
  FOR SELECT
  TO authenticated
  USING (
    privado.es_usuario_administrador()
    OR EXISTS (
      SELECT 1
      FROM public.proyectos AS proyecto
      WHERE proyecto.id = sprints.proyecto_id
    )
  );

CREATE POLICY sprints_crear_administrador
  ON public.sprints
  FOR INSERT
  TO authenticated
  WITH CHECK (privado.es_usuario_administrador());

CREATE POLICY sprints_actualizar_administrador
  ON public.sprints
  FOR UPDATE
  TO authenticated
  USING (privado.es_usuario_administrador())
  WITH CHECK (privado.es_usuario_administrador());

CREATE POLICY tareas_leer_administrador_o_sprint_autorizado
  ON public.tareas
  FOR SELECT
  TO authenticated
  USING (
    privado.es_usuario_administrador()
    OR EXISTS (
      SELECT 1
      FROM public.sprints AS sprint
      WHERE sprint.id = tareas.sprint_id
    )
  );

CREATE POLICY tareas_crear_administrador
  ON public.tareas
  FOR INSERT
  TO authenticated
  WITH CHECK (privado.es_usuario_administrador());

CREATE POLICY tareas_actualizar_administrador
  ON public.tareas
  FOR UPDATE
  TO authenticated
  USING (privado.es_usuario_administrador())
  WITH CHECK (privado.es_usuario_administrador());
