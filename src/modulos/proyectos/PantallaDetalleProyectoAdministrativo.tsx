import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  ArrowLeft,
  CalendarDays,
  FolderKanban,
  LoaderCircle,
  Pencil,
  RotateCcw,
} from 'lucide-react'
import { NavegacionAdministrativa } from '@/componentes/diseno/NavegacionAdministrativa'
import { obtenerClientes } from '@/dominio/clientes/servicio-clientes'
import type { Cliente } from '@/dominio/clientes/tipos-cliente'
import {
  actualizarProyecto,
  obtenerProyecto,
} from '@/dominio/proyectos/servicio-proyectos'
import type {
  DatosActualizarProyecto,
  EstadoProyecto,
  Proyecto,
} from '@/dominio/proyectos/tipos-proyecto'

interface PropiedadesPantallaDetalleProyectoAdministrativo {
  proyectoId: string
}

interface ValoresFormularioProyecto {
  nombre: string
  descripcion: string
  estado: EstadoProyecto
  fecha_inicio: string
  fecha_estimada_fin: string
}

const etiquetasEstadoProyecto: Record<EstadoProyecto, string> = {
  planificacion: 'Planificación',
  en_progreso: 'En progreso',
  pausado: 'Pausado',
  completado: 'Completado',
  archivado: 'Archivado',
}

