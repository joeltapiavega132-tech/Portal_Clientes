import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import {
  LoaderCircle,
  RotateCcw,
  ShieldCheck,
  UserPlus,
  UserRound,
  UserRoundCheck,
  UserRoundX,
} from 'lucide-react'
import type { EstadoUsuario, RolUsuario } from '@/dominio/autenticacion/tipos-perfil'
import { NavegacionAdministrativa } from '@/componentes/diseno/NavegacionAdministrativa'
import { obtenerClientes } from '@/dominio/clientes/servicio-clientes'
import type { Cliente } from '@/dominio/clientes/tipos-cliente'
import { obtenerProyectosPorCliente } from '@/dominio/proyectos/servicio-proyectos'
import type { Proyecto } from '@/dominio/proyectos/tipos-proyecto'
import {
  cambiarEstadoUsuarioAdministrativo,
  crearUsuarioAdministrativo,
  obtenerUsuariosAdministrativos,
} from '@/dominio/usuarios/servicio-usuarios-administrativos'
import type {
  DatosCrearUsuarioAdministrativo,
  PerfilAdministrativo,
} from '@/dominio/usuarios/tipos-usuario-administrativo'

interface DatosFormularioUsuario {
  nombre: string
  apellido: string
  correo: string
  rol_usuario: RolUsuario
  cliente_id: string
  proyecto_ids: string[]
}

const FORMULARIO_INICIAL: DatosFormularioUsuario = {
  nombre: '',
  apellido: '',
  correo: '',
  rol_usuario: 'cliente',
  cliente_id: '',
  proyecto_ids: [],
}

