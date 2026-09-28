import { LoaderCircle, Mail, UserRound } from 'lucide-react'
import { NavegacionPrivada } from '@/componentes/diseno/NavegacionPrivada'
import { usarAutenticacion } from '@/dominio/autenticacion/contexto-autenticacion'

export function PantallaPerfil() {
  const {
    cargandoPerfil,
    errorCargaPerfil,
    perfil,
    rol_usuario,
    sesion,
  } = usarAutenticacion()
  const nombreCompleto = [perfil?.nombre, perfil?.apellido]
    .filter((parte) => parte?.trim())
    .join(' ')

  return (
    <main className="min-h-screen bg-yanax-verde-claro text-yanax-azul-profundo">
      <NavegacionPrivada seccionActual="perfil" />
      <div className="mx-auto w-full max-w-4xl px-4 pb-12 pt-6 sm:px-7 sm:pt-9">
        <section className="rounded-2xl bg-yanax-azul-profundo px-5 py-7 text-white shadow-sm sm:px-8 sm:py-9">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-yanax-verde-claro">
            Yanax Client Portal
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            Tu perfil
          </h1>
          <p className="mt-2 text-sm leading-6 text-white/80 sm:text-base">
            Consulta la información asociada a tu cuenta.
          </p>
        </section>

        {cargandoPerfil && (
          <div
            aria-live="polite"
            className="mt-6 flex min-h-40 items-center justify-center gap-3 rounded-2xl border border-yanax-turquesa/15 bg-white px-5 text-sm font-medium"
            role="status"
          >
            <LoaderCircle
              aria-hidden="true"
              className="size-5 animate-spin text-yanax-turquesa"
            />
            Cargando tu perfil...
          </div>
        )}

        {!cargandoPerfil && errorCargaPerfil && (
          <p
            aria-live="polite"
            className="mt-6 rounded-xl border border-yanax-coral/40 bg-white p-5 text-sm leading-6"
            role="alert"
          >
            {errorCargaPerfil}
          </p>
        )}

        {!cargandoPerfil && !errorCargaPerfil && !perfil && (
          <p
            aria-live="polite"
            className="mt-6 rounded-xl border border-yanax-naranja/50 bg-white p-5 text-sm leading-6"
            role="status"
          >
            No encontramos un perfil asociado a tu cuenta. Comunícate con tu
            contacto en Yanax.
          </p>
        )}

        {!cargandoPerfil && !errorCargaPerfil && perfil && (
          <section
            aria-label="Información del perfil"
            className="mt-6 overflow-hidden rounded-2xl border border-yanax-turquesa/10 bg-white shadow-sm"
          >
            <div className="flex items-center gap-4 border-b border-yanax-turquesa/10 p-5 sm:p-7">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-yanax-verde-claro text-yanax-turquesa">
                <UserRound aria-hidden="true" className="size-6" />
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-lg font-semibold sm:text-xl">
                  {nombreCompleto || 'Nombre no registrado'}
                </h2>
                <p className="mt-1 break-all text-sm text-yanax-azul-profundo/70">
                  {sesion?.user.email || 'Correo no disponible'}
                </p>
              </div>
            </div>

            <dl className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
              <div className="min-w-0">
                <dt className="text-xs font-semibold uppercase tracking-wide text-yanax-turquesa">
                  Nombre
                </dt>
                <dd className="mt-1 break-words text-sm font-medium">
                  {perfil.nombre || 'No registrado'}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs font-semibold uppercase tracking-wide text-yanax-turquesa">
                  Apellido
                </dt>
                <dd className="mt-1 break-words text-sm font-medium">
                  {perfil.apellido || 'No registrado'}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs font-semibold uppercase tracking-wide text-yanax-turquesa">
                  Correo electrónico
                </dt>
                <dd className="mt-1 flex min-w-0 items-start gap-2 break-all text-sm font-medium">
                  <Mail
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-yanax-turquesa"
                  />
                  {sesion?.user.email || 'No disponible'}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs font-semibold uppercase tracking-wide text-yanax-turquesa">
                  Rol
                </dt>
                <dd className="mt-1 text-sm font-medium">
                  {rol_usuario === 'administrador' ? 'Administrador' : 'Cliente'}
                </dd>
              </div>
            </dl>
          </section>
        )}
      </div>
    </main>
  )
}
