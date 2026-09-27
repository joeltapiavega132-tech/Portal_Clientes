-- Identidad y perfiles base para Yanax Client Portal.
-- Pendiente: definir el procedimiento confiable para asignar rol administrador.
-- Hasta entonces, cada usuario nuevo recibe el rol cliente; no existe una
-- política que permita cambiar el rol desde una sesión de cliente.
-- Pendiente: definir si cada usuario puede editar su nombre y apellido.
-- Esta migración no concede permisos de actualización a authenticated.

CREATE TYPE public.rol_usuario AS ENUM (
  'administrador',
  'cliente'
);

CREATE TABLE public.perfiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  nombre text,
  apellido text,
  rol_usuario public.rol_usuario NOT NULL DEFAULT 'cliente',
  creado_en timestamptz NOT NULL DEFAULT pg_catalog.now(),
  actualizado_en timestamptz NOT NULL DEFAULT pg_catalog.now()
);

COMMENT ON TABLE public.perfiles IS
  'Perfil asociado uno a uno con una identidad de Supabase Auth.';

COMMENT ON COLUMN public.perfiles.rol_usuario IS
  'Los registros creados desde Supabase Auth reciben cliente. La asignación de administradores está pendiente de definir.';

CREATE OR REPLACE FUNCTION public.crear_perfil_nuevo_usuario()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $funcion$
BEGIN
  INSERT INTO public.perfiles (id, rol_usuario)
  VALUES (NEW.id, 'cliente'::public.rol_usuario);

  RETURN NEW;
END;
$funcion$;

REVOKE ALL ON FUNCTION public.crear_perfil_nuevo_usuario()
  FROM PUBLIC, anon, authenticated;

CREATE TRIGGER al_crear_usuario_auth_crear_perfil
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.crear_perfil_nuevo_usuario();

CREATE OR REPLACE FUNCTION public.establecer_actualizado_en_perfil()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $funcion$
BEGIN
  NEW.actualizado_en := pg_catalog.now();
  RETURN NEW;
END;
$funcion$;

REVOKE ALL ON FUNCTION public.establecer_actualizado_en_perfil()
  FROM PUBLIC, anon, authenticated;

CREATE TRIGGER al_actualizar_perfil_establecer_fecha
  BEFORE UPDATE ON public.perfiles
  FOR EACH ROW
  EXECUTE FUNCTION public.establecer_actualizado_en_perfil();

ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.perfiles FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.perfiles TO authenticated;

CREATE POLICY perfiles_leer_propio
  ON public.perfiles
  FOR SELECT
  TO authenticated
  USING (id = (SELECT auth.uid()));
