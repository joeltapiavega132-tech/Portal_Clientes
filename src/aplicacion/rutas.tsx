import { useEffect, useState } from 'react'
import { LoaderCircle, LogOut, ShieldCheck } from 'lucide-react'
import { usarAutenticacion } from '@/dominio/autenticacion/contexto-autenticacion'
import { PantallaInicioSesion } from '@/modulos/autenticacion/PantallaInicioSesion'
import { PantallaActivarCuenta } from '@/modulos/autenticacion/PantallaActivarCuenta'
import { PantallaPanelAdministrativo } from '@/modulos/panel_administrativo/PantallaPanelAdministrativo'
import { PantallaPanelCliente } from '@/modulos/panel_cliente/PantallaPanelCliente'
import { PantallaGestionClientes } from '@/modulos/clientes/PantallaGestionClientes'
import { PantallaGestionUsuariosCliente } from '@/modulos/clientes/PantallaGestionUsuariosCliente'
import { PantallaPerfil } from '@/modulos/perfil/PantallaPerfil'
import { PantallaDetalleProyecto } from '@/modulos/proyectos/PantallaDetalleProyecto'
import { PantallaDetalleProyectoAdministrativo } from '@/modulos/proyectos/PantallaDetalleProyectoAdministrativo'
import { PantallaGestionMiembrosProyecto } from '@/modulos/proyectos/PantallaGestionMiembrosProyecto'
import { PantallaGestionProyectosCliente } from '@/modulos/proyectos/PantallaGestionProyectosCliente'
import { PantallaListaProyectos } from '@/modulos/proyectos/PantallaListaProyectos'
import { PantallaPruebaRlsSprints } from '@/modulos/desarrollo/PantallaPruebaRlsSprints'
import { PantallaGestionUsuarios } from '@/modulos/usuarios/PantallaGestionUsuarios'

const RUTA_INICIO_SESION = '/inicio-sesion'
const RUTA_APLICACION_PRIVADA = '/aplicacion'
const RUTA_PANEL_ADMINISTRATIVO = '/aplicacion/administracion'

type RutaReconocida =
  | { tipo: 'inicio' }
  | { tipo: 'inicio_sesion' }
  | { tipo: 'panel' }
  | { tipo: 'panel_administrativo' }
  | { tipo: 'gestion_clientes' }
  | { tipo: 'gestion_usuarios' }
  | { tipo: 'gestion_usuarios_cliente'; clienteId: string }
  | { tipo: 'gestion_proyectos_cliente'; clienteId: string }
  | { tipo: 'detalle_proyecto_administrativo'; proyectoId: string }
  | { tipo: 'gestion_miembros_proyecto'; proyectoId: string }
  | { tipo: 'lista_proyectos' }
  | { tipo: 'perfil' }
  | { tipo: 'detalle_proyecto'; proyectoId: string }
  | { tipo: 'herramienta_prueba_rls' }
  | { tipo: 'activar_cuenta' }
  | { tipo: 'desconocida' }

