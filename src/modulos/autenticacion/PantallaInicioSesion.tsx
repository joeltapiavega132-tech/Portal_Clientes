import { useState, type FormEvent } from 'react'
import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react'
import { usarAutenticacion } from '@/dominio/autenticacion/contexto-autenticacion'
import { iniciarSesion } from '@/dominio/autenticacion/servicio-autenticacion'
import { combinarClases } from '@/utilidades/clases'

interface ErrorAutenticacion {
  code?: string
}

function obtenerMensajeError(error: ErrorAutenticacion) {
  switch (error.code) {
    case 'invalid_credentials':
      return 'El correo o la contraseña no son correctos. Revísalos e inténtalo de nuevo.'
    case 'email_not_confirmed':
      return 'Confirma tu correo electrónico antes de iniciar sesión.'
    case 'over_request_rate_limit':
    case 'too_many_requests':
      return 'Se realizaron demasiados intentos. Espera un momento y vuelve a intentarlo.'
    default:
      return 'No pudimos iniciar sesión. Inténtalo de nuevo en unos momentos.'
  }
}

export function PantallaInicioSesion() {
  const { autenticado, cargando: cargandoSesion } = usarAutenticacion()
  const [correo, establecerCorreo] = useState('')
  const [contrasena, establecerContrasena] = useState('')
  const [mostrarContrasena, establecerMostrarContrasena] = useState(false)
  const [procesando, establecerProcesando] = useState(false)
  const [mensajeError, establecerMensajeError] = useState<string | null>(null)
  const [mensajeRecuperacion, establecerMensajeRecuperacion] = useState(false)
  const [inicioSesionCorrecto, establecerInicioSesionCorrecto] = useState(false)

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    establecerProcesando(true)
    establecerMensajeError(null)
    establecerMensajeRecuperacion(false)
    establecerInicioSesionCorrecto(false)

    try {
      const { error } = await iniciarSesion(correo.trim(), contrasena)

      if (error) {
        establecerMensajeError(obtenerMensajeError(error))
        return
      }

      establecerInicioSesionCorrecto(true)
    } catch {
      establecerMensajeError(
        'No pudimos conectar con el servicio. Comprueba tu conexión e inténtalo de nuevo.',
      )
    } finally {
      establecerProcesando(false)
    }
  }

  const mostrarCarga = cargandoSesion || procesando
  const mostrarConfirmacion = autenticado || inicioSesionCorrecto

  return (
    <main className="min-h-screen bg-background lg:grid lg:grid-cols-2">
      <aside className="relative hidden min-h-screen overflow-hidden bg-yanax-azul-profundo px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 -top-40 size-[30rem] rounded-full border border-white/10"
        >
          <div className="absolute inset-12 rounded-full border border-white/10" />
          <div className="absolute inset-24 rounded-full border border-white/10" />
        </div>

        <div className="relative flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-yanax-verde-claro text-yanax-turquesa">
            <ShieldCheck aria-hidden="true" className="size-5" />
          </span>
          <span className="text-lg font-semibold tracking-[0.16em]">YANAX</span>
        </div>

        <div className="relative max-w-lg pb-8">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-yanax-naranja">
            Portal de clientes
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
            Tus proyectos, con más claridad.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-yanax-verde-claro">
            Consulta avances y novedades en un solo espacio, con la cercanía del
            equipo Yanax.
          </p>
          <div className="mt-10 flex items-center gap-3 text-sm text-yanax-verde-claro">
            <span className="flex size-9 items-center justify-center rounded-full border border-white/15 bg-white/5">
              <LockKeyhole aria-hidden="true" className="size-4" />
            </span>
            Acceso para clientes Yanax
          </div>
        </div>

        <p className="relative text-xs text-yanax-verde-claro/70">
          Yanax Client Portal
        </p>
      </aside>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <span className="flex size-10 items-center justify-center rounded-xl bg-yanax-azul-profundo text-yanax-verde-claro">
              <ShieldCheck aria-hidden="true" className="size-5" />
            </span>
            <span className="text-lg font-semibold tracking-[0.16em] text-yanax-morado">
              YANAX
            </span>
          </div>

          <div className="mb-8">
            <p className="mb-3 text-sm font-medium text-muted-foreground">
              Yanax Client Portal
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
              Bienvenido de nuevo
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Ingresa con el correo asociado a tu cuenta.
            </p>
          </div>

          <form className="space-y-5" onSubmit={manejarEnvio}>
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-foreground"
                htmlFor="correo"
              >
                Correo electrónico
              </label>
              <input
                autoComplete="email"
                className={combinarClases(
                  'flex h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus-visible:border-yanax-turquesa focus-visible:ring-2 focus-visible:ring-yanax-turquesa/20 disabled:cursor-not-allowed disabled:opacity-60',
                )}
                id="correo"
                name="correo"
                onChange={(evento) => {
                  establecerCorreo(evento.target.value)
                  establecerMensajeError(null)
                }}
                placeholder="nombre@empresa.com"
                required
                type="email"
                value={correo}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label
                  className="text-sm font-medium text-foreground"
                  htmlFor="contrasena"
                >
                  Contraseña
                </label>
                <a
                  className="text-sm font-medium text-yanax-morado underline-offset-4 transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-morado focus-visible:ring-offset-2"
                  href="#recuperacion"
                  onClick={(evento) => {
                    evento.preventDefault()
                    establecerMensajeRecuperacion(true)
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative">
                <input
                  autoComplete="current-password"
                  className="flex h-11 w-full rounded-md border border-border bg-background px-3 py-2 pr-11 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus-visible:border-yanax-turquesa focus-visible:ring-2 focus-visible:ring-yanax-turquesa/20 disabled:cursor-not-allowed disabled:opacity-60"
                  id="contrasena"
                  name="contrasena"
                  onChange={(evento) => {
                    establecerContrasena(evento.target.value)
                    establecerMensajeError(null)
                  }}
                  placeholder="Ingresa tu contraseña"
                  required
                  type={mostrarContrasena ? 'text' : 'password'}
                  value={contrasena}
                />
                <button
                  aria-label={
                    mostrarContrasena
                      ? 'Ocultar contraseña'
                      : 'Mostrar contraseña'
                  }
                  aria-pressed={mostrarContrasena}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-yanax-turquesa transition hover:text-yanax-morado focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-yanax-turquesa disabled:cursor-not-allowed"
                  disabled={procesando}
                  onClick={() =>
                    establecerMostrarContrasena(!mostrarContrasena)
                  }
                  type="button"
                >
                  {mostrarContrasena ? (
                    <EyeOff aria-hidden="true" className="size-4" />
                  ) : (
                    <Eye aria-hidden="true" className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {mensajeError && (
              <p
                aria-live="polite"
                className="rounded-md border border-yanax-coral/40 bg-yanax-coral/10 px-3 py-2.5 text-sm text-yanax-azul-profundo"
                role="alert"
              >
                {mensajeError}
              </p>
            )}

            {mensajeRecuperacion && (
              <p
                aria-live="polite"
                className="text-sm text-muted-foreground"
                role="status"
              >
                La recuperación de contraseña estará disponible próximamente.
              </p>
            )}

            {mostrarConfirmacion && (
              <p
                aria-live="polite"
                className="rounded-md border border-yanax-verde/30 bg-yanax-verde-claro px-3 py-2.5 text-sm text-yanax-verde"
                role="status"
              >
                Sesión iniciada correctamente.
              </p>
            )}

            <button
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-yanax-naranja px-4 text-sm font-semibold text-yanax-azul-profundo shadow-sm transition hover:bg-yanax-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-turquesa focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={mostrarCarga}
              type="submit"
            >
              {mostrarCarga ? (
                <>
                  <LoaderCircle
                    aria-hidden="true"
                    className="size-4 animate-spin"
                  />
                  {cargandoSesion ? 'Comprobando sesión...' : 'Iniciando sesión...'}
                </>
              ) : (
                <>
                  Iniciar sesión
                  <ArrowRight aria-hidden="true" className="size-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs leading-5 text-muted-foreground">
            Si necesitas ayuda para acceder, comunícate con tu contacto en
            Yanax.
          </p>
        </div>
      </section>
    </main>
  )
}
