import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  LoaderCircle,
  RotateCcw,
  UserRound,
  UserRoundMinus,
  UserPlus,
  UsersRound,
} from 'lucide-react'
import { NavegacionAdministrativa } from '@/componentes/diseno/NavegacionAdministrativa'
import { obtenerProyecto } from '@/dominio/proyectos/servicio-proyectos'
import {
  agregarMiembroProyecto,
  obtenerMiembrosProyecto,
  quitarMiembroProyecto,
} from '@/dominio/proyectos/servicio-miembros-proyecto'
import type { MiembroProyecto } from '@/dominio/proyectos/tipos-miembro-proyecto'
import type { Proyecto } from '@/dominio/proyectos/tipos-proyecto'
import { obtenerUsuariosCliente } from '@/dominio/usuarios_cliente/servicio-usuarios-cliente'
import type {
  AsociacionUsuarioCliente,
  PerfilSeleccionable,
} from '@/dominio/usuarios_cliente/tipos-asociacion-cliente'

interface PropiedadesPantallaGestionMiembrosProyecto {
  proyectoId: string
}

export function PantallaGestionMiembrosProyecto({
  proyectoId,
}: PropiedadesPantallaGestionMiembrosProyecto) {
  const [proyecto, establecerProyecto] = useState<Proyecto | null>(null)
  const [miembros, establecerMiembros] = useState<MiembroProyecto[]>([])
  const [asociaciones, establecerAsociaciones] = useState<
    AsociacionUsuarioCliente[]
  >([])
  const [cargando, establecerCargando] = useState(true)
  const [errorCarga, establecerErrorCarga] = useState<string | null>(null)
  const [proyectoNoEncontrado, establecerProyectoNoEncontrado] =
    useState(false)
  const [intentoCarga, establecerIntentoCarga] = useState(0)
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
      establecerProyectoNoEncontrado(false)

      try {
        const respuestaProyecto = await obtenerProyecto(proyectoId)
        if (respuestaProyecto.error) throw respuestaProyecto.error
        if (!respuestaProyecto.data) {
          if (!consultaActiva) return
          establecerProyecto(null)
          establecerMiembros([])
          establecerAsociaciones([])
          establecerProyectoNoEncontrado(true)
          return
        }

        const proyectoCargado = respuestaProyecto.data
        const [miembrosCargados, asociacionesCargadas] = await Promise.all([
          obtenerMiembrosProyecto(proyectoCargado.id),
          obtenerUsuariosCliente(proyectoCargado.cliente_id),
        ])

        if (!consultaActiva) return
        establecerProyecto(proyectoCargado)
        establecerMiembros(miembrosCargados)
        establecerAsociaciones(asociacionesCargadas)
      } catch (error: unknown) {
        if (!consultaActiva) return
        establecerProyecto(null)
        establecerMiembros([])
        establecerAsociaciones([])
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

  const miembrosPorUsuario = useMemo(
    () => new Set(miembros.map(({ usuario_id }) => usuario_id)),
    [miembros],
  )
  const candidatos = useMemo(
    () =>
      asociaciones.filter(
        ({ usuario_id }) => !miembrosPorUsuario.has(usuario_id),
      ),
    [asociaciones, miembrosPorUsuario],
  )

  async function manejarAgregarMiembro(asociacion: AsociacionUsuarioCliente) {
    if (!proyecto) return
    const usuarioId = asociacion.usuario_id
    establecerUsuarioProcesando(usuarioId)
    establecerErrorOperacion(null)
    establecerMensajeExito(null)

    try {
      const { error } = await agregarMiembroProyecto({
        proyecto_id: proyecto.id,
        cliente_id: proyecto.cliente_id,
        usuario_id: usuarioId,
      })

      if (error?.code === '23505') {
        throw new Error('Este usuario ya es miembro del proyecto.')
      }
      if (error?.code === '23503') {
        establecerIntentoCarga((intento) => intento + 1)
        throw new Error(
          'La asociación del usuario con el cliente cambió o ya no es válida. Se actualizaron los datos; inténtalo de nuevo.',
        )
      }
      if (error) throw error

      establecerMensajeExito('El miembro se agregó correctamente al proyecto.')
      establecerIntentoCarga((intento) => intento + 1)
    } catch (error: unknown) {
      establecerErrorOperacion(obtenerMensajeError(error))
    } finally {
      establecerUsuarioProcesando(null)
    }
  }

  async function manejarQuitarMiembro(miembro: MiembroProyecto) {
    if (!proyecto) return
    const nombre = obtenerNombrePerfil(miembro.perfil)
    if (
      !window.confirm(
        `¿Quieres quitar a ${nombre} de este proyecto? Solo se eliminará su membresía del proyecto.`,
      )
    ) {
      return
    }

    establecerUsuarioProcesando(miembro.usuario_id)
    establecerErrorOperacion(null)
    establecerMensajeExito(null)
    try {
      const { data, error } = await quitarMiembroProyecto(
        proyecto.id,
        miembro.usuario_id,
      )
      if (error) throw error
      if (!data) {
        throw new Error(
          'La membresía ya no está disponible. Actualiza la lista e inténtalo de nuevo.',
        )
      }
      establecerMensajeExito('El miembro se quitó correctamente del proyecto.')
      establecerIntentoCarga((intento) => intento + 1)
    } catch (error: unknown) {
      establecerErrorOperacion(obtenerMensajeError(error))
    } finally {
      establecerUsuarioProcesando(null)
    }
  }

  const rutaVolver = `/aplicacion/administracion/proyectos/${encodeURIComponent(proyectoId)}`

  return (
    <main className="min-h-screen bg-yanax-verde-claro text-yanax-azul-profundo">
      <NavegacionAdministrativa seccionActual="clientes" />
      <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-7 sm:pt-9">
        <a
          className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-yanax-turquesa transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja focus-visible:ring-offset-2"
          href={rutaVolver}
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Volver al detalle del proyecto
        </a>

        <header className="mt-5 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-yanax-morado">
            Administración · Proyectos
          </p>
          <h1 className="mt-2 break-words text-2xl font-semibold tracking-tight sm:text-3xl">
            Gestionar miembros
          </h1>
          {proyecto && (
            <p className="mt-2 break-words text-sm leading-6 text-yanax-azul-profundo/75 sm:text-base">
              Proyecto: <span className="font-semibold">{proyecto.nombre}</span>
            </p>
          )}
          <p className="mt-2 max-w-3xl text-sm leading-6 text-yanax-azul-profundo/70">
            Los candidatos se muestran según su asociación actual con el cliente. La base de datos valida nuevamente esa relación al guardar.
          </p>
        </header>

        {mensajeExito && <p aria-live="polite" className="mt-5 rounded-xl border border-yanax-verde/25 bg-white px-4 py-3 text-sm text-yanax-verde" role="status">{mensajeExito}</p>}
        {errorOperacion && <p aria-live="polite" className="mt-5 rounded-xl border border-yanax-coral/40 bg-white px-4 py-3 text-sm leading-6" role="alert">{errorOperacion}</p>}

        {cargando && (
          <div aria-live="polite" className="mt-7 flex min-h-36 items-center justify-center gap-3 rounded-2xl border border-yanax-turquesa/15 bg-white px-5 text-sm font-medium" role="status">
            <LoaderCircle aria-hidden="true" className="size-5 animate-spin text-yanax-turquesa" />
            Cargando proyecto y miembros...
          </div>
        )}

        {!cargando && errorCarga && (
          <section className="mt-7 rounded-2xl border border-yanax-coral/40 bg-white p-5 sm:p-7" role="alert">
            <h2 className="font-semibold">No fue posible cargar los miembros</h2>
            <p className="mt-2 break-words text-sm leading-6 text-yanax-azul-profundo/75">{errorCarga}</p>
            <button className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-yanax-turquesa px-4 text-sm font-semibold text-white transition hover:bg-yanax-verde focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja focus-visible:ring-offset-2" onClick={() => establecerIntentoCarga((intento) => intento + 1)} type="button">
              <RotateCcw aria-hidden="true" className="size-4" /> Reintentar
            </button>
          </section>
        )}

        {!cargando && !errorCarga && proyectoNoEncontrado && (
          <section className="mt-7 rounded-2xl border border-yanax-turquesa/10 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Proyecto no encontrado</h2>
            <p className="mt-2 text-sm leading-6 text-yanax-azul-profundo/75">No encontramos un proyecto disponible para esta dirección.</p>
          </section>
        )}

        {!cargando && !errorCarga && proyecto && (
          <div className="mt-7 grid items-start gap-5 lg:grid-cols-2 lg:gap-6">
            <section aria-labelledby="titulo-miembros-proyecto" className="min-w-0 rounded-2xl border border-yanax-turquesa/10 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-yanax-verde-claro text-yanax-turquesa"><UsersRound aria-hidden="true" className="size-5" /></span>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold" id="titulo-miembros-proyecto">Miembros actuales</h2>
                  <p className="mt-1 text-sm leading-6 text-yanax-azul-profundo/70">{miembros.length === 1 ? '1 miembro del proyecto.' : `${miembros.length} miembros del proyecto.`}</p>
                </div>
              </div>
              {miembros.length === 0 ? (
                <p className="mt-5 rounded-xl border border-dashed border-yanax-turquesa/25 bg-yanax-verde-claro/40 px-4 py-6 text-center text-sm leading-6 text-yanax-azul-profundo/75">Este proyecto todavía no tiene miembros.</p>
              ) : (
                <ul className="mt-5 space-y-3">
                  {miembros.map((miembro) => (
                    <li className="min-w-0 rounded-xl border border-yanax-turquesa/10 p-4" key={`${miembro.proyecto_id}:${miembro.usuario_id}`}>
                      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 items-start gap-3">
                          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-yanax-verde-claro text-yanax-turquesa"><UserRound aria-hidden="true" className="size-4" /></span>
                          <div className="min-w-0">
                            <p className="break-words text-sm font-semibold">{obtenerNombrePerfil(miembro.perfil)}</p>
                            <p className="mt-1 break-all font-mono text-xs text-yanax-azul-profundo/65">{miembro.usuario_id}</p>
                          </div>
                        </div>
                        <button aria-label={`Quitar a ${obtenerNombrePerfil(miembro.perfil)} del proyecto`} className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-yanax-coral/35 px-3 text-sm font-semibold transition hover:bg-yanax-coral/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 sm:w-auto" disabled={usuarioProcesando !== null} onClick={() => void manejarQuitarMiembro(miembro)} type="button">
                          {usuarioProcesando === miembro.usuario_id ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <UserRoundMinus aria-hidden="true" className="size-4" />}
                          Quitar miembro
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section aria-labelledby="titulo-candidatos-proyecto" className="min-w-0 rounded-2xl border border-yanax-turquesa/10 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-yanax-verde-claro text-yanax-morado"><UserPlus aria-hidden="true" className="size-5" /></span>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold" id="titulo-candidatos-proyecto">Agregar miembros</h2>
                  <p className="mt-1 text-sm leading-6 text-yanax-azul-profundo/70">Perfiles asociados al cliente del proyecto que aún no aparecen como miembros.</p>
                </div>
              </div>
              {candidatos.length === 0 ? (
                <p className="mt-5 rounded-xl border border-dashed border-yanax-turquesa/25 bg-yanax-verde-claro/40 px-4 py-6 text-center text-sm leading-6 text-yanax-azul-profundo/75">No hay candidatos disponibles para agregar.</p>
              ) : (
                <ul className="mt-5 space-y-3">
                  {candidatos.map((asociacion) => {
                    const estaProcesando = usuarioProcesando === asociacion.usuario_id
                    const nombre = obtenerNombrePerfil(asociacion.perfil)
                    return (
                      <li className="flex min-w-0 flex-col gap-3 rounded-xl border border-yanax-turquesa/10 p-4 sm:flex-row sm:items-center sm:justify-between" key={asociacion.usuario_id}>
                        <div className="flex min-w-0 items-start gap-3">
                          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-yanax-verde-claro text-yanax-turquesa"><UserRound aria-hidden="true" className="size-4" /></span>
                          <div className="min-w-0">
                            <p className="break-words text-sm font-semibold">{nombre}</p>
                            <p className="mt-1 break-all font-mono text-xs text-yanax-azul-profundo/65">{asociacion.usuario_id}</p>
                          </div>
                        </div>
                        <button aria-label={`Agregar a ${nombre} al proyecto`} className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-yanax-turquesa px-3 text-sm font-semibold text-white transition hover:bg-yanax-verde focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 sm:w-auto" disabled={usuarioProcesando !== null} onClick={() => void manejarAgregarMiembro(asociacion)} type="button">
                          {estaProcesando ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <UserPlus aria-hidden="true" className="size-4" />}
                          Agregar
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

function obtenerNombrePerfil(perfil: PerfilSeleccionable | null) {
  const nombre = [perfil?.nombre, perfil?.apellido]
    .filter((parte) => parte?.trim())
    .join(' ')
  return nombre || 'Usuario sin nombre'
}

function obtenerMensajeError(error: unknown) {
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
    return error.message
  }
  return 'Ocurrió un error inesperado. Inténtalo de nuevo.'
}