export function PantallaGestionUsuarios() {
  const [usuarios, establecerUsuarios] = useState<PerfilAdministrativo[]>([])
  const [clientes, establecerClientes] = useState<Cliente[]>([])
  const [proyectos, establecerProyectos] = useState<Proyecto[]>([])
  const [formulario, establecerFormulario] =
    useState<DatosFormularioUsuario>(FORMULARIO_INICIAL)
  const [usuarioParaCambiar, establecerUsuarioParaCambiar] =
    useState<PerfilAdministrativo | null>(null)
  const [contrasenaAdmin, establecerContrasenaAdmin] = useState('')
  const [cargando, establecerCargando] = useState(true)
  const [cargandoProyectos, establecerCargandoProyectos] = useState(false)
  const [guardando, establecerGuardando] = useState(false)
  const [errorCarga, establecerErrorCarga] = useState<string | null>(null)
  const [errorOperacion, establecerErrorOperacion] = useState<string | null>(null)
  const [errorConfirmacion, establecerErrorConfirmacion] = useState<string | null>(null)
  const [mensajeExito, establecerMensajeExito] = useState<string | null>(null)
  const [intentoCarga, establecerIntentoCarga] = useState(0)

  useEffect(() => {
    let activa = true

    async function cargarDatos() {
      establecerCargando(true)
      establecerErrorCarga(null)
      try {
        const [respuestaUsuarios, respuestaClientes] = await Promise.all([
          obtenerUsuariosAdministrativos(),
          obtenerClientes(),
        ])
        if (respuestaUsuarios.error) throw respuestaUsuarios.error
        if (respuestaClientes.error) throw respuestaClientes.error
        if (!activa) return
        establecerUsuarios(respuestaUsuarios.data ?? [])
        establecerClientes(respuestaClientes.data ?? [])
      } catch (error: unknown) {
        if (!activa) return
        establecerErrorCarga(obtenerMensajeError(error))
      } finally {
        if (activa) establecerCargando(false)
      }
    }

    void cargarDatos()
    return () => {
      activa = false
    }
  }, [intentoCarga])

  useEffect(() => {
    let activa = true
    const clienteId = formulario.rol_usuario === 'cliente'
      ? formulario.cliente_id
      : ''

    if (!clienteId) {
      establecerProyectos([])
      establecerCargandoProyectos(false)
      return
    }

    async function cargarProyectos() {
      establecerCargandoProyectos(true)
      try {
        const { data, error } = await obtenerProyectosPorCliente(clienteId)
        if (error) throw error
        if (activa) establecerProyectos(data ?? [])
      } catch {
        if (activa) {
          establecerProyectos([])
          establecerErrorOperacion(
            'No fue posible cargar los proyectos del cliente seleccionado.',
          )
        }
      } finally {
        if (activa) establecerCargandoProyectos(false)
      }
    }

    void cargarProyectos()
    return () => {
      activa = false
    }
  }, [formulario.cliente_id, formulario.rol_usuario])

  function actualizarFormulario(
    campo: keyof DatosFormularioUsuario,
    valor: string | string[],
  ) {
    establecerFormulario((actual) => ({ ...actual, [campo]: valor }))
    establecerErrorOperacion(null)
    establecerErrorConfirmacion(null)
    establecerMensajeExito(null)
  }

  function cambiarRol(rol: RolUsuario) {
    establecerFormulario((actual) => ({
      ...actual,
      rol_usuario: rol,
      cliente_id: rol === 'cliente' ? actual.cliente_id : '',
      proyecto_ids: [],
    }))
    establecerErrorOperacion(null)
    establecerErrorConfirmacion(null)
    establecerMensajeExito(null)
  }

  function cambiarCliente(clienteId: string) {
    establecerFormulario((actual) => ({
      ...actual,
      cliente_id: clienteId,
      proyecto_ids: [],
    }))
    establecerErrorOperacion(null)
    establecerErrorConfirmacion(null)
    establecerMensajeExito(null)
  }

  function alternarProyecto(proyectoId: string) {
    const proyectosSeleccionados = new Set(formulario.proyecto_ids)
    if (proyectosSeleccionados.has(proyectoId)) {
      proyectosSeleccionados.delete(proyectoId)
    } else {
      proyectosSeleccionados.add(proyectoId)
    }
    actualizarFormulario('proyecto_ids', [...proyectosSeleccionados])
  }

  async function manejarCreacion(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
      establecerErrorOperacion(null)
      establecerErrorConfirmacion(null)
    establecerMensajeExito(null)

    const nombre = formulario.nombre.trim()
    const apellido = formulario.apellido.trim()
    const correo = formulario.correo.trim().toLowerCase()
    if (!nombre || !correo) {
      establecerErrorOperacion('El nombre y el correo son obligatorios.')
      return
    }
    if (formulario.rol_usuario === 'cliente' && !formulario.cliente_id) {
      establecerErrorOperacion('Selecciona el cliente al que pertenecerá la cuenta.')
      return
    }

    const datos: DatosCrearUsuarioAdministrativo = {
      nombre,
      apellido,
      correo,
      rol_usuario: formulario.rol_usuario,
      cliente_id:
        formulario.rol_usuario === 'cliente' ? formulario.cliente_id : null,
      proyecto_ids:
        formulario.rol_usuario === 'cliente' ? formulario.proyecto_ids : [],
    }

    establecerGuardando(true)
    try {
      const resultado = await crearUsuarioAdministrativo(datos)
      establecerFormulario(FORMULARIO_INICIAL)
      establecerMensajeExito(
        `Se envió la invitación a ${correo}. La cuenta quedó aprovisionada como ${resultado.rol_usuario}.`,
      )
      establecerIntentoCarga((intento) => intento + 1)
    } catch (error: unknown) {
      establecerErrorOperacion(obtenerMensajeError(error))
    } finally {
      establecerGuardando(false)
    }
  }

  async function manejarCambioEstado(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!usuarioParaCambiar) return

    establecerErrorOperacion(null)
    establecerErrorConfirmacion(null)
    establecerMensajeExito(null)
    establecerGuardando(true)
    try {
      const estadoSiguiente: EstadoUsuario =
        usuarioParaCambiar.estado === 'activo' ? 'inactivo' : 'activo'
      await cambiarEstadoUsuarioAdministrativo(
        usuarioParaCambiar.id,
        estadoSiguiente,
        contrasenaAdmin,
      )
      establecerMensajeExito(
        `El acceso quedó ${estadoSiguiente === 'activo' ? 'activado' : 'desactivado'}. Se conservaron sus relaciones y datos.`,
      )
      cerrarConfirmacionEstado()
      establecerIntentoCarga((intento) => intento + 1)
    } catch (error: unknown) {
      establecerErrorOperacion(obtenerMensajeError(error))
      establecerErrorConfirmacion(obtenerMensajeError(error))
      establecerContrasenaAdmin('')
    } finally {
      establecerGuardando(false)
    }
  }

  function cerrarConfirmacionEstado() {
    establecerUsuarioParaCambiar(null)
    establecerContrasenaAdmin('')
    establecerErrorConfirmacion(null)
  }

  return (
    <main className="min-h-screen bg-yanax-verde-claro text-yanax-azul-profundo">
      <NavegacionAdministrativa seccionActual="usuarios" />
      <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-7 sm:pt-9">
        <header className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-yanax-morado">
            Administración · Usuarios
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Accesos del portal
          </h1>
          <p className="mt-2 text-sm leading-6 text-yanax-azul-profundo/70">
            Invita administradores o usuarios cliente y controla su acceso. Las
            relaciones existentes se conservan cuando se desactiva una cuenta.
          </p>
        </header>

        {mensajeExito && <Aviso tipo="exito">{mensajeExito}</Aviso>}
        {errorOperacion && <Aviso tipo="error">{errorOperacion}</Aviso>}

        <section className="mt-7 rounded-2xl border border-yanax-turquesa/10 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-yanax-verde-claro text-yanax-turquesa">
              <UserPlus aria-hidden="true" className="size-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold">Invitar usuario</h2>
              <p className="mt-1 text-sm leading-6 text-yanax-azul-profundo/70">
                No se solicita ni se almacena una contraseña inicial. El usuario
                recibe un enlace para activar su cuenta.
              </p>
            </div>
          </div>

          <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={(evento) => void manejarCreacion(evento)}>
            <Campo
              etiqueta="Nombre"
              valor={formulario.nombre}
              cambiar={(valor) => actualizarFormulario('nombre', valor)}
              requerido
            />
            <Campo
              etiqueta="Apellido"
              valor={formulario.apellido}
              cambiar={(valor) => actualizarFormulario('apellido', valor)}
            />
            <label className="grid gap-2 text-sm font-medium sm:col-span-2">
              Correo electrónico
              <input
                autoComplete="email"
                className={claseCampo}
                onChange={(evento) => actualizarFormulario('correo', evento.target.value)}
                required
                type="email"
                value={formulario.correo}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Rol
              <select
                className={claseCampo}
                onChange={(evento) => cambiarRol(evento.target.value as RolUsuario)}
                value={formulario.rol_usuario}
              >
                <option value="cliente">Cliente</option>
                <option value="administrador">Administrador</option>
              </select>
            </label>

            {formulario.rol_usuario === 'cliente' && (
              <label className="grid gap-2 text-sm font-medium">
                Cliente asociado
                <select
                  className={claseCampo}
                  onChange={(evento) => cambiarCliente(evento.target.value)}
                  required
                  value={formulario.cliente_id}
                >
                  <option value="">Selecciona un cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nombre}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {formulario.rol_usuario === 'cliente' && formulario.cliente_id && (
              <fieldset className="grid gap-3 sm:col-span-2">
                <legend className="text-sm font-medium">
                  Proyectos a los que tendrá acceso (opcional)
                </legend>
                {cargandoProyectos ? (
                  <p className="text-sm text-yanax-azul-profundo/70">Cargando proyectos...</p>
                ) : proyectos.length === 0 ? (
                  <p className="rounded-lg bg-yanax-verde-claro/60 px-3 py-2 text-sm text-yanax-azul-profundo/70">
                    Este cliente no tiene proyectos disponibles. La cuenta podrá
                    asociarse al cliente sin membresías de proyecto.
                  </p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {proyectos.map((proyecto) => (
                      <label
                        className="flex min-h-11 items-start gap-3 rounded-lg border border-yanax-turquesa/15 p-3 text-sm"
                        key={proyecto.id}
                      >
                        <input
                          checked={formulario.proyecto_ids.includes(proyecto.id)}
                          className="mt-0.5 size-4 accent-yanax-turquesa"
                          onChange={() => alternarProyecto(proyecto.id)}
                          type="checkbox"
                        />
                        <span className="min-w-0 break-words">{proyecto.nombre}</span>
                      </label>
                    ))}
                  </div>
                )}
              </fieldset>
            )}

            <div className="sm:col-span-2">
              <button
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-yanax-turquesa px-4 text-sm font-semibold text-white transition hover:bg-yanax-verde focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
                disabled={guardando || cargando || cargandoProyectos}
                type="submit"
              >
                {guardando ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <UserPlus aria-hidden="true" className="size-4" />}
                Enviar invitación
              </button>
            </div>
          </form>
        </section>

        <section className="mt-8" aria-labelledby="titulo-usuarios-registrados">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-yanax-turquesa">Cuentas existentes</p>
              <h2 className="mt-1 text-xl font-semibold" id="titulo-usuarios-registrados">Usuarios y estado de acceso</h2>
            </div>
            {!cargando && !errorCarga && (
              <span className="text-sm text-yanax-azul-profundo/65">{usuarios.length} perfiles</span>
            )}
          </div>

          {cargando && <EstadoCarga />}
          {!cargando && errorCarga && (
            <div className="mt-4 rounded-2xl border border-yanax-coral/40 bg-white p-5" role="alert">
              <p className="text-sm leading-6">{errorCarga}</p>
              <button className={claseBotonSecundario} onClick={() => establecerIntentoCarga((intento) => intento + 1)} type="button">
                <RotateCcw aria-hidden="true" className="size-4" /> Reintentar
              </button>
            </div>
          )}
          {!cargando && !errorCarga && usuarios.length === 0 && (
            <p className="mt-4 rounded-2xl border border-yanax-turquesa/10 bg-white p-5 text-sm text-yanax-azul-profundo/70">
              Todavía no hay perfiles disponibles.
            </p>
          )}
          {!cargando && !errorCarga && usuarios.length > 0 && (
            <ul className="mt-4 grid gap-3 lg:grid-cols-2">
              {usuarios.map((usuario) => {
                const nombre = [usuario.nombre, usuario.apellido]
                  .filter((parte) => parte?.trim())
                  .join(' ') || 'Usuario sin nombre'
                return (
                  <li className="min-w-0 rounded-2xl border border-yanax-turquesa/10 bg-white p-4 shadow-sm sm:p-5" key={usuario.id}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-yanax-verde-claro text-yanax-turquesa">
                          {usuario.rol_usuario === 'administrador' ? <ShieldCheck aria-hidden="true" className="size-5" /> : <UserRound aria-hidden="true" className="size-5" />}
                        </span>
                        <div className="min-w-0">
                          <h3 className="break-words font-semibold">{nombre}</h3>
                          <p className="mt-1 break-all font-mono text-xs text-yanax-azul-profundo/60">{usuario.id}</p>
                          <p className="mt-2 text-sm text-yanax-azul-profundo/75">
                            {usuario.rol_usuario === 'administrador' ? 'Administrador' : 'Cliente'}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        <span className={`inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold ${usuario.estado === 'activo' ? 'bg-yanax-verde-claro text-yanax-verde' : 'bg-yanax-coral/10 text-yanax-coral'}`}>
                          {usuario.estado === 'activo' ? <UserRoundCheck aria-hidden="true" className="size-3.5" /> : <UserRoundX aria-hidden="true" className="size-3.5" />}
                          {usuario.estado === 'activo' ? 'Activo' : 'Inactivo'}
                        </span>
                        <button
                          className={claseBotonSecundario}
                          disabled={guardando}
                          onClick={() => {
                            establecerErrorOperacion(null)
                            establecerUsuarioParaCambiar(usuario)
                          }}
                          type="button"
                        >
                          {usuario.estado === 'activo' ? 'Desactivar acceso' : 'Activar acceso'}
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>

      {usuarioParaCambiar && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-yanax-azul-profundo/55 p-0 sm:items-center sm:p-5">
          <section
            aria-labelledby="titulo-confirmacion-estado"
            aria-modal="true"
            className="w-full max-w-lg rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl sm:p-7"
            role="dialog"
          >
            <h2 className="text-lg font-semibold" id="titulo-confirmacion-estado">
              {usuarioParaCambiar.estado === 'activo' ? 'Confirmar desactivación' : 'Confirmar activación'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-yanax-azul-profundo/75">
              Para {usuarioParaCambiar.estado === 'activo' ? 'desactivar' : 'activar'} este acceso, confirma la contraseña de tu cuenta administradora. No se modificará ni eliminará ninguna relación.
            </p>
            <form className="mt-5" onSubmit={(evento) => void manejarCambioEstado(evento)}>
              <label className="grid gap-2 text-sm font-medium">
                Contraseña del administrador actual
                <input
                  autoComplete="current-password"
                  autoFocus
                  className={claseCampo}
                  onChange={(evento) => establecerContrasenaAdmin(evento.target.value)}
                  required
                  type="password"
                  value={contrasenaAdmin}
                />
              </label>
              {errorConfirmacion && (
                <p className="mt-3 text-sm leading-5 text-yanax-coral" role="alert">
                  {errorConfirmacion}
                </p>
              )}
              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button className={claseBotonSecundario} disabled={guardando} onClick={cerrarConfirmacionEstado} type="button">
                  Cancelar
                </button>
                <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-yanax-azul-profundo px-4 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja focus-visible:ring-offset-2 disabled:opacity-60" disabled={guardando || !contrasenaAdmin} type="submit">
                  {guardando && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
                  Confirmar cambio
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}

const claseCampo = 'min-h-11 w-full rounded-lg border border-yanax-turquesa/25 bg-white px-3 py-2 text-sm text-yanax-azul-profundo outline-none transition focus-visible:ring-2 focus-visible:ring-yanax-naranja'
const claseBotonSecundario = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-yanax-turquesa/25 px-3 text-sm font-semibold text-yanax-turquesa transition hover:bg-yanax-verde-claro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja disabled:cursor-not-allowed disabled:opacity-50'

function Campo({
  etiqueta,
  valor,
  cambiar,
  requerido = false,
}: {
  etiqueta: string
  valor: string
  cambiar: (valor: string) => void
  requerido?: boolean
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {etiqueta}
      <input
        className={claseCampo}
        onChange={(evento) => cambiar(evento.target.value)}
        required={requerido}
        type="text"
        value={valor}
      />
    </label>
  )
}

function EstadoCarga() {
  return (
    <div aria-live="polite" className="mt-4 flex min-h-28 items-center justify-center gap-3 rounded-2xl bg-white text-sm font-medium" role="status">
      <LoaderCircle aria-hidden="true" className="size-5 animate-spin text-yanax-turquesa" />
      Cargando perfiles...
    </div>
  )
}

function Aviso({ tipo, children }: { tipo: 'exito' | 'error'; children: ReactNode }) {
  return (
    <p aria-live="polite" className={`mt-5 rounded-xl border bg-white px-4 py-3 text-sm leading-6 ${tipo === 'exito' ? 'border-yanax-verde/30 text-yanax-verde' : 'border-yanax-coral/40 text-yanax-azul-profundo'}`} role={tipo === 'error' ? 'alert' : 'status'}>
      {children}
    </p>
  )
}

function obtenerMensajeError(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'No fue posible completar la operación. Inténtalo de nuevo.'
}
