import { clienteSupabase } from '@/infraestructura/supabase/cliente'

export interface ErrorPruebaRls {
  codigo: string | null
  mensaje: string
}

export interface ResultadoPruebaRls<T> {
  filas: T[]
  filasAfectadas: number
  error: ErrorPruebaRls | null
}

export interface SprintPruebaRls {
  id: string
  proyecto_id: string
  nombre: string
  estado: string
  posicion: number
}

export interface TareaPruebaRls {
  id: string
  sprint_id: string
  titulo: string
  estado: string
  prioridad: string
  posicion: number
}

function convertirResultado<T>(filas: T[] | null, error: { code?: string; message: string } | null) {
  const filasSeguras = filas ?? []
  return {
    filas: filasSeguras,
    filasAfectadas: filasSeguras.length,
    error: error ? { codigo: error.code ?? null, mensaje: error.message } : null,
  }
}

export async function consultarSprintsProyecto(proyectoId: string) {
  const { data, error } = await clienteSupabase
    .from('sprints')
    .select('id, proyecto_id, nombre, estado, posicion')
    .eq('proyecto_id', proyectoId)
    .order('posicion', { ascending: true })
    .limit(100)
  return convertirResultado<SprintPruebaRls>(data, error)
}

export async function consultarTareasSprint(sprintId: string) {
  const { data, error } = await clienteSupabase
    .from('tareas')
    .select('id, sprint_id, titulo, estado, prioridad, posicion')
    .eq('sprint_id', sprintId)
    .order('posicion', { ascending: true })
    .limit(100)
  return convertirResultado<TareaPruebaRls>(data, error)
}

export async function consultarSprintPorId(sprintId: string) {
  const { data, error } = await clienteSupabase
    .from('sprints')
    .select('id, proyecto_id, nombre, estado, posicion')
    .eq('id', sprintId)
    .limit(1)
  return convertirResultado<SprintPruebaRls>(data, error)
}

export async function consultarTareaPorId(tareaId: string) {
  const { data, error } = await clienteSupabase
    .from('tareas')
    .select('id, sprint_id, titulo, estado, prioridad, posicion')
    .eq('id', tareaId)
    .limit(1)
  return convertirResultado<TareaPruebaRls>(data, error)
}

export async function insertarSprintPrueba(datos: {
  proyecto_id: string
  nombre: string
  descripcion: string
  estado: 'pendiente' | 'en_progreso' | 'completado'
  posicion: number
}) {
  const { data, error } = await clienteSupabase
    .from('sprints')
    .insert(datos)
    .select('id, proyecto_id, nombre, estado, posicion')
  return convertirResultado<SprintPruebaRls>(data, error)
}

export async function actualizarSprintPrueba(datos: {
  sprint_id: string
  estado: 'pendiente' | 'en_progreso' | 'completado'
}) {
  const { data, error } = await clienteSupabase
    .from('sprints')
    .update({ estado: datos.estado })
    .eq('id', datos.sprint_id)
    .select('id, proyecto_id, nombre, estado, posicion')
  return convertirResultado<SprintPruebaRls>(data, error)
}

export async function insertarTareaPrueba(datos: {
  sprint_id: string
  titulo: string
  descripcion: string
  estado: 'pendiente' | 'en_progreso' | 'completado'
  prioridad: 'baja' | 'media' | 'alta'
  posicion: number
}) {
  const { data, error } = await clienteSupabase
    .from('tareas')
    .insert(datos)
    .select('id, sprint_id, titulo, estado, prioridad, posicion')
  return convertirResultado<TareaPruebaRls>(data, error)
}

export async function actualizarTareaPrueba(datos: {
  tarea_id: string
  estado: 'pendiente' | 'en_progreso' | 'completado'
}) {
  const { data, error } = await clienteSupabase
    .from('tareas')
    .update({ estado: datos.estado })
    .eq('id', datos.tarea_id)
    .select('id, sprint_id, titulo, estado, prioridad, posicion')
  return convertirResultado<TareaPruebaRls>(data, error)
}

export async function intentarCambiarProyectoSprint(datos: {
  sprint_id: string
  proyecto_id: string
}) {
  const { data, error } = await clienteSupabase
    .from('sprints')
    .update({ proyecto_id: datos.proyecto_id })
    .eq('id', datos.sprint_id)
    .select('id, proyecto_id, nombre, estado, posicion')
  return convertirResultado<SprintPruebaRls>(data, error)
}

export async function intentarCambiarSprintTarea(datos: {
  tarea_id: string
  sprint_id: string
}) {
  const { data, error } = await clienteSupabase
    .from('tareas')
    .update({ sprint_id: datos.sprint_id })
    .eq('id', datos.tarea_id)
    .select('id, sprint_id, titulo, estado, prioridad, posicion')
  return convertirResultado<TareaPruebaRls>(data, error)
}
