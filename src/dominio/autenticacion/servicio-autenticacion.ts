import { clienteSupabase } from '@/infraestructura/supabase/cliente'

export function iniciarSesion(correo: string, contrasena: string) {
  return clienteSupabase.auth.signInWithPassword({
    email: correo,
    password: contrasena,
  })
}

export function registrarUsuario(correo: string, contrasena: string) {
  return clienteSupabase.auth.signUp({
    email: correo,
    password: contrasena,
  })
}

export function cerrarSesion() {
  return clienteSupabase.auth.signOut({ scope: 'local' })
}

export function solicitarRecuperacionContrasena(correo: string) {
  return clienteSupabase.auth.resetPasswordForEmail(correo)
}

export function establecerContrasenaUsuario(contrasena: string) {
  return clienteSupabase.auth.updateUser({ password: contrasena })
}

export function obtenerSesionActual() {
  return clienteSupabase.auth.getSession()
}
