import { clienteSupabase } from '@/infraestructura/supabase/cliente'
import type {
  AsociacionUsuarioCliente,
  DatosAsociacionUsuarioCliente,
  PerfilSeleccionable,
} from './tipos-asociacion-cliente'

export async function obtenerUsuariosCliente(clienteId: string) {
  const { data: asociaciones, error: errorAsociaciones } = await clienteSupabase
    .from('usuarios_cliente')
    .select('cliente_id, usuario_id, creado_en')
    .eq('cliente_id', clienteId)

  if (errorAsociaciones) throw errorAsociaciones
  if (!asociaciones?.length) return [] satisfies AsociacionUsuarioCliente[]

  const usuarioIds = [...new Set(asociaciones.map(({ usuario_id }) => usuario_id))]
  const { data: perfiles, error: errorPerfiles } = await clienteSupabase
    .from('perfiles')
    .select('id, nombre, apellido')
    .in('id', usuarioIds)
    .overrideTypes<PerfilSeleccionable[], { merge: false }>()

  if (errorPerfiles) throw errorPerfiles

  const perfilesPorId = new Map(
    (perfiles ?? []).map((perfil) => [perfil.id, perfil]),
  )

  return asociaciones.map((asociacion) => ({
    ...asociacion,
    perfil: perfilesPorId.get(asociacion.usuario_id) ?? null,
  })) satisfies AsociacionUsuarioCliente[]
}

export function obtenerPerfilesParaSeleccion() {
  return clienteSupabase
    .from('perfiles')
    .select('id, nombre, apellido')
    .order('nombre', { ascending: true, nullsFirst: false })
    .order('apellido', { ascending: true, nullsFirst: false })
    .overrideTypes<PerfilSeleccionable[], { merge: false }>()
}

export function asociarUsuarioACliente(
  datos: DatosAsociacionUsuarioCliente,
) {
  return clienteSupabase
    .from('usuarios_cliente')
    .insert(datos)
    .select('cliente_id, usuario_id, creado_en')
    .single()
}

export function quitarUsuarioDeCliente(
  clienteId: string,
  usuarioId: string,
) {
  return clienteSupabase
    .from('usuarios_cliente')
    .delete()
    .eq('cliente_id', clienteId)
    .eq('usuario_id', usuarioId)
    .select('cliente_id, usuario_id, creado_en')
    .maybeSingle()
}
