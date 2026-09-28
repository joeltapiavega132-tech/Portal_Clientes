import { clienteSupabase } from '@/infraestructura/supabase/cliente'
import type { ActualizacionProyecto } from './tipos-actualizacion-proyecto'

export function obtenerActualizacionesProyecto(proyectoId: string) {
  return clienteSupabase
    .from('actualizaciones_proyecto')
    .select(
      'id, proyecto_id, titulo, contenido, creado_por, creado_en, actualizado_en',
    )
    .eq('proyecto_id', proyectoId)
    .order('creado_en', { ascending: false })
    .overrideTypes<ActualizacionProyecto[], { merge: false }>()
}
