import type { ReactNode } from 'react'
import { ProveedorAutenticacion } from '@/dominio/autenticacion/contexto-autenticacion'

interface PropiedadesProveedores {
  contenido: ReactNode
}

export function Proveedores({ contenido }: PropiedadesProveedores) {
  return (
    <ProveedorAutenticacion contenido={contenido} />
  )
}
