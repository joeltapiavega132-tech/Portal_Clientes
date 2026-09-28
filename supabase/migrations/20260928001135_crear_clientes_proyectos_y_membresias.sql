-- Modelo base de clientes, proyectos y asignaciones para Sprint 2.
-- La tabla usuarios_cliente conserva el vínculo usuario-organización definido
-- en el modelo del proyecto. Para leer un proyecto, un cliente debe pertenecer
-- a su organización y tener una asignación explícita en miembros_proyecto.
--
-- Los clientes se desactivan mediante estado_cliente y los proyectos se
-- archivan mediante estado_proyecto; esta migración no concede borrado físico.
-- La asignación inicial del rol administrador sigue pendiente. Hasta definir
-- un proceso confiable, las políticas administrativas no serán utilizables
-- por cuentas cliente y no se crea ningún administrador automáticamente.

CREATE SCHEMA privado;
REVOKE ALL ON SCHEMA privado FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA privado TO authenticated;

CREATE TYPE public.estado_cliente AS ENUM (
  'activo',
  'inactivo'
);

CREATE TYPE public.estado_proyecto AS ENUM (
  'planificacion',
  'en_progreso',
  'pausado',
  'completado',
  'archivado'
);

REVOKE ALL ON TYPE public.estado_cliente, public.estado_proyecto
  FROM PUBLIC, anon, authenticated;
GRANT USAGE ON TYPE public.estado_cliente, public.estado_proyecto
  TO authenticated;

CREATE TABLE public.clientes (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  nombre text NOT NULL,
  nombre_contacto text,
  telefono text,
  estado public.estado_cliente NOT NULL DEFAULT 'activo',
  creado_en timestamptz NOT NULL DEFAULT pg_catalog.now()
);

CREATE TABLE public.usuarios_cliente (
  cliente_id uuid NOT NULL
    REFERENCES public.clientes (id) ON DELETE CASCADE,
  usuario_id uuid NOT NULL
    REFERENCES public.perfiles (id) ON DELETE CASCADE,
  creado_en timestamptz NOT NULL DEFAULT pg_catalog.now(),
  PRIMARY KEY (cliente_id, usuario_id)
);

CREATE TABLE public.proyectos (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  cliente_id uuid NOT NULL
    REFERENCES public.clientes (id) ON DELETE RESTRICT,
  nombre text NOT NULL,
  descripcion text,
  estado public.estado_proyecto NOT NULL DEFAULT 'planificacion',
  fecha_inicio date,
  fecha_estimada_fin date,
  creado_en timestamptz NOT NULL DEFAULT pg_catalog.now(),
  actualizado_en timestamptz NOT NULL DEFAULT pg_catalog.now(),
  CONSTRAINT proyectos_fechas_validas CHECK (
    fecha_inicio IS NULL
    OR fecha_estimada_fin IS NULL
    OR fecha_estimada_fin >= fecha_inicio
  )
);

CREATE TABLE public.miembros_proyecto (
  proyecto_id uuid NOT NULL
    REFERENCES public.proyectos (id) ON DELETE CASCADE,
  usuario_id uuid NOT NULL
    REFERENCES public.perfiles (id) ON DELETE CASCADE,
  PRIMARY KEY (proyecto_id, usuario_id)
);

CREATE INDEX usuarios_cliente_usuario_id_idx
  ON public.usuarios_cliente (usuario_id, cliente_id);

CREATE INDEX proyectos_cliente_id_idx
  ON public.proyectos (cliente_id);

CREATE INDEX miembros_proyecto_usuario_id_idx
  ON public.miembros_proyecto (usuario_id, proyecto_id);

CREATE OR REPLACE FUNCTION privado.es_usuario_administrador()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $funcion$
  SELECT EXISTS (
    SELECT 1
    FROM public.perfiles AS perfil
    WHERE perfil.id = (SELECT auth.uid())
      AND perfil.rol_usuario = 'administrador'::public.rol_usuario
  );
$funcion$;

