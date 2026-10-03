import type { EstadoUsuario, RolUsuario } from '@/dominio/autenticacion/tipos-perfil'

export interface PerfilAdministrativo {
  id: string
  nombre: string | null
  apellido: string | null
  rol_usuario: RolUsuario
  estado: EstadoUsuario
  creado_en: string
  actualizado_en: string
}

export interface DatosCrearUsuarioAdministrativo {
  nombre: string
  apellido: string
  correo: string
  rol_usuario: RolUsuario
  cliente_id: string | null
  proyecto_ids: string[]
}

export interface ResultadoCrearUsuarioAdministrativo {
  usuario_id: string
  rol_usuario: RolUsuario
  estado: EstadoUsuario
  invitacion_enviada: true
}

export interface ResultadoCambioEstadoUsuario {
  usuario_id: string
  estado: EstadoUsuario
}
