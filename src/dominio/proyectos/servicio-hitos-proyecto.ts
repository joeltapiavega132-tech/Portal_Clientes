import { clienteSupabase } from '@/infraestructura/supabase/cliente'
import type { HitoProyecto } from './tipos-hito-proyecto'

export function obtenerHitosProyecto(proyectoId: string) {
  return clienteSupabase
    .from('hitos_proyecto')
    .select(
      'id, proyecto_id, nombre, descripcion, estado, fecha_prevista, fecha_completada, orden, creado_en, actualizado_en',
    )
    .eq('proyecto_id', proyectoId)
    .order('orden', { ascending: true })
    .overrideTypes<HitoProyecto[], { merge: false }>()
}
