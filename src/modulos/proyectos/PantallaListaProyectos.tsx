import { useEffect, useState } from 'react'
import { ArrowUpRight, CalendarDays, FolderKanban, LoaderCircle } from 'lucide-react'
import { NavegacionPrivada } from '@/componentes/diseno/NavegacionPrivada'
import { obtenerProyectos } from '@/dominio/proyectos/servicio-proyectos'
import type { EstadoProyecto, Proyecto } from '@/dominio/proyectos/tipos-proyecto'

const etiquetasEstadoProyecto: Record<EstadoProyecto, string> = {
  planificacion: 'Planificación',
  en_progreso: 'En progreso',
  pausado: 'Pausado',
  completado: 'Completado',
  archivado: 'Archivado',
}

type EstadoCargaProyectos =
  | { tipo: 'cargando' }
  | { tipo: 'error' }
  | { tipo: 'vacio' }
  | { tipo: 'cargado'; proyectos: Proyecto[] }

export function PantallaListaProyectos() {
  const [estadoCarga, establecerEstadoCarga] =
    useState<EstadoCargaProyectos>({ tipo: 'cargando' })
  const [intentoCarga, establecerIntentoCarga] = useState(0)

  useEffect(() => {
    let consultaActiva = true

    async function cargarProyectos() {
      establecerEstadoCarga({ tipo: 'cargando' })

      try {
        const { data, error } = await obtenerProyectos()
        if (!consultaActiva) return

        if (error) {
          establecerEstadoCarga({ tipo: 'error' })
        } else if (!data?.length) {
          establecerEstadoCarga({ tipo: 'vacio' })
        } else {
          establecerEstadoCarga({ tipo: 'cargado', proyectos: data })
        }
      } catch {
        if (consultaActiva) establecerEstadoCarga({ tipo: 'error' })
      }
    }

    void cargarProyectos()

    return () => {
      consultaActiva = false
    }
  }, [intentoCarga])

  return (
    <main className="min-h-screen bg-yanax-verde-claro text-yanax-azul-profundo">
      <NavegacionPrivada seccionActual="proyectos" />
      <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-7 sm:pt-9">
        <section className="rounded-2xl bg-yanax-azul-profundo px-5 py-7 text-white shadow-sm sm:px-8 sm:py-9">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-yanax-verde-claro">
            Yanax Client Portal
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            Tus proyectos
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
            Consulta el estado y los detalles de los proyectos disponibles para
            tu cuenta.
          </p>
        </section>

        {estadoCarga.tipo === 'cargando' && (
          <div
            aria-live="polite"
            className="mt-6 flex min-h-40 items-center justify-center gap-3 rounded-2xl border border-yanax-turquesa/15 bg-white px-5 text-sm font-medium"
            role="status"
          >
            <LoaderCircle
              aria-hidden="true"
              className="size-5 animate-spin text-yanax-turquesa"
            />
            Cargando tus proyectos...
          </div>
        )}

        {estadoCarga.tipo === 'error' && (
          <section
            aria-labelledby="titulo-error-proyectos"
            className="mt-6 rounded-2xl border border-yanax-coral/40 bg-white p-5 sm:p-7"
          >
            <h2 className="text-lg font-semibold" id="titulo-error-proyectos">
              No se pudieron cargar los proyectos
            </h2>
            <p className="mt-2 text-sm leading-6 text-yanax-azul-profundo/80">
              Inténtalo de nuevo. Si el problema continúa, comunícate con tu
              contacto en Yanax.
            </p>
            <button
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-yanax-turquesa px-4 text-sm font-semibold text-white transition hover:bg-yanax-verde focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja focus-visible:ring-offset-2"
              onClick={() => establecerIntentoCarga((intento) => intento + 1)}
              type="button"
            >
              Reintentar
            </button>
          </section>
        )}

        {estadoCarga.tipo === 'vacio' && (
          <section className="mt-6 rounded-2xl border border-yanax-turquesa/15 bg-white p-6 sm:p-8">
            <span className="flex size-11 items-center justify-center rounded-xl bg-yanax-verde-claro text-yanax-turquesa">
              <FolderKanban aria-hidden="true" className="size-5" />
            </span>
            <h2 className="mt-4 text-lg font-semibold">
              Aún no hay proyectos disponibles
            </h2>
            <p className="mt-2 text-sm leading-6 text-yanax-azul-profundo/75">
              Cuando se habiliten proyectos para tu cuenta, aparecerán aquí.
            </p>
          </section>
        )}

        {estadoCarga.tipo === 'cargado' && (
          <section aria-label="Proyectos disponibles" className="mt-6">
            <p className="mb-4 text-sm font-medium text-yanax-azul-profundo/70">
              {estadoCarga.proyectos.length}{' '}
              {estadoCarga.proyectos.length === 1 ? 'proyecto' : 'proyectos'}
            </p>
            <div className="grid gap-4 lg:grid-cols-2">
              {estadoCarga.proyectos.map((proyecto) => (
                <article
                  className="rounded-2xl border border-yanax-turquesa/10 bg-white p-5 shadow-sm sm:p-6"
                  key={proyecto.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h2 className="min-w-0 break-words text-lg font-semibold">
                      {proyecto.nombre}
                    </h2>
                    <span className="inline-flex min-h-8 items-center rounded-full border border-yanax-turquesa/20 bg-yanax-verde-claro/70 px-3 text-xs font-semibold text-yanax-azul-profundo">
                      {etiquetasEstadoProyecto[proyecto.estado]}
                    </span>
                  </div>
                  {proyecto.descripcion && (
                    <p className="mt-3 text-sm leading-6 text-yanax-azul-profundo/75">
                      {proyecto.descripcion}
                    </p>
                  )}

                  {(proyecto.fecha_inicio || proyecto.fecha_estimada_fin) && (
                    <dl className="mt-5 grid gap-3 border-t border-yanax-turquesa/10 pt-4 text-sm sm:grid-cols-2">
                      {proyecto.fecha_inicio && (
                        <div className="flex items-start gap-2.5">
                          <CalendarDays
                            aria-hidden="true"
                            className="mt-0.5 size-4 shrink-0 text-yanax-turquesa"
                          />
                          <div>
                            <dt className="text-xs text-yanax-azul-profundo/65">
                              Inicio
                            </dt>
                            <dd className="mt-0.5 font-medium">
                              {formatearFecha(proyecto.fecha_inicio)}
                            </dd>
                          </div>
                        </div>
                      )}
                      {proyecto.fecha_estimada_fin && (
                        <div className="flex items-start gap-2.5">
                          <CalendarDays
                            aria-hidden="true"
                            className="mt-0.5 size-4 shrink-0 text-yanax-turquesa"
                          />
                          <div>
                            <dt className="text-xs text-yanax-azul-profundo/65">
                              Fecha estimada de finalización
                            </dt>
                            <dd className="mt-0.5 font-medium">
                              {formatearFecha(proyecto.fecha_estimada_fin)}
                            </dd>
                          </div>
                        </div>
                      )}
                    </dl>
                  )}

                  <a
                    className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-yanax-turquesa px-4 text-sm font-semibold text-white transition hover:bg-yanax-verde focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja focus-visible:ring-offset-2"
                    href={`/aplicacion/proyectos/${encodeURIComponent(proyecto.id)}`}
                  >
                    Ver proyecto
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  </a>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

function formatearFecha(fecha: string) {
  const fechaLocal = new Date(`${fecha}T00:00:00`)

  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(fechaLocal)
}
