import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  LoaderCircle,
  RotateCcw,
  Search,
  UserPlus,
  UserRound,
  UserRoundMinus,
} from 'lucide-react'
import { NavegacionAdministrativa } from '@/componentes/diseno/NavegacionAdministrativa'
import { obtenerClientes } from '@/dominio/clientes/servicio-clientes'
import type { Cliente } from '@/dominio/clientes/tipos-cliente'
import {
  asociarUsuarioACliente,
  obtenerPerfilesParaSeleccion,
  obtenerUsuariosCliente,
  quitarUsuarioDeCliente,
} from '@/dominio/usuarios_cliente/servicio-usuarios-cliente'
import type {
  AsociacionUsuarioCliente,
  PerfilSeleccionable,
} from '@/dominio/usuarios_cliente/tipos-asociacion-cliente'

interface PropiedadesPantallaGestionUsuariosCliente {
  clienteId: string
}

export function PantallaGestionUsuariosCliente({
  clienteId,
}: PropiedadesPantallaGestionUsuariosCliente) {
  const [cliente, establecerCliente] = useState<Cliente | null>(null)
  const [asociaciones, establecerAsociaciones] = useState<
    AsociacionUsuarioCliente[]
  >([])
  const [perfiles, establecerPerfiles] = useState<PerfilSeleccionable[]>([])
  const [cargando, establecerCargando] = useState(true)
  const [errorCarga, establecerErrorCarga] = useState<string | null>(null)
  const [intentoCarga, establecerIntentoCarga] = useState(0)
  const [busqueda, establecerBusqueda] = useState('')
  const [usuarioProcesando, establecerUsuarioProcesando] = useState<
    string | null
  >(null)
  const [errorOperacion, establecerErrorOperacion] = useState<string | null>(
    null,
  )
  const [mensajeExito, establecerMensajeExito] = useState<string | null>(null)

  useEffect(() => {
    let consultaActiva = true

    async function cargarDatos() {
      establecerCargando(true)
      establecerErrorCarga(null)

      try {
        const [respuestaClientes, usuariosCliente, respuestaPerfiles] =
          await Promise.all([
            obtenerClientes(),
            obtenerUsuariosCliente(clienteId),
            obtenerPerfilesParaSeleccion(),
          ])

        if (!consultaActiva) return
        if (respuestaClientes.error) throw respuestaClientes.error
        if (respuestaPerfiles.error) throw respuestaPerfiles.error

        const clienteEncontrado = (respuestaClientes.data ?? []).find(
          (registro) => registro.id === clienteId,
        )

        if (!clienteEncontrado) {
          throw new Error(
            'No se encontró el cliente o no tienes acceso a esta información.',
          )
        }

        establecerCliente(clienteEncontrado)
        establecerAsociaciones(usuariosCliente)
        establecerPerfiles(respuestaPerfiles.data ?? [])
      } catch (error: unknown) {
        if (!consultaActiva) return
        establecerCliente(null)
        establecerAsociaciones([])
        establecerPerfiles([])
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

  const perfilesFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase('es')
    if (!termino) return perfiles

    return perfiles.filter((perfil) => {
      const nombre = [perfil.nombre, perfil.apellido]
        .filter((parte) => parte?.trim())
        .join(' ')
        .toLocaleLowerCase('es')

      return (
        nombre.includes(termino) || perfil.id.toLocaleLowerCase().includes(termino)
      )
    })
  }, [busqueda, perfiles])

  async function manejarAsociacion(perfil: PerfilSeleccionable) {
    if (!cliente) return

    establecerUsuarioProcesando(perfil.id)
    establecerErrorOperacion(null)
    establecerMensajeExito(null)

    try {
      const { error } = await asociarUsuarioACliente({
        cliente_id: cliente.id,
        usuario_id: perfil.id,
      })

      if (error) {
        if (error.code === '23505') {
          throw new Error('Este usuario ya está asociado a este cliente.')
        }
        throw error
      }

      establecerMensajeExito('El usuario se asoció correctamente al cliente.')
      establecerIntentoCarga((intento) => intento + 1)
    } catch (error: unknown) {
      establecerErrorOperacion(obtenerMensajeError(error))
    } finally {
      establecerUsuarioProcesando(null)
    }
  }

  async function manejarQuitarAsociacion(
    asociacion: AsociacionUsuarioCliente,
  ) {
    if (!cliente) return

    const perfilNombre = asociacion.perfil
      ? obtenerNombrePerfil(asociacion.perfil)
      : asociacion.usuario_id
    const confirmado = window.confirm(
      `¿Quieres quitar a ${perfilNombre} de ${cliente.nombre}? Esto solo elimina la asociación con este cliente.`,
    )
    if (!confirmado) return

    establecerUsuarioProcesando(asociacion.usuario_id)
    establecerErrorOperacion(null)
    establecerMensajeExito(null)

    try {
      const { data, error } = await quitarUsuarioDeCliente(
        cliente.id,
        asociacion.usuario_id,
      )

      if (error) throw error
      if (!data) {
        throw new Error(
          'La asociación ya no está disponible. Actualiza la lista e inténtalo de nuevo.',
        )
      }

      establecerMensajeExito('La asociación se quitó correctamente.')
      establecerIntentoCarga((intento) => intento + 1)
    } catch (error: unknown) {
      establecerErrorOperacion(obtenerMensajeError(error))
    } finally {
      establecerUsuarioProcesando(null)
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

        <header className="mt-5 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-yanax-morado">
            Administración · Clientes
          </p>
          <h1 className="mt-2 break-words text-2xl font-semibold tracking-tight sm:text-3xl">
            Usuarios del cliente
          </h1>
          {cliente && (
            <p className="mt-2 flex min-w-0 items-start gap-2 text-sm leading-6 text-yanax-azul-profundo/75 sm:text-base">
              <Building2
                aria-hidden="true"
                className="mt-1 size-4 shrink-0 text-yanax-turquesa"
              />
              <span className="break-words font-medium">{cliente.nombre}</span>
            </p>
          )}
          <p className="mt-2 max-w-2xl text-sm leading-6 text-yanax-azul-profundo/70">
            Administra qué perfiles existentes están asociados con esta
            organización. Esta sección no crea cuentas ni modifica perfiles.
          </p>
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

        {errorOperacion && (
          <p
            aria-live="polite"
            className="mt-5 rounded-xl border border-yanax-coral/40 bg-white px-4 py-3 text-sm leading-6 text-yanax-azul-profundo"
            role="alert"
          >
            {errorOperacion}
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
            Cargando usuarios y asociaciones...
          </div>
        )}

        {!cargando && errorCarga && (
          <section
            aria-labelledby="titulo-error-usuarios-cliente"
            className="mt-7 rounded-2xl border border-yanax-coral/40 bg-white p-5 sm:p-7"
            role="alert"
          >
            <h2 className="font-semibold" id="titulo-error-usuarios-cliente">
              No fue posible cargar la gestión de usuarios
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

        {!cargando && !errorCarga && cliente && (
          <div className="mt-7 grid items-start gap-5 lg:grid-cols-2 lg:gap-6">
            <section
              aria-labelledby="titulo-usuarios-asociados"
              className="min-w-0 rounded-2xl border border-yanax-turquesa/10 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-yanax-verde-claro text-yanax-turquesa">
                  <UserRound aria-hidden="true" className="size-5" />
                </span>
                <div className="min-w-0">
                  <h2
                    className="text-lg font-semibold"
                    id="titulo-usuarios-asociados"
                  >
                    Usuarios asociados
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-yanax-azul-profundo/70">
                    {asociaciones.length === 1
                      ? '1 perfil asociado a este cliente.'
                      : `${asociaciones.length} perfiles asociados a este cliente.`}
                  </p>
                </div>
              </div>

              {asociaciones.length === 0 ? (
                <div className="mt-5 rounded-xl border border-dashed border-yanax-turquesa/25 bg-yanax-verde-claro/40 px-4 py-6 text-center">
                  <p className="text-sm font-semibold">Aún no hay usuarios asociados</p>
                  <p className="mt-1 text-sm leading-6 text-yanax-azul-profundo/70">
                    Busca un perfil existente para darle acceso a este cliente.
                  </p>
                </div>
              ) : (
                <ul className="mt-5 space-y-3">
                  {asociaciones.map((asociacion) => (
                    <li
                      className="min-w-0 rounded-xl border border-yanax-turquesa/10 p-4"
                      key={`${asociacion.cliente_id}:${asociacion.usuario_id}`}
                    >
                      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="break-words text-sm font-semibold">
                            {asociacion.perfil
                              ? obtenerNombrePerfil(asociacion.perfil)
                              : 'Perfil no disponible'}
                          </p>
                          <p className="mt-1 break-all font-mono text-xs text-yanax-azul-profundo/65">
                            {asociacion.usuario_id}
                          </p>
                          <p className="mt-2 flex items-center gap-1.5 text-xs text-yanax-azul-profundo/65">
                            <CalendarDays
                              aria-hidden="true"
                              className="size-3.5 shrink-0"
                            />
                            Asociado el {formatearFecha(asociacion.creado_en)}
                          </p>
                        </div>
                        <button
                          aria-label={`Quitar asociación de ${asociacion.perfil ? obtenerNombrePerfil(asociacion.perfil) : asociacion.usuario_id}`}
                          className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-yanax-coral/35 px-3 text-sm font-semibold text-yanax-azul-profundo transition hover:bg-yanax-coral/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
                          disabled={usuarioProcesando !== null}
                          onClick={() => void manejarQuitarAsociacion(asociacion)}
                          type="button"
                        >
                          {usuarioProcesando === asociacion.usuario_id ? (
                            <LoaderCircle
                              aria-hidden="true"
                              className="size-4 animate-spin"
                            />
                          ) : (
                            <UserRoundMinus
                              aria-hidden="true"
                              className="size-4"
                            />
                          )}
                          Quitar asociación
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section
              aria-labelledby="titulo-seleccionar-perfil"
              className="min-w-0 rounded-2xl border border-yanax-turquesa/10 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-yanax-verde-claro text-yanax-morado">
                  <UserPlus aria-hidden="true" className="size-5" />
                </span>
                <div className="min-w-0">
                  <h2
                    className="text-lg font-semibold"
                    id="titulo-seleccionar-perfil"
                  >
                    Asociar un perfil existente
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-yanax-azul-profundo/70">
                    Busca por nombre, apellido o UUID. No se crean cuentas ni
                    se modifican perfiles.
                  </p>
                </div>
              </div>

              <label className="mt-5 block text-sm font-medium">
                Buscar perfil
                <span className="relative mt-1.5 block">
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-yanax-azul-profundo/55"
                  />
                  <input
                    autoComplete="off"
                    className="min-h-11 w-full rounded-lg border border-yanax-turquesa/25 bg-white py-2 pl-10 pr-3 text-base text-yanax-azul-profundo outline-none transition placeholder:text-yanax-azul-profundo/45 focus:border-yanax-turquesa focus:ring-2 focus:ring-yanax-turquesa/20"
                    onChange={(evento) => establecerBusqueda(evento.target.value)}
                    placeholder="Nombre, apellido o UUID"
                    type="search"
                    value={busqueda}
                  />
                </span>
              </label>

              {perfilesFiltrados.length === 0 ? (
                <p
                  aria-live="polite"
                  className="mt-4 rounded-xl bg-yanax-verde-claro/50 px-4 py-5 text-center text-sm leading-6 text-yanax-azul-profundo/75"
                  role="status"
                >
                  {perfiles.length === 0
                    ? 'No hay perfiles disponibles para seleccionar.'
                    : 'No hay perfiles que coincidan con la búsqueda.'}
                </p>
              ) : (
                <ul className="mt-4 max-h-[32rem] space-y-2 overflow-y-auto pr-1">
                  {perfilesFiltrados.map((perfil) => {
                    const yaAsociado = asociaciones.some(
                      ({ usuario_id }) => usuario_id === perfil.id,
                    )
                    const estaProcesando = usuarioProcesando === perfil.id

                    return (
                      <li
                        className="flex min-w-0 flex-col gap-3 rounded-xl border border-yanax-turquesa/10 p-3 sm:flex-row sm:items-center sm:justify-between"
                        key={perfil.id}
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-yanax-verde-claro text-yanax-turquesa">
                            <UserRound
                              aria-hidden="true"
                              className="size-4"
                            />
                          </span>
                          <div className="min-w-0">
                            <p className="break-words text-sm font-semibold">
                              {obtenerNombrePerfil(perfil)}
                            </p>
                            <p className="mt-1 break-all font-mono text-xs text-yanax-azul-profundo/65">
                              {perfil.id}
                            </p>
                          </div>
                        </div>
                        <button
                          aria-label={
                            yaAsociado
                              ? `${obtenerNombrePerfil(perfil)} ya está asociado`
                              : `Asociar ${obtenerNombrePerfil(perfil)}`
                          }
                          className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-yanax-turquesa px-3 text-sm font-semibold text-white transition hover:bg-yanax-verde focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                          disabled={yaAsociado || usuarioProcesando !== null}
                          onClick={() => void manejarAsociacion(perfil)}
                          type="button"
                        >
                          {estaProcesando ? (
                            <LoaderCircle
                              aria-hidden="true"
                              className="size-4 animate-spin"
                            />
                          ) : (
                            <UserPlus aria-hidden="true" className="size-4" />
                          )}
                          {yaAsociado ? 'Ya asociado' : 'Asociar'}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  )
}

function obtenerNombrePerfil(perfil: PerfilSeleccionable) {
  const nombre = [perfil.nombre, perfil.apellido]
    .filter((parte) => parte?.trim())
    .join(' ')

  return nombre || 'Perfil sin nombre'
}

function formatearFecha(fecha: string) {
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
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
