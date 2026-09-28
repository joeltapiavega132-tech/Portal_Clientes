export type EstadoCliente = 'activo' | 'inactivo'

export interface Cliente {
  id: string
  nombre: string
  nombre_contacto: string | null
  telefono: string | null
  estado: EstadoCliente
  creado_en: string
}
