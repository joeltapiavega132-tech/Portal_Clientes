import { useEffect, useState } from 'react'
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  FolderKanban,
  LoaderCircle,
  LogOut,
  Phone,
  UserRound,
} from 'lucide-react'
import { usarAutenticacion } from '@/dominio/autenticacion/contexto-autenticacion'
import { obtenerClientes } from '@/dominio/clientes/servicio-clientes'
import type { Cliente } from '@/dominio/clientes/tipos-cliente'
import { obtenerProyectos } from '@/dominio/proyectos/servicio-proyectos'
import type {
  EstadoProyecto,
  Proyecto,
} from '@/dominio/proyectos/tipos-proyecto'

const etiquetasEstadoProyecto: Record<EstadoProyecto, string> = {
  planificacion: 'Planificación',
  en_progreso: 'En progreso',
  pausado: 'Pausado',
  completado: 'Completado',
  archivado: 'Archivado',
}

export function PantallaPanelCliente() {
  const { cerrarSesion, perfil } = usarAutenticacion()
  const [clientes, establecerClientes] = useState<Cliente[]>([])
  const [proyectos, establecerProyectos] = useState<Proyecto[]>([])
  const [cargando, establecerCargando] = useState(true)
  const [errorCarga, establecerErrorCarga] = useState<string | null>(null)
  const [errorAlCerrar, establecerErrorAlCerrar] = useState(false)
  const [intentoCarga, establecerIntentoCarga] = useState(0)

  useEffect(() => {
    let consultaActiva = true

    async function cargarDatosAutorizados() {
      establecerCargando(true)
      establecerErrorCarga(null)

      try {
        const [respuestaClientes, respuestaProyectos] = await Promise.all([
          obtenerClientes(),
          obtenerProyectos(),
        ])

        if (!consultaActiva) return

        if (respuestaClientes.error || respuestaProyectos.error) {
          establecerClientes([])
          establecerProyectos([])
          establecerErrorCarga(
            'No fue posible cargar la información del panel. Inténtalo de nuevo.',
          )
          return
        }

        establecerClientes(respuestaClientes.data ?? [])
        establecerProyectos(respuestaProyectos.data ?? [])
      } catch {
        if (!consultaActiva) return

        establecerClientes([])
        establecerProyectos([])
        establecerErrorCarga(
          'No fue posible cargar la información del panel. Inténtalo de nuevo.',
        )
      } finally {
        if (consultaActiva) establecerCargando(false)
      }
    }

    void cargarDatosAutorizados()

    return () => {
      consultaActiva = false
    }
  }, [intentoCarga])

  async function manejarCierreSesion() {
    establecerErrorAlCerrar(false)

    try {
      const { error } = await cerrarSesion()
      if (error) establecerErrorAlCerrar(true)
    } catch {
      establecerErrorAlCerrar(true)
    }
  }

  const nombreCompleto = [perfil?.nombre, perfil?.apellido]
    .filter((parte) => parte?.trim())
    .join(' ')

  return (
    <main className="min-h-screen bg-yanax-verde-claro px-4 py-5 text-yanax-azul-profundo sm:px-7 sm:py-8">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
        <a
          aria-label="Yanax Client Portal, inicio"
          className="text-base font-bold tracking-[0.16em] text-yanax-azul-profundo sm:text-lg"
          href="/aplicacion"
        >
          YANAX
        </a>
        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-yanax-turquesa/20 bg-white px-3 text-sm font-semibold text-yanax-turquesa transition hover:bg-yanax-turquesa hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja focus-visible:ring-offset-2 sm:px-4"
          onClick={() => void manejarCierreSesion()}
          type="button"
        >
          <LogOut aria-hidden="true" className="size-4" />
          <span>Cerrar sesión</span>
        </button>
      </header>

      <div className="mx-auto w-full max-w-6xl pb-12 pt-8 sm:pt-12">
        <section className="rounded-2xl bg-yanax-azul-profundo px-5 py-7 text-white shadow-sm sm:px-8 sm:py-9">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-yanax-verde-claro">
            Yanax Client Portal
          </p>
          <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {nombreCompleto ? `Hola, ${nombreCompleto}` : 'Tu panel de cliente'}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
                Consulta aquí tus organizaciones y el avance de sus proyectos.
              </p>
            </div>
            <span className="inline-flex min-h-9 w-fit items-center rounded-full border border-white/30 px-3 text-sm font-semibold">
              Rol: Cliente
            </span>
          </div>
        </section>

        {errorAlCerrar && (
          <p
            aria-live="polite"
            className="mt-5 rounded-xl border border-yanax-coral/50 bg-white px-4 py-3 text-sm font-medium"
            role="alert"
          >
            No fue posible cerrar la sesión. Inténtalo de nuevo.
          </p>
        )}

        {cargando && (
          <div
            aria-live="polite"
            className="mt-6 flex min-h-36 items-center justify-center gap-3 rounded-2xl border border-yanax-turquesa/15 bg-white px-5 text-sm font-medium"
            role="status"
          >
            <LoaderCircle
              aria-hidden="true"
              className="size-5 animate-spin text-yanax-turquesa"
            />
            Cargando tus clientes y proyectos...
          </div>
        )}

        {!cargando && errorCarga && (
          <section
            aria-labelledby="titulo-error-carga"
            className="mt-6 rounded-2xl border border-yanax-coral/40 bg-white p-5 sm:p-7"
          >
            <h2
              className="text-lg font-semibold"
              id="titulo-error-carga"
            >
              No se pudo cargar el panel
            </h2>
            <p className="mt-2 text-sm leading-6 text-yanax-azul-profundo/80">
              {errorCarga}
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

        {!cargando && !errorCarga && (
          <>
            <section
              aria-labelledby="titulo-clientes"
              className="mt-7 sm:mt-9"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-white text-yanax-turquesa">
                  <Building2 aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold" id="titulo-clientes">
                    Tus clientes
                  </h2>
                  <p className="text-sm text-yanax-azul-profundo/70">
                    Organizaciones asociadas a tu cuenta
                  </p>
                </div>
              </div>

              {clientes.length === 0 ? (
                <p className="rounded-xl border border-yanax-turquesa/15 bg-white p-5 text-sm leading-6 text-yanax-azul-profundo/80 sm:p-6">
                  No encontramos un cliente asociado a tu cuenta. Comunícate
                  con tu contacto en Yanax.
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {clientes.map((cliente) => (
                    <article
                      className="rounded-2xl border border-yanax-turquesa/10 bg-white p-5 shadow-sm sm:p-6"
                      key={cliente.id}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="break-words text-lg font-semibold">
                          {cliente.nombre}
                        </h3>
                        <span className="shrink-0 rounded-full bg-yanax-verde-claro px-3 py-1 text-xs font-semibold text-yanax-verde">
                          {cliente.estado === 'activo' ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      {(cliente.nombre_contacto || cliente.telefono) && (
                        <dl className="mt-5 grid gap-3 border-t border-yanax-turquesa/10 pt-4 text-sm">
                          {cliente.nombre_contacto && (
                            <div className="flex items-start gap-3">
                              <UserRound
                                aria-hidden="true"
                                className="mt-0.5 size-4 shrink-0 text-yanax-turquesa"
                              />
                              <div>
                                <dt className="text-xs font-medium text-yanax-azul-profundo/65">
                                  Contacto
                                </dt>
                                <dd className="mt-0.5 font-medium">
                                  {cliente.nombre_contacto}
                                </dd>
                              </div>
                            </div>
                          )}
                          {cliente.telefono && (
                            <div className="flex items-start gap-3">
                              <Phone
                                aria-hidden="true"
                                className="mt-0.5 size-4 shrink-0 text-yanax-turquesa"
                              />
                              <div>
                                <dt className="text-xs font-medium text-yanax-azul-profundo/65">
                                  Teléfono
                                </dt>
                                <dd className="mt-0.5 break-all font-medium">
                                  {cliente.telefono}
                                </dd>
                              </div>
                            </div>
                          )}
                        </dl>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section
              aria-labelledby="titulo-proyectos"
              className="mt-8 sm:mt-10"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-white text-yanax-morado">
                  <FolderKanban aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold" id="titulo-proyectos">
                    Tus proyectos
                  </h2>
                  <p className="text-sm text-yanax-azul-profundo/70">
                    Proyectos disponibles para tu cuenta
                  </p>
                </div>
              </div>

              {proyectos.length === 0 ? (
                <p className="rounded-xl border border-yanax-turquesa/15 bg-white p-5 text-sm leading-6 text-yanax-azul-profundo/80 sm:p-6">
                  Todavía no hay proyectos disponibles para tu cuenta.
                </p>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {proyectos.map((proyecto) => (
                    <article
                      className="rounded-2xl border border-yanax-turquesa/10 bg-white p-5 shadow-sm sm:p-6"
                      key={proyecto.id}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <h3 className="min-w-0 break-words text-lg font-semibold">
                          {proyecto.nombre}
                        </h3>
                        <span className="rounded-full border border-yanax-turquesa/20 bg-yanax-verde-claro/70 px-3 py-1 text-xs font-semibold text-yanax-azul-profundo">
                          {etiquetasEstadoProyecto[proyecto.estado]}
                        </span>
                      </div>

                      {proyecto.descripcion && (
                        <p className="mt-3 text-sm leading-6 text-yanax-azul-profundo/75">
                          {proyecto.descripcion}
                        </p>
                      )}

                      {(proyecto.fecha_inicio ||
                        proyecto.fecha_estimada_fin) && (
                        <dl className="mt-5 grid gap-3 border-t border-yanax-turquesa/10 pt-4 text-sm sm:grid-cols-2">
                          {proyecto.fecha_inicio && (
                            <div className="flex items-start gap-2.5">
                              <CalendarDays
                                aria-hidden="true"
                                className="mt-0.5 size-4 shrink-0 text-yanax-turquesa"
                              />
                              <div>
                                <dt className="text-xs font-medium text-yanax-azul-profundo/65">
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
                                <dt className="text-xs font-medium text-yanax-azul-profundo/65">
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
                        <span>Ver proyecto</span>
                        <ArrowUpRight aria-hidden="true" className="size-4" />
                      </a>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
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
