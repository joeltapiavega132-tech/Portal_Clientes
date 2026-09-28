import { Building2, FolderKanban, ShieldCheck } from 'lucide-react'
import { NavegacionAdministrativa } from '@/componentes/diseno/NavegacionAdministrativa'
import { usarAutenticacion } from '@/dominio/autenticacion/contexto-autenticacion'

export function PantallaPanelAdministrativo() {
  const { perfil } = usarAutenticacion()
  const nombreCompleto = [perfil?.nombre, perfil?.apellido]
    .filter((parte) => parte?.trim())
    .join(' ')

  return (
    <main className="min-h-screen bg-yanax-verde-claro text-yanax-azul-profundo">
      <NavegacionAdministrativa seccionActual="inicio" />

      <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-7 sm:pt-9">
        <section className="rounded-2xl bg-yanax-azul-profundo px-5 py-7 text-white shadow-sm sm:px-8 sm:py-9">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-yanax-verde-claro">
                Yanax Client Portal
              </p>
              <h1 className="mt-3 break-words text-2xl font-semibold tracking-tight sm:text-3xl">
                {nombreCompleto
                  ? `Bienvenido, ${nombreCompleto}`
                  : 'Panel administrativo'}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
                Este espacio reunirá las herramientas para acompañar los
                proyectos y las organizaciones de Yanax.
              </p>
            </div>
            <span className="inline-flex min-h-9 w-fit shrink-0 items-center gap-2 rounded-full border border-white/30 px-3 text-sm font-semibold">
              <ShieldCheck aria-hidden="true" className="size-4" />
              Administrador
            </span>
          </div>
        </section>

        <section aria-labelledby="titulo-gestion" className="mt-7 sm:mt-9">
          <div className="mb-4">
            <h2 className="text-lg font-semibold" id="titulo-gestion">
              Gestión de la plataforma
            </h2>
            <p className="mt-1 text-sm leading-6 text-yanax-azul-profundo/70">
              Las herramientas administrativas se habilitarán de forma gradual.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <article className="min-w-0 rounded-2xl border border-yanax-turquesa/10 bg-white p-5 shadow-sm sm:p-6">
              <span className="flex size-11 items-center justify-center rounded-xl bg-yanax-verde-claro text-yanax-turquesa">
                <Building2 aria-hidden="true" className="size-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold">Clientes</h3>
              <p className="mt-2 text-sm leading-6 text-yanax-azul-profundo/75">
                Consulta y actualiza las organizaciones registradas en el
                portal.
              </p>
              <a
                className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-yanax-turquesa px-4 text-sm font-semibold text-white transition hover:bg-yanax-verde focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja focus-visible:ring-offset-2"
                href="/aplicacion/administracion/clientes"
              >
                Gestionar clientes
              </a>
            </article>

            <article className="min-w-0 rounded-2xl border border-yanax-turquesa/10 bg-white p-5 shadow-sm sm:p-6">
              <span className="flex size-11 items-center justify-center rounded-xl bg-yanax-verde-claro text-yanax-morado">
                <FolderKanban aria-hidden="true" className="size-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold">Proyectos</h3>
              <p className="mt-2 text-sm leading-6 text-yanax-azul-profundo/75">
                La vista administrativa de proyectos y su seguimiento se
                incorporará después.
              </p>
              <span className="mt-4 inline-flex min-h-8 items-center rounded-full border border-yanax-naranja/40 bg-yanax-naranja/10 px-3 text-xs font-semibold text-yanax-azul-profundo">
                En preparación
              </span>
            </article>
          </div>
        </section>
      </div>
    </main>
  )
}
