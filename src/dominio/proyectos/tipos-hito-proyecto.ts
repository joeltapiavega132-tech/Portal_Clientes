export type EstadoHitoProyecto = 'pendiente' | 'en_progreso' | 'completado'

export interface HitoProyecto {
  id: string
  proyecto_id: string
  nombre: string
  descripcion: string | null
  estado: EstadoHitoProyecto
  fecha_prevista: string | null
  fecha_completada: string | null
  orden: number
  creado_en: string
  actualizado_en: string
}
