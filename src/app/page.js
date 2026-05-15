'use client'

import { useState, useEffect } from 'react'

const OCASIONES = [
  { id:"romantica", emoji:"🕯️", nombre:"Velada romántica",   sub:"Para dos personas",           color:"#8B3A3A" },
  { id:"chicas",    emoji:"💃",  nombre:"Juntada de chicas",  sub:"Solo entre ellas",            color:"#6B3A8B" },
  { id:"parejas",   emoji:"👫",  nombre:"Juntada de parejas", sub:"Grupos mixtos",               color:"#3A6B5A" },
  { id:"cumple",    emoji:"🎂",  nombre:"Cumpleaños",         sub:"El festejado en el centro",   color:"#8B6A2A" },
  { id:"quincho",   emoji:"🔥",  nombre:"Quincho / Asado",    sub:"Largo y relajado",            color:"#7A3A1A" },
  { id:"after",     emoji:"🌙",  nombre:"After / Previa",     sub:"Energía desde el arranque",   color:"#2A2A6B" },
  { id:"familiar",  emoji:"👨‍👩‍👧‍👦", nombre:"Reunión familiar",  sub:"Todas las edades",            color:"#2A6B3A" },
  { id:"corp",      emoji:"🏢",  nombre:"Corporativo",        sub:"Profesional e inclusivo",     color:"#2A4A6B" },
]

const PASOS = [
  { n:"01", emoji:"🎉", titulo:"Contás qué festejás",   desc:"5 preguntas simples. Tipo de evento, cuánta gente, qué música les gusta. Menos de 2 minutos." },
  { n:"02", emoji:"🧠", titulo:"La IA arma todo",        desc:"El sistema genera el timeline completo: qué suena en cada momento, cuánto tiempo, qué energía, qué artistas." },
  { n:"03", emoji:"▶️", titulo:"Conectás YouTube",       desc:"Un click. Iniciás sesión con Google. El sistema crea las playlists en tu cuenta automáticamente." },
  { n:"04", emoji:"🔥", titulo:"Dale play y listo",      desc:"La música corre sola toda la noche. Vos disfrutás. Sin tocar nada más." },
]

const FAQS = [
  { q:"¿Necesito saber de música o tecnología?", a:"Para nada. Si podés pedir comida por app, podés usar Mandale Play. Son 5 preguntas y un botón." },
  { q:"¿Por qué necesito YouTube Premium?",      a:"Para que la música corra sin cortes, sin anuncios y de forma automática. Cuesta un mes de suscripción — mucho menos que un DJ. Y después lo cancelás." },
  { q:"¿Qué pasa si no me gusta alguna canción?",a:"Podés saltarla con un botón. El sistema sigue solo desde ahí." },
  { q:"¿Funciona en cualquier dispositivo?",     a:"Sí. En la compu, el celular o la tablet. Si lo conectás a la TV con HDMI o por Bluetooth al parlante, el efecto es completo." },
  { q:"¿Es gratis?",                             a:"Sí. Mandale Play es gratuito. Solo necesitás YouTube Premium que ya puede ser tuyo o de alguien conocido." },
  { q:"¿Puedo usarlo para un evento grande?",    a:"Funciona perfecto para eventos de 10 a 120 personas." },
]

