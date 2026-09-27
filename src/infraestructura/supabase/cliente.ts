import { createClient } from '@supabase/supabase-js'

const direccionSupabase = import.meta.env.VITE_SUPABASE_URL
const clavePublicableSupabase = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

const variablesFaltantes = [
  !direccionSupabase?.trim() && 'VITE_SUPABASE_URL',
  !clavePublicableSupabase?.trim() && 'VITE_SUPABASE_PUBLISHABLE_KEY',
].filter(Boolean)

if (variablesFaltantes.length > 0) {
  throw new Error(
    `Falta configurar en .env.local: ${variablesFaltantes.join(', ')}.`,
  )
}

export const clienteSupabase = createClient(
  direccionSupabase,
  clavePublicableSupabase,
)
