import type { ReactNode } from 'react'

interface PropiedadesProveedores {
  contenido: ReactNode
}

export function Proveedores({ contenido }: PropiedadesProveedores) {
  return <>{contenido}</>
}
