export type RolUsuario = 'administrador' | 'cliente'
export type EstadoUsuario = 'activo' | 'inactivo'

export interface PerfilUsuario {
  id: string
  nombre: string | null
  apellido: string | null
  rol_usuario: RolUsuario
  estado: EstadoUsuario
  creado_en: string
  actualizado_en: string
}