REVOKE ALL ON FUNCTION privado.es_usuario_administrador()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION privado.es_usuario_administrador()
  TO authenticated;

CREATE OR REPLACE FUNCTION privado.establecer_actualizado_en_proyecto()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $funcion$
BEGIN
  NEW.actualizado_en := pg_catalog.now();
  RETURN NEW;
END;
$funcion$;

REVOKE ALL ON FUNCTION privado.establecer_actualizado_en_proyecto()
  FROM PUBLIC, anon, authenticated;

CREATE TRIGGER al_actualizar_proyecto_establecer_fecha
  BEFORE UPDATE ON public.proyectos
  FOR EACH ROW
  EXECUTE FUNCTION privado.establecer_actualizado_en_proyecto();

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios_cliente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.miembros_proyecto ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.clientes FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.usuarios_cliente FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.proyectos FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.miembros_proyecto FROM PUBLIC, anon, authenticated;

GRANT SELECT, INSERT, UPDATE ON TABLE public.clientes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE public.usuarios_cliente TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.proyectos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE public.miembros_proyecto TO authenticated;

CREATE POLICY clientes_leer_administrador_o_usuario_asociado
  ON public.clientes
  FOR SELECT
  TO authenticated
  USING (
    privado.es_usuario_administrador()
    OR EXISTS (
      SELECT 1
      FROM public.usuarios_cliente AS usuario_cliente
      WHERE usuario_cliente.cliente_id = clientes.id
        AND usuario_cliente.usuario_id = (SELECT auth.uid())
    )
  );

CREATE POLICY clientes_crear_administrador
  ON public.clientes
  FOR INSERT
  TO authenticated
  WITH CHECK (privado.es_usuario_administrador());

CREATE POLICY clientes_actualizar_administrador
  ON public.clientes
  FOR UPDATE
  TO authenticated
  USING (privado.es_usuario_administrador())
  WITH CHECK (privado.es_usuario_administrador());

CREATE POLICY usuarios_cliente_leer_propios_o_administrador
  ON public.usuarios_cliente
  FOR SELECT
  TO authenticated
  USING (
    usuario_id = (SELECT auth.uid())
    OR privado.es_usuario_administrador()
  );

CREATE POLICY usuarios_cliente_administrar_administrador
  ON public.usuarios_cliente
  FOR ALL
  TO authenticated
  USING (privado.es_usuario_administrador())
  WITH CHECK (privado.es_usuario_administrador());

CREATE POLICY proyectos_leer_administrador_o_miembro_autorizado
  ON public.proyectos
  FOR SELECT
  TO authenticated
  USING (
    privado.es_usuario_administrador()
    OR (
      EXISTS (
        SELECT 1
        FROM public.usuarios_cliente AS usuario_cliente
        WHERE usuario_cliente.cliente_id = proyectos.cliente_id
          AND usuario_cliente.usuario_id = (SELECT auth.uid())
      )
      AND EXISTS (
        SELECT 1
        FROM public.miembros_proyecto AS miembro
        WHERE miembro.proyecto_id = proyectos.id
          AND miembro.usuario_id = (SELECT auth.uid())
      )
    )
  );

CREATE POLICY proyectos_crear_administrador
  ON public.proyectos
  FOR INSERT
  TO authenticated
  WITH CHECK (privado.es_usuario_administrador());

CREATE POLICY proyectos_actualizar_administrador
  ON public.proyectos
  FOR UPDATE
  TO authenticated
  USING (privado.es_usuario_administrador())
  WITH CHECK (privado.es_usuario_administrador());

CREATE POLICY miembros_proyecto_leer_propios_o_administrador
  ON public.miembros_proyecto
  FOR SELECT
  TO authenticated
  USING (
    usuario_id = (SELECT auth.uid())
    OR privado.es_usuario_administrador()
  );

CREATE POLICY miembros_proyecto_administrar_administrador
  ON public.miembros_proyecto
  FOR ALL
  TO authenticated
  USING (privado.es_usuario_administrador())
  WITH CHECK (privado.es_usuario_administrador());
