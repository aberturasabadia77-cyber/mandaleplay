'use client'

import { useState, useEffect } from 'react'

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

const ENERGIAS = ['Muy tranquila 😌', 'Relajada 🙂', 'Animada 🎉', 'Fiesta total 🔥']
const EDADES = ['18-25', '25-35', '35-50', '50+', 'Mixto']
const GUSTOS = ['Reggaeton', 'Pop latino', 'Rock', 'Electrónica', 'Cumbia', 'Clásicos 80s/90s', 'Trap/Urbano', 'Jazz/Soul', 'Internacional', 'Variado']
const DURACIONES = ['1 hora', '2 horas', '3 horas', '4 horas', '5+ horas']

export default function Evento() {
  const [paso, setPaso] = useState(0)
  const [ocasion, setOcasion] = useState(null)
  const [form, setForm] = useState({ personas: '', edad: '', energia: '', gustos: [], duracion: '' })
  const [plan, setPlan] = useState(null)
  const [error, setError] = useState(null)

  const toggleGusto = (g) => {
    setForm(f => ({
      ...f,
      gustos: f.gustos.includes(g) ? f.gustos.filter(x => x !== g) : [...f.gustos, g]
    }))
  }

  const calcularCanciones = (duracion) => {
    const horas = { '1 hora': 1, '2 horas': 2, '3 horas': 3, '4 horas': 4, '5+ horas': 5 }
    return Math.ceil((horas[duracion] || 2) * 60 / 3.5)
  }

  const generarPlan = async () => {
    setPaso(2)
    setError(null)
    const cantCanciones = calcularCanciones(form.duracion)
    try {
      const prompt = `Sos un DJ profesional argentino. Generá un plan musical detallado para este evento:

Ocasión: ${OCASIONES.find(o => o.id === ocasion)?.nombre}
Personas: ${form.personas}
Rango de edad: ${form.edad}
Energía deseada: ${form.energia}
Gustos musicales: ${form.gustos.join(', ')}
Duración del evento: ${form.duracion}

IMPORTANTE: Necesitás exactamente ${cantCanciones} canciones para cubrir ${form.duracion} sin silencios.
Para cada canción indicá el segundo exacto donde empieza la música real (saltando intro).

Respondé SOLO con un JSON válido con esta estructura exacta (sin texto extra, sin backticks):
{
  "titulo": "nombre creativo para este evento",
  "duracion_total": "${form.duracion}",
  "tip_dj": "consejo corto y específico del DJ para este evento (máx 2 oraciones)",
  "bloques": [
    {
      "nombre": "nombre del bloque",
      "duracion": "X min",
      "energia": "baja/media/alta",
      "descripcion": "qué suena y por qué",
      "artistas": ["artista1", "artista2", "artista3"],
      "canciones_sugeridas": [
        { "titulo": "Nombre canción - Artista", "inicio": 15 },
        { "titulo": "Otra canción - Artista", "inicio": 0 }
      ]
    }
  ]
}

La suma total de canciones_sugeridas debe ser exactamente ${cantCanciones}.
El campo "inicio" es el segundo donde empieza la música real (sin intro).`

      const response = await fetch('/api/generar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error)

      const text = data.content?.find(b => b.type === 'text')?.text || ''
      const clean = text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      setPlan(parsed)
      setPaso(3)
    } catch (e) {
      setError('Hubo un error generando el plan. Intentá de nuevo.')
      setPaso(1)
    }
  }

  const reproducirAhora = () => {
    // Aplanar bloques → array plano de canciones con {titulo, artista, bloque, inicio}
    const canciones = plan.bloques.flatMap(bloque =>
      (bloque.canciones_sugeridas || []).map(c => {
        const textoCompleto = typeof c === 'string' ? c : (c.titulo || '')
        // Separar "Nombre canción - Artista" por el ÚLTIMO " - "
        const ultimoGuion = textoCompleto.lastIndexOf(' - ')
        const titulo  = ultimoGuion !== -1 ? textoCompleto.slice(0, ultimoGuion).trim() : textoCompleto.trim()
        const artista = ultimoGuion !== -1 ? textoCompleto.slice(ultimoGuion + 3).trim() : ''
        return {
          titulo,
          artista,
          bloque: bloque.nombre,
          momento: bloque.nombre,
          inicio: typeof c === 'object' ? (c.inicio || 0) : 0,
        }
      })
    )

    // Guardar con la key que lee el player
    sessionStorage.setItem('mandale_plan', JSON.stringify({
      canciones,
      nombre: plan.titulo || '',
    }))

    window.location.href = '/player'
  }

  const energiaColor = { 'baja': '#4ade80', 'media': '#facc15', 'alta': '#f97316' }
  const formularioCompleto = ocasion && form.personas && form.edad && form.energia && form.gustos.length > 0 && form.duracion

  // PASO 0 — ELEGIR OCASIÓN
  if (paso === 0) return (
    <main style={{ minHeight: '100vh', background: '#09090b', color: '#fff', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <button onClick={() => window.location.href = '/'} style={{ background: 'none', border: '1px solid #333', color: '#888', padding: '8px 16px', borderRadius: '100px', fontSize: '13px', cursor: 'pointer', marginBottom: '40px' }}>
          ← Volver
        </button>
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
              <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#fff' }}>{o.nombre}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>{o.sub}</div>
            </button>
          ))}
        </div>
      </div>
    </main>
  )

  // PASO 1 — PREGUNTAS
  if (paso === 1) return (
    <main style={{ minHeight: '100vh', background: '#09090b', color: '#fff', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        <button onClick={() => setPaso(0)} style={{ background: 'none', border: '1px solid #333', color: '#888', padding: '8px 16px', borderRadius: '100px', fontSize: '13px', cursor: 'pointer', marginBottom: '40px' }}>
          ← {OCASIONES.find(o => o.id === ocasion)?.emoji} {OCASIONES.find(o => o.id === ocasion)?.nombre}
        </button>
        <h2 style={{ fontSize: '26px', fontWeight: '300', marginBottom: '32px', color: '#fff' }}>Contanos un poco más</h2>

        <div style={{ marginBottom: '28px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>¿Cuántas personas?</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['1-5', '6-15', '16-30', '30-60', '60+'].map(n => (
              <button key={n} onClick={() => setForm(f => ({ ...f, personas: n }))}
                style={{ padding: '10px 20px', borderRadius: '100px', border: `1px solid ${form.personas === n ? '#d4a843' : '#333'}`, background: form.personas === n ? '#d4a843' : 'transparent', color: form.personas === n ? '#000' : '#ccc', cursor: 'pointer', fontSize: '14px', fontWeight: form.personas === n ? '600' : '400', transition: 'all .15s' }}>
                {n}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '28px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>Edad promedio</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {EDADES.map(e => (
              <button key={e} onClick={() => setForm(f => ({ ...f, edad: e }))}
                style={{ padding: '10px 20px', borderRadius: '100px', border: `1px solid ${form.edad === e ? '#d4a843' : '#333'}`, background: form.edad === e ? '#d4a843' : 'transparent', color: form.edad === e ? '#000' : '#ccc', cursor: 'pointer', fontSize: '14px', fontWeight: form.edad === e ? '600' : '400', transition: 'all .15s' }}>
                {e}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '28px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>Energía deseada</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {ENERGIAS.map(e => (
              <button key={e} onClick={() => setForm(f => ({ ...f, energia: e }))}
                style={{ padding: '10px 20px', borderRadius: '100px', border: `1px solid ${form.energia === e ? '#d4a843' : '#333'}`, background: form.energia === e ? '#d4a843' : 'transparent', color: form.energia === e ? '#000' : '#ccc', cursor: 'pointer', fontSize: '14px', fontWeight: form.energia === e ? '600' : '400', transition: 'all .15s' }}>
                {e}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '28px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>¿Cuánto dura el evento?</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {DURACIONES.map(d => (
              <button key={d} onClick={() => setForm(f => ({ ...f, duracion: d }))}
                style={{ padding: '10px 20px', borderRadius: '100px', border: `1px solid ${form.duracion === d ? '#d4a843' : '#333'}`, background: form.duracion === d ? '#d4a843' : 'transparent', color: form.duracion === d ? '#000' : '#ccc', cursor: 'pointer', fontSize: '14px', fontWeight: form.duracion === d ? '600' : '400', transition: 'all .15s' }}>
                {d}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '36px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>Géneros musicales (podés elegir varios)</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {GUSTOS.map(g => (
              <button key={g} onClick={() => toggleGusto(g)}
                style={{ padding: '10px 20px', borderRadius: '100px', border: `1px solid ${form.gustos.includes(g) ? '#d4a843' : '#333'}`, background: form.gustos.includes(g) ? '#d4a843' : 'transparent', color: form.gustos.includes(g) ? '#000' : '#ccc', cursor: 'pointer', fontSize: '14px', fontWeight: form.gustos.includes(g) ? '600' : '400', transition: 'all .15s' }}>
                {g}
              </button>
            ))}
          </div>
        </div>

        {error && <p style={{ color: '#f87171', fontSize: '14px', marginBottom: '16px' }}>{error}</p>}

        <button
          onClick={generarPlan}
          disabled={!formularioCompleto}
          style={{ width: '100%', padding: '16px', background: formularioCompleto ? '#d4a843' : '#1a1a1a', color: formularioCompleto ? '#000' : '#444', border: 'none', borderRadius: '100px', fontSize: '16px', fontWeight: '600', cursor: formularioCompleto ? 'pointer' : 'not-allowed', transition: 'all .2s' }}>
          ✨ Generar mi plan musical
        </button>
      </div>
    </main>
  )

  // PASO 2 — GENERANDO
  if (paso === 2) return (
    <main style={{ minHeight: '100vh', background: '#09090b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '24px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ width: '48px', height: '48px', border: '3px solid #222', borderTop: '3px solid #d4a843', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <p style={{ color: '#666', fontSize: '16px' }}>La IA está armando tu plan musical...</p>
    </main>
  )

  // PASO 3 — PLAN GENERADO
  if (paso === 3 && plan) return (
    <main style={{ minHeight: '100vh', background: '#09090b', color: '#fff', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <button onClick={() => setPaso(1)} style={{ background: 'none', border: '1px solid #333', color: '#888', padding: '8px 16px', borderRadius: '100px', fontSize: '13px', cursor: 'pointer', marginBottom: '32px' }}>
          ← Volver
        </button>

        <div style={{ background: '#111', border: '1px solid #222', borderRadius: '20px', padding: '28px', marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', color: '#d4a843', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '10px' }}>Tu plan musical</div>
          <h2 style={{ fontSize: '26px', fontWeight: '500', marginBottom: '12px', color: '#fff' }}>{plan.titulo}</h2>
          <p style={{ color: '#555', fontSize: '14px', marginBottom: '16px' }}>⏱ {plan.duracion_total} · {plan.bloques?.length} bloques</p>
          <div style={{ background: '#0d0d0d', borderRadius: '12px', padding: '16px', borderLeft: '3px solid #d4a843' }}>
            <p style={{ fontSize: '12px', color: '#555', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Tip del DJ</p>
            <p style={{ fontSize: '14px', color: '#aaa', lineHeight: 1.7 }}>{plan.tip_dj}</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
          {plan.bloques?.map((bloque, i) => (
            <div key={i} style={{ background: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#444', marginRight: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Bloque {i + 1}</span>
                  <span style={{ fontSize: '16px', fontWeight: '500', color: '#fff' }}>{bloque.nombre}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#444' }}>{bloque.duracion}</span>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: energiaColor[bloque.energia] || '#d4a843', display: 'inline-block' }} />
                </div>
              </div>
              <p style={{ fontSize: '13px', color: '#555', marginBottom: '12px', lineHeight: 1.7 }}>{bloque.descripcion}</p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                {bloque.artistas?.map((a, j) => (
                  <span key={j} style={{ fontSize: '12px', background: '#1a1a1a', border: '1px solid #252525', color: '#777', padding: '4px 10px', borderRadius: '100px' }}>{a}</span>
                ))}
              </div>
              {bloque.canciones_sugeridas?.length > 0 && (
                <div style={{ marginTop: '10px', borderTop: '1px solid #1a1a1a', paddingTop: '10px' }}>
                  {bloque.canciones_sugeridas.map((c, j) => (
                    <p key={j} style={{ fontSize: '12px', color: '#444', margin: '4px 0' }}>
                      ♪ {typeof c === 'string' ? c : c.titulo}
                      {typeof c === 'object' && c.inicio > 0 && <span style={{ color: '#2a2a2a', marginLeft: '6px' }}>▶ {c.inicio}s</span>}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ background: 'linear-gradient(135deg, #1a1400, #0f0a00)', border: '1px solid #2a1e00', borderRadius: '20px', padding: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '16px' }}>🎵</div>
          <h3 style={{ fontSize: '22px', fontWeight: '400', marginBottom: '10px', color: '#fff' }}>¿Listo para escuchar?</h3>
          <p style={{ color: '#666', fontSize: '14px', lineHeight: 1.7, maxWidth: '360px', margin: '0 auto 24px' }}>
            Mandale Play reproduce tu plan completo con enganches automáticos entre canciones.
          </p>
          <button
            onClick={reproducirAhora}
            style={{ background: '#d4a843', color: '#000', border: 'none', padding: '14px 36px', borderRadius: '100px', fontSize: '16px', fontWeight: '700', cursor: 'pointer' }}>
            ▶ Reproducir ahora
          </button>
        </div>
      </div>
    </main>
  )

  return null
}
