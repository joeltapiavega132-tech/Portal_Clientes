import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  ArrowLeft,
  CalendarDays,
  FolderKanban,
  LoaderCircle,
  Plus,
  RotateCcw,
} from 'lucide-react'
import { NavegacionAdministrativa } from '@/componentes/diseno/NavegacionAdministrativa'
import { obtenerClientes } from '@/dominio/clientes/servicio-clientes'
import type { Cliente } from '@/dominio/clientes/tipos-cliente'
import {
  crearProyecto,
  obtenerProyectosPorCliente,
} from '@/dominio/proyectos/servicio-proyectos'
import type {
  DatosCrearProyecto,
  EstadoProyecto,
  Proyecto,
} from '@/dominio/proyectos/tipos-proyecto'

interface PropiedadesPantallaGestionProyectosCliente {
  clienteId: string
}

interface ValoresFormularioProyecto {
  nombre: string
  descripcion: string
  estado: EstadoProyecto
  fecha_inicio: string
  fecha_estimada_fin: string
}

const formularioVacio: ValoresFormularioProyecto = {
  nombre: '',
  descripcion: '',
  estado: 'planificacion',
  fecha_inicio: '',
  fecha_estimada_fin: '',
}

const etiquetasEstadoProyecto: Record<EstadoProyecto, string> = {
  planificacion: 'Planificación',
  en_progreso: 'En progreso',
  pausado: 'Pausado',
  completado: 'Completado',
  archivado: 'Archivado',
}

