'use client'

import { useState } from 'react'

const OCASIONES = [
  { id: 'romantica', emoji: '🕯️', nombre: 'Velada romántica', sub: 'Para dos personas' },
  { id: 'cumple', emoji: '🎂', nombre: 'Cumpleaños', sub: 'El festejado en el centro' },
  { id: 'chicas', emoji: '💃', nombre: 'Juntada de chicas', sub: 'Solo entre ellas' },
  { id: 'after', emoji: '🌙', nombre: 'After / Previa', sub: 'Energía desde el arranque' },
  { id: 'quincho', emoji: '🔥', nombre: 'Quincho / Asado', sub: 'Largo y relajado' },
  { id: 'familiar', emoji: '👨‍👩‍👧', nombre: 'Reunión familiar', sub: 'Todas las edades' },
  { id: 'parejas', emoji: '👫', nombre: 'Juntada de parejas', sub: 'Grupos mixtos' },
  { id: 'corp', emoji: '💼', nombre: 'Corporativo', sub: 'Profesional e inclusivo' },
]

const ENERGIAS   = ['Muy tranquila 😌', 'Relajada 🙂', 'Animada 🎉', 'Fiesta total 🔥']
const EDADES     = ['18-25', '25-35', '35-50', '50+', 'Mixto']
const GUSTOS     = ['Reggaeton', 'Pop latino', 'Rock', 'Electrónica', 'Cumbia', 'Clásicos 80s/90s', 'Trap/Urbano', 'Jazz/Soul', 'Internacional', 'Variado']
const DURACIONES = ['1 hora', '2 horas', '3 horas', '4 horas', '5+ horas']
const HORARIOS   = ['Mañana (10-13)', 'Tarde (14-18)', 'Noche temprana (19-21)', 'Noche (22 en adelante)']
const PISTAS     = ['Sí, hay pista', 'Puede pasar', 'No, es solo ambiente']
const MOMENTOS   = ['Ninguno', 'Cumpleaños / Feliz cumple', 'Brindis especial', 'Primer baile', 'Otro momento especial']

const ENERGIA_COLOR = { baja: '#4ade80', media: '#facc15', alta: '#f97316' }
const ENERGIA_BG    = { baja: '#052e16', media: '#1c1500', alta: '#1c0a00' }
const ENERGIA_LABEL = { baja: 'Baja energía', media: 'Media energía', alta: 'Alta energía' }

const BPM_RANGO = {
  baja:  { min: 70,  max: 95,  label: '70-95 BPM' },
  media: { min: 95,  max: 120, label: '95-120 BPM' },
  alta:  { min: 120, max: 140, label: '120-140 BPM' },
}

const parsearMinutos = (str = '') => {
  const h = str.match(/(\d+)\s*h/)
  const m = str.match(/(\d+)\s*min/)
  return (h ? parseInt(h[1]) * 60 : 0) + (m ? parseInt(m[1]) : 0) || 30
}

