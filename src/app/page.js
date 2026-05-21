export default function Home() {
  return (
    <main style={{ minHeight: '100vh', background: '#09090b', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif', overflowX: 'hidden' }}>

      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', borderBottom: '1px solid #111' }}>
        <div style={{ fontSize: '20px', fontWeight: '600', letterSpacing: '-0.5px' }}>
          Mandale <span style={{ color: '#d4a843' }}>Play</span>
        </div>
        <a href="/evento" style={{ background: '#d4a843', color: '#000', padding: '10px 24px', borderRadius: '100px', fontSize: '14px', fontWeight: '600', textDecoration: 'none', transition: 'opacity .2s' }}>
          Crear mi plan
        </a>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 24px 60px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: '#1a1400', border: '1px solid #2a1e00', borderRadius: '100px', padding: '6px 16px', fontSize: '12px', color: '#d4a843', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '32px' }}>
          DJ inteligente para tu evento
        </div>

        <h1 style={{ fontSize: 'clamp(36px, 7vw, 72px)', fontWeight: '300', lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-1px' }}>
          La música perfecta<br />para <em style={{ color: '#d4a843', fontStyle: 'italic' }}>tu fiesta</em>
        </h1>

        <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: '#666', lineHeight: 1.7, maxWidth: '560px', margin: '0 auto 40px' }}>
          Contanos qué festejás, cuánta gente viene y qué energía querés. La IA arma el timeline musical completo como lo haría un DJ profesional.
        </p>

        <a href="/evento" style={{ display: 'inline-block', background: '#d4a843', color: '#000', padding: '16px 40px', borderRadius: '100px', fontSize: '17px', fontWeight: '700', textDecoration: 'none', marginBottom: '16px' }}>
          ✨ Crear mi plan musical gratis
        </a>
        <div style={{ fontSize: '13px', color: '#444' }}>Sin registrarse · Listo en 30 segundos</div>
      </section>

      {/* Timeline visual demo */}
      <section style={{ maxWidth: '700px', margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ background: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '20px', padding: '28px', marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', color: '#444', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>
            Ejemplo — Quincho, 3 horas, energía animada
          </div>

          {/* Barra timeline demo */}
          <div style={{ display: 'flex', borderRadius: '10px', overflow: 'hidden', height: '44px', marginBottom: '8px', gap: '2px' }}>
            {[
              { label: 'Llegada', color: '#4ade80', w: 18 },
              { label: 'Aperitivo', color: '#4ade80', w: 18 },
              { label: 'Comida', color: '#facc15', w: 28 },
              { label: 'Pico', color: '#f97316', w: 22 },
              { label: 'Cierre', color: '#facc15', w: 14 },
            ].map((b, i) => (
              <div key={i} style={{ width: `${b.w}%`, background: b.color, opacity: 0.75, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '9px', fontWeight: '700', color: '#000' }}>{b.label}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '2px', marginBottom: '20px' }}>
            {[
              { dur: '20 min', bpm: '75-85 BPM', color: '#4ade80', w: 18 },
              { dur: '20 min', bpm: '85-95 BPM', color: '#4ade80', w: 18 },
              { dur: '35 min', bpm: '95-115 BPM', color: '#facc15', w: 28 },
              { dur: '25 min', bpm: '115-130 BPM', color: '#f97316', w: 22 },
              { dur: '20 min', bpm: '100-115 BPM', color: '#facc15', w: 14 },
            ].map((b, i) => (
              <div key={i} style={{ width: `${b.w}%` }}>
                <div style={{ fontSize: '9px', color: b.color, fontWeight: '600' }}>{b.dur}</div>
                <div style={{ fontSize: '8px', color: '#333' }}>{b.bpm}</div>
              </div>
            ))}
          </div>

          {/* Canciones demo */}
          {[
            { titulo: 'De Música Ligera', artista: 'Soda Stereo', bpm: 78, color: '#4ade80' },
            { titulo: 'La Balsa', artista: 'Los Gatos', bpm: 85, color: '#4ade80' },
            { titulo: 'Maradona', artista: 'Fito Páez', bpm: 102, color: '#facc15' },
            { titulo: 'La Bamba', artista: 'Los Lobos', bpm: 124, color: '#f97316' },
          ].map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 0', borderBottom: '1px solid #111' }}>
              <span style={{ color: c.color, fontSize: '10px' }}>♪</span>
              <span style={{ fontSize: '13px', color: '#666', flex: 1 }}>{c.titulo} — {c.artista}</span>
              <span style={{ fontSize: '11px', color: c.color, fontWeight: '600' }}>{c.bpm} BPM</span>
            </div>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: '300', textAlign: 'center', marginBottom: '48px' }}>
          Cómo funciona
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
          {[
            { num: '01', titulo: 'Contanos tu evento', desc: 'Tipo de reunión, personas, energía, horario. Como le explicarías a un DJ.' },
            { num: '02', titulo: 'La IA arma el timeline', desc: 'Bloques de música con BPMs verificados y progresión de energía profesional.' },
            { num: '03', titulo: 'Dale play', desc: 'Reproducción automática, sin silencios, con enganches entre canciones.' },
          ].map((p, i) => (
            <div key={i} style={{ background: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '16px', padding: '24px' }}>
              <div style={{ fontSize: '28px', fontWeight: '200', color: '#d4a843', marginBottom: '12px' }}>{p.num}</div>
              <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>{p.titulo}</div>
              <div style={{ fontSize: '13px', color: '#555', lineHeight: 1.7 }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Diferenciadores */}
      <section style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: '300', textAlign: 'center', marginBottom: '48px' }}>
          No es una playlist. Es un <em style={{ color: '#d4a843', fontStyle: 'italic' }}>plan.</em>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {[
            { emoji: '🎯', titulo: 'Contexto real', desc: 'No es "poneme música tranquila". Es "asado, 20 personas, mixto de edades, arranca a las 13". La IA entiende la diferencia.' },
            { emoji: '🎚️', titulo: 'BPMs verificados', desc: 'Cada canción tiene el BPM real. Nunca más un tema lento en medio de la pista.' },
            { emoji: '🌙', titulo: 'Arco de energía', desc: 'El plan sube y baja la energía exactamente cuando tiene que hacerlo, como un DJ que conoce tu evento.' },
            { emoji: '🇦🇷', titulo: 'Pensado para Argentina', desc: 'Soda Stereo en el momento justo. Cumbia cuando la energía sube. Gardel en la nostalgia. Lo entiende.' },
          ].map((d, i) => (
            <div key={i} style={{ background: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '16px', padding: '24px' }}>
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>{d.emoji}</div>
              <div style={{ fontSize: '15px', fontWeight: '500', marginBottom: '8px' }}>{d.titulo}</div>
              <div style={{ fontSize: '13px', color: '#555', lineHeight: 1.7 }}>{d.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section style={{ textAlign: 'center', padding: '60px 24px 80px', borderTop: '1px solid #111' }}>
        <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: '300', marginBottom: '16px' }}>
          ¿Tenés un evento?<br /><em style={{ color: '#d4a843', fontStyle: 'italic' }}>Mandále Play.</em>
        </h2>
        <p style={{ color: '#555', fontSize: '16px', marginBottom: '36px' }}>Gratis. Sin registro. Listo en 30 segundos.</p>
        <a href="/evento" style={{ display: 'inline-block', background: '#d4a843', color: '#000', padding: '16px 48px', borderRadius: '100px', fontSize: '18px', fontWeight: '700', textDecoration: 'none' }}>
          ✨ Crear mi plan musical
        </a>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #111', padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ fontSize: '15px', fontWeight: '600' }}>Mandale <span style={{ color: '#d4a843' }}>Play</span></div>
        <div style={{ fontSize: '12px', color: '#333' }}>© 2026 · Hecho con IA en Argentina 🇦🇷</div>
      </footer>

    </main>
  )
}
