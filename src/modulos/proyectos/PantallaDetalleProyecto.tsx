import { useEffect, useState } from 'react'
import { CalendarDays, LoaderCircle } from 'lucide-react'
import { NavegacionPrivada } from '@/componentes/diseno/NavegacionPrivada'
import { obtenerProyecto } from '@/dominio/proyectos/servicio-proyectos'
import type { EstadoProyecto, Proyecto } from '@/dominio/proyectos/tipos-proyecto'

interface PropiedadesPantallaDetalleProyecto {
  proyectoId: string
}

type EstadoDetalleProyecto =
  | { tipo: 'cargando' }
  | { tipo: 'error' }
  | { tipo: 'no_encontrado' }
  | { tipo: 'cargado'; proyecto: Proyecto }

const etiquetasEstadoProyecto: Record<EstadoProyecto, string> = {
  planificacion: 'Planificación',
  en_progreso: 'En progreso',
  pausado: 'Pausado',
  completado: 'Completado',
  archivado: 'Archivado',
}

export function PantallaDetalleProyecto({
  proyectoId,
}: PropiedadesPantallaDetalleProyecto) {
  const [estadoDetalle, establecerEstadoDetalle] =
    useState<EstadoDetalleProyecto>({ tipo: 'cargando' })
  const [intentoCarga, establecerIntentoCarga] = useState(0)

  useEffect(() => {
    let consultaActiva = true
    establecerEstadoDetalle({ tipo: 'cargando' })

    async function cargarProyecto() {
      try {
        const { data, error } = await obtenerProyecto(proyectoId)
        if (!consultaActiva) return

        if (error) {
          establecerEstadoDetalle({ tipo: 'error' })
        } else if (!data) {
          establecerEstadoDetalle({ tipo: 'no_encontrado' })
        } else {
          establecerEstadoDetalle({ tipo: 'cargado', proyecto: data })
        }
      } catch {
        if (consultaActiva) establecerEstadoDetalle({ tipo: 'error' })
      }
    }

    void cargarProyecto()

    return () => {
      consultaActiva = false
    }
  }, [intentoCarga, proyectoId])

  return (
    <main className="min-h-screen bg-yanax-verde-claro text-yanax-azul-profundo">
      <NavegacionPrivada seccionActual="proyectos" />

      <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-6 sm:px-7 sm:pt-9">
        <a
          className="mb-5 inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-sm font-semibold text-yanax-turquesa transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja focus-visible:ring-offset-2"
          href="/aplicacion"
        >
          Volver al panel
        </a>
        {estadoDetalle.tipo === 'cargando' && (
          <div
            aria-live="polite"
            className="flex min-h-48 items-center justify-center gap-3 rounded-2xl border border-yanax-turquesa/15 bg-white px-5 text-sm font-medium"
            role="status"
          >
            <LoaderCircle
              aria-hidden="true"
              className="size-5 animate-spin text-yanax-turquesa"
            />
            Cargando el proyecto...
          </div>
        )}

        {estadoDetalle.tipo === 'error' && (
          <section
            aria-labelledby="titulo-error-proyecto"
            className="rounded-2xl border border-yanax-coral/40 bg-white p-5 sm:p-8"
          >
            <h1 className="text-xl font-semibold" id="titulo-error-proyecto">
              No fue posible cargar el proyecto
            </h1>
            <p className="mt-2 text-sm leading-6 text-yanax-azul-profundo/80">
              Inténtalo de nuevo. Si el problema continúa, vuelve al panel o
              comunícate con tu contacto en Yanax.
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

        {estadoDetalle.tipo === 'no_encontrado' && (
          <section
            aria-labelledby="titulo-proyecto-no-disponible"
            className="rounded-2xl border border-yanax-turquesa/15 bg-white p-5 sm:p-8"
          >
            <h1
              className="text-xl font-semibold"
              id="titulo-proyecto-no-disponible"
            >
              Proyecto no disponible
            </h1>
            <p className="mt-2 text-sm leading-6 text-yanax-azul-profundo/80">
              No encontramos un proyecto disponible para tu cuenta. Vuelve al
              panel para consultar tus proyectos.
            </p>
          </section>
        )}

        {estadoDetalle.tipo === 'cargado' && (
          <article className="overflow-hidden rounded-2xl border border-yanax-turquesa/10 bg-white shadow-sm">
            <div className="bg-yanax-azul-profundo px-5 py-7 text-white sm:px-8 sm:py-9">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-yanax-verde-claro">
                Detalle del proyecto
              </p>
              <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">
                  {estadoDetalle.proyecto.nombre}
                </h1>
                <span className="inline-flex min-h-9 w-fit shrink-0 items-center rounded-full border border-white/30 px-3 text-sm font-semibold">
                  {etiquetasEstadoProyecto[estadoDetalle.proyecto.estado]}
                </span>
              </div>
            </div>

            <div className="space-y-7 p-5 sm:p-8">
              {estadoDetalle.proyecto.descripcion && (
                <section aria-labelledby="titulo-descripcion-proyecto">
                  <h2
                    className="text-sm font-semibold uppercase tracking-wide text-yanax-turquesa"
                    id="titulo-descripcion-proyecto"
                  >
                    Descripción
                  </h2>
                  <p className="mt-2 whitespace-pre-line text-sm leading-7 text-yanax-azul-profundo/85 sm:text-base">
                    {estadoDetalle.proyecto.descripcion}
                  </p>
                </section>
              )}

              {(estadoDetalle.proyecto.fecha_inicio ||
                estadoDetalle.proyecto.fecha_estimada_fin) && (
                <dl className="grid gap-5 border-t border-yanax-turquesa/10 pt-6 sm:grid-cols-2">
                  {estadoDetalle.proyecto.fecha_inicio && (
                    <div className="flex items-start gap-3">
                      <CalendarDays
                        aria-hidden="true"
                        className="mt-0.5 size-5 shrink-0 text-yanax-turquesa"
                      />
                      <div>
                        <dt className="text-sm font-medium text-yanax-azul-profundo/65">
                          Fecha de inicio
                        </dt>
                        <dd className="mt-1 text-sm font-semibold">
                          {formatearFecha(estadoDetalle.proyecto.fecha_inicio)}
                        </dd>
                      </div>
                    </div>
                  )}
                  {estadoDetalle.proyecto.fecha_estimada_fin && (
                    <div className="flex items-start gap-3">
                      <CalendarDays
                        aria-hidden="true"
                        className="mt-0.5 size-5 shrink-0 text-yanax-turquesa"
                      />
                      <div>
                        <dt className="text-sm font-medium text-yanax-azul-profundo/65">
                          Fecha estimada de finalización
                        </dt>
                        <dd className="mt-1 text-sm font-semibold">
                          {formatearFecha(
                            estadoDetalle.proyecto.fecha_estimada_fin,
                          )}
                        </dd>
                      </div>
                    </div>
                  )}
                </dl>
              )}

              {!estadoDetalle.proyecto.descripcion &&
                !estadoDetalle.proyecto.fecha_inicio &&
                !estadoDetalle.proyecto.fecha_estimada_fin && (
                  <p className="text-sm leading-6 text-yanax-azul-profundo/70">
                    No hay más detalles disponibles para este proyecto todavía.
                  </p>
                )}
            </div>
          </article>
        )}
      </div>
    </main>
  )
}

function formatearFecha(fecha: string) {
  const fechaLocal = new Date(`${fecha}T00:00:00`)

  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(fechaLocal)
}