export function PantallaGestionProyectosCliente({
  clienteId,
}: PropiedadesPantallaGestionProyectosCliente) {
  const [cliente, establecerCliente] = useState<Cliente | null>(null)
  const [proyectos, establecerProyectos] = useState<Proyecto[]>([])
  const [cargando, establecerCargando] = useState(true)
  const [errorCarga, establecerErrorCarga] = useState<string | null>(null)
  const [intentoCarga, establecerIntentoCarga] = useState(0)
  const [formularioAbierto, establecerFormularioAbierto] = useState(false)
  const [valoresFormulario, establecerValoresFormulario] =
    useState<ValoresFormularioProyecto>(formularioVacio)
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

      try {
        const [respuestaClientes, respuestaProyectos] = await Promise.all([
          obtenerClientes(),
          obtenerProyectosPorCliente(clienteId),
        ])

        if (!consultaActiva) return
        if (respuestaClientes.error) throw respuestaClientes.error
        if (respuestaProyectos.error) throw respuestaProyectos.error

        const clienteEncontrado = (respuestaClientes.data ?? []).find(
          (registro) => registro.id === clienteId,
        )
        if (!clienteEncontrado) {
          throw new Error(
            'No se encontró el cliente o no tienes acceso a esta información.',
          )
        }

        establecerCliente(clienteEncontrado)
        establecerProyectos(respuestaProyectos.data ?? [])
      } catch (error: unknown) {
        if (!consultaActiva) return
        establecerCliente(null)
        establecerProyectos([])
        establecerErrorCarga(obtenerMensajeError(error))
      } finally {
        if (consultaActiva) establecerCargando(false)
      }
    }

    void cargarDatos()

    return () => {
      consultaActiva = false
    }
  }, [clienteId, intentoCarga])

  function abrirFormulario() {
    establecerValoresFormulario(formularioVacio)
    establecerErrorFormulario(null)
    establecerMensajeExito(null)
    establecerFormularioAbierto(true)
  }

  function cancelarFormulario() {
    establecerFormularioAbierto(false)
    establecerErrorFormulario(null)
    establecerValoresFormulario(formularioVacio)
  }

  async function manejarEnvioFormulario(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
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
    if (!cliente) return

    const datosProyecto: DatosCrearProyecto = {
      cliente_id: cliente.id,
      nombre,
      descripcion: valoresFormulario.descripcion.trim() || null,
      estado: valoresFormulario.estado,
      fecha_inicio: valoresFormulario.fecha_inicio || null,
      fecha_estimada_fin: valoresFormulario.fecha_estimada_fin || null,
    }

    establecerGuardando(true)
    try {
      const { data, error } = await crearProyecto(datosProyecto)
      if (error) throw error
      if (!data) throw new Error('Supabase no devolvió el proyecto creado.')

      establecerProyectos((actuales) => [data, ...actuales])
      establecerFormularioAbierto(false)
      establecerValoresFormulario(formularioVacio)
      establecerMensajeExito('El proyecto se creó correctamente.')
    } catch (error: unknown) {
      establecerErrorFormulario(obtenerMensajeError(error))
    } finally {
      establecerGuardando(false)
    }
  }

  return (
    <main className="min-h-screen bg-yanax-verde-claro text-yanax-azul-profundo">
      <NavegacionAdministrativa seccionActual="clientes" />

      <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-7 sm:pt-9">
        <a
          className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-yanax-turquesa transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja focus-visible:ring-offset-2"
          href="/aplicacion/administracion/clientes"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Volver a clientes
        </a>

        <header className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-yanax-morado">
              Administración · Proyectos
            </p>
            <h1 className="mt-2 break-words text-2xl font-semibold tracking-tight sm:text-3xl">
              Proyectos del cliente
            </h1>
            {cliente && (
              <p className="mt-2 break-words text-sm text-yanax-azul-profundo/75 sm:text-base">
                {cliente.nombre}
              </p>
            )}
          </div>
          {!cargando && !errorCarga && cliente && (
            <button
              className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-yanax-turquesa px-4 text-sm font-semibold text-white transition hover:bg-yanax-verde focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja focus-visible:ring-offset-2 sm:w-auto"
              onClick={abrirFormulario}
              type="button"
            >
              <Plus aria-hidden="true" className="size-4" />
              Nuevo proyecto
            </button>
          )}
        </header>

        {mensajeExito && (
          <p
            aria-live="polite"
            className="mt-5 rounded-xl border border-yanax-verde/25 bg-white px-4 py-3 text-sm text-yanax-verde"
            role="status"
          >
            {mensajeExito}
          </p>
        )}

        {cargando && (
          <div
            aria-live="polite"
            className="mt-7 flex min-h-36 items-center justify-center gap-3 rounded-2xl border border-yanax-turquesa/15 bg-white px-5 text-sm font-medium"
            role="status"
          >
            <LoaderCircle
              aria-hidden="true"
              className="size-5 animate-spin text-yanax-turquesa"
            />
            Cargando cliente y proyectos...
          </div>
        )}

        {!cargando && errorCarga && (
          <section
            aria-labelledby="titulo-error-proyectos-administrativos"
            className="mt-7 rounded-2xl border border-yanax-coral/40 bg-white p-5 sm:p-7"
            role="alert"
          >
            <h2
              className="font-semibold"
              id="titulo-error-proyectos-administrativos"
            >
              No fue posible cargar los proyectos
            </h2>
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

        {!cargando && !errorCarga && formularioAbierto && (
          <section
            aria-labelledby="titulo-formulario-proyecto"
            className="mt-6 rounded-2xl border border-yanax-turquesa/15 bg-white p-5 shadow-sm sm:p-7"
          >
            <div className="mb-5">
              <h2
                className="text-lg font-semibold sm:text-xl"
                id="titulo-formulario-proyecto"
              >
                Nuevo proyecto
              </h2>
              <p className="mt-1 text-sm leading-6 text-yanax-azul-profundo/70">
                Se creará para {cliente?.nombre}. El cliente asociado no se
                modifica desde este formulario.
              </p>
            </div>

            <form className="space-y-4" onSubmit={manejarEnvioFormulario}>
              <label className="block text-sm font-medium">
                Nombre del proyecto
                <input
                  autoComplete="off"
                  className="mt-1.5 min-h-11 w-full rounded-lg border border-yanax-turquesa/25 bg-white px-3 text-base text-yanax-azul-profundo outline-none transition focus:border-yanax-turquesa focus:ring-2 focus:ring-yanax-turquesa/20"
                  onChange={(evento) =>
                    establecerValoresFormulario((valores) => ({
                      ...valores,
                      nombre: evento.target.value,
                    }))
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
                    establecerValoresFormulario((valores) => ({
                      ...valores,
                      descripcion: evento.target.value,
                    }))
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
                      establecerValoresFormulario((valores) => ({
                        ...valores,
                        estado: evento.target.value as EstadoProyecto,
                      }))
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
                      establecerValoresFormulario((valores) => ({
                        ...valores,
                        fecha_inicio: evento.target.value,
                      }))
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
                      establecerValoresFormulario((valores) => ({
                        ...valores,
                        fecha_estimada_fin: evento.target.value,
                      }))
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
                  onClick={cancelarFormulario}
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
                  {guardando ? 'Guardando...' : 'Crear proyecto'}
                </button>
              </div>
            </form>
          </section>
        )}

        {!cargando && !errorCarga && !formularioAbierto && proyectos.length === 0 && (
          <section className="mt-7 rounded-2xl border border-yanax-turquesa/15 bg-white p-6 sm:p-8">
            <span className="flex size-11 items-center justify-center rounded-xl bg-yanax-verde-claro text-yanax-turquesa">
              <FolderKanban aria-hidden="true" className="size-5" />
            </span>
            <h2 className="mt-4 text-lg font-semibold">
              Este cliente aún no tiene proyectos
            </h2>
            <p className="mt-2 text-sm leading-6 text-yanax-azul-profundo/75">
              Crea el primer proyecto para esta organización.
            </p>
            <button
              className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-yanax-turquesa px-4 text-sm font-semibold text-white transition hover:bg-yanax-verde focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja focus-visible:ring-offset-2"
              onClick={abrirFormulario}
              type="button"
            >
              <Plus aria-hidden="true" className="size-4" />
              Nuevo proyecto
            </button>
          </section>
        )}

        {!cargando && !errorCarga && !formularioAbierto && proyectos.length > 0 && (
          <section aria-labelledby="titulo-lista-proyectos" className="mt-7">
            <h2 className="sr-only" id="titulo-lista-proyectos">
              Proyectos de {cliente?.nombre}
            </h2>
            <p className="mb-4 text-sm font-medium text-yanax-azul-profundo/70">
              {proyectos.length}{' '}
              {proyectos.length === 1 ? 'proyecto' : 'proyectos'}
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {proyectos.map((proyecto) => (
                <article
                  className="min-w-0 rounded-2xl border border-yanax-turquesa/10 bg-white p-5 shadow-sm sm:p-6"
                  key={proyecto.id}
                >
                  <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <h3 className="min-w-0 break-words text-lg font-semibold">
                      {proyecto.nombre}
                    </h3>
                    <span className="inline-flex min-h-8 w-fit shrink-0 items-center rounded-full border border-yanax-turquesa/20 bg-yanax-verde-claro/70 px-3 text-xs font-semibold text-yanax-azul-profundo">
                      {etiquetasEstadoProyecto[proyecto.estado]}
                    </span>
                  </div>
                  {(proyecto.fecha_inicio || proyecto.fecha_estimada_fin) && (
                    <dl className="mt-4 grid gap-3 border-t border-yanax-turquesa/10 pt-4 text-sm sm:grid-cols-2">
                      {proyecto.fecha_inicio && (
                        <div className="min-w-0">
                          <dt className="text-xs text-yanax-azul-profundo/65">
                            Inicio
                          </dt>
                          <dd className="mt-1 flex items-start gap-2 font-medium">
                            <CalendarDays
                              aria-hidden="true"
                              className="mt-0.5 size-4 shrink-0 text-yanax-turquesa"
                            />
                            {formatearFecha(proyecto.fecha_inicio)}
                          </dd>
                        </div>
                      )}
                      {proyecto.fecha_estimada_fin && (
                        <div className="min-w-0">
                          <dt className="text-xs text-yanax-azul-profundo/65">
                            Finalización estimada
                          </dt>
                          <dd className="mt-1 flex items-start gap-2 font-medium">
                            <CalendarDays
                              aria-hidden="true"
                              className="mt-0.5 size-4 shrink-0 text-yanax-turquesa"
                            />
                            {formatearFecha(proyecto.fecha_estimada_fin)}
                          </dd>
                        </div>
                      )}
                    </dl>
                  )}
                  <a
                    className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-yanax-turquesa px-4 text-sm font-semibold text-white transition hover:bg-yanax-verde focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja focus-visible:ring-offset-2 sm:w-auto"
                    href={`/aplicacion/administracion/proyectos/${encodeURIComponent(proyecto.id)}`}
                  >
                    Ver y editar proyecto
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
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
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