function reconocerRuta(ruta: string): RutaReconocida {
  if (import.meta.env.DEV && ruta === '/__desarrollo/validacion-rls-sprints') {
    return { tipo: 'herramienta_prueba_rls' }
  }
  if (ruta === '/') return { tipo: 'inicio' }
  if (ruta === RUTA_INICIO_SESION) return { tipo: 'inicio_sesion' }
  if (ruta === '/activar-cuenta' || ruta === '/activar-cuenta/') {
    return { tipo: 'activar_cuenta' }
  }
  if (ruta === RUTA_APLICACION_PRIVADA || ruta === `${RUTA_APLICACION_PRIVADA}/`) {
    return { tipo: 'panel' }
  }
  if (
    ruta === RUTA_PANEL_ADMINISTRATIVO ||
    ruta === `${RUTA_PANEL_ADMINISTRATIVO}/`
  ) {
    return { tipo: 'panel_administrativo' }
  }
  if (
    ruta === '/aplicacion/administracion/clientes' ||
    ruta === '/aplicacion/administracion/clientes/'
  ) {
    return { tipo: 'gestion_clientes' }
  }
  if (
    ruta === '/aplicacion/administracion/usuarios' ||
    ruta === '/aplicacion/administracion/usuarios/'
  ) {
    return { tipo: 'gestion_usuarios' }
  }
  const coincidenciaUsuariosCliente = ruta.match(
    /^\/aplicacion\/administracion\/clientes\/([^/]+)\/usuarios\/?$/,
  )
  if (coincidenciaUsuariosCliente) {
    try {
      return {
        tipo: 'gestion_usuarios_cliente',
        clienteId: decodeURIComponent(coincidenciaUsuariosCliente[1]),
      }
    } catch {
      return { tipo: 'desconocida' }
    }
  }
  const coincidenciaProyectosCliente = ruta.match(
    /^\/aplicacion\/administracion\/clientes\/([^/]+)\/proyectos\/?$/,
  )
  if (coincidenciaProyectosCliente) {
    try {
      return {
        tipo: 'gestion_proyectos_cliente',
        clienteId: decodeURIComponent(coincidenciaProyectosCliente[1]),
      }
    } catch {
      return { tipo: 'desconocida' }
    }
  }
  const coincidenciaMiembrosProyecto = ruta.match(
    /^\/aplicacion\/administracion\/proyectos\/([^/]+)\/miembros\/?$/,
  )
  if (coincidenciaMiembrosProyecto) {
    try {
      return {
        tipo: 'gestion_miembros_proyecto',
        proyectoId: decodeURIComponent(coincidenciaMiembrosProyecto[1]),
      }
    } catch {
      return { tipo: 'desconocida' }
    }
  }
  const coincidenciaDetalleAdministrativo = ruta.match(
    /^\/aplicacion\/administracion\/proyectos\/([^/]+)\/?$/,
  )
  if (coincidenciaDetalleAdministrativo) {
    try {
      return {
        tipo: 'detalle_proyecto_administrativo',
        proyectoId: decodeURIComponent(coincidenciaDetalleAdministrativo[1]),
      }
    } catch {
      return { tipo: 'desconocida' }
    }
  }
  if (ruta === '/aplicacion/proyectos' || ruta === '/aplicacion/proyectos/') {
    return { tipo: 'lista_proyectos' }
  }
  if (ruta === '/aplicacion/perfil' || ruta === '/aplicacion/perfil/') {
    return { tipo: 'perfil' }
  }

  const coincidencia = ruta.match(/^\/aplicacion\/proyectos\/([^/]+)\/?$/)
  if (!coincidencia) return { tipo: 'desconocida' }

  try {
    return {
      tipo: 'detalle_proyecto',
      proyectoId: decodeURIComponent(coincidencia[1]),
    }
  } catch {
    return { tipo: 'desconocida' }
  }
}

