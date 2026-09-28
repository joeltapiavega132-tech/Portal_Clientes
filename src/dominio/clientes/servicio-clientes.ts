import { clienteSupabase } from '@/infraestructura/supabase/cliente'
import type { Cliente, DatosCliente } from './tipos-cliente'

export function obtenerClientes() {
  return clienteSupabase
    .from('clientes')
    .select('id, nombre, nombre_contacto, telefono, estado, creado_en')
    .overrideTypes<Cliente[], { merge: false }>()
}

export function crearCliente(datos: DatosCliente) {
  return clienteSupabase
    .from('clientes')
    .insert(datos)
    .select('id, nombre, nombre_contacto, telefono, estado, creado_en')
    .single()
    .overrideTypes<Cliente, { merge: false }>()
}

export function actualizarCliente(clienteId: string, datos: DatosCliente) {
  return clienteSupabase
    .from('clientes')
    .update(datos)
    .eq('id', clienteId)
    .select('id, nombre, nombre_contacto, telefono, estado, creado_en')
    .single()
    .overrideTypes<Cliente, { merge: false }>()
}
