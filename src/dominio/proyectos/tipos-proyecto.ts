export type EstadoProyecto =
  | 'planificacion'
  | 'en_progreso'
  | 'pausado'
  | 'completado'
  | 'archivado'

export interface Proyecto {
  id: string
  cliente_id: string
  nombre: string
  descripcion: string | null
  estado: EstadoProyecto
  fecha_inicio: string | null
  fecha_estimada_fin: string | null
  creado_en: string
  actualizado_en: string
}