export function Rutas() {
  const {
    autenticado,
    cargando,
    cargandoPerfil,
    perfil,
    rol_usuario,
  } = usarAutenticacion()
  const [rutaActual, establecerRutaActual] = useState(
    () => window.location.pathname,
  )
  const rutaReconocida = reconocerRuta(rutaActual)

  useEffect(() => {
    function sincronizarRuta() {
      establecerRutaActual(window.location.pathname)
    }

    window.addEventListener('popstate', sincronizarRuta)
    return () => window.removeEventListener('popstate', sincronizarRuta)
  }, [])

  useEffect(() => {
    if (cargando || (autenticado && cargandoPerfil)) return

    const debeIrAlInicioSesion =
      !autenticado &&
      rutaActual !== RUTA_INICIO_SESION &&
      rutaReconocida.tipo !== 'activar_cuenta'
    const debeIrAlPanel =
      autenticado &&
      (rutaReconocida.tipo === 'inicio_sesion' || rutaReconocida.tipo === 'inicio')
    const rutaCliente =
      rutaReconocida.tipo === 'lista_proyectos' ||
      rutaReconocida.tipo === 'perfil' ||
      rutaReconocida.tipo === 'detalle_proyecto'
    const debeIrAlPanelAdministrativo =
      autenticado &&
      rol_usuario === 'administrador' &&
      rutaCliente
    const debeIrAlPanelCliente =
      autenticado &&
      rol_usuario === 'cliente' &&
      (rutaReconocida.tipo === 'panel_administrativo' ||
        rutaReconocida.tipo === 'gestion_clientes' ||
        rutaReconocida.tipo === 'gestion_usuarios' ||
        rutaReconocida.tipo === 'gestion_usuarios_cliente' ||
        rutaReconocida.tipo === 'gestion_proyectos_cliente' ||
        rutaReconocida.tipo === 'detalle_proyecto_administrativo' ||
        rutaReconocida.tipo === 'gestion_miembros_proyecto')
    const destinoPanel =
      rol_usuario === 'administrador'
        ? RUTA_PANEL_ADMINISTRATIVO
        : RUTA_APLICACION_PRIVADA
    let rutaDestino: string | null = null
    if (debeIrAlInicioSesion) {
      rutaDestino = RUTA_INICIO_SESION
    } else if (debeIrAlPanel) {
      rutaDestino = destinoPanel
    } else if (debeIrAlPanelAdministrativo) {
      rutaDestino = RUTA_PANEL_ADMINISTRATIVO
    } else if (debeIrAlPanelCliente) {
      rutaDestino = RUTA_APLICACION_PRIVADA
    }

    if (rutaDestino && rutaActual !== rutaDestino) {
      window.history.replaceState(null, '', rutaDestino)
      establecerRutaActual(rutaDestino)
    }
  }, [
    autenticado,
    cargando,
    cargandoPerfil,
    rol_usuario,
    rutaActual,
    rutaReconocida.tipo,
  ])

  if (cargando) return <PantallaCargaSesion />
  if (rutaReconocida.tipo === 'activar_cuenta') {
    if (autenticado && cargandoPerfil) {
      return <PantallaCargaSesion mensaje="Validando la invitación..." />
    }
    return (
      <PantallaActivarCuenta
        autenticado={autenticado}
        cargando={false}
        perfil={perfil}
      />
    )
  }
  if (!autenticado) return <PantallaInicioSesion />
  if (cargandoPerfil) {
    return <PantallaCargaSesion mensaje="Cargando tu perfil..." />
  }
  if (perfil?.estado === 'inactivo') return <PantallaCuentaInactiva />

  if (rutaReconocida.tipo === 'desconocida') {
    return <PantallaRutaNoEncontrada />
  }

  if (import.meta.env.DEV && rutaReconocida.tipo === 'herramienta_prueba_rls') {
    return <PantallaPruebaRlsSprints />
  }

  const rutaPrivada =
    rutaReconocida.tipo === 'herramienta_prueba_rls' ||
    rutaReconocida.tipo === 'panel' ||
    rutaReconocida.tipo === 'panel_administrativo' ||
    rutaReconocida.tipo === 'gestion_clientes' ||
    rutaReconocida.tipo === 'gestion_usuarios' ||
    rutaReconocida.tipo === 'gestion_usuarios_cliente' ||
    rutaReconocida.tipo === 'gestion_proyectos_cliente' ||
    rutaReconocida.tipo === 'detalle_proyecto_administrativo' ||
    rutaReconocida.tipo === 'gestion_miembros_proyecto' ||
    rutaReconocida.tipo === 'lista_proyectos' ||
    rutaReconocida.tipo === 'perfil' ||
    rutaReconocida.tipo === 'detalle_proyecto' ||
    rutaReconocida.tipo === 'inicio' ||
    rutaReconocida.tipo === 'inicio_sesion'

  if (rol_usuario === 'administrador' && perfil && rutaPrivada) {
    if (rutaReconocida.tipo === 'gestion_clientes') {
      return <PantallaGestionClientes />
    }
    if (rutaReconocida.tipo === 'gestion_usuarios') {
      return <PantallaGestionUsuarios />
    }
    if (rutaReconocida.tipo === 'gestion_usuarios_cliente') {
      return (
        <PantallaGestionUsuariosCliente clienteId={rutaReconocida.clienteId} />
      )
    }
    if (rutaReconocida.tipo === 'gestion_proyectos_cliente') {
      return (
        <PantallaGestionProyectosCliente
          clienteId={rutaReconocida.clienteId}
        />
      )
    }
    if (rutaReconocida.tipo === 'detalle_proyecto_administrativo') {
      return (
        <PantallaDetalleProyectoAdministrativo
          proyectoId={rutaReconocida.proyectoId}
        />
      )
    }
    if (rutaReconocida.tipo === 'gestion_miembros_proyecto') {
      return (
        <PantallaGestionMiembrosProyecto
          proyectoId={rutaReconocida.proyectoId}
        />
      )
    }

    return <PantallaPanelAdministrativo />
  }

  if (rol_usuario === 'cliente' && perfil && rutaPrivada) {
    if (rutaReconocida.tipo === 'lista_proyectos') {
      return <PantallaListaProyectos />
    }

    if (rutaReconocida.tipo === 'perfil') {
      return <PantallaPerfil />
    }

    if (rutaReconocida.tipo === 'detalle_proyecto') {
      return <PantallaDetalleProyecto proyectoId={rutaReconocida.proyectoId} />
    }

    return <PantallaPanelCliente />
  }

  return <PantallaAplicacionPrivada />
}

