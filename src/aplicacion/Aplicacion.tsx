import { Rutas } from './rutas'
import { Proveedores } from './proveedores'

export function Aplicacion() {
  return (
    <Proveedores contenido={<Rutas />} />
  )
}
