export type RolUsuario = 'administrador' | 'cliente'

export interface PerfilUsuario {
  id: string
  nombre: string | null
  apellido: string | null
  rol_usuario: RolUsuario
  creado_en: string
  actualizado_en: string
}
