import { useEffect, useState } from 'react'
import { LoaderCircle, LogOut, ShieldCheck } from 'lucide-react'
import { usarAutenticacion } from '@/dominio/autenticacion/contexto-autenticacion'
import { PantallaInicioSesion } from '@/modulos/autenticacion/PantallaInicioSesion'
import { PantallaPanelCliente } from '@/modulos/panel_cliente/PantallaPanelCliente'

const RUTA_INICIO_SESION = '/inicio-sesion'
const RUTA_APLICACION_PRIVADA = '/aplicacion'

export function Rutas() {
  const {
    autenticado,
    cargando,
    perfil,
    rol_usuario,
  } = usarAutenticacion()
  const [rutaActual, establecerRutaActual] = useState(
    () => window.location.pathname,
  )

  useEffect(() => {
    function sincronizarRuta() {
      establecerRutaActual(window.location.pathname)
    }

    window.addEventListener('popstate', sincronizarRuta)
    return () => window.removeEventListener('popstate', sincronizarRuta)
  }, [])

  useEffect(() => {
    if (cargando) return

    const rutaDestino = autenticado
      ? RUTA_APLICACION_PRIVADA
      : RUTA_INICIO_SESION

    if (rutaActual !== rutaDestino) {
      window.history.replaceState(null, '', rutaDestino)
      establecerRutaActual(rutaDestino)
    }
  }, [autenticado, cargando, rutaActual])

  if (cargando) return <PantallaCargaSesion />
  if (!autenticado) return <PantallaInicioSesion />
  if (rol_usuario === 'cliente' && perfil) return <PantallaPanelCliente />

  return <PantallaAplicacionPrivada />
}

function PantallaCargaSesion() {
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
        Comprobando tu sesión...
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
              No encontramos un perfil asociado a tu cuenta. Comunícate con tu
              contacto en Yanax.
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
