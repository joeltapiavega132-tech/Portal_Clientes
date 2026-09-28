import { useState } from 'react'
import { FolderKanban, House, LogOut, UserRound } from 'lucide-react'
import { usarAutenticacion } from '@/dominio/autenticacion/contexto-autenticacion'

type SeccionPrivada = 'inicio' | 'proyectos' | 'perfil'

interface PropiedadesNavegacionPrivada {
  seccionActual: SeccionPrivada
}

const enlacesNavegacion: {
  etiqueta: string
  icono: typeof House
  ruta: string
  seccion: SeccionPrivada
}[] = [
  {
    etiqueta: 'Inicio',
    icono: House,
    ruta: '/aplicacion',
    seccion: 'inicio',
  },
  {
    etiqueta: 'Proyectos',
    icono: FolderKanban,
    ruta: '/aplicacion/proyectos',
    seccion: 'proyectos',
  },
  {
    etiqueta: 'Perfil',
    icono: UserRound,
    ruta: '/aplicacion/perfil',
    seccion: 'perfil',
  },
]

export function NavegacionPrivada({
  seccionActual,
}: PropiedadesNavegacionPrivada) {
  const { cerrarSesion } = usarAutenticacion()
  const [errorAlCerrar, establecerErrorAlCerrar] = useState(false)
  const [cerrandoSesion, establecerCerrandoSesion] = useState(false)

  async function manejarCierreSesion() {
    establecerErrorAlCerrar(false)
    establecerCerrandoSesion(true)

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
            aria-label="Yanax Client Portal, inicio"
            className="text-base font-bold tracking-[0.16em] text-yanax-azul-profundo sm:text-lg"
            href="/aplicacion"
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

        <nav aria-label="Navegación principal" className="grid grid-cols-3 gap-2">
          {enlacesNavegacion.map(({ etiqueta, icono: Icono, ruta, seccion }) => {
            const actual = seccionActual === seccion

            return (
              <a
                aria-current={actual ? 'page' : undefined}
                className={`inline-flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg px-1 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja focus-visible:ring-offset-2 sm:flex-row sm:gap-2 sm:px-4 sm:text-sm ${
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
          })}
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
