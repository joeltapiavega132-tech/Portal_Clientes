import { useState } from 'react'
import { AlertTriangle, Database, LockKeyhole, Play, RefreshCw } from 'lucide-react'
import { usarAutenticacion } from '@/dominio/autenticacion/contexto-autenticacion'
import {
  actualizarSprintPrueba,
  actualizarTareaPrueba,
  consultarSprintPorId,
  consultarSprintsProyecto,
  consultarTareaPorId,
  consultarTareasSprint,
  insertarSprintPrueba,
  insertarTareaPrueba,
  intentarCambiarProyectoSprint,
  intentarCambiarSprintTarea,
} from './servicio-prueba-rls-sprints'
import type { ResultadoPruebaRls } from './servicio-prueba-rls-sprints'

const PROYECTOS_PRUEBA = {
  A1: '7b915440-90ac-4706-a8cd-76998e0e9c95',
  A2: 'e4003e58-ef07-4193-b91e-d22a4e404eff',
  B1: '4a211c50-89bf-4f7b-9c55-da7b45e151c0',
} as const

const ESTADOS = ['pendiente', 'en_progreso', 'completado'] as const

interface ResultadoVisible {
  accion: string
  resultado: ResultadoPruebaRls<unknown>
}

export function PantallaPruebaRlsSprints() {
  const { sesion } = usarAutenticacion()
  const [proyectoLectura, establecerProyectoLectura] = useState<string>(PROYECTOS_PRUEBA.A1)
  const [sprintLecturaId, establecerSprintLecturaId] = useState('')
  const [sprintDirectoId, establecerSprintDirectoId] = useState('')
  const [tareaDirectaId, establecerTareaDirectaId] = useState('')
  const [permitirEscrituras, establecerPermitirEscrituras] = useState(false)
  const [proyectoCreacion, establecerProyectoCreacion] = useState<string>(PROYECTOS_PRUEBA.A1)
  const [nombreSprint, establecerNombreSprint] = useState('PRUEBA_RLS_S7A_SPRINT_A1')
  const [posicionSprint, establecerPosicionSprint] = useState('0')
  const [sprintActualizacionId, establecerSprintActualizacionId] = useState('')
  const [estadoSprint, establecerEstadoSprint] = useState<(typeof ESTADOS)[number]>('en_progreso')
  const [sprintTareaId, establecerSprintTareaId] = useState('')
  const [tituloTarea, establecerTituloTarea] = useState('PRUEBA_RLS_S7A_TAREA_A1')
  const [posicionTarea, establecerPosicionTarea] = useState('0')
  const [tareaActualizacionId, establecerTareaActualizacionId] = useState('')
  const [estadoTarea, establecerEstadoTarea] = useState<(typeof ESTADOS)[number]>('en_progreso')
  const [sprintInmutableId, establecerSprintInmutableId] = useState('')
  const [proyectoDestino, establecerProyectoDestino] = useState<string>(PROYECTOS_PRUEBA.A2)
  const [tareaInmutableId, establecerTareaInmutableId] = useState('')
  const [sprintDestino, establecerSprintDestino] = useState('')
  const [ocupado, establecerOcupado] = useState(false)
  const [resultadoVisible, establecerResultadoVisible] = useState<ResultadoVisible | null>(null)

  async function ejecutarLectura(
    accion: string,
    consulta: () => Promise<ResultadoPruebaRls<unknown>>,
  ) {
    establecerOcupado(true)
    establecerResultadoVisible(null)
    try {
      establecerResultadoVisible({ accion, resultado: await consulta() })
    } catch (error) {
      establecerResultadoVisible({ accion, resultado: resultadoError(error) })
    } finally {
      establecerOcupado(false)
    }
  }

  async function ejecutarEscritura(
    accion: string,
    confirmacion: string,
    operacion: () => Promise<ResultadoPruebaRls<unknown>>,
  ) {
    if (!permitirEscrituras || ocupado) return
    if (!window.confirm(`${confirmacion}\n\nLa solicitud usará la sesión autenticada actual.`)) return

    establecerOcupado(true)
    establecerResultadoVisible(null)
    try {
      establecerResultadoVisible({ accion, resultado: await operacion() })
    } catch (error) {
      establecerResultadoVisible({ accion, resultado: resultadoError(error) })
    } finally {
      establecerOcupado(false)
    }
  }

  return (
    <main className="min-h-screen bg-yanax-verde-claro px-4 py-6 text-yanax-azul-profundo sm:px-7 sm:py-9">
      <div className="mx-auto w-full max-w-5xl space-y-5">
        <header className="rounded-2xl bg-yanax-azul-profundo p-5 text-white shadow-sm sm:p-7">
          <div className="flex items-start gap-3">
            <Database aria-hidden="true" className="mt-1 size-6 shrink-0 text-yanax-naranja" />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-yanax-verde-claro">Herramienta temporal · solo desarrollo</p>
              <h1 className="mt-2 text-xl font-semibold sm:text-2xl">Validación RLS de sprints y tareas</h1>
              <p className="mt-2 break-all text-sm text-white/80">Sesión activa: {sesion?.user.id ?? 'sin sesión'}</p>
              <p className="mt-1 text-xs text-white/70">No se muestran ni se registran tokens o credenciales. Todas las llamadas usan clienteSupabase y la sesión actual.</p>
            </div>
          </div>
        </header>

        <section className="rounded-2xl border border-yanax-naranja/40 bg-white p-4 sm:p-5" aria-labelledby="aviso-pruebas">
          <div className="flex gap-3">
            <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-yanax-coral" />
            <div>
              <h2 className="font-semibold" id="aviso-pruebas">Escrituras bajo confirmación</h2>
              <p className="mt-1 text-sm leading-6 text-yanax-azul-profundo/80">Las acciones de escritura están desarmadas inicialmente. Habilitarlas no ejecuta consultas; cada INSERT o UPDATE además requiere una confirmación individual. No hay acción DELETE.</p>
              <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium">
                <input checked={permitirEscrituras} onChange={(evento) => establecerPermitirEscrituras(evento.target.checked)} type="checkbox" />
                Habilitar botones de INSERT/UPDATE para esta sesión de prueba
              </label>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <article className="space-y-4 rounded-2xl border border-yanax-turquesa/15 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-lg font-semibold">Consultas de lectura</h2>
            <label className="block text-sm font-medium">Proyecto para listar sprints
              <select className={claseCampo} value={proyectoLectura} onChange={(evento) => establecerProyectoLectura(evento.target.value)}>
                <option value={PROYECTOS_PRUEBA.A1}>A1 · {PROYECTOS_PRUEBA.A1}</option>
                <option value={PROYECTOS_PRUEBA.B1}>B1 · {PROYECTOS_PRUEBA.B1}</option>
              </select>
            </label>
            <button className={claseBoton} disabled={ocupado} onClick={() => void ejecutarLectura('Listar sprints del proyecto', () => consultarSprintsProyecto(proyectoLectura))} type="button">
              <Play aria-hidden="true" className="size-4" /> Consultar sprints visibles
            </button>

            <label className="block text-sm font-medium">UUID de sprint para listar tareas
              <input className={claseCampo} value={sprintLecturaId} onChange={(evento) => establecerSprintLecturaId(evento.target.value)} placeholder="UUID devuelto al crear un sprint" />
            </label>
            <button className={claseBoton} disabled={ocupado || !sprintLecturaId.trim()} onClick={() => void ejecutarLectura('Listar tareas de sprint', () => consultarTareasSprint(sprintLecturaId.trim()))} type="button">
              <Play aria-hidden="true" className="size-4" /> Consultar tareas visibles
            </button>

            <label className="block text-sm font-medium">UUID directo de sprint
              <input className={claseCampo} value={sprintDirectoId} onChange={(evento) => establecerSprintDirectoId(evento.target.value)} placeholder="UUID de sprint A1 o B1" />
            </label>
            <button className={claseBoton} disabled={ocupado || !sprintDirectoId.trim()} onClick={() => void ejecutarLectura('Consultar sprint por UUID directo', () => consultarSprintPorId(sprintDirectoId.trim()))} type="button">
              <Play aria-hidden="true" className="size-4" /> Consultar sprint por ID
            </button>

            <label className="block text-sm font-medium">UUID directo de tarea
              <input className={claseCampo} value={tareaDirectaId} onChange={(evento) => establecerTareaDirectaId(evento.target.value)} placeholder="UUID de tarea A1 o B1" />
            </label>
            <button className={claseBoton} disabled={ocupado || !tareaDirectaId.trim()} onClick={() => void ejecutarLectura('Consultar tarea por UUID directo', () => consultarTareaPorId(tareaDirectaId.trim()))} type="button">
              <Play aria-hidden="true" className="size-4" /> Consultar tarea por ID
            </button>
          </article>

          <article className="space-y-4 rounded-2xl border border-yanax-turquesa/15 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-lg font-semibold">Escrituras de prueba controladas</h2>
            <label className="block text-sm font-medium">Proyecto para INSERT sprint
              <select className={claseCampo} value={proyectoCreacion} onChange={(evento) => establecerProyectoCreacion(evento.target.value)}>
                <option value={PROYECTOS_PRUEBA.A1}>A1 · {PROYECTOS_PRUEBA.A1}</option>
                <option value={PROYECTOS_PRUEBA.B1}>B1 · {PROYECTOS_PRUEBA.B1}</option>
              </select>
            </label>
            <label className="block text-sm font-medium">Nombre del sprint
              <input className={claseCampo} value={nombreSprint} onChange={(evento) => establecerNombreSprint(evento.target.value)} />
            </label>
            <label className="block text-sm font-medium">Posición libre del sprint
              <input className={claseCampo} min="0" type="number" value={posicionSprint} onChange={(evento) => establecerPosicionSprint(evento.target.value)} />
            </label>
            <button className={claseBotonEscritura} disabled={!permitirEscrituras || ocupado} onClick={() => void ejecutarEscritura('INSERT sprint', `Crear “${nombreSprint}” en el proyecto seleccionado.`, () => insertarSprintPrueba({ proyecto_id: proyectoCreacion, nombre: nombreSprint.trim(), descripcion: 'Fila temporal de validación RLS Sprint 7A', estado: 'pendiente', posicion: Number(posicionSprint) }))} type="button">
              <LockKeyhole aria-hidden="true" className="size-4" /> INSERT sprint
            </button>

            <label className="block text-sm font-medium">UUID de sprint para UPDATE
              <input className={claseCampo} value={sprintActualizacionId} onChange={(evento) => establecerSprintActualizacionId(evento.target.value)} placeholder="UUID de sprint de prueba" />
            </label>
            <label className="block text-sm font-medium">Estado nuevo
              <select className={claseCampo} value={estadoSprint} onChange={(evento) => establecerEstadoSprint(evento.target.value as (typeof ESTADOS)[number])}>{ESTADOS.map((estado) => <option key={estado} value={estado}>{estado}</option>)}</select>
            </label>
            <button className={claseBotonEscritura} disabled={!permitirEscrituras || ocupado || !sprintActualizacionId.trim()} onClick={() => void ejecutarEscritura('UPDATE sprint.estado', `Cambiar el estado del sprint ${sprintActualizacionId} a ${estadoSprint}.`, () => actualizarSprintPrueba({ sprint_id: sprintActualizacionId.trim(), estado: estadoSprint }))} type="button">
              <LockKeyhole aria-hidden="true" className="size-4" /> UPDATE sprint
            </button>

            <label className="block text-sm font-medium">UUID de sprint para INSERT tarea
              <input className={claseCampo} value={sprintTareaId} onChange={(evento) => establecerSprintTareaId(evento.target.value)} placeholder="UUID de sprint A1/B1 de prueba" />
            </label>
            <label className="block text-sm font-medium">Título de la tarea
              <input className={claseCampo} value={tituloTarea} onChange={(evento) => establecerTituloTarea(evento.target.value)} />
            </label>
            <label className="block text-sm font-medium">Posición libre de la tarea
              <input className={claseCampo} min="0" type="number" value={posicionTarea} onChange={(evento) => establecerPosicionTarea(evento.target.value)} />
            </label>
            <button className={claseBotonEscritura} disabled={!permitirEscrituras || ocupado || !sprintTareaId.trim()} onClick={() => void ejecutarEscritura('INSERT tarea', `Crear “${tituloTarea}” bajo el sprint ${sprintTareaId}.`, () => insertarTareaPrueba({ sprint_id: sprintTareaId.trim(), titulo: tituloTarea.trim(), descripcion: 'Fila temporal de validación RLS Sprint 7A', estado: 'pendiente', prioridad: 'media', posicion: Number(posicionTarea) }))} type="button">
              <LockKeyhole aria-hidden="true" className="size-4" /> INSERT tarea
            </button>

            <label className="block text-sm font-medium">UUID de tarea para UPDATE
              <input className={claseCampo} value={tareaActualizacionId} onChange={(evento) => establecerTareaActualizacionId(evento.target.value)} placeholder="UUID de tarea de prueba" />
            </label>
            <label className="block text-sm font-medium">Estado nuevo
              <select className={claseCampo} value={estadoTarea} onChange={(evento) => establecerEstadoTarea(evento.target.value as (typeof ESTADOS)[number])}>{ESTADOS.map((estado) => <option key={estado} value={estado}>{estado}</option>)}</select>
            </label>
            <button className={claseBotonEscritura} disabled={!permitirEscrituras || ocupado || !tareaActualizacionId.trim()} onClick={() => void ejecutarEscritura('UPDATE tarea.estado', `Cambiar el estado de la tarea ${tareaActualizacionId} a ${estadoTarea}.`, () => actualizarTareaPrueba({ tarea_id: tareaActualizacionId.trim(), estado: estadoTarea }))} type="button">
              <LockKeyhole aria-hidden="true" className="size-4" /> UPDATE tarea
            </button>
          </article>
        </section>

        <section className="space-y-4 rounded-2xl border border-yanax-turquesa/15 bg-white p-4 shadow-sm sm:p-5" aria-labelledby="titulo-inmutabilidad">
          <h2 className="text-lg font-semibold" id="titulo-inmutabilidad">Intentos de modificar claves padre</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <label className="block text-sm font-medium">UUID de sprint de prueba
                <input className={claseCampo} value={sprintInmutableId} onChange={(evento) => establecerSprintInmutableId(evento.target.value)} />
              </label>
              <label className="block text-sm font-medium">Nuevo proyecto_id
                <select className={claseCampo} value={proyectoDestino} onChange={(evento) => establecerProyectoDestino(evento.target.value)}>
                  <option value={PROYECTOS_PRUEBA.A1}>A1 · {PROYECTOS_PRUEBA.A1}</option><option value={PROYECTOS_PRUEBA.A2}>A2 · {PROYECTOS_PRUEBA.A2}</option><option value={PROYECTOS_PRUEBA.B1}>B1 · {PROYECTOS_PRUEBA.B1}</option>
                </select>
              </label>
              <button className={claseBotonEscritura} disabled={!permitirEscrituras || ocupado || !sprintInmutableId.trim()} onClick={() => void ejecutarEscritura('UPDATE sprint.proyecto_id', `Intentar cambiar proyecto_id del sprint ${sprintInmutableId} a ${proyectoDestino}.`, () => intentarCambiarProyectoSprint({ sprint_id: sprintInmutableId.trim(), proyecto_id: proyectoDestino }))} type="button">
                <LockKeyhole aria-hidden="true" className="size-4" /> Intentar cambiar proyecto_id
              </button>
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium">UUID de tarea de prueba
                <input className={claseCampo} value={tareaInmutableId} onChange={(evento) => establecerTareaInmutableId(evento.target.value)} />
              </label>
              <label className="block text-sm font-medium">Nuevo sprint_id
                <input className={claseCampo} value={sprintDestino} onChange={(evento) => establecerSprintDestino(evento.target.value)} placeholder="UUID de otro sprint existente" />
              </label>
              <button className={claseBotonEscritura} disabled={!permitirEscrituras || ocupado || !tareaInmutableId.trim() || !sprintDestino.trim()} onClick={() => void ejecutarEscritura('UPDATE tarea.sprint_id', `Intentar cambiar sprint_id de la tarea ${tareaInmutableId} al sprint ${sprintDestino}.`, () => intentarCambiarSprintTarea({ tarea_id: tareaInmutableId.trim(), sprint_id: sprintDestino.trim() }))} type="button">
                <LockKeyhole aria-hidden="true" className="size-4" /> Intentar cambiar sprint_id
              </button>
            </div>
          </div>
        </section>

        <section aria-live="polite" className="rounded-2xl border border-yanax-turquesa/15 bg-white p-4 shadow-sm sm:p-5" role="region" aria-label="Resultado de la última consulta u operación">
          <div className="flex items-center gap-2">
            {ocupado ? <RefreshCw aria-hidden="true" className="size-4 animate-spin text-yanax-turquesa" /> : <Database aria-hidden="true" className="size-4 text-yanax-turquesa" />}
            <h2 className="font-semibold">Resultado</h2>
          </div>
          {!resultadoVisible && <p className="mt-3 text-sm text-yanax-azul-profundo/70">Todavía no se ejecutó ninguna consulta ni escritura.</p>}
          {resultadoVisible && <div className="mt-3 space-y-2 text-sm">
            <p><strong>Acción:</strong> {resultadoVisible.accion}</p>
            <p><strong>Filas devueltas/afectadas:</strong> {resultadoVisible.resultado.filasAfectadas}</p>
            <p><strong>Error:</strong> {resultadoVisible.resultado.error ? `${resultadoVisible.resultado.error.codigo ?? 'sin código'} · ${resultadoVisible.resultado.error.mensaje}` : 'ninguno'}</p>
            <pre className="max-h-96 overflow-auto rounded-xl bg-yanax-azul-profundo p-3 text-xs text-white" aria-label="Filas devueltas">{JSON.stringify(resultadoVisible.resultado.filas, null, 2)}</pre>
          </div>}
        </section>
      </div>
    </main>
  )
}

function resultadoError(error: unknown): ResultadoPruebaRls<unknown> {
  return {
    filas: [],
    filasAfectadas: 0,
    error: {
      codigo: null,
      mensaje: error instanceof Error ? error.message : 'Error inesperado en la solicitud.',
    },
  }
}

const claseCampo = 'mt-1 min-h-11 w-full min-w-0 rounded-lg border border-yanax-turquesa/25 bg-white px-3 text-sm text-yanax-azul-profundo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja'
const claseBoton = 'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-yanax-turquesa px-4 text-sm font-semibold text-white hover:bg-yanax-verde disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-naranja focus-visible:ring-offset-2'
const claseBotonEscritura = 'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-yanax-coral/50 bg-yanax-coral/10 px-4 text-sm font-semibold text-yanax-azul-profundo hover:bg-yanax-coral/20 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yanax-coral focus-visible:ring-offset-2'
