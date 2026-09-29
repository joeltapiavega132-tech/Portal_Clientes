import type { PerfilSeleccionable } from '@/dominio/usuarios_cliente/tipos-asociacion-cliente'

export interface MiembroProyecto {
  proyecto_id: string
  cliente_id: string
  usuario_id: string
  perfil: PerfilSeleccionable | null
}

export interface DatosCrearMiembroProyecto {
  proyecto_id: string
  cliente_id: string
  usuario_id: string
}
