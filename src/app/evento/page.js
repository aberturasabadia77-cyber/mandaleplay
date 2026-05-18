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

const ENERGIAS = ['Muy tranquila 😌', 'Relajada 🙂', 'Animada 🎉', 'Fiesta total 🔥']
const EDADES = ['18-25', '25-35', '35-50', '50+', 'Mixto']
const GUSTOS = ['Reggaeton', 'Pop latino', 'Rock', 'Electrónica', 'Cumbia', 'Clásicos 80s/90s', 'Trap/Urbano', 'Jazz/Soul', 'Internacional', 'Variado']

export default function Evento() {
  const [paso, setPaso] = useState(0) // 0=ocasion, 1=preguntas, 2=generando, 3=plan, 4=conectar
  const [ocasion, setOcasion] = useState(null)
  const [form, setForm] = useState({ personas: '', edad: '', energia: '', gustos: [] })
  const [plan, setPlan] = useState(null)
  const [error, setError] = useState(null)

  const toggleGusto = (g) => {
    setForm(f => ({
      ...f,
      gustos: f.gustos.includes(g) ? f.gustos.filter(x => x !== g) : [...f.gustos, g]
    }))
  }

  const generarPlan = async () => {
    setPaso(2)
    setError(null)
    try {
      const prompt = `Sos un DJ profesional argentino. Generá un plan musical detallado para este evento:

Ocasión: ${OCASIONES.find(o => o.id === ocasion)?.nombre}
Personas: ${form.personas}
Rango de edad: ${form.edad}
Energía deseada: ${form.energia}
Gustos musicales: ${form.gustos.join(', ')}

Respondé SOLO con un JSON válido con esta estructura exacta:
{
  "titulo": "nombre creativo para este evento",
  "duracion_total": "X horas",
  "tip_dj": "consejo corto y específico del DJ para este evento (máx 2 oraciones)",
  "bloques": [
    {
      "nombre": "nombre del bloque",
      "duracion": "X min",
      "energia": "baja/media/alta",
      "descripcion": "qué suena y por qué",
      "artistas": ["artista1", "artista2", "artista3"],
      "canciones_sugeridas": ["canción1 - artista", "canción2 - artista"]
    }
  ]
}`

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      })

      const data = await response.json()
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

  const energiaColor = { 'baja': '#4ade80', 'media': '#facc15', 'alta': '#f97316' }

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
        <p style={{ color: '#666', marginBottom: '40px', fontSize: '15px' }}>Elegí la ocasión y la IA arma el plan musical perfecto.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
          {OCASIONES.map(o => (
            <button key={o.id} onClick={() => { setOcasion(o.id); setPaso(1) }}
              style={{ background: '#111', border: '1px solid #222', borderRadius: '16px', padding: '20px 16px', cursor: 'pointer', textAlign: 'left', transition: 'all .2s', color: '#fff' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#d4a843'; e.currentTarget.style.background = '#1a1600' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#222'; e.currentTarget.style.background = '#111' }}>
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>{o.emoji}</div>
              <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>{o.nombre}</div>
              <div style={{ fontSize: '12px', color: '#555' }}>{o.sub}</div>
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
        <h2 style={{ fontSize: '26px', fontWeight: '300', marginBottom: '32px' }}>Contanos un poco más</h2>

        {/* Personas */}
        <div style={{ marginBottom: '28px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#888', marginBottom: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>¿Cuántas personas?</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['1-5', '6-15', '16-30', '30-60', '60+'].map(n => (
              <button key={n} onClick={() => setForm(f => ({ ...f, personas: n }))}
                style={{ padding: '10px 18px', borderRadius: '100px', border: `1px solid ${form.personas === n ? '#d4a843' : '#333'}`, background: form.personas === n ? '#1a1600' : 'transparent', color: form.personas === n ? '#d4a843' : '#888', cursor: 'pointer', fontSize: '14px', transition: 'all .15s' }}>
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Edad */}
        <div style={{ marginBottom: '28px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#888', marginBottom: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>Edad promedio</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {EDADES.map(e => (
              <button key={e} onClick={() => setForm(f => ({ ...f, edad: e }))}
                style={{ padding: '10px 18px', borderRadius: '100px', border: `1px solid ${form.edad === e ? '#d4a843' : '#333'}`, background: form.edad === e ? '#1a1600' : 'transparent', color: form.edad === e ? '#d4a843' : '#888', cursor: 'pointer', fontSize: '14px', transition: 'all .15s' }}>
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Energía */}
        <div style={{ marginBottom: '28px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#888', marginBottom: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>Energía deseada</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {ENERGIAS.map(e => (
              <button key={e} onClick={() => setForm(f => ({ ...f, energia: e }))}
                style={{ padding: '10px 18px', borderRadius: '100px', border: `1px solid ${form.energia === e ? '#d4a843' : '#333'}`, background: form.energia === e ? '#1a1600' : 'transparent', color: form.energia === e ? '#d4a843' : '#888', cursor: 'pointer', fontSize: '14px', transition: 'all .15s' }}>
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Gustos */}
        <div style={{ marginBottom: '36px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#888', marginBottom: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>Géneros musicales (podés elegir varios)</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {GUSTOS.map(g => (
              <button key={g} onClick={() => toggleGusto(g)}
                style={{ padding: '10px 18px', borderRadius: '100px', border: `1px solid ${form.gustos.includes(g) ? '#d4a843' : '#333'}`, background: form.gustos.includes(g) ? '#1a1600' : 'transparent', color: form.gustos.includes(g) ? '#d4a843' : '#888', cursor: 'pointer', fontSize: '14px', transition: 'all .15s' }}>
                {g}
              </button>
            ))}
          </div>
        </div>

        {error && <p style={{ color: '#f87171', fontSize: '14px', marginBottom: '16px' }}>{error}</p>}

        <button
          onClick={generarPlan}
          disabled={!form.personas || !form.edad || !form.energia || form.gustos.length === 0}
          style={{ width: '100%', padding: '16px', background: (!form.personas || !form.edad || !form.energia || form.gustos.length === 0) ? '#222' : '#d4a843', color: (!form.personas || !form.edad || !form.energia || form.gustos.length === 0) ? '#555' : '#000', border: 'none', borderRadius: '100px', fontSize: '16px', fontWeight: '600', cursor: (!form.personas || !form.edad || !form.energia || form.gustos.length === 0) ? 'not-allowed' : 'pointer', transition: 'all .2s' }}>
          ✨ Generar mi plan musical
        </button>
      </div>
    </main>
  )

  // PASO 2 — GENERANDO
  if (paso === 2) return (
    <main style={{ minHeight: '100vh', background: '#09090b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '24px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ width: '48px', height: '48px', border: '3px solid #333', borderTop: '3px solid #d4a843', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <p style={{ color: '#888', fontSize: '16px' }}>La IA está armando tu plan musical...</p>
    </main>
  )

  // PASO 3 — PLAN GENERADO
  if (paso === 3 && plan) return (
    <main style={{ minHeight: '100vh', background: '#09090b', color: '#fff', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <button onClick={() => setPaso(1)} style={{ background: 'none', border: '1px solid #333', color: '#888', padding: '8px 16px', borderRadius: '100px', fontSize: '13px', cursor: 'pointer', marginBottom: '32px' }}>
          ← Volver
        </button>

        {/* Header del plan */}
        <div style={{ background: '#111', border: '1px solid #222', borderRadius: '20px', padding: '28px', marginBottom: '24px' }}>
          <div style={{ fontSize: '12px', color: '#d4a843', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>Tu plan musical</div>
          <h2 style={{ fontSize: '26px', fontWeight: '500', marginBottom: '12px' }}>{plan.titulo}</h2>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>⏱ {plan.duracion_total} · {plan.bloques?.length} bloques</p>
          <div style={{ background: '#0a0a0a', borderRadius: '12px', padding: '16px', borderLeft: '3px solid #d4a843' }}>
            <p style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>💬 Tip del DJ</p>
            <p style={{ fontSize: '14px', color: '#ccc', lineHeight: 1.6 }}>{plan.tip_dj}</p>
          </div>
        </div>

        {/* Bloques */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
          {plan.bloques?.map((bloque, i) => (
            <div key={i} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#555', marginRight: '8px' }}>BLOQUE {i + 1}</span>
                  <span style={{ fontSize: '16px', fontWeight: '500' }}>{bloque.nombre}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#555' }}>{bloque.duracion}</span>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: energiaColor[bloque.energia] || '#d4a843', display: 'inline-block' }} />
                </div>
              </div>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px', lineHeight: 1.6 }}>{bloque.descripcion}</p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                {bloque.artistas?.map((a, j) => (
                  <span key={j} style={{ fontSize: '12px', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#888', padding: '4px 10px', borderRadius: '100px' }}>{a}</span>
                ))}
              </div>
              {bloque.canciones_sugeridas?.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  {bloque.canciones_sugeridas.map((c, j) => (
                    <p key={j} style={{ fontSize: '12px', color: '#555', margin: '2px 0' }}>♪ {c}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA conectar YouTube */}
        <div style={{ background: 'linear-gradient(135deg, #1a1400, #0f0a00)', border: '1px solid #3a2a00', borderRadius: '20px', padding: '28px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>▶️</div>
          <h3 style={{ fontSize: '20px', fontWeight: '500', marginBottom: '8px' }}>¿Listo para reproducir?</h3>
          <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px', lineHeight: 1.6 }}>Conectá tu YouTube Premium y el sistema crea las playlists automáticamente en tu cuenta.</p>
          <button
            onClick={() => setPaso(4)}
            style={{ background: '#d4a843', color: '#000', border: 'none', padding: '14px 32px', borderRadius: '100px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
            Conectar YouTube Premium →
          </button>
          <p style={{ color: '#444', fontSize: '12px', marginTop: '12px' }}>Necesitás tener YouTube Premium activo</p>
        </div>
      </div>
    </main>
  )

  // PASO 4 — CONECTAR YOUTUBE
  if (paso === 4) return (
    <main style={{ minHeight: '100vh', background: '#09090b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '460px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '24px' }}>🎵</div>
        <h2 style={{ fontSize: '26px', fontWeight: '400', marginBottom: '12px' }}>Conectá tu YouTube</h2>
        <p style={{ color: '#666', fontSize: '15px', marginBottom: '32px', lineHeight: 1.7 }}>
          Al conectar tu cuenta de Google, el sistema va a crear las playlists del evento automáticamente en tu YouTube. Vos solo apretás play.
        </p>
        <a
          href={`https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin + '/api/auth/callback/google' : '')}&response_type=code&scope=https://www.googleapis.com/auth/youtube&access_type=offline`}
          style={{ display: 'inline-block', background: '#fff', color: '#000', padding: '14px 28px', borderRadius: '100px', fontSize: '15px', fontWeight: '600', textDecoration: 'none', marginBottom: '16px' }}>
          🔗 Conectar con Google
        </a>
        <p style={{ color: '#444', fontSize: '12px' }}>Solo se accede a tu YouTube. No guardamos datos personales.</p>
        <button onClick={() => setPaso(3)} style={{ display: 'block', margin: '16px auto 0', background: 'none', border: 'none', color: '#555', fontSize: '13px', cursor: 'pointer' }}>
          ← Volver al plan
        </button>
      </div>
    </main>
  )

  return null
}
