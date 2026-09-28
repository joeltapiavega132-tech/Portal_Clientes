import { clienteSupabase } from '@/infraestructura/supabase/cliente'
import type { Cliente } from './tipos-cliente'

export function obtenerClientes() {
  return clienteSupabase
    .from('clientes')
    .select('id, nombre, nombre_contacto, telefono, estado, creado_en')
    .overrideTypes<Cliente[], { merge: false }>()
}
