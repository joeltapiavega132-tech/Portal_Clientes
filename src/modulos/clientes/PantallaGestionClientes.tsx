import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  Building2,
  CalendarDays,
  FolderKanban,
  LoaderCircle,
  Pencil,
  Plus,
  RotateCcw,
  UserRound,
  UsersRound,
  Phone,
} from 'lucide-react'
import { NavegacionAdministrativa } from '@/componentes/diseno/NavegacionAdministrativa'
import {
  actualizarCliente,
  crearCliente,
  obtenerClientes,
} from '@/dominio/clientes/servicio-clientes'
import type {
  Cliente,
  DatosCliente,
  EstadoCliente,
} from '@/dominio/clientes/tipos-cliente'

interface ValoresFormularioCliente {
  nombre: string
  nombre_contacto: string
  telefono: string
  estado: EstadoCliente
}

const formularioVacio: ValoresFormularioCliente = {
  nombre: '',
  nombre_contacto: '',
  telefono: '',
  estado: 'activo',
}

export function PantallaGestionClientes() {
  const [clientes, establecerClientes] = useState<Cliente[]>([])
  const [cargando, establecerCargando] = useState(true)
  const [errorCarga, establecerErrorCarga] = useState(false)
  const [intentoCarga, establecerIntentoCarga] = useState(0)
  const [formularioAbierto, establecerFormularioAbierto] = useState(false)
  const [clienteEditando, establecerClienteEditando] =
    useState<Cliente | null>(null)
  const [valoresFormulario, establecerValoresFormulario] =
    useState<ValoresFormularioCliente>(formularioVacio)
  const [errorFormulario, establecerErrorFormulario] = useState<string | null>(
    null,
  )
  const [guardando, establecerGuardando] = useState(false)
  const [mensajeExito, establecerMensajeExito] = useState<string | null>(null)

  useEffect(() => {
    let consultaActiva = true

    async function cargarClientes() {
      establecerCargando(true)
      establecerErrorCarga(false)

      try {
        const { data, error } = await obtenerClientes()
        if (!consultaActiva) return

        if (error) {
          establecerClientes([])
          establecerErrorCarga(true)
        } else {
          establecerClientes(data ?? [])
        }
      } catch {
        if (!consultaActiva) return

        establecerClientes([])
        establecerErrorCarga(true)
      } finally {
        if (consultaActiva) establecerCargando(false)
      }
    }

    void cargarClientes()

    return () => {
      consultaActiva = false
    }
  }, [intentoCarga])

  function abrirFormularioNuevo() {
    establecerClienteEditando(null)
    establecerValoresFormulario(formularioVacio)
    establecerErrorFormulario(null)
    establecerMensajeExito(null)
    establecerFormularioAbierto(true)
  }

  function abrirFormularioEdicion(cliente: Cliente) {
    establecerClienteEditando(cliente)
    establecerValoresFormulario({
      nombre: cliente.nombre,
      nombre_contacto: cliente.nombre_contacto ?? '',
      telefono: cliente.telefono ?? '',
      estado: cliente.estado,
    })
    establecerErrorFormulario(null)
    establecerMensajeExito(null)
    establecerFormularioAbierto(true)
  }

  function cerrarFormulario() {
    establecerFormularioAbierto(false)
    establecerClienteEditando(null)
    establecerErrorFormulario(null)
  }

  async function manejarEnvioFormulario(
    evento: FormEvent<HTMLFormElement>,
  ) {
    evento.preventDefault()
    establecerErrorFormulario(null)
    establecerMensajeExito(null)

    const nombre = valoresFormulario.nombre.trim()
    if (!nombre) {
      establecerErrorFormulario('Escribe el nombre o razón social del cliente.')
      return
    }

    const datosCliente: DatosCliente = {
      nombre,
      nombre_contacto: valoresFormulario.nombre_contacto.trim() || null,
      telefono: valoresFormulario.telefono.trim() || null,
      estado: valoresFormulario.estado,
    }

    establecerGuardando(true)

    try {
      const respuesta = clienteEditando
        ? await actualizarCliente(clienteEditando.id, datosCliente)
        : await crearCliente(datosCliente)

      if (respuesta.error || !respuesta.data) {
        establecerErrorFormulario(
          'No fue posible guardar el cliente. Revisa los datos e inténtalo de nuevo.',
        )
        return
      }

      const clienteGuardado = respuesta.data
      establecerClientes((clientesActuales) =>
        clienteEditando
          ? clientesActuales.map((cliente) =>
              cliente.id === clienteGuardado.id ? clienteGuardado : cliente,
            )
          : [clienteGuardado, ...clientesActuales],
      )
      establecerMensajeExito(
        clienteEditando
          ? 'Los datos del cliente se actualizaron correctamente.'
          : 'El cliente se creó correctamente.',
      )
      cerrarFormulario()
    } catch {
      establecerErrorFormulario(
        'No fue posible guardar el cliente. Inténtalo de nuevo.',
      )
    } finally {
      establecerGuardando(false)
    }
  }

  return (
    <main className="min-h-screen bg-yanax-verde-claro text-yanax-azul-profundo">
      <NavegacionAdministrativa seccionActual="clientes" />

      <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-7 sm:pt-9">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-yanax-morado">
              Administración
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Clientes
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-yanax-azul-profundo/70 sm:text-base">
              Consulta y actualiza la información de las organizaciones del
              portal.
            </p>
          </div>
          <button
            className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-yanax-turquesa px-4 text-sm font-semibold text-white transition hover:bg-yanax-verde focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja focus-visible:ring-offset-2 sm:w-auto"
            onClick={abrirFormularioNuevo}
            type="button"
          >
            <Plus aria-hidden="true" className="size-4" />
            Nuevo cliente
          </button>
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

        {formularioAbierto && (
          <section
            aria-labelledby="titulo-formulario-cliente"
            className="mt-6 rounded-2xl border border-yanax-turquesa/15 bg-white p-5 shadow-sm sm:p-7"
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2
                  className="text-lg font-semibold sm:text-xl"
                  id="titulo-formulario-cliente"
                >
                  {clienteEditando ? 'Editar cliente' : 'Crear cliente'}
                </h2>
                <p className="mt-1 text-sm leading-6 text-yanax-azul-profundo/70">
                  El nombre es obligatorio. Los demás datos pueden completarse
                  después.
                </p>
              </div>
              <Building2
                aria-hidden="true"
                className="mt-1 size-5 shrink-0 text-yanax-turquesa"
              />
            </div>

            <form className="space-y-4" onSubmit={manejarEnvioFormulario}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="min-w-0 text-sm font-medium sm:col-span-2">
                  Nombre o razón social
                  <input
                    autoComplete="organization"
                    className="mt-1.5 min-h-11 w-full rounded-lg border border-yanax-turquesa/25 bg-white px-3 text-base text-yanax-azul-profundo outline-none transition placeholder:text-yanax-azul-profundo/45 focus:border-yanax-turquesa focus:ring-2 focus:ring-yanax-turquesa/20"
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

                <label className="min-w-0 text-sm font-medium">
                  Nombre de contacto
                  <input
                    autoComplete="name"
                    className="mt-1.5 min-h-11 w-full rounded-lg border border-yanax-turquesa/25 bg-white px-3 text-base text-yanax-azul-profundo outline-none transition placeholder:text-yanax-azul-profundo/45 focus:border-yanax-turquesa focus:ring-2 focus:ring-yanax-turquesa/20"
                    onChange={(evento) =>
                      establecerValoresFormulario((valores) => ({
                        ...valores,
                        nombre_contacto: evento.target.value,
                      }))
                    }
                    value={valoresFormulario.nombre_contacto}
                  />
                </label>

                <label className="min-w-0 text-sm font-medium">
                  Teléfono
                  <input
                    autoComplete="tel"
                    className="mt-1.5 min-h-11 w-full rounded-lg border border-yanax-turquesa/25 bg-white px-3 text-base text-yanax-azul-profundo outline-none transition placeholder:text-yanax-azul-profundo/45 focus:border-yanax-turquesa focus:ring-2 focus:ring-yanax-turquesa/20"
                    inputMode="tel"
                    onChange={(evento) =>
                      establecerValoresFormulario((valores) => ({
                        ...valores,
                        telefono: evento.target.value,
                      }))
                    }
                    value={valoresFormulario.telefono}
                  />
                </label>

                <label className="text-sm font-medium sm:col-span-2">
                  Estado
                  <select
                    className="mt-1.5 min-h-11 w-full rounded-lg border border-yanax-turquesa/25 bg-white px-3 text-base text-yanax-azul-profundo outline-none transition focus:border-yanax-turquesa focus:ring-2 focus:ring-yanax-turquesa/20 sm:max-w-xs"
                    onChange={(evento) =>
                      establecerValoresFormulario((valores) => ({
                        ...valores,
                        estado: evento.target.value as EstadoCliente,
                      }))
                    }
                    value={valoresFormulario.estado}
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
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
                  onClick={cerrarFormulario}
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
                  {guardando
                    ? 'Guardando...'
                    : clienteEditando
                      ? 'Guardar cambios'
                      : 'Crear cliente'}
                </button>
              </div>
            </form>
          </section>
        )}

        <section aria-labelledby="titulo-lista-clientes" className="mt-7 sm:mt-9">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-white text-yanax-turquesa">
              <Building2 aria-hidden="true" className="size-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold" id="titulo-lista-clientes">
                Clientes registrados
              </h2>
              <p className="text-sm text-yanax-azul-profundo/70">
                La lista refleja los registros que Supabase autoriza consultar.
              </p>
            </div>
          </div>

          {cargando && (
            <div
              aria-live="polite"
              className="flex min-h-36 items-center justify-center gap-3 rounded-2xl border border-yanax-turquesa/15 bg-white px-5 text-sm font-medium"
              role="status"
            >
              <LoaderCircle
                aria-hidden="true"
                className="size-5 animate-spin text-yanax-turquesa"
              />
              Cargando clientes...
            </div>
          )}

          {!cargando && errorCarga && (
            <div
              aria-labelledby="titulo-error-clientes"
              className="rounded-2xl border border-yanax-coral/40 bg-white p-5 sm:p-7"
              role="alert"
            >
              <h3 className="font-semibold" id="titulo-error-clientes">
                No fue posible cargar los clientes
              </h3>
              <p className="mt-2 text-sm leading-6 text-yanax-azul-profundo/75">
                Inténtalo de nuevo. Si el problema continúa, verifica tu acceso
                con el administrador de la plataforma.
              </p>
              <button
                className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-yanax-turquesa px-4 text-sm font-semibold text-white transition hover:bg-yanax-verde focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja focus-visible:ring-offset-2"
                onClick={() => establecerIntentoCarga((intento) => intento + 1)}
                type="button"
              >
                <RotateCcw aria-hidden="true" className="size-4" />
                Reintentar
              </button>
            </div>
          )}

          {!cargando && !errorCarga && clientes.length === 0 && (
            <div
              aria-live="polite"
              className="rounded-2xl border border-yanax-turquesa/15 bg-white px-5 py-8 text-center sm:px-8"
              role="status"
            >
              <Building2
                aria-hidden="true"
                className="mx-auto size-8 text-yanax-turquesa"
              />
              <h3 className="mt-3 text-base font-semibold">
                Todavía no hay clientes
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-yanax-azul-profundo/70">
                Crea el primer registro para comenzar a organizar los clientes
                de Yanax.
              </p>
              <button
                className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-yanax-turquesa/25 px-4 text-sm font-semibold text-yanax-turquesa transition hover:bg-yanax-verde-claro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja focus-visible:ring-offset-2"
                onClick={abrirFormularioNuevo}
                type="button"
              >
                <Plus aria-hidden="true" className="size-4" />
                Crear cliente
              </button>
            </div>
          )}

          {!cargando && !errorCarga && clientes.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {clientes.map((cliente) => (
                <article
                  className="min-w-0 rounded-2xl border border-yanax-turquesa/10 bg-white p-5 shadow-sm sm:p-6"
                  key={cliente.id}
                >
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <h3 className="min-w-0 break-words text-lg font-semibold">
                      {cliente.nombre}
                    </h3>
                    <span
                      className={`inline-flex min-h-7 shrink-0 items-center rounded-full px-3 text-xs font-semibold ${
                        cliente.estado === 'activo'
                          ? 'bg-yanax-verde/10 text-yanax-verde'
                          : 'border border-yanax-coral/30 bg-yanax-coral/10 text-yanax-azul-profundo'
                      }`}
                    >
                      {cliente.estado === 'activo' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  <dl className="mt-5 grid gap-3 border-t border-yanax-turquesa/10 pt-4 text-sm">
                    <div className="flex min-w-0 items-start gap-3">
                      <CalendarDays
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0 text-yanax-turquesa"
                      />
                      <div className="min-w-0">
                        <dt className="text-xs font-medium text-yanax-azul-profundo/65">
                          Creado
                        </dt>
                        <dd className="mt-0.5 break-words font-medium">
                          {formatearFecha(cliente.creado_en)}
                        </dd>
                      </div>
                    </div>
                    {cliente.nombre_contacto && (
                      <div className="flex min-w-0 items-start gap-3">
                        <UserRound
                          aria-hidden="true"
                          className="mt-0.5 size-4 shrink-0 text-yanax-turquesa"
                        />
                        <div className="min-w-0">
                          <dt className="text-xs font-medium text-yanax-azul-profundo/65">
                            Contacto
                          </dt>
                          <dd className="mt-0.5 break-words font-medium">
                            {cliente.nombre_contacto}
                          </dd>
                        </div>
                      </div>
                    )}
                    {cliente.telefono && (
                      <div className="flex min-w-0 items-start gap-3">
                        <Phone
                          aria-hidden="true"
                          className="mt-0.5 size-4 shrink-0 text-yanax-turquesa"
                        />
                        <div className="min-w-0">
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

                  <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap">
                    <button
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-yanax-turquesa/25 px-4 text-sm font-semibold text-yanax-turquesa transition hover:bg-yanax-verde-claro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja focus-visible:ring-offset-2 sm:w-auto"
                      onClick={() => abrirFormularioEdicion(cliente)}
                      type="button"
                    >
                      <Pencil aria-hidden="true" className="size-4" />
                      Editar cliente
                    </button>
                    <a
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-yanax-turquesa px-4 text-sm font-semibold text-white transition hover:bg-yanax-verde focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja focus-visible:ring-offset-2 sm:w-auto"
                      href={`/aplicacion/administracion/clientes/${encodeURIComponent(cliente.id)}/usuarios`}
                    >
                      <UsersRound aria-hidden="true" className="size-4" />
                      Gestionar usuarios
                    </a>
                    <a
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-yanax-morado/25 px-4 text-sm font-semibold text-yanax-morado transition hover:bg-yanax-morado/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja focus-visible:ring-offset-2 sm:w-auto"
                      href={`/aplicacion/administracion/clientes/${encodeURIComponent(cliente.id)}/proyectos`}
                    >
                      <FolderKanban aria-hidden="true" className="size-4" />
                      Gestionar proyectos
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function formatearFecha(fecha: string) {
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(fecha))
}
