import { clienteSupabase } from '@/infraestructura/supabase/cliente'
import type { PerfilUsuario } from './tipos-perfil'

export function obtenerPerfilUsuario(usuarioId: string) {
  return clienteSupabase
    .from('perfiles')
    .select('id, nombre, apellido, rol_usuario, creado_en, actualizado_en')
    .eq('id', usuarioId)
    .maybeSingle()
    .overrideTypes<PerfilUsuario, { merge: false }>()
}
