import { useEffect, useState } from 'react'
import {
  CalendarDays,
  CheckCircle2,
  CircleHelp,
  Clock3,
  FolderKanban,
  LoaderCircle,
  MessageSquareText,
  Newspaper,
  RotateCcw,
  Circle,
  CircleDashed,
} from 'lucide-react'
import { NavegacionPrivada } from '@/componentes/diseno/NavegacionPrivada'
import { obtenerActualizacionesProyecto } from '@/dominio/proyectos/servicio-actualizaciones-proyecto'
import { obtenerHitosProyecto } from '@/dominio/proyectos/servicio-hitos-proyecto'
import { obtenerProyecto } from '@/dominio/proyectos/servicio-proyectos'
import type { ActualizacionProyecto } from '@/dominio/proyectos/tipos-actualizacion-proyecto'
import type {
  EstadoHitoProyecto,
  HitoProyecto,
} from '@/dominio/proyectos/tipos-hito-proyecto'
import type { EstadoProyecto, Proyecto } from '@/dominio/proyectos/tipos-proyecto'

interface PropiedadesPantallaDetalleProyecto {
  proyectoId: string
}

type EstadoDetalleProyecto =
  | { tipo: 'cargando' }
  | { tipo: 'error' }
  | { tipo: 'no_encontrado' }
  | {
      tipo: 'cargado'
      proyecto: Proyecto
      hitos: HitoProyecto[] | null
      actualizaciones: ActualizacionProyecto[] | null
    }

const etiquetasEstadoProyecto: Record<EstadoProyecto, string> = {
  planificacion: 'Planificación',
  en_progreso: 'En progreso',
  pausado: 'Pausado',
  completado: 'Completado',
  archivado: 'Archivado',
}

const etiquetasEstadoHito: Record<EstadoHitoProyecto, string> = {
  pendiente: 'Pendiente',
  en_progreso: 'En progreso',
  completado: 'Completado',
}

const iconosEstadoHito = {
  pendiente: Circle,
  en_progreso: CircleDashed,
  completado: CheckCircle2,
} satisfies Record<EstadoHitoProyecto, typeof Circle>

