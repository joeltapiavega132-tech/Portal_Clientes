import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { clienteSupabase } from '@/infraestructura/supabase/cliente'
import { obtenerPerfilUsuario } from './servicio-perfil'
import type { PerfilUsuario, RolUsuario } from './tipos-perfil'
import {
  cerrarSesion as cerrarSesionServicio,
  obtenerSesionActual,
} from './servicio-autenticacion'

interface EstadoAutenticacion {
  cargando: boolean
  autenticado: boolean
  sesion: Session | null
  perfil: PerfilUsuario | null
  rol_usuario: RolUsuario | null
  cargandoPerfil: boolean
  errorCargaPerfil: string | null
  cerrarSesion: () => ReturnType<typeof cerrarSesionServicio>
}

interface PropiedadesProveedorAutenticacion {
  contenido: ReactNode
}

const contextoAutenticacion = createContext<EstadoAutenticacion | null>(null)

export function ProveedorAutenticacion({
  contenido,
}: PropiedadesProveedorAutenticacion) {
  const [sesion, establecerSesion] = useState<Session | null>(null)
  const [cargando, establecerCargando] = useState(true)
  const [perfil, establecerPerfil] = useState<PerfilUsuario | null>(null)
  const [cargandoPerfil, establecerCargandoPerfil] = useState(false)
  const [errorCargaPerfil, establecerErrorCargaPerfil] = useState<string | null>(
    null,
  )
  const usuarioIdDeSesion = useRef<string | null>(null)

  const actualizarSesion = useCallback((nuevaSesion: Session | null) => {
    const nuevoUsuarioId = nuevaSesion?.user.id ?? null

    if (usuarioIdDeSesion.current !== nuevoUsuarioId) {
      usuarioIdDeSesion.current = nuevoUsuarioId
      establecerPerfil(null)
      establecerErrorCargaPerfil(null)
      establecerCargandoPerfil(nuevoUsuarioId !== null)
    }

    establecerSesion(nuevaSesion)
  }, [])

  useEffect(() => {
    let montado = true
    let recibioCambioAutenticacion = false

    const { data } = clienteSupabase.auth.onAuthStateChange(
      (_evento, nuevaSesion) => {
        recibioCambioAutenticacion = true
        actualizarSesion(nuevaSesion)
        establecerCargando(false)
      },
    )

    void obtenerSesionActual()
      .then(({ data: respuesta, error }) => {
        if (!montado || recibioCambioAutenticacion) return

        actualizarSesion(error ? null : respuesta.session)
        establecerCargando(false)
      })
      .catch(() => {
        if (!montado || recibioCambioAutenticacion) return

        actualizarSesion(null)
        establecerCargando(false)
      })

    return () => {
      montado = false
      data.subscription.unsubscribe()
    }
  }, [actualizarSesion])

  useEffect(() => {
    const usuarioId = sesion?.user.id

    if (!usuarioId) return

    let consultaActiva = true

    void (async () => {
      try {
        const { data: perfilEncontrado, error } =
          await obtenerPerfilUsuario(usuarioId)
        if (!consultaActiva) return

        if (error) {
          establecerPerfil(null)
          establecerErrorCargaPerfil(
            'No fue posible cargar tu perfil. Inténtalo de nuevo más tarde.',
          )
        } else {
          establecerPerfil(perfilEncontrado)
          establecerErrorCargaPerfil(null)
        }

        establecerCargandoPerfil(false)
      } catch {
        if (!consultaActiva) return

        establecerPerfil(null)
        establecerErrorCargaPerfil(
          'No fue posible cargar tu perfil. Inténtalo de nuevo más tarde.',
        )
        establecerCargandoPerfil(false)
      }
    })()

    return () => {
      consultaActiva = false
    }
  }, [sesion?.user.id])

  const perfilActual = perfil?.id === sesion?.user.id ? perfil : null

  const valor = useMemo<EstadoAutenticacion>(
    () => ({
      cargando,
      autenticado: sesion !== null,
      sesion,
      perfil: perfilActual,
      rol_usuario: perfilActual?.rol_usuario ?? null,
      cargandoPerfil,
      errorCargaPerfil,
      cerrarSesion: () => cerrarSesionServicio(),
    }),
    [cargando, cargandoPerfil, errorCargaPerfil, perfilActual, sesion],
  )

  return (
    <contextoAutenticacion.Provider value={valor}>
      {contenido}
    </contextoAutenticacion.Provider>
  )
}

export function usarAutenticacion() {
  const estado = useContext(contextoAutenticacion)

  if (estado === null) {
    throw new Error(
      'usarAutenticacion debe utilizarse dentro de ProveedorAutenticacion.',
    )
  }

  return estado
}