export function PantallaDetalleProyectoAdministrativo({
  proyectoId,
}: PropiedadesPantallaDetalleProyectoAdministrativo) {
  const [proyecto, establecerProyecto] = useState<Proyecto | null>(null)
  const [cliente, establecerCliente] = useState<Cliente | null>(null)
  const [cargando, establecerCargando] = useState(true)
  const [errorCarga, establecerErrorCarga] = useState<string | null>(null)
  const [proyectoNoEncontrado, establecerProyectoNoEncontrado] =
    useState(false)
  const [intentoCarga, establecerIntentoCarga] = useState(0)
  const [editando, establecerEditando] = useState(false)
  const [valoresFormulario, establecerValoresFormulario] =
    useState<ValoresFormularioProyecto | null>(null)
  const [errorFormulario, establecerErrorFormulario] = useState<string | null>(
    null,
  )
  const [guardando, establecerGuardando] = useState(false)
  const [mensajeExito, establecerMensajeExito] = useState<string | null>(null)

  useEffect(() => {
    let consultaActiva = true

    async function cargarDatos() {
      establecerCargando(true)
      establecerErrorCarga(null)
      establecerProyectoNoEncontrado(false)

      try {
        const [respuestaProyecto, respuestaClientes] = await Promise.all([
          obtenerProyecto(proyectoId),
          obtenerClientes(),
        ])

        if (!consultaActiva) return
        if (respuestaProyecto.error) throw respuestaProyecto.error
        if (respuestaClientes.error) throw respuestaClientes.error
        if (!respuestaProyecto.data) {
          establecerProyecto(null)
          establecerCliente(null)
          establecerProyectoNoEncontrado(true)
          return
        }

        const clienteEncontrado = (respuestaClientes.data ?? []).find(
          (registro) => registro.id === respuestaProyecto.data?.cliente_id,
        )
        if (!clienteEncontrado) {
          throw new Error(
            'No fue posible cargar el cliente asociado al proyecto.',
          )
        }

        establecerProyecto(respuestaProyecto.data)
        establecerCliente(clienteEncontrado)
        establecerValoresFormulario(convertirAValoresFormulario(respuestaProyecto.data))
        establecerEditando(false)
      } catch (error: unknown) {
        if (!consultaActiva) return
        establecerProyecto(null)
        establecerCliente(null)
        establecerErrorCarga(obtenerMensajeError(error))
      } finally {
        if (consultaActiva) establecerCargando(false)
      }
    }

    void cargarDatos()

    return () => {
      consultaActiva = false
    }
  }, [proyectoId, intentoCarga])

  function iniciarEdicion() {
    if (!proyecto) return
    establecerValoresFormulario(convertirAValoresFormulario(proyecto))
    establecerErrorFormulario(null)
    establecerMensajeExito(null)
    establecerEditando(true)
  }

  function cancelarEdicion() {
    if (proyecto) {
      establecerValoresFormulario(convertirAValoresFormulario(proyecto))
    }
    establecerErrorFormulario(null)
    establecerEditando(false)
  }

  async function manejarEnvioFormulario(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!proyecto || !valoresFormulario) return

    establecerErrorFormulario(null)
    establecerMensajeExito(null)

    const nombre = valoresFormulario.nombre.trim()
    if (!nombre) {
      establecerErrorFormulario('El nombre del proyecto es obligatorio.')
      return
    }
    if (
      valoresFormulario.fecha_inicio &&
      valoresFormulario.fecha_estimada_fin &&
      valoresFormulario.fecha_estimada_fin < valoresFormulario.fecha_inicio
    ) {
      establecerErrorFormulario(
        'La fecha estimada de finalización debe ser igual o posterior a la fecha de inicio.',
      )
      return
    }

    const datosProyecto: DatosActualizarProyecto = {
      nombre,
      descripcion: valoresFormulario.descripcion.trim() || null,
      estado: valoresFormulario.estado,
      fecha_inicio: valoresFormulario.fecha_inicio || null,
      fecha_estimada_fin: valoresFormulario.fecha_estimada_fin || null,
    }

    establecerGuardando(true)
    try {
      const { data, error } = await actualizarProyecto(
        proyecto.id,
        datosProyecto,
      )
      if (error) throw error
      if (!data) {
        throw new Error(
          'No se encontró un proyecto disponible para actualizar.',
        )
      }

      establecerProyecto(data)
      establecerValoresFormulario(convertirAValoresFormulario(data))
      establecerEditando(false)
      establecerMensajeExito('Los cambios del proyecto se guardaron correctamente.')
    } catch (error: unknown) {
      establecerErrorFormulario(obtenerMensajeError(error))
    } finally {
      establecerGuardando(false)
    }
  }

  const rutaVolver = proyecto
    ? `/aplicacion/administracion/clientes/${encodeURIComponent(proyecto.cliente_id)}/proyectos`
    : '/aplicacion/administracion/clientes'

  return (
    <main className="min-h-screen bg-yanax-verde-claro text-yanax-azul-profundo">
      <NavegacionAdministrativa seccionActual="clientes" />

      <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-6 sm:px-7 sm:pt-9">
        <a
          className="mb-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold text-yanax-turquesa transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja focus-visible:ring-offset-2"
          href={rutaVolver}
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Volver a proyectos del cliente
        </a>

        {mensajeExito && (
          <p
            aria-live="polite"
            className="mb-5 rounded-xl border border-yanax-verde/25 bg-white px-4 py-3 text-sm text-yanax-verde"
            role="status"
          >
            {mensajeExito}
          </p>
        )}

        {cargando && (
          <div
            aria-live="polite"
            className="flex min-h-48 items-center justify-center gap-3 rounded-2xl border border-yanax-turquesa/15 bg-white px-5 text-sm font-medium"
            role="status"
          >
            <LoaderCircle
              aria-hidden="true"
              className="size-5 animate-spin text-yanax-turquesa"
            />
            Cargando proyecto...
          </div>
        )}

        {!cargando && errorCarga && (
          <section
            aria-labelledby="titulo-error-proyecto-administrativo"
            className="rounded-2xl border border-yanax-coral/40 bg-white p-5 sm:p-7"
            role="alert"
          >
            <h1
              className="text-lg font-semibold"
              id="titulo-error-proyecto-administrativo"
            >
              No fue posible cargar el proyecto
            </h1>
            <p className="mt-2 break-words text-sm leading-6 text-yanax-azul-profundo/75">
              {errorCarga}
            </p>
            <button
              className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-yanax-turquesa px-4 text-sm font-semibold text-white transition hover:bg-yanax-verde focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja focus-visible:ring-offset-2"
              onClick={() => establecerIntentoCarga((intento) => intento + 1)}
              type="button"
            >
              <RotateCcw aria-hidden="true" className="size-4" />
              Reintentar
            </button>
          </section>
        )}

        {!cargando && !errorCarga && proyectoNoEncontrado && (
          <section className="rounded-2xl border border-yanax-turquesa/15 bg-white p-6 sm:p-8">
            <span className="flex size-11 items-center justify-center rounded-xl bg-yanax-verde-claro text-yanax-turquesa">
              <FolderKanban aria-hidden="true" className="size-5" />
            </span>
            <h1 className="mt-4 text-xl font-semibold">
              Proyecto no encontrado
            </h1>
            <p className="mt-2 text-sm leading-6 text-yanax-azul-profundo/75">
              No encontramos un proyecto disponible con esa dirección.
            </p>
          </section>
        )}

        {!cargando && !errorCarga && proyecto && cliente && (
          <div className="space-y-5 sm:space-y-7">
            <header className="overflow-hidden rounded-2xl bg-yanax-azul-profundo text-white shadow-sm">
              <div className="px-5 py-7 sm:px-8 sm:py-9">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-yanax-verde-claro">
                  Administración · Detalle del proyecto
                </p>
                <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">
                      {proyecto.nombre}
                    </h1>
                    <p className="mt-2 break-words text-sm text-white/80 sm:text-base">
                      Cliente: {cliente.nombre}
                    </p>
                  </div>
                  <span className="inline-flex min-h-9 w-fit shrink-0 items-center rounded-full border border-white/35 px-3 text-sm font-semibold">
                    {etiquetasEstadoProyecto[proyecto.estado]}
                  </span>
                </div>
              </div>
            </header>

            {!editando && (
              <section
                aria-labelledby="titulo-informacion-proyecto-admin"
                className="rounded-2xl border border-yanax-turquesa/10 bg-white p-5 shadow-sm sm:p-7"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2
                      className="text-lg font-semibold"
                      id="titulo-informacion-proyecto-admin"
                    >
                      Información del proyecto
                    </h2>
                    <p className="mt-1 text-sm text-yanax-azul-profundo/70">
                      El cliente asociado se mantiene fijo desde esta pantalla.
                    </p>
                  </div>
                  <button
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-yanax-turquesa/25 px-4 text-sm font-semibold text-yanax-turquesa transition hover:bg-yanax-verde-claro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja focus-visible:ring-offset-2 sm:w-auto"
                    onClick={iniciarEdicion}
                    type="button"
                  >
                    <Pencil aria-hidden="true" className="size-4" />
                    Editar proyecto
                  </button>
                </div>

                <dl className="mt-5 grid gap-4 border-t border-yanax-turquesa/10 pt-5 sm:grid-cols-2">
                  <div className="min-w-0 sm:col-span-2">
                    <dt className="text-xs font-medium text-yanax-azul-profundo/65">
                      Descripción
                    </dt>
                    <dd className="mt-1 whitespace-pre-wrap break-words text-sm leading-6">
                      {proyecto.descripcion || 'Sin descripción'}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="flex items-center gap-2 text-xs font-medium text-yanax-azul-profundo/65">
                      <CalendarDays
                        aria-hidden="true"
                        className="size-4 text-yanax-turquesa"
                      />
                      Fecha de inicio
                    </dt>
                    <dd className="mt-1 text-sm font-semibold">
                      {proyecto.fecha_inicio
                        ? formatearFecha(proyecto.fecha_inicio)
                        : 'Sin definir'}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="flex items-center gap-2 text-xs font-medium text-yanax-azul-profundo/65">
                      <CalendarDays
                        aria-hidden="true"
                        className="size-4 text-yanax-turquesa"
                      />
                      Fecha estimada de finalización
                    </dt>
                    <dd className="mt-1 text-sm font-semibold">
                      {proyecto.fecha_estimada_fin
                        ? formatearFecha(proyecto.fecha_estimada_fin)
                        : 'Sin definir'}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs font-medium text-yanax-azul-profundo/65">
                      Creado
                    </dt>
                    <dd className="mt-1 text-sm font-semibold">
                      {formatearFechaHora(proyecto.creado_en)}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs font-medium text-yanax-azul-profundo/65">
                      Última actualización
                    </dt>
                    <dd className="mt-1 text-sm font-semibold">
                      {formatearFechaHora(proyecto.actualizado_en)}
                    </dd>
                  </div>
                </dl>
              </section>
            )}

            {editando && valoresFormulario && (
              <section
                aria-labelledby="titulo-editar-proyecto"
                className="rounded-2xl border border-yanax-turquesa/10 bg-white p-5 shadow-sm sm:p-7"
              >
                <div className="mb-5">
                  <h2
                    className="text-lg font-semibold sm:text-xl"
                    id="titulo-editar-proyecto"
                  >
                    Editar proyecto
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-yanax-azul-profundo/70">
                    Cliente asociado: {cliente.nombre}. Este dato no se puede
                    cambiar aquí.
                  </p>
                </div>

                <form className="space-y-4" onSubmit={manejarEnvioFormulario}>
                  <label className="block text-sm font-medium">
                    Nombre del proyecto
                    <input
                      autoComplete="off"
                      className="mt-1.5 min-h-11 w-full rounded-lg border border-yanax-turquesa/25 bg-white px-3 text-base text-yanax-azul-profundo outline-none transition focus:border-yanax-turquesa focus:ring-2 focus:ring-yanax-turquesa/20"
                      onChange={(evento) =>
                        establecerValoresFormulario((valores) =>
                          valores
                            ? { ...valores, nombre: evento.target.value }
                            : valores,
                        )
                      }
                      required
                      value={valoresFormulario.nombre}
                    />
                  </label>

                  <label className="block text-sm font-medium">
                    Descripción
                    <textarea
                      className="mt-1.5 min-h-28 w-full resize-y rounded-lg border border-yanax-turquesa/25 bg-white px-3 py-2.5 text-base text-yanax-azul-profundo outline-none transition focus:border-yanax-turquesa focus:ring-2 focus:ring-yanax-turquesa/20"
                      onChange={(evento) =>
                        establecerValoresFormulario((valores) =>
                          valores
                            ? { ...valores, descripcion: evento.target.value }
                            : valores,
                        )
                      }
                      value={valoresFormulario.descripcion}
                    />
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm font-medium">
                      Estado
                      <select
                        className="mt-1.5 min-h-11 w-full rounded-lg border border-yanax-turquesa/25 bg-white px-3 text-base text-yanax-azul-profundo outline-none transition focus:border-yanax-turquesa focus:ring-2 focus:ring-yanax-turquesa/20"
                        onChange={(evento) =>
                          establecerValoresFormulario((valores) =>
                            valores
                              ? {
                                  ...valores,
                                  estado: evento.target.value as EstadoProyecto,
                                }
                              : valores,
                          )
                        }
                        value={valoresFormulario.estado}
                      >
                        {Object.entries(etiquetasEstadoProyecto).map(
                          ([estado, etiqueta]) => (
                            <option key={estado} value={estado}>
                              {etiqueta}
                            </option>
                          ),
                        )}
                      </select>
                    </label>
                    <label className="block text-sm font-medium">
                      Fecha de inicio
                      <input
                        className="mt-1.5 min-h-11 w-full rounded-lg border border-yanax-turquesa/25 bg-white px-3 text-base text-yanax-azul-profundo outline-none transition focus:border-yanax-turquesa focus:ring-2 focus:ring-yanax-turquesa/20"
                        onChange={(evento) =>
                          establecerValoresFormulario((valores) =>
                            valores
                              ? {
                                  ...valores,
                                  fecha_inicio: evento.target.value,
                                }
                              : valores,
                          )
                        }
                        type="date"
                        value={valoresFormulario.fecha_inicio}
                      />
                    </label>
                    <label className="block text-sm font-medium sm:col-span-2">
                      Fecha estimada de finalización
                      <input
                        className="mt-1.5 min-h-11 w-full rounded-lg border border-yanax-turquesa/25 bg-white px-3 text-base text-yanax-azul-profundo outline-none transition focus:border-yanax-turquesa focus:ring-2 focus:ring-yanax-turquesa/20 sm:max-w-md"
                        onChange={(evento) =>
                          establecerValoresFormulario((valores) =>
                            valores
                              ? {
                                  ...valores,
                                  fecha_estimada_fin: evento.target.value,
                                }
                              : valores,
                          )
                        }
                        type="date"
                        value={valoresFormulario.fecha_estimada_fin}
                      />
                    </label>
                  </div>

                  {errorFormulario && (
                    <p
                      aria-live="polite"
                      className="rounded-lg border border-yanax-coral/40 bg-yanax-coral/10 px-4 py-3 text-sm leading-6"
                      role="alert"
                    >
                      {errorFormulario}
                    </p>
                  )}

                  <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                    <button
                      className="inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold text-yanax-turquesa transition hover:bg-yanax-verde-claro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja focus-visible:ring-offset-2 disabled:opacity-60"
                      disabled={guardando}
                      onClick={cancelarEdicion}
                      type="button"
                    >
                      Cancelar
                    </button>
                    <button
                      aria-busy={guardando}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-yanax-turquesa px-4 text-sm font-semibold text-white transition hover:bg-yanax-verde focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
                      disabled={guardando}
                      type="submit"
                    >
                      {guardando && (
                        <LoaderCircle
                          aria-hidden="true"
                          className="size-4 animate-spin"
                        />
                      )}
                      {guardando ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                  </div>
                </form>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

function convertirAValoresFormulario(
  proyecto: Proyecto,
): ValoresFormularioProyecto {
  return {
    nombre: proyecto.nombre,
    descripcion: proyecto.descripcion ?? '',
    estado: proyecto.estado,
    fecha_inicio: proyecto.fecha_inicio ?? '',
    fecha_estimada_fin: proyecto.fecha_estimada_fin ?? '',
  }
}

function formatearFecha(fecha: string) {
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(fecha))
}

function formatearFechaHora(fecha: string) {
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(fecha))
}

function obtenerMensajeError(error: unknown) {
  if (error instanceof Error) return error.message
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message
  }

  return 'Ocurrió un error inesperado. Inténtalo de nuevo.'
}