const estilosEstadoHito: Record<EstadoHitoProyecto, string> = {
  pendiente:
    'border-yanax-turquesa/20 bg-yanax-verde-claro text-yanax-azul-profundo',
  en_progreso:
    'border-yanax-naranja/45 bg-yanax-naranja/10 text-yanax-azul-profundo',
  completado:
    'border-yanax-verde/30 bg-yanax-verde/10 text-yanax-verde',
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

    async function cargarDetalle() {
      try {
        const [respuestaProyecto, respuestaHitos, respuestaActualizaciones] =
          await Promise.all([
            obtenerProyecto(proyectoId),
            obtenerHitosProyecto(proyectoId),
            obtenerActualizacionesProyecto(proyectoId),
          ])
        if (!consultaActiva) return

        if (respuestaProyecto.error) {
          establecerEstadoDetalle({ tipo: 'error' })
        } else if (!respuestaProyecto.data) {
          establecerEstadoDetalle({ tipo: 'no_encontrado' })
        } else {
          establecerEstadoDetalle({
            tipo: 'cargado',
            proyecto: respuestaProyecto.data,
            hitos: respuestaHitos.error ? null : respuestaHitos.data,
            actualizaciones: respuestaActualizaciones.error
              ? null
              : respuestaActualizaciones.data,
          })
        }
      } catch {
        if (consultaActiva) establecerEstadoDetalle({ tipo: 'error' })
      }
    }

    void cargarDetalle()

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
              className="space-y-5 rounded-2xl border border-yanax-morado/15 bg-white p-4 shadow-sm sm:space-y-7 sm:p-7"
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
                    Consulta los hitos y las actualizaciones compartidas por
                    Yanax para este proyecto.
                  </p>
                </div>
              </div>

              <div className="grid min-w-0 gap-5 lg:grid-cols-2 lg:gap-6">
                <section
                  aria-labelledby="titulo-hitos-proyecto"
                  className="min-w-0 rounded-xl border border-yanax-turquesa/10 bg-white p-4 sm:p-5"
                >
                  <div className="flex items-center gap-2 border-b border-yanax-turquesa/10 pb-3">
                    <FolderKanban
                      aria-hidden="true"
                      className="size-5 shrink-0 text-yanax-turquesa"
                    />
                    <h3
                      className="text-base font-semibold sm:text-lg"
                      id="titulo-hitos-proyecto"
                    >
                      Hitos del proyecto
                    </h3>
                  </div>

                  {estadoDetalle.hitos === null ? (
                    <p
                      aria-live="polite"
                      className="mt-4 rounded-xl border border-yanax-coral/35 bg-yanax-coral/10 p-4 text-sm leading-6"
                      role="alert"
                    >
                      No fue posible cargar los hitos. Puedes reintentar la
                      carga del seguimiento.
                    </p>
                  ) : estadoDetalle.hitos.length === 0 ? (
                    <div
                      aria-live="polite"
                      className="mt-4 flex min-h-36 flex-col items-center justify-center rounded-xl bg-yanax-verde-claro/60 px-4 py-6 text-center"
                      role="status"
                    >
                      <CalendarDays
                        aria-hidden="true"
                        className="size-6 text-yanax-turquesa"
                      />
                      <p className="mt-3 text-sm font-semibold">
                        Aún no hay hitos registrados
                      </p>
                      <p className="mt-1 max-w-xs text-sm leading-6 text-yanax-azul-profundo/70">
                        Cuando Yanax agregue hitos, podrás consultar aquí sus
                        estados y fechas.
                      </p>
                    </div>
                  ) : (
                    <ol className="mt-4 space-y-3">
                      {estadoDetalle.hitos.map((hito) => {
                        const IconoEstado = iconosEstadoHito[hito.estado]

                        return (
                          <li
                            className="min-w-0 rounded-xl border border-yanax-turquesa/15 bg-yanax-verde-claro/30 p-4 sm:p-5"
                            key={hito.id}
                          >
                            <div className="flex min-w-0 flex-col gap-3">
                              <div className="flex min-w-0 items-start justify-between gap-2 sm:gap-3">
                                <div className="flex min-w-0 items-start gap-3">
                                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white">
                                    <IconoEstado
                                      aria-hidden="true"
                                      className="size-5 text-yanax-turquesa"
                                    />
                                  </span>
                                  <h4 className="min-w-0 break-words pt-1 text-sm font-semibold sm:text-base">
                                    {hito.nombre}
                                  </h4>
                                </div>
                                <span
                                  className={`inline-flex min-h-8 max-w-[45%] shrink-0 items-center justify-center gap-1.5 rounded-full border px-2 text-center text-xs font-semibold sm:max-w-none sm:px-3 ${estilosEstadoHito[hito.estado]}`}
                                >
                                  <span className="break-words">
                                    {etiquetasEstadoHito[hito.estado]}
                                  </span>
                                </span>
                              </div>

                              {hito.descripcion && (
                                <p className="break-words whitespace-pre-line pl-12 text-sm leading-6 text-yanax-azul-profundo/75">
                                  {hito.descripcion}
                                </p>
                              )}

                              {(hito.fecha_prevista ||
                                hito.fecha_completada) && (
                                <dl className="grid gap-3 border-t border-yanax-turquesa/10 pt-3 text-sm sm:grid-cols-2">
                                  {hito.fecha_prevista && (
                                    <div className="min-w-0">
                                      <dt className="text-xs font-medium text-yanax-azul-profundo/65">
                                        Fecha prevista
                                      </dt>
                                      <dd className="mt-1 break-words font-medium">
                                        {formatearFecha(hito.fecha_prevista)}
                                      </dd>
                                    </div>
                                  )}
                                  {hito.fecha_completada && (
                                    <div className="min-w-0">
                                      <dt className="text-xs font-medium text-yanax-azul-profundo/65">
                                        Fecha completada
                                      </dt>
                                      <dd className="mt-1 break-words font-medium">
                                        {formatearFecha(hito.fecha_completada)}
                                      </dd>
                                    </div>
                                  )}
                                </dl>
                              )}
                            </div>
                          </li>
                        )
                      })}
                    </ol>
                  )}
                </section>

                <section
                  aria-labelledby="titulo-actualizaciones-proyecto"
                  className="min-w-0 rounded-xl border border-yanax-turquesa/10 bg-white p-4 sm:p-5"
                >
                  <div className="flex items-center gap-2 border-b border-yanax-turquesa/10 pb-3">
                    <Newspaper
                      aria-hidden="true"
                      className="size-5 shrink-0 text-yanax-turquesa"
                    />
                    <h3
                      className="text-base font-semibold sm:text-lg"
                      id="titulo-actualizaciones-proyecto"
                    >
                      Actualizaciones
                    </h3>
                  </div>

                  {estadoDetalle.actualizaciones === null ? (
                    <p
                      aria-live="polite"
                      className="mt-4 rounded-xl border border-yanax-coral/35 bg-yanax-coral/10 p-4 text-sm leading-6"
                      role="alert"
                    >
                      No fue posible cargar las actualizaciones. Puedes
                      reintentar la carga del seguimiento.
                    </p>
                  ) : estadoDetalle.actualizaciones.length === 0 ? (
                    <div
                      aria-live="polite"
                      className="mt-4 flex min-h-36 flex-col items-center justify-center rounded-xl bg-yanax-verde-claro/60 px-4 py-6 text-center"
                      role="status"
                    >
                      <MessageSquareText
                        aria-hidden="true"
                        className="size-6 text-yanax-turquesa"
                      />
                      <p className="mt-3 text-sm font-semibold">
                        Aún no hay actualizaciones
                      </p>
                      <p className="mt-1 max-w-xs text-sm leading-6 text-yanax-azul-profundo/70">
                        Aquí aparecerán las novedades que Yanax comparta sobre
                        este proyecto.
                      </p>
                    </div>
                  ) : (
                    <ol className="mt-4 space-y-3">
                      {estadoDetalle.actualizaciones.map((actualizacion) => (
                        <li
                          className="min-w-0 rounded-xl border border-yanax-turquesa/15 p-4 sm:p-5"
                          key={actualizacion.id}
                        >
                          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <h4 className="min-w-0 break-words text-sm font-semibold sm:text-base">
                              {actualizacion.titulo}
                            </h4>
                            <time
                              className="max-w-full break-words text-xs text-yanax-azul-profundo/65 sm:shrink-0 sm:text-right"
                              dateTime={actualizacion.creado_en}
                            >
                              {formatearFechaHora(actualizacion.creado_en)}
                            </time>
                          </div>
                          <p className="mt-3 break-words whitespace-pre-line text-sm leading-6 text-yanax-azul-profundo/80">
                            {actualizacion.contenido}
                          </p>
                        </li>
                      ))}
                    </ol>
                  )}
                </section>
              </div>

              {(estadoDetalle.hitos === null ||
                estadoDetalle.actualizaciones === null) && (
                <button
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-yanax-turquesa/25 px-4 text-sm font-semibold text-yanax-turquesa transition hover:bg-yanax-verde-claro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja focus-visible:ring-offset-2"
                  onClick={() => establecerIntentoCarga((intento) => intento + 1)}
                  type="button"
                >
                  <RotateCcw aria-hidden="true" className="size-4" />
                  Reintentar carga del seguimiento
                </button>
              )}
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