export default function Home() {
  const [faqAbierta, setFaqAbierta] = useState(null)
  const [modal, setModal] = useState(false)

  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.1 })
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <main style={{ background:'var(--bg)', minHeight:'100vh', overflowX:'hidden' }}>

      {/* Grain */}
      <svg style={{ position:'fixed', inset:0, width:'100%', height:'100%', opacity:0.022, pointerEvents:'none', zIndex:100 }}>
        <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
        <rect width="100%" height="100%" filter="url(#g)"/>
      </svg>

      {/* NAV */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:50, padding:'18px 32px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(6,6,12,0.85)', backdropFilter:'blur(24px)', borderBottom:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <span style={{ fontSize:'20px', color:'var(--gold)' }}>▶</span>
          <span style={{ fontFamily:"'Playfair Display',serif", fontSize:'18px' }}>Mandale Play</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'20px' }}>
          <a href="#como" style={{ color:'var(--muted)', fontSize:'13px', textDecoration:'none' }}>Cómo funciona</a>
          <a href="#ocasiones" style={{ color:'var(--muted)', fontSize:'13px', textDecoration:'none' }}>Ocasiones</a>
          <a href="#faq" style={{ color:'var(--muted)', fontSize:'13px', textDecoration:'none' }}>FAQ</a>
          <button onClick={() => setModal(true)} style={{ background:'var(--gold)', color:'#1a1200', border:'none', padding:'10px 22px', borderRadius:'100px', fontSize:'13px', fontWeight:'600', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
            Crear mi evento
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight:'100vh', display:'flex', alignItems:'center', position:'relative', overflow:'hidden', paddingTop:'80px' }}>
        <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
          <div style={{ position:'absolute', width:'800px', height:'800px', borderRadius:'50%', filter:'blur(160px)', opacity:0.06, background:'var(--gold)', top:'-200px', left:'-200px', animation:'orb 14s ease-in-out infinite' }}/>
          <div style={{ position:'absolute', width:'500px', height:'500px', borderRadius:'50%', filter:'blur(130px)', opacity:0.04, background:'#a078e8', bottom:'-100px', right:'-100px', animation:'orb 18s ease-in-out infinite reverse' }}/>
        </div>

        <div style={{ maxWidth:'900px', margin:'0 auto', padding:'0 32px', position:'relative', zIndex:1 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'var(--gold-dim)', border:'1px solid rgba(232,201,122,0.2)', borderRadius:'100px', padding:'7px 18px', marginBottom:'32px', animation:'fadeIn .6s ease' }}>
            <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'var(--gold)', animation:'pulse 2s ease infinite' }}/>
            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'10px', letterSpacing:'3px', color:'var(--gold)' }}>DJ AUTOMÁTICO CON IA · GRATIS</span>
          </div>

          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(42px,7vw,80px)', fontWeight:'300', lineHeight:1.1, letterSpacing:'-0.5px', marginBottom:'24px', animation:'fadeUp .6s ease' }}>
            La música de tu fiesta,<br/>
            <em style={{ color:'var(--gold)', fontStyle:'italic' }}>sin DJ y sin vueltas.</em>
          </h1>

          <p style={{ fontSize:'clamp(16px,2vw,20px)', color:'var(--muted)', lineHeight:1.65, maxWidth:'560px', marginBottom:'40px', animation:'fadeUp .7s ease' }}>
            Contanos qué festejás. La IA arma el timeline, elige la música y la reproduce sola toda la noche. Vos solo disfrutás.
          </p>

          <div style={{ display:'flex', gap:'12px', flexWrap:'wrap', marginBottom:'56px', animation:'fadeUp .8s ease' }}>
            <button onClick={() => setModal(true)} style={{ background:'var(--gold)', color:'#1a1200', border:'none', padding:'16px 36px', borderRadius:'100px', fontSize:'15px', fontWeight:'600', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", display:'flex', alignItems:'center', gap:'8px', boxShadow:'0 8px 40px rgba(232,201,122,0.2)' }}>
              <span style={{ fontSize:'18px' }}>▶</span> Crear mi evento gratis
            </button>
            <a href="#como" style={{ background:'var(--surface)', border:'1px solid var(--border)', color:'var(--muted)', padding:'16px 28px', borderRadius:'100px', fontSize:'14px', textDecoration:'none', display:'flex', alignItems:'center', gap:'6px' }}>
              Ver cómo funciona ↓
            </a>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:'16px', animation:'fadeUp .9s ease' }}>
            <div style={{ display:'flex' }}>
              {['🧑','👩','👨','👩','🧑'].map((e,i)=>(
                <div key={i} style={{ width:'32px', height:'32px', borderRadius:'50%', background:`hsl(${i*40+20},40%,25%)`, border:'2px solid var(--bg)', marginLeft:i>0?'-8px':'0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px' }}>{e}</div>
              ))}
            </div>
            <p style={{ fontSize:'13px', color:'var(--muted)' }}>
              <strong style={{ color:'var(--text)' }}>+2.400 eventos</strong> musicalizados este mes
            </p>
          </div>
        </div>

        <div style={{ position:'absolute', bottom:'32px', left:'50%', transform:'translateX(-50%)', display:'flex', flexDirection:'column', alignItems:'center', gap:'6px', color:'var(--dim)', animation:'float 2.5s ease-in-out infinite' }}>
          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'9px', letterSpacing:'3px' }}>SCROLL</span>
          <div style={{ width:'1px', height:'32px', background:'linear-gradient(to bottom, var(--dim), transparent)' }}/>
        </div>
      </section>

      {/* MARQUEE */}
      <div style={{ borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)', padding:'16px 0', overflow:'hidden', background:'var(--bg2)' }}>
        <div style={{ display:'flex', gap:'48px', animation:'marquee 20s linear infinite', whiteSpace:'nowrap', width:'max-content' }}>
          {[...Array(2)].map((_,i)=>
            ["🕯️ Velada romántica","💃 Juntada de chicas","👫 Juntada de parejas","🎂 Cumpleaños","🔥 Quincho","🌙 After / Previa","👨‍👩‍👧‍👦 Reunión familiar","🏢 Corporativo"].map((item,j)=>(
              <span key={`${i}-${j}`} style={{ fontFamily:"'DM Mono',monospace", fontSize:'12px', color:'var(--dim)', letterSpacing:'2px' }}>{item}</span>
            ))
          )}
        </div>
      </div>

      {/* CÓMO FUNCIONA */}
      <section id="como" style={{ padding:'100px 32px', background:'var(--bg2)' }}>
        <div style={{ maxWidth:'900px', margin:'0 auto' }}>
          <div className="reveal" style={{ textAlign:'center', marginBottom:'64px' }}>
            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'10px', letterSpacing:'4px', color:'var(--dim)', display:'block', marginBottom:'16px' }}>CÓMO FUNCIONA</span>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(28px,4vw,44px)', fontWeight:'300' }}>Cuatro pasos. Sin complicaciones.</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'20px' }}>
            {PASOS.map((p,i)=>(
              <div key={i} className="reveal" style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'20px', padding:'32px 24px', transitionDelay:`${i*0.12}s` }}>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'11px', color:'var(--gold)', letterSpacing:'2px', marginBottom:'20px', opacity:0.7 }}>{p.n}</div>
                <div style={{ fontSize:'36px', marginBottom:'16px' }}>{p.emoji}</div>
                <h3 style={{ fontSize:'15px', fontWeight:'500', marginBottom:'10px' }}>{p.titulo}</h3>
                <p style={{ fontSize:'13px', color:'var(--muted)', lineHeight:1.6 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OCASIONES */}
      <section id="ocasiones" style={{ padding:'100px 32px' }}>
        <div style={{ maxWidth:'900px', margin:'0 auto' }}>
          <div className="reveal" style={{ textAlign:'center', marginBottom:'56px' }}>
            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'10px', letterSpacing:'4px', color:'var(--dim)', display:'block', marginBottom:'16px' }}>OCASIONES</span>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(28px,4vw,44px)', fontWeight:'300' }}>Para cada momento, la música exacta.</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'12px' }}>
            {OCASIONES.map((oc,i)=>(
              <button key={i} className="reveal" onClick={() => setModal(true)}
                style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'16px', padding:'24px 20px', cursor:'pointer', textAlign:'left', color:'var(--text)', fontFamily:"'DM Sans',sans-serif", transition:'all .2s', transitionDelay:`${i*0.06}s` }}
                onMouseEnter={e => { e.currentTarget.style.background=`${oc.color}18`; e.currentTarget.style.borderColor=`${oc.color}50`; e.currentTarget.style.transform='translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background='var(--surface)'; e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='translateY(0)'; }}
              >
                <div style={{ fontSize:'28px', marginBottom:'12px' }}>{oc.emoji}</div>
                <div style={{ fontSize:'14px', fontWeight:'500' }}>{oc.nombre}</div>
                <div style={{ fontSize:'11px', color:'var(--dim)', marginTop:'4px', fontFamily:"'DM Mono',monospace", letterSpacing:'1px' }}>CREAR →</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ padding:'100px 32px', background:'var(--bg2)' }}>
        <div style={{ maxWidth:'680px', margin:'0 auto' }}>
          <div className="reveal" style={{ textAlign:'center', marginBottom:'56px' }}>
            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'10px', letterSpacing:'4px', color:'var(--dim)', display:'block', marginBottom:'16px' }}>FAQ</span>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(28px,4vw,44px)', fontWeight:'300' }}>Todo lo que querés saber.</h2>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {FAQS.map((faq,i)=>(
              <div key={i} className="reveal" style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'14px', overflow:'hidden', transitionDelay:`${i*0.06}s` }}>
                <button onClick={() => setFaqAbierta(faqAbierta===i?null:i)} style={{ width:'100%', padding:'20px 22px', background:'none', border:'none', color:'var(--text)', fontFamily:"'DM Sans',sans-serif", fontSize:'14px', textAlign:'left', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'12px' }}>
                  <span style={{ fontWeight:'500' }}>{faq.q}</span>
                  <span style={{ color:'var(--gold)', fontSize:'18px', transition:'transform .3s', transform:faqAbierta===i?'rotate(45deg)':'rotate(0)', flexShrink:0 }}>+</span>
                </button>
                {faqAbierta===i && (
                  <div style={{ padding:'0 22px 20px', animation:'fadeIn .2s ease' }}>
                    <p style={{ fontSize:'13px', color:'var(--muted)', lineHeight:1.7 }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding:'100px 32px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
          <div style={{ position:'absolute', width:'600px', height:'600px', borderRadius:'50%', filter:'blur(140px)', opacity:0.08, background:'var(--gold)', top:'50%', left:'50%', transform:'translate(-50%,-50%)', animation:'orb 10s ease-in-out infinite' }}/>
        </div>
        <div className="reveal" style={{ maxWidth:'680px', margin:'0 auto', textAlign:'center', position:'relative', zIndex:1 }}>
          <div style={{ fontSize:'48px', marginBottom:'24px', animation:'float 3s ease-in-out infinite' }}>▶</div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(32px,5vw,56px)', fontWeight:'300', lineHeight:1.15, marginBottom:'20px' }}>
            Tu próxima fiesta merece<br/><em style={{ color:'var(--gold)' }}>buena música.</em>
          </h2>
          <p style={{ color:'var(--muted)', fontSize:'16px', lineHeight:1.6, marginBottom:'36px', maxWidth:'420px', margin:'0 auto 36px' }}>
            Sin DJ. Sin vueltas. Sin gastar de más.
          </p>
          <button onClick={() => setModal(true)} style={{ background:'var(--gold)', color:'#1a1200', border:'none', padding:'18px 48px', borderRadius:'100px', fontSize:'16px', fontWeight:'600', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", boxShadow:'0 8px 60px rgba(232,201,122,0.3)' }}>
            Mandale play a tu fiesta →
          </button>
          <p style={{ color:'var(--dim)', fontSize:'12px', marginTop:'16px', fontFamily:"'DM Mono',monospace", letterSpacing:'1px' }}>
            GRATIS · SIN REGISTRO · LISTO EN 2 MINUTOS
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:'1px solid var(--border)', padding:'32px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'16px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <span style={{ fontSize:'16px', color:'var(--gold)' }}>▶</span>
          <span style={{ fontFamily:"'Playfair Display',serif", fontSize:'16px' }}>Mandale Play</span>
        </div>
        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'10px', letterSpacing:'3px', color:'var(--dim)' }}>HECHO EN ARGENTINA · 2026</span>
        <div style={{ display:'flex', gap:'20px' }}>
          {['Instagram','TikTok','WhatsApp'].map(red=>(
            <a key={red} href="#" style={{ color:'var(--dim)', fontSize:'12px', textDecoration:'none' }}>{red}</a>
          ))}
        </div>
      </footer>

      {/* MODAL */}
      {modal && (
        <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(6,6,12,0.95)', backdropFilter:'blur(24px)', display:'flex', alignItems:'center', justifyContent:'center', animation:'fadeIn .3s ease' }}>
          <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'24px', padding:'48px 40px', maxWidth:'480px', width:'90%', textAlign:'center' }}>
            <div style={{ fontSize:'48px', marginBottom:'16px' }}>▶</div>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:'24px', fontWeight:'300', marginBottom:'10px' }}>¡Ya casi!</h3>
            <p style={{ color:'var(--muted)', fontSize:'14px', lineHeight:1.6, marginBottom:'28px' }}>
              El producto está listo. Estamos terminando los últimos detalles para el lanzamiento oficial. Dejanos tu mail y te avisamos cuando esté disponible.
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              <input type="email" placeholder="tu@email.com" style={{ padding:'14px 18px', borderRadius:'12px', border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text)', fontSize:'14px', fontFamily:"'DM Sans',sans-serif", outline:'none', textAlign:'center' }}/>
              <button style={{ background:'var(--gold)', color:'#1a1200', border:'none', padding:'14px', borderRadius:'100px', fontSize:'14px', fontWeight:'600', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                Avisame cuando esté →
              </button>
              <button onClick={() => setModal(false)} style={{ background:'none', border:'1px solid var(--border)', color:'var(--muted)', padding:'12px', borderRadius:'100px', fontSize:'13px', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
