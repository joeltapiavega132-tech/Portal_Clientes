-- Sprint 6.4: cada miembro debe estar asociado al cliente propietario
-- del proyecto. Las claves foráneas compuestas hacen cumplir esta regla
-- sin consultar tablas mediante políticas RLS ni usar SECURITY DEFINER.

ALTER TABLE public.miembros_proyecto
  ADD COLUMN cliente_id uuid;

UPDATE public.miembros_proyecto AS miembro
SET cliente_id = proyecto.cliente_id
FROM public.proyectos AS proyecto
WHERE proyecto.id = miembro.proyecto_id;

DO $bloque$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.miembros_proyecto AS miembro
    JOIN public.proyectos AS proyecto
      ON proyecto.id = miembro.proyecto_id
    LEFT JOIN public.usuarios_cliente AS usuario_cliente
      ON usuario_cliente.cliente_id = proyecto.cliente_id
     AND usuario_cliente.usuario_id = miembro.usuario_id
    WHERE usuario_cliente.usuario_id IS NULL
  ) THEN
    RAISE EXCEPTION
      'No se puede imponer la integridad de miembros: hay membresías cuyo usuario no está asociado al cliente del proyecto.';
  END IF;
END;
$bloque$;

ALTER TABLE public.miembros_proyecto
  ALTER COLUMN cliente_id SET NOT NULL;

ALTER TABLE public.proyectos
  ADD CONSTRAINT proyectos_id_cliente_id_unico
  UNIQUE (id, cliente_id);

-- La nueva FK mantiene la eliminación en cascada del proyecto, pero bloquea
-- cualquier cambio de cliente_id que tenga membresías referenciando el par.
ALTER TABLE public.miembros_proyecto
  DROP CONSTRAINT miembros_proyecto_proyecto_id_fkey;

ALTER TABLE public.miembros_proyecto
  ADD CONSTRAINT miembros_proyecto_proyecto_cliente_id_fkey
  FOREIGN KEY (proyecto_id, cliente_id)
  REFERENCES public.proyectos (id, cliente_id)
  ON UPDATE RESTRICT
  ON DELETE CASCADE;

-- La asociación usuario-cliente debe existir mientras exista la membresía.
-- RESTRICT impide quitar o cambiar esa asociación dejando miembros huérfanos.
ALTER TABLE public.miembros_proyecto
  ADD CONSTRAINT miembros_proyecto_cliente_usuario_id_fkey
  FOREIGN KEY (cliente_id, usuario_id)
  REFERENCES public.usuarios_cliente (cliente_id, usuario_id)
  ON UPDATE RESTRICT
  ON DELETE RESTRICT;

CREATE INDEX miembros_proyecto_cliente_usuario_id_idx
  ON public.miembros_proyecto (cliente_id, usuario_id);
