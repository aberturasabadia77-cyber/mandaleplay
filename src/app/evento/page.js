'use client'
import { useRouter } from 'next/navigation'

import { useState } from 'react'

const OCASIONES = [
  { id: 'romantica', emoji: '🕯️', nombre: 'Velada romántica', sub: 'Para dos personas' },
  { id: 'cumple',    emoji: '🎂', nombre: 'Cumpleaños',        sub: 'El festejado en el centro' },
  { id: 'chicas',   emoji: '💃', nombre: 'Juntada de chicas', sub: 'Solo entre ellas' },
  { id: 'after',    emoji: '🌙', nombre: 'After / Previa',    sub: 'Energía desde el arranque' },
  { id: 'quincho',  emoji: '🔥', nombre: 'Quincho / Asado',   sub: 'Largo y relajado' },
  { id: 'familiar', emoji: '👨‍👩‍👧', nombre: 'Reunión familiar', sub: 'Todas las edades' },
  { id: 'parejas',  emoji: '👫', nombre: 'Juntada de parejas', sub: 'Grupos mixtos' },
  { id: 'corp',     emoji: '💼', nombre: 'Corporativo',        sub: 'Profesional e inclusivo' },
]

const ENERGIAS   = ['Muy tranquila 😌', 'Relajada 🙂', 'Animada 🎉', 'Fiesta total 🔥']
const EDADES     = ['18-25', '25-35', '35-50', '50+', 'Mixto']
const GUSTOS     = ['Reggaeton', 'Pop latino', 'Rock', 'Electrónica', 'Cumbia', 'Clásicos 80s/90s', 'Trap/Urbano', 'Jazz/Soul', 'Internacional', 'Variado']
const DURACIONES = ['1 hora', '2 horas', '3 horas', '4 horas']
const HORARIOS   = ['Mañana (10-13)', 'Tarde (14-18)', 'Noche temprana (19-21)', 'Noche (22 en adelante)']
const PISTAS     = ['Sí, hay pista', 'Puede pasar', 'No, es solo ambiente']

const ENERGIA_COLOR = { baja: '#4ade80', media: '#facc15', alta: '#f97316' }
const ENERGIA_BG    = { baja: '#052e16', media: '#1c1500', alta: '#1c0a00' }
const ENERGIA_LABEL = { baja: 'Baja energía', media: 'Media energía', alta: 'Alta energía' }
const BPM_RANGO     = { baja: { min: 70, max: 95 }, media: { min: 95, max: 120 }, alta: { min: 120, max: 140 } }

// Colores neon metálicos
const NEON_CYAN   = '#00f5ff'
const NEON_VIOLET = '#8b5cf6'
const NEON_MID    = '#6366f1'

const parsearMinutos = (str = '') => {
  const h = str.match(/(\d+)\s*h/)
  const m = str.match(/(\d+)\s*min/)
  return (h ? parseInt(h[1]) * 60 : 0) + (m ? parseInt(m[1]) : 0) || 30
}

const separarTituloArtista = (texto = '') => {
  const i = texto.lastIndexOf(' - ')
  return i !== -1
    ? { titulo: texto.slice(0, i).trim(), artista: texto.slice(i + 3).trim() }
    : { titulo: texto.trim(), artista: '' }
}