// ── Timeline ──────────────────────────────────────────────────────────────────
function Timeline({ bloques }) {
  const [abierto, setAbierto] = useState(null)
  const totalMin = bloques.reduce((s, b) => s + parsearMinutos(b.duracion), 0)

  return (
    <div>
      {/* Barra horizontal */}
      <div style={{ display: 'flex', borderRadius: '12px', overflow: 'hidden', height: '52px', marginBottom: '8px', gap: '2px' }}>
        {bloques.map((b, i) => {
          const pct   = (parsearMinutos(b.duracion) / totalMin) * 100
          const color = ENERGIA_COLOR[b.energia] || '#d4a843'
          const open  = abierto === i
          return (
            <div key={i} onClick={() => setAbierto(open ? null : i)} title={b.nombre}
              style={{ width: `${pct}%`, background: color, opacity: open ? 1 : 0.65, cursor: 'pointer', transition: 'opacity .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '4px' }}>
              {pct > 12 && (
                <span style={{ fontSize: '9px', fontWeight: '700', color: '#000', textAlign: 'center', padding: '0 4px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                  {b.nombre.split(' ').slice(0, 2).join(' ')}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Duraciones y BPM */}
      <div style={{ display: 'flex', gap: '2px', marginBottom: '24px' }}>
        {bloques.map((b, i) => {
          const pct   = (parsearMinutos(b.duracion) / totalMin) * 100
          const color = ENERGIA_COLOR[b.energia] || '#d4a843'
          const bpm   = BPM_RANGO[b.energia]
          return (
            <div key={i} style={{ width: `${pct}%`, minWidth: '4px' }}>
              <div style={{ fontSize: '9px', color, fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.duracion}</div>
              {pct > 10 && bpm && <div style={{ fontSize: '8px', color: '#333', whiteSpace: 'nowrap' }}>{bpm.label}</div>}
            </div>
          )
        })}
      </div>

      {/* Bloques expandibles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {bloques.map((b, i) => {
          const color = ENERGIA_COLOR[b.energia] || '#d4a843'
          const bg    = ENERGIA_BG[b.energia]    || '#0f0a00'
          const open  = abierto === i
          const bpm   = BPM_RANGO[b.energia]

          // BPM de las canciones para mostrar progresión
          const bpms  = b.canciones_sugeridas?.map(c => typeof c === 'object' ? c.bpm : null).filter(Boolean) || []
          const bpmMin = bpms.length ? Math.min(...bpms) : null
          const bpmMax = bpms.length ? Math.max(...bpms) : null

          return (
            <div key={i} onClick={() => setAbierto(open ? null : i)} style={{
              borderRadius: '14px', border: `1px solid ${open ? color + '66' : '#1e1e1e'}`,
              background: open ? bg : '#0f0f0f', overflow: 'hidden', cursor: 'pointer', transition: 'all .2s',
            }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, flexShrink: 0, boxShadow: open ? `0 0 8px ${color}` : 'none' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '10px', color: '#444', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span>Bloque {i + 1} · {b.duracion}</span>
                    <span style={{ color }}>● {ENERGIA_LABEL[b.energia] || b.energia}</span>
                    {bpmMin && bpmMax && (
                      <span style={{ color: '#333' }}>
                        ♩ {bpmMin === bpmMax ? `${bpmMin}` : `${bpmMin}→${bpmMax}`} BPM
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '15px', color: open ? '#fff' : '#ccc', fontWeight: '500' }}>{b.nombre}</div>
                </div>
                <div style={{ fontSize: '11px', color: '#333' }}>{open ? '▲' : '▼'}</div>
              </div>

              {/* Contenido expandido */}
              {open && (
                <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${color}22` }}>
                  <p style={{ fontSize: '13px', color: '#666', marginBottom: '14px', lineHeight: 1.7, marginTop: '12px' }}>{b.descripcion}</p>

                  {/* Artistas */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    {b.artistas?.map((a, j) => (
                      <span key={j} style={{ fontSize: '11px', background: '#1a1a1a', border: `1px solid ${color}33`, color, padding: '3px 10px', borderRadius: '100px' }}>{a}</span>
                    ))}
                  </div>

                  {/* Canciones con BPM */}
                  <div style={{ fontSize: '10px', color: '#333', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Progresión de BPM en este bloque
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {b.canciones_sugeridas?.map((c, j) => {
                      const cancion = typeof c === 'string' ? { titulo: c, bpm: null, inicio: 0 } : c
                      const bpmColor = cancion.bpm
                        ? cancion.bpm < 95  ? ENERGIA_COLOR.baja
                        : cancion.bpm < 120 ? ENERGIA_COLOR.media
                        : ENERGIA_COLOR.alta
                        : '#333'
                      return (
                        <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 0', borderBottom: '1px solid #111' }}>
                          <span style={{ color, fontSize: '10px', flexShrink: 0 }}>♪</span>
                          <span style={{ fontSize: '13px', color: '#777', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {cancion.titulo}
                          </span>
                          {cancion.bpm && (
                            <span style={{ fontSize: '10px', color: bpmColor, flexShrink: 0, fontWeight: '600', minWidth: '52px', textAlign: 'right' }}>
                              {cancion.bpm} BPM
                            </span>
                          )}
                          {cancion.inicio > 0 && (
                            <span style={{ fontSize: '10px', color: '#333', flexShrink: 0 }}>▶{cancion.inicio}s</span>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Barra visual de progresión BPM */}
                  {bpms.length > 1 && (
                    <div style={{ marginTop: '12px', padding: '10px 12px', background: '#0a0a0a', borderRadius: '8px' }}>
                      <div style={{ fontSize: '10px', color: '#333', marginBottom: '6px' }}>Progresión de energía en este bloque</div>
                      <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '24px' }}>
                        {bpms.map((bpm, j) => {
                          const minBpm = 60, maxBpm = 145
                          const altura = Math.round(((bpm - minBpm) / (maxBpm - minBpm)) * 100)
                          const bc = bpm < 95 ? ENERGIA_COLOR.baja : bpm < 120 ? ENERGIA_COLOR.media : ENERGIA_COLOR.alta
                          return (
                            <div key={j} title={`${bpm} BPM`} style={{
                              flex: 1, background: bc, borderRadius: '2px 2px 0 0',
                              height: `${Math.max(altura, 10)}%`, opacity: 0.8, transition: 'height .3s',
                            }} />
                          )
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
  const [paso,    setPaso]    = useState(0)
  const [ocasion, setOcasion] = useState(null)
  const [form,    setForm]    = useState({
    personas: '', edad: '', energia: '', gustos: [], duracion: '',
    horario: '', pista: '', momento: '',
  })
  const [plan,  setPlan]  = useState(null)
  const [error, setError] = useState(null)

  const toggleGusto = (g) => setForm(f => ({
    ...f, gustos: f.gustos.includes(g) ? f.gustos.filter(x => x !== g) : [...f.gustos, g]
  }))

  const calcularCanciones = (duracion) => {
    const horas = { '1 hora': 1, '2 horas': 2, '3 horas': 3, '4 horas': 4, '5+ horas': 5 }
    return Math.ceil((horas[duracion] || 2) * 60 / 3.5)
  }

  const generarPlan = async () => {
    setPaso(2); setError(null)
    const cantCanciones = calcularCanciones(form.duracion)
    const ocasionNombre = OCASIONES.find(o => o.id === ocasion)?.nombre

    try {
      const prompt = `Sos un DJ profesional argentino experto en armar timelines musicales con criterio de BPM. Generá un plan musical para este evento:

DATOS DEL EVENTO:
- Ocasión: ${ocasionNombre}
- Personas: ${form.personas}
- Rango de edad: ${form.edad}
- Energía deseada: ${form.energia}
- Gustos musicales: ${form.gustos.join(', ')}
- Duración total: ${form.duracion}
- Horario de inicio: ${form.horario}
- ¿Hay pista de baile?: ${form.pista}
- Momento especial: ${form.momento}

CONTEXTO CULTURAL: En Argentina toda reunión incluye comida. Consideralo para estructurar el timeline (llegada/aperitivo → comida → sobremesa/baile según corresponda).

REGLAS DE BPM — MUY IMPORTANTE:
Un DJ profesional nunca salta más de 10-15 BPM entre canciones consecutivas. Seguí estas reglas:
- Bloques de energía BAJA: canciones entre 70-95 BPM
- Bloques de energía MEDIA: canciones entre 95-120 BPM  
- Bloques de energía ALTA: canciones entre 120-140 BPM
- Dentro de cada bloque, ordená las canciones con progresión gradual de BPM (de menor a mayor si el bloque sube, de mayor a menor si baja)
- Entre bloques consecutivos, el último BPM del bloque anterior y el primero del siguiente no deben diferir más de 15 BPM
- Indicá el BPM real y aproximado de cada canción

CONSIDERACIONES DE DJ PROFESIONAL:
- El horario de inicio afecta cuándo llega el pico: noche = calentamiento corto, tarde = calentamiento largo
- Si hay pista de baile, construí hacia un pico bailable claro con BPM alto
- Si no hay pista, mantené BPM parejo sin picos extremos
- Si hay momento especial, reservá una canción icónica y mencionala en la descripción del bloque
- Adaptá el arco de BPM a la energía deseada

REGLAS CRÍTICAS PARA LAS CANCIONES:
1. Solo podés incluir canciones que EXISTEN REALMENTE en YouTube
2. Verificá que cada combinación título-artista sea correcta y real
3. Si no estás 100% seguro de que existe, NO la incluyas
4. Preferí hits conocidos y populares
5. Necesitás exactamente ${cantCanciones} canciones

Respondé SOLO con JSON válido (sin texto extra, sin backticks):
{
  "titulo": "nombre creativo para este evento",
  "duracion_total": "${form.duracion}",
  "tip_dj": "consejo específico mencionando la estrategia de BPM y el arco de energía (máx 2 oraciones)",
  "bloques": [
    {
      "nombre": "nombre del bloque",
      "duracion": "X min",
      "energia": "baja/media/alta",
      "bpm_rango": "XX-XX BPM",
      "descripcion": "qué suena, por qué en este momento, cómo se conecta con el siguiente bloque y qué hace el BPM",
      "artistas": ["artista1", "artista2"],
      "canciones_sugeridas": [
        { "titulo": "Nombre canción - Artista", "inicio": 15, "bpm": 95 }
      ]
    }
  ]
}

La suma de canciones_sugeridas debe ser exactamente ${cantCanciones}.
"inicio" = segundo donde empieza la música real. Si arranca directo ponés 0.
"bpm" = BPM real aproximado de esa canción — respetá la progresión gradual.`

      const response = await fetch('/api/generar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      const text   = data.content?.find(b => b.type === 'text')?.text || ''
      const clean  = text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      setPlan(parsed)
      setPaso(3)
    } catch (e) {
      setError('Hubo un error generando el plan. Intentá de nuevo.')
      setPaso(1)
    }
  }

  const reproducirAhora = () => {
    const canciones = plan.bloques.flatMap(bloque =>
      (bloque.canciones_sugeridas || []).map(c => {
        const texto       = typeof c === 'string' ? c : (c.titulo || '')
        const ultimoGuion = texto.lastIndexOf(' - ')
        const titulo      = ultimoGuion !== -1 ? texto.slice(0, ultimoGuion).trim() : texto.trim()
        const artista     = ultimoGuion !== -1 ? texto.slice(ultimoGuion + 3).trim() : ''
        return {
          titulo, artista,
          bloque:  bloque.nombre,
          momento: bloque.nombre,
          energia: bloque.energia,
          bpm:     typeof c === 'object' ? (c.bpm || null) : null,
          inicio:  typeof c === 'object' ? (c.inicio || 0) : 0,
        }
      })
    )
    sessionStorage.setItem('mandale_plan', JSON.stringify({
      canciones, nombre: plan.titulo || '', bloques: plan.bloques,
    }))
    window.location.href = '/player'
  }

  const formularioCompleto = ocasion && form.personas && form.edad && form.energia &&
    form.gustos.length > 0 && form.duracion && form.horario && form.pista && form.momento

  const btnStyle = (activo) => ({
    padding: '10px 20px', borderRadius: '100px',
    border: `1px solid ${activo ? '#d4a843' : '#333'}`,
    background: activo ? '#d4a843' : 'transparent',
    color: activo ? '#000' : '#ccc',
    cursor: 'pointer', fontSize: '14px',
    fontWeight: activo ? '600' : '400',
    transition: 'all .15s',
  })

  // PASO 0
  if (paso === 0) return (
    <main style={{ minHeight: '100vh', background: '#09090b', color: '#fff', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <button onClick={() => window.location.href = '/'} style={{ background: 'none', border: '1px solid #333', color: '#888', padding: '8px 16px', borderRadius: '100px', fontSize: '13px', cursor: 'pointer', marginBottom: '40px' }}>← Volver</button>
        <h1 style={{ fontSize: 'clamp(28px,5vw,42px)', fontWeight: '300', marginBottom: '8px', lineHeight: 1.2 }}>
          ¿Qué estás <em style={{ color: '#d4a843', fontStyle: 'italic' }}>festejando?</em>
        </h1>
        <p style={{ color: '#999', marginBottom: '40px', fontSize: '15px' }}>Elegí la ocasión y la IA arma el plan musical perfecto.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
          {OCASIONES.map(o => (
            <button key={o.id} onClick={() => { setOcasion(o.id); setPaso(1) }}
              style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '20px 16px', cursor: 'pointer', textAlign: 'left', transition: 'all .2s', color: '#fff' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#d4a843'; e.currentTarget.style.background = '#1a1600' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.background = '#111' }}>
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>{o.emoji}</div>
              <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>{o.nombre}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>{o.sub}</div>
            </button>
          ))}
        </div>
      </div>
    </main>
  )

  // PASO 1
  if (paso === 1) return (
    <main style={{ minHeight: '100vh', background: '#09090b', color: '#fff', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        <button onClick={() => setPaso(0)} style={{ background: 'none', border: '1px solid #333', color: '#888', padding: '8px 16px', borderRadius: '100px', fontSize: '13px', cursor: 'pointer', marginBottom: '40px' }}>
          ← {OCASIONES.find(o => o.id === ocasion)?.emoji} {OCASIONES.find(o => o.id === ocasion)?.nombre}
        </button>
        <h2 style={{ fontSize: '26px', fontWeight: '300', marginBottom: '32px' }}>Contanos un poco más</h2>

        {[
          { label: '¿Cuántas personas?',           key: 'personas', opts: ['1-5','6-15','16-30','30-60','60+'] },
          { label: 'Edad promedio',                 key: 'edad',     opts: EDADES },
          { label: 'Energía deseada',               key: 'energia',  opts: ENERGIAS },
          { label: '¿Cuánto dura?',                 key: 'duracion', opts: DURACIONES },
          { label: '¿A qué hora arranca?',          key: 'horario',  opts: HORARIOS },
          { label: '¿Hay pista de baile?',          key: 'pista',    opts: PISTAS },
          { label: '¿Hay algún momento especial?',  key: 'momento',  opts: MOMENTOS },
        ].map(({ label, key, opts }) => (
          <div key={key} style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>{label}</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {opts.map(o => <button key={o} onClick={() => setForm(f => ({ ...f, [key]: o }))} style={btnStyle(form[key] === o)}>{o}</button>)}
            </div>
          </div>
        ))}

        <div style={{ marginBottom: '36px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>Géneros musicales (podés elegir varios)</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {GUSTOS.map(g => <button key={g} onClick={() => toggleGusto(g)} style={btnStyle(form.gustos.includes(g))}>{g}</button>)}
          </div>
        </div>

        {error && <p style={{ color: '#f87171', fontSize: '14px', marginBottom: '16px' }}>{error}</p>}

        <button onClick={generarPlan} disabled={!formularioCompleto} style={{
          width: '100%', padding: '16px',
          background: formularioCompleto ? '#d4a843' : '#1a1a1a',
          color: formularioCompleto ? '#000' : '#444',
          border: 'none', borderRadius: '100px', fontSize: '16px', fontWeight: '600',
          cursor: formularioCompleto ? 'pointer' : 'not-allowed', transition: 'all .2s',
        }}>✨ Generar mi plan musical</button>
      </div>
    </main>
  )

  // PASO 2
  if (paso === 2) return (
    <main style={{ minHeight: '100vh', background: '#09090b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '24px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ width: '48px', height: '48px', border: '3px solid #222', borderTop: '3px solid #d4a843', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <p style={{ color: '#666', fontSize: '16px' }}>La IA está armando tu plan musical...</p>
    </main>
  )

  // PASO 3
  if (paso === 3 && plan) {
    const totalCanciones = plan.bloques?.reduce((s, b) => s + (b.canciones_sugeridas?.length || 0), 0)
    return (
      <main style={{ minHeight: '100vh', background: '#09090b', color: '#fff', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <button onClick={() => setPaso(1)} style={{ background: 'none', border: '1px solid #333', color: '#888', padding: '8px 16px', borderRadius: '100px', fontSize: '13px', cursor: 'pointer', marginBottom: '32px' }}>← Volver</button>

          <div style={{ marginBottom: '28px' }}>
            <div style={{ fontSize: '11px', color: '#d4a843', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>Tu plan musical</div>
            <h2 style={{ fontSize: '26px', fontWeight: '400', marginBottom: '8px', lineHeight: 1.2 }}>{plan.titulo}</h2>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <span style={{ fontSize: '13px', color: '#555' }}>⏱ {plan.duracion_total}</span>
              <span style={{ fontSize: '13px', color: '#555' }}>🎵 {totalCanciones} canciones</span>
              <span style={{ fontSize: '13px', color: '#555' }}>📦 {plan.bloques?.length} bloques</span>
            </div>
            <div style={{ background: '#0d0d0d', borderRadius: '12px', padding: '14px 16px', borderLeft: '3px solid #d4a843' }}>
              <p style={{ fontSize: '11px', color: '#555', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>🎧 Tip del DJ</p>
              <p style={{ fontSize: '13px', color: '#888', lineHeight: 1.7, margin: 0 }}>{plan.tip_dj}</p>
            </div>
          </div>

          {/* Leyenda */}
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '14px' }}>
            {Object.entries(ENERGIA_COLOR).map(([k, color]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
                <span style={{ fontSize: '11px', color: '#555' }}>{ENERGIA_LABEL[k]} · {BPM_RANGO[k]?.label}</span>
              </div>
            ))}
          </div>

          <Timeline bloques={plan.bloques || []} />

          <div style={{ marginTop: '36px', background: 'linear-gradient(135deg, #1a1400, #0f0a00)', border: '1px solid #2a1e00', borderRadius: '20px', padding: '32px', textAlign: 'center' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🎵</div>
            <h3 style={{ fontSize: '20px', fontWeight: '400', marginBottom: '8px' }}>¿Listo para escuchar?</h3>
            <p style={{ color: '#666', fontSize: '13px', lineHeight: 1.7, maxWidth: '340px', margin: '0 auto 24px' }}>
              Mandale Play reproduce tu plan completo respetando la progresión de BPM entre canciones.
            </p>
            <button onClick={reproducirAhora} style={{ background: '#d4a843', color: '#000', border: 'none', padding: '14px 36px', borderRadius: '100px', fontSize: '16px', fontWeight: '700', cursor: 'pointer' }}>
              ▶ Reproducir ahora
            </button>
          </div>
        </div>
      </main>
    )
  }

  return null
}
