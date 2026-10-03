import { useState } from 'react'
import type { FormEvent } from 'react'
import { KeyRound, LoaderCircle } from 'lucide-react'
import type { PerfilUsuario } from '@/dominio/autenticacion/tipos-perfil'
import { establecerContrasenaUsuario } from '@/dominio/autenticacion/servicio-autenticacion'

interface PropiedadesPantallaActivarCuenta {
  cargando: boolean
  autenticado: boolean
  perfil: PerfilUsuario | null
}

export function PantallaActivarCuenta({
  cargando,
  autenticado,
  perfil,
}: PropiedadesPantallaActivarCuenta) {
  const [contrasena, establecerContrasena] = useState('')
  const [confirmacion, establecerConfirmacion] = useState('')
  const [guardando, establecerGuardando] = useState(false)
  const [error, establecerError] = useState<string | null>(null)

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    establecerError(null)
    if (contrasena !== confirmacion) {
      establecerError('Las contraseñas no coinciden.')
      return
    }

    establecerGuardando(true)
    try {
      const { error: errorAuth } = await establecerContrasenaUsuario(contrasena)
      if (errorAuth) {
        establecerError(
          'No fue posible establecer la contraseña. Revisa los requisitos de la cuenta o solicita una nueva invitación.',
        )
        return
      }

      const rutaDestino =
        perfil?.rol_usuario === 'administrador'
          ? '/aplicacion/administracion'
          : '/aplicacion'
      window.location.assign(rutaDestino)
    } catch {
      establecerError('No fue posible completar la activación de la cuenta.')
    } finally {
      establecerGuardando(false)
      establecerContrasena('')
      establecerConfirmacion('')
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-yanax-verde-claro px-4 py-8 text-yanax-azul-profundo">
      <section className="w-full max-w-md rounded-2xl border border-yanax-turquesa/10 bg-white p-6 shadow-sm sm:p-8">
        <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-yanax-verde-claro text-yanax-turquesa">
          <KeyRound aria-hidden="true" className="size-6" />
        </span>
        <p className="mt-5 text-center text-xs font-semibold uppercase tracking-[0.16em] text-yanax-morado">
          Yanax Client Portal
        </p>
        <h1 className="mt-2 text-center text-2xl font-semibold">Activar cuenta</h1>

        {cargando ? (
          <p aria-live="polite" className="mt-5 flex items-center justify-center gap-2 text-sm" role="status">
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            Validando la invitación...
          </p>
        ) : !autenticado ? (
          <div className="mt-5 text-center">
            <p className="text-sm leading-6 text-yanax-azul-profundo/75">
              No encontramos una invitación activa en esta sesión. Abre el enlace
              recibido por correo o solicita que te envíen una nueva invitación.
            </p>
            <a className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-yanax-turquesa px-4 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja" href="/inicio-sesion">
              Ir al inicio de sesión
            </a>
          </div>
        ) : !perfil ? (
          <p className="mt-5 text-sm leading-6 text-yanax-coral" role="alert">
            No fue posible cargar el perfil de esta invitación. Contacta a Yanax.
          </p>
        ) : perfil.estado === 'inactivo' ? (
          <p className="mt-5 text-sm leading-6 text-yanax-azul-profundo/75" role="status">
            La cuenta todavía no está aprovisionada o su acceso está inactivo.
            Contacta al administrador que envió la invitación.
          </p>
        ) : (
          <form className="mt-6 grid gap-4" onSubmit={(evento) => void manejarEnvio(evento)}>
            <p className="text-sm leading-6 text-yanax-azul-profundo/75">
              Elige una contraseña para finalizar la activación. Yanax no recibe
              ni almacena esta contraseña.
            </p>
            <label className="grid gap-2 text-sm font-medium">
              Nueva contraseña
              <input
                autoComplete="new-password"
                className={claseCampo}
                onChange={(evento) => establecerContrasena(evento.target.value)}
                required
                type="password"
                value={contrasena}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Confirmar contraseña
              <input
                autoComplete="new-password"
                className={claseCampo}
                onChange={(evento) => establecerConfirmacion(evento.target.value)}
                required
                type="password"
                value={confirmacion}
              />
            </label>
            {error && <p className="text-sm text-yanax-coral" role="alert">{error}</p>}
            <button
              className="mt-1 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-yanax-turquesa px-4 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja disabled:opacity-60"
              disabled={guardando || !contrasena || !confirmacion}
              type="submit"
            >
              {guardando && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
              Guardar contraseña
            </button>
          </form>
        )}
      </section>
    </main>
  )
}

const claseCampo = 'min-h-11 w-full rounded-lg border border-yanax-turquesa/25 px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja'
