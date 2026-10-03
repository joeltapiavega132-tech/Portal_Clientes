import { clienteSupabase } from '@/infraestructura/supabase/cliente'
import type { EstadoUsuario } from '@/dominio/autenticacion/tipos-perfil'
import type {
  DatosCrearUsuarioAdministrativo,
  PerfilAdministrativo,
  ResultadoCambioEstadoUsuario,
  ResultadoCrearUsuarioAdministrativo,
} from './tipos-usuario-administrativo'

export function obtenerUsuariosAdministrativos() {
  return clienteSupabase
    .from('perfiles')
    .select('id, nombre, apellido, rol_usuario, estado, creado_en, actualizado_en')
    .order('creado_en', { ascending: false })
    .overrideTypes<PerfilAdministrativo[], { merge: false }>()
}

export async function crearUsuarioAdministrativo(
  datos: DatosCrearUsuarioAdministrativo,
) {
  const { data, error } = await clienteSupabase.functions.invoke(
    'administrar-usuarios',
    {
      body: { accion: 'crear_usuario', ...datos },
    },
  )

  if (error) throw await convertirErrorFuncion(error)
  if (data?.error) throw new Error(String(data.error))
  return data as ResultadoCrearUsuarioAdministrativo
}

export async function cambiarEstadoUsuarioAdministrativo(
  usuarioId: string,
  estado: EstadoUsuario,
  contrasenaAdmin: string,
) {
  const { data, error } = await clienteSupabase.functions.invoke(
    'administrar-usuarios',
    {
      body: {
        accion: 'cambiar_estado',
        usuario_id: usuarioId,
        estado,
        contrasena_admin: contrasenaAdmin,
      },
    },
  )

  if (error) throw await convertirErrorFuncion(error)
  if (data?.error) throw new Error(String(data.error))
  return data as ResultadoCambioEstadoUsuario
}

async function convertirErrorFuncion(error: Error & { context?: unknown }) {
  if (error.context instanceof Response) {
    try {
      const cuerpo: unknown = await error.context.clone().json()
      if (
        typeof cuerpo === 'object' &&
        cuerpo !== null &&
        'error' in cuerpo &&
        typeof cuerpo.error === 'string'
      ) {
        const identificador =
          'usuario_id' in cuerpo && typeof cuerpo.usuario_id === 'string'
            ? ` Identificador para reconciliación: ${cuerpo.usuario_id}.`
            : ''
        return new Error(`${cuerpo.error}${identificador}`)
      }
    } catch {
      // Se usa el mensaje genérico inferior si la respuesta no es JSON.
    }
  }
  return new Error(
    'No se pudo confirmar el resultado. Actualiza la lista antes de volver a intentar.',
  )
}