function PantallaCuentaInactiva() {
  const { cerrarSesion } = usarAutenticacion()
  const [cerrandoSesion, establecerCerrandoSesion] = useState(false)
  const [error, establecerError] = useState(false)

  async function manejarCierreSesion() {
    establecerCerrandoSesion(true)
    establecerError(false)
    try {
      const { error: errorAuth } = await cerrarSesion()
      establecerError(Boolean(errorAuth))
    } catch {
      establecerError(true)
    } finally {
      establecerCerrandoSesion(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-yanax-verde-claro px-5 py-10">
      <section className="w-full max-w-lg rounded-2xl border border-yanax-turquesa/10 bg-white p-6 text-center shadow-sm sm:p-9">
        <ShieldCheck aria-hidden="true" className="mx-auto size-10 text-yanax-turquesa" />
        <h1 className="mt-4 text-2xl font-semibold text-yanax-azul-profundo">Acceso inactivo</h1>
        <p className="mt-3 text-sm leading-6 text-yanax-azul-profundo/75">
          Esta cuenta está desactivada. Tus proyectos y relaciones se conservan.
          Contacta al administrador de Yanax si necesitas recuperar el acceso.
        </p>
        {error && <p className="mt-4 text-sm text-yanax-coral" role="alert">No fue posible cerrar la sesión.</p>}
        <button
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-yanax-turquesa px-4 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja disabled:opacity-60"
          disabled={cerrandoSesion}
          onClick={() => void manejarCierreSesion()}
          type="button"
        >
          {cerrandoSesion ? 'Cerrando sesión...' : 'Cerrar sesión'}
        </button>
      </section>
    </main>
  )
}

function PantallaRutaNoEncontrada() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-yanax-verde-claro px-5 py-10">
      <section className="w-full max-w-lg rounded-2xl border border-yanax-turquesa/10 bg-white p-6 text-center shadow-sm sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-yanax-morado">
          Yanax Client Portal
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-yanax-azul-profundo">
          Página no encontrada
        </h1>
        <p className="mt-3 text-sm leading-6 text-yanax-azul-profundo/75">
          La dirección no corresponde a una página disponible.
        </p>
        <a
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-yanax-turquesa px-4 text-sm font-semibold text-white transition hover:bg-yanax-verde focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja focus-visible:ring-offset-2"
          href={RUTA_APLICACION_PRIVADA}
        >
          Volver al panel
        </a>
      </section>
    </main>
  )
}

function PantallaCargaSesion({
  mensaje = 'Comprobando tu sesión...',
}: {
  mensaje?: string
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-yanax-verde-claro px-6 py-12">
      <div
        aria-live="polite"
        className="flex items-center gap-3 rounded-xl bg-white px-5 py-4 text-sm font-medium text-yanax-azul-profundo shadow-sm"
        role="status"
      >
        <LoaderCircle
          aria-hidden="true"
          className="size-5 animate-spin text-yanax-turquesa"
        />
        {mensaje}
      </div>
    </main>
  )
}

