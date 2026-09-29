import { clienteSupabase } from '@/infraestructura/supabase/cliente'
import type {
  DatosActualizarProyecto,
  DatosCrearProyecto,
  Proyecto,
} from './tipos-proyecto'

const CAMPOS_PROYECTO =
  'id, cliente_id, nombre, descripcion, estado, fecha_inicio, fecha_estimada_fin, creado_en, actualizado_en'

export function obtenerProyectos() {
  return clienteSupabase
    .from('proyectos')
    .select(CAMPOS_PROYECTO)
    .overrideTypes<Proyecto[], { merge: false }>()
}

export function obtenerProyecto(proyectoId: string) {
  return clienteSupabase
    .from('proyectos')
    .select(CAMPOS_PROYECTO)
    .eq('id', proyectoId)
    .maybeSingle()
    .overrideTypes<Proyecto | null, { merge: false }>()
}

export function obtenerProyectosPorCliente(clienteId: string) {
  return clienteSupabase
    .from('proyectos')
    .select(CAMPOS_PROYECTO)
    .eq('cliente_id', clienteId)
    .order('creado_en', { ascending: false })
    .order('nombre', { ascending: true })
    .overrideTypes<Proyecto[], { merge: false }>()
}

export function crearProyecto(datos: DatosCrearProyecto) {
  return clienteSupabase
    .from('proyectos')
    .insert({
      cliente_id: datos.cliente_id,
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      estado: datos.estado,
      fecha_inicio: datos.fecha_inicio,
      fecha_estimada_fin: datos.fecha_estimada_fin,
    })
    .select(CAMPOS_PROYECTO)
    .single()
    .overrideTypes<Proyecto, { merge: false }>()
}

export function actualizarProyecto(
  proyectoId: string,
  datos: DatosActualizarProyecto,
) {
  return clienteSupabase
    .from('proyectos')
    .update({
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      estado: datos.estado,
      fecha_inicio: datos.fecha_inicio,
      fecha_estimada_fin: datos.fecha_estimada_fin,
    })
    .eq('id', proyectoId)
    .select(CAMPOS_PROYECTO)
    .maybeSingle()
    .overrideTypes<Proyecto | null, { merge: false }>()
}
