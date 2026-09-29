-- Permite que la administración identifique perfiles al gestionar
-- asociaciones con clientes. La lectura propia existente se conserva.
CREATE POLICY perfiles_leer_administrador
  ON public.perfiles
  FOR SELECT
  TO authenticated
  USING (privado.es_usuario_administrador());