function PantallaAplicacionPrivada() {
  const {
    cerrarSesion,
    cargandoPerfil,
    errorCargaPerfil,
    perfil,
    rol_usuario,
  } = usarAutenticacion()
  const [errorAlCerrar, establecerErrorAlCerrar] = useState(false)
  const nombreCompleto = [perfil?.nombre, perfil?.apellido]
    .filter((parte) => parte?.trim())
    .join(' ')

  async function manejarCierreSesion() {
    establecerErrorAlCerrar(false)

    try {
      const { error } = await cerrarSesion()
      if (error) establecerErrorAlCerrar(true)
    } catch {
      establecerErrorAlCerrar(true)
    }
  }

  return (
    <main className="min-h-screen bg-yanax-verde-claro px-5 py-6 sm:px-8 sm:py-10">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
        <a
          aria-label="Yanax Client Portal, inicio"
          className="text-base font-bold tracking-[0.16em] text-yanax-azul-profundo"
          href={RUTA_APLICACION_PRIVADA}
        >
          YANAX
        </a>
        <button
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-yanax-turquesa/20 bg-white px-3 text-sm font-medium text-yanax-turquesa transition hover:bg-yanax-turquesa hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-turquesa focus-visible:ring-offset-2"
          onClick={() => void manejarCierreSesion()}
          type="button"
        >
          <LogOut aria-hidden="true" className="size-4" />
          <span>Cerrar sesión</span>
        </button>
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-6xl items-center justify-center py-12">
        <div className="w-full max-w-xl rounded-2xl border border-yanax-turquesa/10 bg-white p-7 text-center shadow-sm sm:p-10">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-yanax-verde-claro text-yanax-turquesa">
            <ShieldCheck aria-hidden="true" className="size-7" />
          </span>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-yanax-morado">
            Yanax Client Portal
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-yanax-azul-profundo sm:text-3xl">
            {nombreCompleto ? `Bienvenido, ${nombreCompleto}` : 'Sesión iniciada'}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
            {rol_usuario === 'administrador'
              ? 'El área administrativa todavía está en desarrollo.'
              : 'Tu espacio privado está listo. El contenido del portal se incorporará aquí.'}
          </p>

          {cargandoPerfil && (
            <div
              aria-live="polite"
              className="mt-7 flex items-center justify-center gap-2 text-sm text-yanax-turquesa"
              role="status"
            >
              <LoaderCircle
                aria-hidden="true"
                className="size-4 animate-spin"
              />
              Cargando tu perfil...
            </div>
          )}

          {!cargandoPerfil && errorCargaPerfil && (
            <p
              aria-live="polite"
              className="mt-7 rounded-lg border border-yanax-coral/40 bg-yanax-coral/10 px-4 py-3 text-sm text-yanax-azul-profundo"
              role="alert"
            >
              {errorCargaPerfil}
            </p>
          )}

          {!cargandoPerfil && !errorCargaPerfil && !perfil && (
            <p
              aria-live="polite"
              className="mt-7 rounded-lg border border-yanax-naranja/50 bg-yanax-naranja/10 px-4 py-3 text-sm text-yanax-azul-profundo"
              role="status"
            >
              No encontramos un perfil activo para esta sesión o no fue posible
              cargarlo. Comunícate con tu contacto en Yanax.
            </p>
          )}

          {!cargandoPerfil && perfil && (
            <dl className="mt-7 grid gap-4 rounded-xl bg-yanax-verde-claro/60 p-4 text-left sm:grid-cols-2 sm:p-5">
              {nombreCompleto && (
                <div className="min-w-0">
                  <dt className="text-xs font-medium text-yanax-turquesa">
                    Nombre
                  </dt>
                  <dd className="mt-1 break-words text-sm font-semibold text-yanax-azul-profundo">
                    {nombreCompleto}
                  </dd>
                </div>
              )}
              <div className="min-w-0">
                <dt className="text-xs font-medium text-yanax-turquesa">
                  Rol
                </dt>
                <dd className="mt-1 text-sm font-semibold text-yanax-azul-profundo">
                  {rol_usuario === 'administrador'
                    ? 'Administrador'
                    : 'Cliente'}
                </dd>
              </div>
            </dl>
          )}

          {errorAlCerrar && (
            <p
              aria-live="polite"
              className="mt-6 rounded-lg border border-yanax-coral/40 bg-yanax-coral/10 px-4 py-3 text-sm text-yanax-azul-profundo"
              role="alert"
            >
              No fue posible cerrar la sesión. Inténtalo de nuevo.
            </p>
          )}
        </div>
      </section>
    </main>
  )
}
