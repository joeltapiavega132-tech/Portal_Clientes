import { clienteSupabase } from '@/infraestructura/supabase/cliente'
import type {
  DatosCrearMiembroProyecto,
  MiembroProyecto,
} from './tipos-miembro-proyecto'
import type { PerfilSeleccionable } from '@/dominio/usuarios_cliente/tipos-asociacion-cliente'

export async function obtenerMiembrosProyecto(proyectoId: string) {
  const { data: miembros, error: errorMiembros } = await clienteSupabase
    .from('miembros_proyecto')
    .select('proyecto_id, cliente_id, usuario_id')
    .eq('proyecto_id', proyectoId)

  if (errorMiembros) throw errorMiembros
  if (!miembros?.length) return [] satisfies MiembroProyecto[]

  const usuarioIds = [...new Set(miembros.map(({ usuario_id }) => usuario_id))]
  const { data: perfiles, error: errorPerfiles } = await clienteSupabase
    .from('perfiles')
    .select('id, nombre, apellido')
    .in('id', usuarioIds)
    .overrideTypes<PerfilSeleccionable[], { merge: false }>()

  if (errorPerfiles) throw errorPerfiles

  const perfilesPorId = new Map(
    (perfiles ?? []).map((perfil) => [perfil.id, perfil]),
  )

  return miembros.map((miembro) => ({
    ...miembro,
    perfil: perfilesPorId.get(miembro.usuario_id) ?? null,
  })) satisfies MiembroProyecto[]
}

export function agregarMiembroProyecto(datos: DatosCrearMiembroProyecto) {
  return clienteSupabase
    .from('miembros_proyecto')
    .insert({
      proyecto_id: datos.proyecto_id,
      cliente_id: datos.cliente_id,
      usuario_id: datos.usuario_id,
    })
    .select('proyecto_id, cliente_id, usuario_id')
    .single()
}

export function quitarMiembroProyecto(
  proyectoId: string,
  usuarioId: string,
) {
  return clienteSupabase
    .from('miembros_proyecto')
    .delete()
    .eq('proyecto_id', proyectoId)
    .eq('usuario_id', usuarioId)
    .select('proyecto_id, usuario_id')
    .maybeSingle()
}
