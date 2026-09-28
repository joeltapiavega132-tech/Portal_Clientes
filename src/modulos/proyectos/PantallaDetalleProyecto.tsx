import { useEffect, useState } from 'react'
import {
  CalendarDays,
  CircleHelp,
  Clock3,
  FolderKanban,
  LoaderCircle,
} from 'lucide-react'
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
          className="mb-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold text-yanax-turquesa transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja focus-visible:ring-offset-2"
          href="/aplicacion/proyectos"
        >
          <FolderKanban aria-hidden="true" className="size-4" />
          Volver a proyectos
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
            Cargando la información del proyecto...
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
              Inténtalo de nuevo. Si el problema continúa, vuelve a la lista de
              proyectos o comunícate con tu contacto en Yanax.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-yanax-turquesa px-4 text-sm font-semibold text-white transition hover:bg-yanax-verde focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja focus-visible:ring-offset-2"
                onClick={() => establecerIntentoCarga((intento) => intento + 1)}
                type="button"
              >
                Reintentar
              </button>
              <a
                className="inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold text-yanax-turquesa transition hover:bg-yanax-verde-claro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja focus-visible:ring-offset-2"
                href="/aplicacion/proyectos"
              >
                Volver a proyectos
              </a>
            </div>
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
              listado para consultar tus proyectos.
            </p>
            <a
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-yanax-turquesa px-4 text-sm font-semibold text-white transition hover:bg-yanax-verde focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja focus-visible:ring-offset-2"
              href="/aplicacion/proyectos"
            >
              Volver a proyectos
            </a>
          </section>
        )}

        {estadoDetalle.tipo === 'cargado' && (
          <div className="space-y-5 sm:space-y-7">
            <header className="overflow-hidden rounded-2xl bg-yanax-azul-profundo text-white shadow-sm">
              <div className="px-5 py-7 sm:px-8 sm:py-9">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-yanax-verde-claro">
                  Detalle del proyecto
                </p>
                <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <h1 className="min-w-0 break-words text-2xl font-semibold tracking-tight sm:text-3xl">
                    {estadoDetalle.proyecto.nombre}
                  </h1>
                  <span className="inline-flex min-h-10 w-fit max-w-full shrink-0 items-center rounded-full border border-white/40 px-3 text-sm font-semibold">
                    {etiquetasEstadoProyecto[estadoDetalle.proyecto.estado]}
                  </span>
                </div>
                <section
                  aria-labelledby="titulo-descripcion-proyecto"
                  className="mt-6 max-w-3xl border-t border-white/20 pt-5"
                >
                  <h2
                    className="text-xs font-semibold uppercase tracking-wide text-yanax-verde-claro"
                    id="titulo-descripcion-proyecto"
                  >
                    Descripción
                  </h2>
                  {estadoDetalle.proyecto.descripcion ? (
                    <p className="mt-2 break-words whitespace-pre-line text-sm leading-7 text-white/85 sm:text-base">
                      {estadoDetalle.proyecto.descripcion}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm leading-6 text-white/75">
                      Aún no se ha agregado una descripción para este proyecto.
                    </p>
                  )}
                </section>
              </div>
            </header>

            <section
              aria-labelledby="titulo-informacion-proyecto"
              className="rounded-2xl border border-yanax-turquesa/10 bg-white p-5 shadow-sm sm:p-7"
            >
              <h2
                className="text-lg font-semibold sm:text-xl"
                id="titulo-informacion-proyecto"
              >
                Información del proyecto
              </h2>
              <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-yanax-verde-claro/55 p-4">
                  <dt className="flex items-center gap-2 text-sm font-medium text-yanax-azul-profundo/70">
                    <CalendarDays
                      aria-hidden="true"
                      className="size-4 shrink-0 text-yanax-turquesa"
                    />
                    Fecha de inicio
                  </dt>
                  <dd className="mt-2 break-words text-sm font-semibold">
                    {estadoDetalle.proyecto.fecha_inicio
                      ? formatearFecha(estadoDetalle.proyecto.fecha_inicio)
                      : 'No definida'}
                  </dd>
                </div>
                <div className="rounded-xl bg-yanax-verde-claro/55 p-4">
                  <dt className="flex items-center gap-2 text-sm font-medium text-yanax-azul-profundo/70">
                    <CalendarDays
                      aria-hidden="true"
                      className="size-4 shrink-0 text-yanax-turquesa"
                    />
                    Fecha estimada de finalización
                  </dt>
                  <dd className="mt-2 break-words text-sm font-semibold">
                    {estadoDetalle.proyecto.fecha_estimada_fin
                      ? formatearFecha(
                          estadoDetalle.proyecto.fecha_estimada_fin,
                        )
                      : 'No definida'}
                  </dd>
                </div>
                <div className="rounded-xl bg-yanax-verde-claro/55 p-4">
                  <dt className="text-sm font-medium text-yanax-azul-profundo/70">
                    Estado actual
                  </dt>
                  <dd className="mt-2 break-words text-sm font-semibold">
                    {etiquetasEstadoProyecto[estadoDetalle.proyecto.estado]}
                  </dd>
                </div>
                <div className="rounded-xl bg-yanax-verde-claro/55 p-4">
                  <dt className="flex items-center gap-2 text-sm font-medium text-yanax-azul-profundo/70">
                    <Clock3
                      aria-hidden="true"
                      className="size-4 shrink-0 text-yanax-turquesa"
                    />
                    Última actualización
                  </dt>
                  <dd className="mt-2 break-words text-sm font-semibold">
                    {formatearFechaHora(estadoDetalle.proyecto.actualizado_en)}
                  </dd>
                </div>
              </dl>
            </section>

            <section
              aria-labelledby="titulo-seguimiento-proyecto"
              className="rounded-2xl border border-yanax-morado/15 bg-white p-5 shadow-sm sm:p-7"
            >
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-yanax-verde-claro text-yanax-morado">
                  <CircleHelp aria-hidden="true" className="size-5" />
                </span>
                <div className="min-w-0">
                  <h2
                    className="text-lg font-semibold sm:text-xl"
                    id="titulo-seguimiento-proyecto"
                  >
                    Seguimiento del proyecto
                  </h2>
                  <p className="mt-2 break-words text-sm leading-6 text-yanax-azul-profundo/75">
                    En futuras mejoras podrás consultar aquí las novedades y
                    avances que Yanax comparta sobre este proyecto.
                  </p>
                </div>
              </div>
            </section>
          </div>
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

function formatearFechaHora(fecha: string) {
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(fecha))
}
