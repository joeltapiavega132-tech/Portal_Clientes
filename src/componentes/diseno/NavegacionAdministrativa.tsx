import { useState } from 'react'
import { Building2, LayoutDashboard, LogOut } from 'lucide-react'
import { usarAutenticacion } from '@/dominio/autenticacion/contexto-autenticacion'

type SeccionAdministrativa = 'inicio' | 'clientes'

interface PropiedadesNavegacionAdministrativa {
  seccionActual: SeccionAdministrativa
}

const enlacesNavegacion: {
  etiqueta: string
  icono: typeof LayoutDashboard
  ruta: string
  seccion: SeccionAdministrativa
}[] = [
  {
    etiqueta: 'Inicio',
    icono: LayoutDashboard,
    ruta: '/aplicacion/administracion',
    seccion: 'inicio',
  },
  {
    etiqueta: 'Clientes',
    icono: Building2,
    ruta: '/aplicacion/administracion/clientes',
    seccion: 'clientes',
  },
]

export function NavegacionAdministrativa({
  seccionActual,
}: PropiedadesNavegacionAdministrativa) {
  const { cerrarSesion } = usarAutenticacion()
  const [cerrandoSesion, establecerCerrandoSesion] = useState(false)
  const [errorAlCerrar, establecerErrorAlCerrar] = useState(false)

  async function manejarCierreSesion() {
    establecerCerrandoSesion(true)
    establecerErrorAlCerrar(false)

    try {
      const { error } = await cerrarSesion()
      establecerErrorAlCerrar(Boolean(error))
    } catch {
      establecerErrorAlCerrar(true)
    } finally {
      establecerCerrandoSesion(false)
    }
  }

  return (
    <header className="border-b border-yanax-turquesa/10 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-7 sm:py-5">
        <div className="flex items-center justify-between gap-3">
          <a
            aria-label="Yanax Client Portal, inicio administrativo"
            className="text-base font-bold tracking-[0.16em] text-yanax-azul-profundo sm:text-lg"
            href="/aplicacion/administracion"
          >
            YANAX
          </a>
          <button
            aria-busy={cerrandoSesion}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-yanax-turquesa/20 px-3 text-sm font-semibold text-yanax-turquesa transition hover:bg-yanax-turquesa hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 sm:px-4"
            disabled={cerrandoSesion}
            onClick={() => void manejarCierreSesion()}
            type="button"
          >
            <LogOut aria-hidden="true" className="size-4" />
            <span>{cerrandoSesion ? 'Cerrando sesión...' : 'Cerrar sesión'}</span>
          </button>
        </div>

        <nav
          aria-label="Navegación administrativa"
          className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap"
        >
          {enlacesNavegacion.map(
            ({ etiqueta, icono: Icono, ruta, seccion }) => {
              const actual = seccionActual === seccion

              return (
                <a
                  aria-current={actual ? 'page' : undefined}
                  className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja focus-visible:ring-offset-2 sm:px-4 ${
                    actual
                      ? 'bg-yanax-azul-profundo text-white'
                      : 'text-yanax-azul-profundo hover:bg-yanax-verde-claro'
                  }`}
                  href={ruta}
                  key={seccion}
                >
                  <Icono aria-hidden="true" className="size-4 shrink-0" />
                  <span>{etiqueta}</span>
                </a>
              )
            },
          )}
        </nav>

        {errorAlCerrar && (
          <p
            aria-live="polite"
            className="rounded-lg border border-yanax-coral/40 bg-yanax-coral/10 px-3 py-2 text-sm text-yanax-azul-profundo"
            role="alert"
          >
            No fue posible cerrar la sesión. Inténtalo de nuevo.
          </p>
        )}
      </div>
    </header>
  )
}