// ── Timeline ──────────────────────────────────────────────────────────────────
function Timeline({ bloques }) {
  const [abierto, setAbierto] = useState(null)
  const totalMin = bloques.reduce((s, b) => s + parsearMinutos(b.duracion), 0)

  // Colores neon para el timeline
  const timelineColors = [NEON_CYAN, '#22d3ee', NEON_MID, NEON_VIOLET, '#a855f7', '#ec4899']

  return (
    <div>
      {/* Barra */}
      <div style={{ display: 'flex', borderRadius: '12px', overflow: 'hidden', height: '52px', marginBottom: '8px', gap: '2px' }}>
        {bloques.map((b, i) => {
          const pct   = (parsearMinutos(b.duracion) / totalMin) * 100
          const color = timelineColors[i % timelineColors.length]
          const open  = abierto === i
          return (
            <div key={i} onClick={() => setAbierto(open ? null : i)} title={b.nombre}
              style={{
                width: `${pct}%`, background: `linear-gradient(180deg, ${color}cc, ${color}88)`,
                opacity: open ? 1 : 0.8, cursor: 'pointer', transition: 'opacity .2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '4px',
                boxShadow: open ? `inset 0 0 20px rgba(255,255,255,0.2)` : 'none',
              }}>
              {pct > 12 && (
                <span style={{ fontSize: '9px', fontWeight: '700', color: '#000', textAlign: 'center', padding: '0 4px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                  {b.nombre.split(' ').slice(0, 2).join(' ')}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Duraciones */}
      <div style={{ display: 'flex', gap: '2px', marginBottom: '24px' }}>
        {bloques.map((b, i) => {
          const pct   = (parsearMinutos(b.duracion) / totalMin) * 100
          const color = timelineColors[i % timelineColors.length]
          return (
            <div key={i} style={{ width: `${pct}%`, minWidth: '4px' }}>
              <div style={{ fontSize: '9px', color, fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.duracion}</div>
              {pct > 10 && <div style={{ fontSize: '8px', color: '#444' }}>{BPM_RANGO[b.energia]?.min}-{BPM_RANGO[b.energia]?.max} BPM</div>}
            </div>
          )
        })}
      </div>

      {/* Bloques expandibles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {bloques.map((b, i) => {
          const color = timelineColors[i % timelineColors.length]
          const open  = abierto === i
          const bpms  = b.canciones_sugeridas?.map(c => typeof c === 'object' ? c.bpm : null).filter(Boolean) || []
          const bpmMin = bpms.length ? Math.min(...bpms) : null
          const bpmMax = bpms.length ? Math.max(...bpms) : null

          return (
            <div key={i} onClick={() => setAbierto(open ? null : i)} style={{
              borderRadius: '14px',
              border: `1px solid ${open ? color + '88' : 'rgba(255,255,255,0.06)'}`,
              background: open ? `linear-gradient(135deg, ${color}11, ${color}06)` : 'rgba(255,255,255,0.02)',
              overflow: 'hidden', cursor: 'pointer', transition: 'all .2s',
              boxShadow: open ? `0 0 20px ${color}22` : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, flexShrink: 0, boxShadow: `0 0 8px ${color}` }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span>Bloque {i + 1} · {b.duracion}</span>
                    <span style={{ color }}>● {ENERGIA_LABEL[b.energia] || b.energia}</span>
                    {bpmMin && <span style={{ color: '#444' }}>♩ {bpmMin === bpmMax ? bpmMin : `${bpmMin}→${bpmMax}`} BPM</span>}
                  </div>
                  <div style={{ fontSize: '15px', color: open ? '#fff' : '#bbb', fontWeight: '500' }}>{b.nombre}</div>
                </div>
                <div style={{ fontSize: '11px', color: '#444' }}>{open ? '▲' : '▼'}</div>
              </div>

              {open && (
                <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${color}22` }}>
                  <p style={{ fontSize: '13px', color: '#666', marginBottom: '14px', lineHeight: 1.7, marginTop: '12px' }}>{b.descripcion}</p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    {b.artistas?.map((a, j) => (
                      <span key={j} style={{ fontSize: '11px', background: `${color}11`, border: `1px solid ${color}44`, color, padding: '3px 10px', borderRadius: '100px' }}>{a}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {b.canciones_sugeridas?.map((c, j) => {
                      const cancion = typeof c === 'string' ? { titulo: c, bpm: null, inicio: 0 } : c
                      return (
                        <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <span style={{ color, fontSize: '10px', flexShrink: 0 }}>♪</span>
                          <span style={{ fontSize: '13px', color: '#777', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cancion.titulo}</span>
                          {cancion.bpm && <span style={{ fontSize: '11px', color, flexShrink: 0, fontWeight: '600' }}>{cancion.bpm} BPM</span>}
                          {cancion.inicio > 0 && <span style={{ fontSize: '10px', color: '#333', flexShrink: 0 }}>▶{cancion.inicio}s</span>}
                        </div>
                      )
                    })}
                  </div>
                  {bpms.length > 1 && (
                    <div style={{ marginTop: '12px', padding: '10px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                      <div style={{ fontSize: '10px', color: '#333', marginBottom: '6px' }}>Progresión de energía</div>
                      <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '24px' }}>
                        {bpms.map((bpm, j) => {
                          const altura = Math.round(((bpm - 60) / (145 - 60)) * 100)
                          return <div key={j} title={`${bpm} BPM`} style={{ flex: 1, background: color, borderRadius: '2px 2px 0 0', height: `${Math.max(altura, 10)}%`, opacity: 0.7 }} />
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Página ────────────────────────────────────────────────────────────────────
export default function Evento() {
  const router = useRouter()
  const [paso,    setPaso]    = useState(0)
  const [ocasion, setOcasion] = useState(null)
  const [form,    setForm]    = useState({ personas: '', edad: '', energia: '', gustos: [], duracion: '', horario: '', pista: '' })
  const [plan,    setPlan]    = useState(null)
  const [error,   setError]   = useState(null)
  const [verificando, setVerificando] = useState(false)

  const toggleGusto = (g) => setForm(f => ({ ...f, gustos: f.gustos.includes(g) ? f.gustos.filter(x => x !== g) : [...f.gustos, g] }))
  const calcularCanciones = (d) => Math.ceil(({ '1 hora': 1, '2 horas': 2, '3 horas': 3, '4 horas': 4 }[d] || 2) * 60 / 3.5)

  const verificarBPMs = async (bloques) => {
    const bloquesVerificados = await Promise.all(
      bloques.map(async (bloque) => {
        const rango = BPM_RANGO[bloque.energia] || { min: 70, max: 140 }
        const cancionesVerificadas = await Promise.all(
          (bloque.canciones_sugeridas || []).map(async (c) => {
            const texto = typeof c === 'string' ? c : (c.titulo || '')
            const { titulo, artista } = separarTituloArtista(texto)
            try {
              const res  = await fetch(`/api/bpm?titulo=${encodeURIComponent(titulo)}&artista=${encodeURIComponent(artista)}`)
              const data = await res.json()
              const bpmReal = data.bpm || (typeof c === 'object' ? c.bpm : null)
              return { ...(typeof c === 'object' ? c : { titulo: texto, inicio: 0 }), bpm: bpmReal }
            } catch {
              return typeof c === 'object' ? c : { titulo: texto, inicio: 0, bpm: null }
            }
          })
        )
        const conBpm    = cancionesVerificadas.filter(c => c.bpm)
        const sinBpm    = cancionesVerificadas.filter(c => !c.bpm)
        const ordenadas = [...conBpm.sort((a, b) => a.bpm - b.bpm), ...sinBpm]
        const fueraDeRango = conBpm.some(c => c.bpm < rango.min - 15 || c.bpm > rango.max + 15)
        return { ...bloque, canciones_sugeridas: ordenadas, bpm_verificado: !fueraDeRango }
      })
    )
    return bloquesVerificados
  }

  const generarPlan = async () => {
    setPaso(2); setError(null)
    const cantCanciones = calcularCanciones(form.duracion)
    const ocasionNombre = OCASIONES.find(o => o.id === ocasion)?.nombre
    try {
      const prompt = `Sos un DJ profesional argentino experto en timelines musicales con criterio de BPM. Generá un plan musical para este evento:

DATOS DEL EVENTO:
- Ocasión: ${ocasionNombre}
- Personas: ${form.personas}
- Rango de edad: ${form.edad}
- Energía deseada: ${form.energia}
- Gustos musicales: ${form.gustos.join(', ')}
- Duración total: ${form.duracion}
- Horario de inicio: ${form.horario}
- ¿Hay pista de baile?: ${form.pista}

CONTEXTO CULTURAL: En Argentina toda reunión incluye comida. Estructurá el timeline considerando llegada/aperitivo → comida → sobremesa/baile según corresponda.

REGLAS DE BPM — CRÍTICO:
- Bloques de energía BAJA: canciones entre 70-95 BPM
- Bloques de energía MEDIA: canciones entre 95-120 BPM
- Bloques de energía ALTA: canciones entre 120-140 BPM
- Dentro de cada bloque, progresión GRADUAL (nunca más de 10-15 BPM de salto entre canciones)
- Entre bloques, diferencia máxima de 15 BPM
- Indicá el BPM REAL y preciso de cada canción

CONSIDERACIONES DE DJ:
- Horario afecta el pico: noche = calentamiento corto, tarde = calentamiento largo
- Con pista: construí hacia pico bailable con BPM alto
- Sin pista: BPM parejo, sin picos extremos

REGLAS CANCIONES REALES:
1. Solo canciones que EXISTEN en YouTube — verificá mentalmente antes de incluir
2. Combinación título-artista debe ser 100% correcta
3. Preferí hits conocidos y populares
4. Necesitás exactamente ${cantCanciones} canciones

Respondé SOLO con JSON válido (sin texto extra, sin backticks):
{
  "titulo": "nombre creativo",
  "duracion_total": "${form.duracion}",
  "tip_dj": "consejo mencionando estrategia de BPM y arco de energía (máx 2 oraciones)",
  "bloques": [
    {
      "nombre": "nombre del bloque",
      "duracion": "X min",
      "energia": "baja/media/alta",
      "bpm_rango": "XX-XX BPM",
      "descripcion": "qué suena, por qué en este momento, cómo conecta con el siguiente",
      "artistas": ["artista1", "artista2"],
      "canciones_sugeridas": [
        { "titulo": "Nombre canción - Artista", "inicio": 15, "bpm": 95 }
      ]
    }
  ]
}

Suma de canciones_sugeridas = exactamente ${cantCanciones}.
"inicio" = segundo donde empieza la música real (0 si arranca directo).
"bpm" = BPM real de esa canción, respetando progresión gradual dentro del bloque.`

      const response = await fetch('/api/generar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })
      const data   = await response.json()
      if (data.error) throw new Error(data.error)
      const text   = data.content?.find(b => b.type === 'text')?.text || ''
      const clean  = text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)

      setVerificando(true)
      const bloquesVerificados = await verificarBPMs(parsed.bloques || [])
      setPlan({ ...parsed, bloques: bloquesVerificados })
      setVerificando(false)
      setPaso(3)
    } catch (e) {
      setError('Hubo un error generando el plan. Intentá de nuevo.')
      setVerificando(false)
      setPaso(1)
    }
  }

  const reproducirAhora = () => {
    const canciones = plan.bloques.flatMap(bloque =>
      (bloque.canciones_sugeridas || []).map(c => {
        const texto = typeof c === 'string' ? c : (c.titulo || '')
        const { titulo, artista } = separarTituloArtista(texto)
        return { titulo, artista, bloque: bloque.nombre, momento: bloque.nombre, energia: bloque.energia, bpm: typeof c === 'object' ? (c.bpm || null) : null, inicio: typeof c === 'object' ? (c.inicio || 0) : 0 }
      })
    )
    sessionStorage.setItem('mandale_plan', JSON.stringify({ canciones, nombre: plan.titulo || '', bloques: plan.bloques }))
    router.push('/player')
  }

  const formularioCompleto = ocasion && form.personas && form.edad && form.energia && form.gustos.length > 0 && form.duracion && form.horario && form.pista

  // Estilos neon metálicos
  const s = {
    main: { minHeight: '100vh', background: '#060612', color: '#fff', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' },
    btnActivo: {
      padding: '10px 20px', borderRadius: '100px',
      background: `linear-gradient(135deg, ${NEON_CYAN}, ${NEON_VIOLET})`,
      border: 'none', color: '#000', cursor: 'pointer', fontSize: '14px', fontWeight: '700',
      boxShadow: `0 0 16px rgba(0,245,255,0.4)`, transition: 'all .15s',
    },
    btnInactivo: {
      padding: '10px 20px', borderRadius: '100px',
      border: '1px solid rgba(255,255,255,0.1)',
      background: 'rgba(255,255,255,0.03)', color: '#888',
      cursor: 'pointer', fontSize: '14px', fontWeight: '400', transition: 'all .15s',
    },
    label: { display: 'block', fontSize: '12px', color: '#555', marginBottom: '12px', letterSpacing: '2px', textTransform: 'uppercase' },
    volver: { background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#555', padding: '8px 16px', borderRadius: '100px', fontSize: '13px', cursor: 'pointer', marginBottom: '40px' },
  }

  const btnStyle = (activo) => activo ? s.btnActivo : s.btnInactivo

  // PASO 0
  if (paso === 0) return (
    <main style={s.main}>
      <style>{`.oc:hover { border-color: ${NEON_CYAN} !important; background: rgba(0,245,255,0.05) !important; box-shadow: 0 0 20px rgba(0,245,255,0.1) !important; }`}</style>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <button onClick={() => window.location.href = '/'} style={s.volver}>← Volver</button>
        <h1 style={{ fontSize: 'clamp(28px,5vw,42px)', fontWeight: '300', marginBottom: '8px', lineHeight: 1.2 }}>
          ¿Qué estás{' '}
          <em style={{ background: `linear-gradient(135deg, ${NEON_CYAN}, ${NEON_VIOLET})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontStyle: 'italic' }}>festejando?</em>
        </h1>
        <p style={{ color: '#555', marginBottom: '40px', fontSize: '15px' }}>Elegí la ocasión y la IA arma el plan musical perfecto.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
          {OCASIONES.map(o => (
            <button key={o.id} className="oc" onClick={() => { setOcasion(o.id); setPaso(1) }}
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px 16px', cursor: 'pointer', textAlign: 'left', transition: 'all .2s', color: '#fff' }}>
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>{o.emoji}</div>
              <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>{o.nombre}</div>
              <div style={{ fontSize: '12px', color: '#555' }}>{o.sub}</div>
            </button>
          ))}
        </div>
      </div>
    </main>
  )

  // PASO 1
  if (paso === 1) return (
    <main style={s.main}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        <button onClick={() => setPaso(0)} style={s.volver}>
          ← {OCASIONES.find(o => o.id === ocasion)?.emoji} {OCASIONES.find(o => o.id === ocasion)?.nombre}
        </button>
        <h2 style={{ fontSize: '26px', fontWeight: '300', marginBottom: '32px' }}>Contanos un poco más</h2>

        {[
          { label: '¿Cuántas personas?',   key: 'personas', opts: ['1-5','6-15','16-30','30-60','60+'] },
          { label: 'Edad promedio',         key: 'edad',     opts: EDADES },
          { label: 'Energía deseada',       key: 'energia',  opts: ENERGIAS },
          { label: '¿Cuánto dura?',         key: 'duracion', opts: DURACIONES },
          { label: '¿A qué hora arranca?',  key: 'horario',  opts: HORARIOS },
          { label: '¿Hay pista de baile?',  key: 'pista',    opts: PISTAS },
        ].map(({ label, key, opts }) => (
          <div key={key} style={{ marginBottom: '28px' }}>
            <label style={s.label}>{label}</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {opts.map(o => <button key={o} onClick={() => setForm(f => ({ ...f, [key]: o }))} style={btnStyle(form[key] === o)}>{o}</button>)}
            </div>
          </div>
        ))}

        <div style={{ marginBottom: '36px' }}>
          <label style={s.label}>Géneros musicales (podés elegir varios)</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {GUSTOS.map(g => <button key={g} onClick={() => toggleGusto(g)} style={btnStyle(form.gustos.includes(g))}>{g}</button>)}
          </div>
        </div>

        {error && <p style={{ color: '#f87171', fontSize: '14px', marginBottom: '16px' }}>{error}</p>}

        <button onClick={generarPlan} disabled={!formularioCompleto} style={{
          width: '100%', padding: '16px',
          background: formularioCompleto ? `linear-gradient(135deg, ${NEON_CYAN}, ${NEON_VIOLET})` : 'rgba(255,255,255,0.05)',
          color: formularioCompleto ? '#000' : '#333',
          border: 'none', borderRadius: '100px', fontSize: '16px', fontWeight: '700',
          cursor: formularioCompleto ? 'pointer' : 'not-allowed',
          boxShadow: formularioCompleto ? `0 0 30px rgba(0,245,255,0.3)` : 'none',
          transition: 'all .2s',
        }}>✨ Generar mi plan musical</button>
      </div>
    </main>
  )

  // PASO 2
  if (paso === 2) return (
    <main style={{ ...s.main, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{ width: '48px', height: '48px', border: `3px solid rgba(0,245,255,0.2)`, borderTop: `3px solid ${NEON_CYAN}`, borderRadius: '50%', animation: 'spin 1s linear infinite', boxShadow: `0 0 20px rgba(0,245,255,0.3)` }} />
      <p style={{ color: '#888', fontSize: '16px' }}>
        {verificando ? '🎵 Verificando BPMs reales...' : 'La IA está armando tu plan musical...'}
      </p>
      {verificando && <p style={{ color: '#444', fontSize: '13px' }}>Consultando base de datos de tempo</p>}
    </main>
  )

  // PASO 3
  if (paso === 3 && plan) {
    const totalCanciones = plan.bloques?.reduce((s, b) => s + (b.canciones_sugeridas?.length || 0), 0)
    const bloquesConBpmFuera = plan.bloques?.filter(b => b.bpm_verificado === false).length || 0
    return (
      <main style={s.main}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <button onClick={() => setPaso(1)} style={s.volver}>← Volver</button>

          <div style={{ marginBottom: '28px' }}>
            <div style={{ fontSize: '11px', background: `linear-gradient(135deg, ${NEON_CYAN}, ${NEON_VIOLET})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>Tu plan musical</div>
            <h2 style={{ fontSize: '26px', fontWeight: '400', marginBottom: '8px', lineHeight: 1.2 }}>{plan.titulo}</h2>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <span style={{ fontSize: '13px', color: '#555' }}>⏱ {plan.duracion_total}</span>
              <span style={{ fontSize: '13px', color: '#555' }}>🎵 {totalCanciones} canciones</span>
              <span style={{ fontSize: '13px', color: '#555' }}>📦 {plan.bloques?.length} bloques</span>
              <span style={{ fontSize: '13px', color: NEON_CYAN }}>✓ BPMs verificados</span>
            </div>
            {bloquesConBpmFuera > 0 && (
              <div style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px' }}>
                <p style={{ fontSize: '12px', color: '#f97316', margin: 0 }}>⚠ {bloquesConBpmFuera} bloque{bloquesConBpmFuera > 1 ? 's' : ''} con canciones reordenadas para mejor flujo de BPM.</p>
              </div>
            )}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid rgba(0,245,255,0.15)`, borderRadius: '12px', padding: '14px 16px', borderLeft: `3px solid ${NEON_CYAN}` }}>
              <p style={{ fontSize: '11px', color: '#555', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>🎧 Tip del DJ</p>
              <p style={{ fontSize: '13px', color: '#888', lineHeight: 1.7, margin: 0 }}>{plan.tip_dj}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '14px' }}>
            {Object.entries(ENERGIA_COLOR).map(([k, color]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
                <span style={{ fontSize: '11px', color: '#555' }}>{ENERGIA_LABEL[k]} · {BPM_RANGO[k]?.min}-{BPM_RANGO[k]?.max} BPM</span>
              </div>
            ))}
          </div>

          <Timeline bloques={plan.bloques || []} />

          <div style={{ marginTop: '36px', background: `linear-gradient(135deg, rgba(0,245,255,0.05), rgba(139,92,246,0.05))`, border: `1px solid rgba(0,245,255,0.15)`, borderRadius: '20px', padding: '32px', textAlign: 'center', boxShadow: `0 0 40px rgba(0,245,255,0.08)` }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🎵</div>
            <h3 style={{ fontSize: '20px', fontWeight: '400', marginBottom: '8px' }}>¿Listo para escuchar?</h3>
            <p style={{ color: '#555', fontSize: '13px', lineHeight: 1.7, maxWidth: '340px', margin: '0 auto 24px' }}>
              Plan con BPMs verificados y progresión de energía profesional.
            </p>
            <button onClick={reproducirAhora} style={{
              background: `linear-gradient(135deg, ${NEON_CYAN}, ${NEON_VIOLET})`,
              color: '#000', border: 'none', padding: '14px 36px', borderRadius: '100px',
              fontSize: '16px', fontWeight: '700', cursor: 'pointer',
              boxShadow: `0 0 30px rgba(0,245,255,0.4)`,
            }}>▶ Reproducir ahora</button>
          </div>
        </div>
      </main>
    )
  }

  return null
}
