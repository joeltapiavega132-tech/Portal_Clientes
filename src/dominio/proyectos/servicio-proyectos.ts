import { clienteSupabase } from '@/infraestructura/supabase/cliente'
import type { Proyecto } from './tipos-proyecto'

export function obtenerProyectos() {
  return clienteSupabase
    .from('proyectos')
    .select(
      'id, cliente_id, nombre, descripcion, estado, fecha_inicio, fecha_estimada_fin, creado_en, actualizado_en',
    )
    .overrideTypes<Proyecto[], { merge: false }>()
}

export function obtenerProyecto(proyectoId: string) {
  return clienteSupabase
    .from('proyectos')
    .select(
      'id, cliente_id, nombre, descripcion, estado, fecha_inicio, fecha_estimada_fin, creado_en, actualizado_en',
    )
    .eq('id', proyectoId)
    .maybeSingle()
    .overrideTypes<Proyecto | null, { merge: false }>()
}
