import type { PerfilUsuario } from '@/dominio/autenticacion/tipos-perfil'

export type PerfilSeleccionable = Pick<
  PerfilUsuario,
  'id' | 'nombre' | 'apellido'
>

export interface AsociacionUsuarioCliente {
  cliente_id: string
  usuario_id: string
  creado_en: string
  perfil: PerfilSeleccionable | null
}

export interface DatosAsociacionUsuarioCliente {
  cliente_id: string
  usuario_id: string
}
