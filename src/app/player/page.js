'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Suspense } from 'react'

const NEON_CYAN   = '#00f5ff'
const NEON_VIOLET = '#8b5cf6'
const ENERGIA_COLOR = { baja: '#4ade80', media: '#facc15', alta: '#f97316' }

function PlayerInner() {
  const router = useRouter()

  const divA       = useRef(null)
  const divB       = useRef(null)
  const playerA    = useRef(null)
  const playerB    = useRef(null)
  const activa     = useRef('A')
  const iniciando  = useRef(false)
  const listos     = useRef(0)

  const cancionesR    = useRef([])
  const wakeLockR     = useRef(null)   // Wake Lock API
  const estadoR       = useRef('cargando') // ref para visibilitychange (evita closures viejos)
  const debiaSonar    = useRef(false)  // true cuando el player debería estar reproduciendo
  const indiceR       = useRef(0)
  const skipTimerR    = useRef(null)
  const loadTimerR    = useRef(null)
  const fadeTimer     = useRef(null)
  const progresoT     = useRef(null)
  const prefetchCache = useRef({})

  const [canciones,    setCanciones]    = useState([])
  const [indiceActual, setIndiceActual] = useState(0)
  const [nombreEvento, setNombreEvento] = useState('')
  const [estado,       setEstado]       = useState('cargando')
  const [progreso,     setProgreso]     = useState(0)
  const [bandejaVis,   setBandejaVis]   = useState('A')

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('mandale_plan')
      if (!raw) return
      const { canciones: lista, nombre } = JSON.parse(raw)
      if (nombre) setNombreEvento(nombre)
      if (lista?.length) { setCanciones(lista); cancionesR.current = lista }
    } catch (e) { console.error(e) }
  }, [])

  const getActivo = () => activa.current === 'A' ? playerA.current : playerB.current
  const getEspera = () => activa.current === 'A' ? playerB.current : playerA.current

  // Sincroniza estado + ref (evita closures viejos en visibilitychange)
  const setEstadoSync = (val) => {
    estadoR.current = val
    setEstado(val)
    if (val === 'playing') debiaSonar.current = true
    if (val === 'error')   debiaSonar.current = false
  }

  // Wake Lock API — evita que el navegador suspenda la pestaña
  const pedirWakeLock = async () => {
    try {
      if ('wakeLock' in navigator && !wakeLockR.current) {
        wakeLockR.current = await navigator.wakeLock.request('screen')
        console.log('Wake Lock activo')
      }
    } catch (e) { console.warn('Wake Lock no disponible:', e.message) }
  }

  const liberarWakeLock = () => {
    if (wakeLockR.current) {
      wakeLockR.current.release().catch(() => {})
      wakeLockR.current = null
    }
  }

  const limpiarTimers = () => {
    clearTimeout(skipTimerR.current)
    clearTimeout(loadTimerR.current)
    clearTimeout(fadeTimer.current)
    clearInterval(progresoT.current)
  }

  const agendarAutoSkip = (ms = 1500) => {
    limpiarTimers()
    skipTimerR.current = setTimeout(() => {
      const sig = indiceR.current + 1
      if (sig < cancionesR.current.length) cargarPorIndice(sig)
    }, ms)
  }

  const buscarVideoId = async (idx) => {
    if (prefetchCache.current[idx]) return prefetchCache.current[idx]
    const lista = cancionesR.current
    if (idx < 0 || idx >= lista.length) return null
    const c     = lista[idx]
    const query = `${c.titulo} ${c.artista} audio`
    try {
      const res  = await fetch(`/api/buscar?q=${encodeURIComponent(query)}`)
      const json = await res.json()
      if (json.videoId) prefetchCache.current[idx] = json.videoId
      return json.videoId || null
    } catch { return null }
  }

  const crossfade = (duracion = 1200) => {
    const act = getActivo()
    const esp = getEspera()
    if (!act || !esp) return
    const pasos = 20, intervalo = duracion / pasos
    let paso = 0
    const tick = setInterval(() => {
      paso++
      try {
        esp.setVolume(Math.round((paso / pasos) * 100))
        act.setVolume(Math.round(((pasos - paso) / pasos) * 100))
      } catch {}
      if (paso >= pasos) {
        clearInterval(tick)
        try { act.pauseVideo(); act.setVolume(0) } catch {}
      }
    }, intervalo)
  }

  const precargarEnEspera = async (idx) => {
    const espera = getEspera()
    const lista  = cancionesR.current
    if (!espera || idx < 0 || idx >= lista.length) return
    const videoId = await buscarVideoId(idx)
    if (!videoId) return
    try {
      espera.setVolume(0)
      espera.cueVideoById({ videoId, startSeconds: lista[idx].inicio || 0 })
    } catch {}
  }

  const iniciarProgreso = () => {
    clearInterval(progresoT.current)
    setProgreso(0)
    let precargado = false
    progresoT.current = setInterval(() => {
      const player = getActivo()
      if (!player) return
      const tiempo = player.getCurrentTime?.() || 0
      const total  = player.getDuration?.() || 1
      const pct    = tiempo / total
      setProgreso(pct * 100)
      if (pct > 0.7 && !precargado) {
        precargado = true
        precargarEnEspera(indiceR.current + 1)
      }
      if (pct > 0.9) {
        const esp = getEspera()
        try {
          if (esp?.getPlayerState?.() === 5) { esp.playVideo(); esp.setVolume(0) }
        } catch {}
      }
    }, 800)
  }

  const cargarPorIndice = async (idx, sinCrossfade = false) => {
    const lista = cancionesR.current
    if (idx < 0 || idx >= lista.length) return
    limpiarTimers()
    indiceR.current = idx
    setIndiceActual(idx)
    setProgreso(0)

    const videoId = await buscarVideoId(idx)
    if (!videoId) { setEstadoSync('error'); agendarAutoSkip(800); return }

    const espera = getEspera()
    const activo = getActivo()
    const yaPrecargado = !!prefetchCache.current[idx]

    if (!sinCrossfade && yaPrecargado && espera) {
      setEstadoSync('playing')
      try { espera.setVolume(0); espera.playVideo() } catch {}
      crossfade(1200)
      activa.current = activa.current === 'A' ? 'B' : 'A'
      setBandejaVis(activa.current)
      iniciarProgreso()
    } else {
      setEstadoSync('cargando')
      try { activo?.setVolume(100); activo?.loadVideoById({ videoId, startSeconds: lista[idx].inicio || 0 }) } catch {}
      loadTimerR.current = setTimeout(() => {
        const s = getActivo()?.getPlayerState?.()
        if (s !== 1 && s !== 3) agendarAutoSkip(0)
      }, 10000)
    }
    setTimeout(() => precargarEnEspera(idx + 1), 2000)
  }

  useEffect(() => {
    if (canciones.length === 0 || iniciando.current) return
    iniciando.current = true

    const onListo = () => {
      listos.current++
      if (listos.current === 1) {
        // Timeout: si en 6s no llega el segundo player, arrancar con uno solo
        setTimeout(() => {
          if (listos.current < 2) {
            console.log('Mobile fallback: arrancando con 1 player')
            cargarPorIndice(0, true)
          }
        }, 6000)
      }
      if (listos.current >= 2) {
        cargarPorIndice(0, true)
        setTimeout(() => precargarEnEspera(1), 3000)
      }
    }

    const crearPlayers = () => {
      const config = (div, ref, esPrincipal) => {
        ref.current = new window.YT.Player(div, {
          height: '100%', width: '100%',
          playerVars: { autoplay: esPrincipal ? 1 : 0, controls: 0, rel: 0, modestbranding: 1, iv_load_policy: 3, fs: 0, disablekb: 1, playsinline: 1 },
          events: {
            onReady: onListo,
            onStateChange: ({ data }) => {
              const S = window.YT.PlayerState
              const esActivo = (esPrincipal && activa.current === 'A') || (!esPrincipal && activa.current === 'B')
              if (!esActivo) return
              if (data === S.PLAYING) {
              limpiarTimers(); setEstadoSync('playing'); iniciarProgreso()
              pedirWakeLock() // activar wake lock cuando empieza a sonar
            }
              if (data === S.PAUSED)  { clearInterval(progresoT.current) }
              if (data === S.ENDED)   {
                const sig = indiceR.current + 1
                if (sig < cancionesR.current.length) cargarPorIndice(sig)
              }
            },
            onError: () => {
              const esActivo = (esPrincipal && activa.current === 'A') || (!esPrincipal && activa.current === 'B')
              if (!esActivo) return
              setEstadoSync('error')
              delete prefetchCache.current[indiceR.current]
              agendarAutoSkip(800)
            },
          },
        })
      }
      config(divA.current, playerA, true)
      config(divB.current, playerB, false)
    }

    if (window.YT?.Player) crearPlayers()
    else {
      const tag = document.createElement('script')
      tag.src   = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
      window.onYouTubeIframeAPIReady = crearPlayers
    }
    return limpiarTimers
  }, [canciones])

  // Page Visibility API — retoma si se cortó al volver a la pestaña
  useEffect(() => {
    const handleVisibility = async () => {
      if (document.visibilityState === 'visible') {
        // Re-pedir wake lock (se libera automáticamente al ocultar la pestaña)
        await pedirWakeLock()

        // Si debería estar sonando pero el player se detuvo → retomar
        if (debiaSonar.current) {
          const player = getActivo()
          const state  = player?.getPlayerState?.()
          // 2=paused, -1=unstarted, 0=ended → retomar
          if (state === 2 || state === -1 || state === 0) {
            console.log('Retomando reproducción al volver a la pestaña, estado:', state)
            setTimeout(() => {
              try { player?.playVideo?.() } catch(e) {}
            }, 400)
          }
        }
      } else {
        // Pestaña oculta: el wake lock se libera solo, actualizamos ref
        wakeLockR.current = null
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      liberarWakeLock()
    }
  }, []) // solo mount/unmount — usa refs para evitar closures viejos

  const actual      = canciones[indiceActual] || {}
  const energyColor = ENERGIA_COLOR[actual.energia] || NEON_CYAN

  return (
    <main style={{ background: '#060612', minHeight: '100vh', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid rgba(0,245,255,0.1)', flexShrink: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#666', padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px' }}>← Plan</button>
        <span style={{ color: '#888', fontSize: '13px', flex: 1, textAlign: 'center', padding: '0 10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nombreEvento}</span>
        <span style={{ color: '#444', fontSize: '13px', flexShrink: 0 }}>{indiceActual + 1} / {canciones.length}</span>
      </div>

      {/* Video — dos bandejas */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '640px', margin: '0 auto', flexShrink: 0 }}>
        <div style={{ paddingTop: '56.25%', position: 'relative', background: '#0a0a18' }}>
          <div ref={divA} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: bandejaVis === 'A' ? 2 : 1 }} />
          <div ref={divB} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: bandejaVis === 'B' ? 2 : 1 }} />

          {estado === 'error' && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(6,6,18,0.93)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>
              <div style={{ fontSize: '34px', marginBottom: '10px' }}>⚠️</div>
              <p style={{ color: '#aaa', fontSize: '14px', margin: '0 0 6px' }}>Video no disponible</p>
              <p style={{ color: '#555', fontSize: '12px' }}>Pasando a la siguiente canción...</p>
            </div>
          )}
          {estado === 'inicial' && (
            <div style={{ position:'absolute', inset:0, background:'rgba(6,6,18,0.85)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', zIndex:20, cursor:'pointer' }}
              onClick={() => { getActivo()?.playVideo?.() }}>
              <div style={{ width:70, height:70, borderRadius:'50%', background:'linear-gradient(135deg,#00f0ff,#8844ff)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, color:'#000', fontWeight:900 }}>▶</div>
              <p style={{ color:'rgba(200,230,255,0.6)', fontSize:13, marginTop:14, letterSpacing:1 }}>Tocá para reproducir</p>
            </div>
          )}
          {estado === 'cargando' && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(6,6,18,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20, pointerEvents: 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', border: `2px solid rgba(0,245,255,0.2)`, borderTop: `2px solid ${NEON_CYAN}`, borderRadius: '50%', animation: 'spin 1s linear infinite', boxShadow: `0 0 12px rgba(0,245,255,0.4)` }} />
                <span style={{ color: NEON_CYAN, fontSize: '13px', letterSpacing: '1px' }}>Buscando...</span>
              </div>
            </div>
          )}
        </div>

        {/* Barra de progreso neon */}
        <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)' }}>
          <div style={{ height: '100%', background: `linear-gradient(90deg, ${NEON_CYAN}, ${NEON_VIOLET})`, width: `${progreso}%`, transition: 'width .8s linear', boxShadow: `0 0 8px ${NEON_CYAN}` }} />
        </div>
      </div>

      {/* Info canción */}
      <div style={{ textAlign: 'center', padding: '16px 20px 4px' }}>
        {actual.bloque && (
          <div style={{ fontSize: '10px', letterSpacing: '2px', marginBottom: '6px', textTransform: 'uppercase', background: `linear-gradient(135deg, ${NEON_CYAN}, ${NEON_VIOLET})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {actual.bloque}
          </div>
        )}
        <div style={{ fontSize: '19px', fontWeight: '300', lineHeight: 1.3, marginBottom: '8px' }}>
          {actual.titulo} <span style={{ color: '#333' }}>—</span> {actual.artista}
        </div>
        {actual.bpm && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0,245,255,0.06)', border: `1px solid rgba(0,245,255,0.2)`, borderRadius: '100px', padding: '4px 14px', boxShadow: `0 0 12px rgba(0,245,255,0.1)` }}>
            <span style={{ fontSize: '10px', color: NEON_CYAN }}>♩</span>
            <span style={{ fontSize: '12px', color: NEON_CYAN, fontWeight: '600' }}>{actual.bpm ? `${actual.bpm} BPM` : '—'}</span>
          </div>
        )}
      </div>

      {/* Controles */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '28px', alignItems: 'center', padding: '14px 0 18px' }}>
        <button onClick={() => cargarPorIndice(indiceActual - 1, true)} disabled={indiceActual === 0}
          style={{ background: 'none', border: 'none', color: indiceActual === 0 ? '#1a1a2e' : '#555', fontSize: '26px', cursor: indiceActual === 0 ? 'default' : 'pointer' }}>⏮</button>
        <button onClick={() => {
          const p = getActivo()
          const s = p?.getPlayerState?.()
          if (s === 1) p.pauseVideo()
          else p?.playVideo()
        }} style={{
          background: `linear-gradient(135deg, ${NEON_CYAN}, ${NEON_VIOLET})`,
          border: 'none', color: '#000', width: '60px', height: '60px', borderRadius: '50%',
          fontSize: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 30px rgba(0,245,255,0.5), 0 0 60px rgba(139,92,246,0.3)`,
          transition: 'box-shadow .3s',
        }}>▶</button>
        <button onClick={() => cargarPorIndice(indiceActual + 1, true)} disabled={indiceActual === canciones.length - 1}
          style={{ background: 'none', border: 'none', color: indiceActual === canciones.length - 1 ? '#1a1a2e' : '#555', fontSize: '26px', cursor: indiceActual === canciones.length - 1 ? 'default' : 'pointer' }}>⏭</button>
      </div>

      {/* Cola */}
      <div style={{ flex: 1, overflowY: 'auto', maxWidth: '640px', width: '100%', margin: '0 auto', padding: '0 12px 40px' }}>
        <div style={{ fontSize: '10px', color: '#333', letterSpacing: '2px', marginBottom: '10px', padding: '0 4px' }}>
          COLA · {canciones.length} CANCIONES
        </div>
        {canciones.map((c, i) => {
          const esActual = i === indiceActual
          const enCache  = !!prefetchCache.current[i]
          return (
            <div key={i} onClick={() => cargarPorIndice(i, true)} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 10px', borderRadius: '8px', cursor: 'pointer',
              background: esActual ? 'rgba(0,245,255,0.06)' : 'transparent',
              borderLeft: esActual ? `3px solid ${NEON_CYAN}` : '3px solid transparent',
              marginBottom: '1px', transition: 'background .15s',
              boxShadow: esActual ? `inset 0 0 20px rgba(0,245,255,0.05)` : 'none',
            }}
              onMouseEnter={e => { if (!esActual) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
              onMouseLeave={e => { if (!esActual) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ color: '#2a2a4a', fontSize: '11px', minWidth: '18px', textAlign: 'right' }}>{i + 1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', color: esActual ? '#fff' : '#777', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {c.titulo} <span style={{ color: '#2a2a4a' }}>—</span> {c.artista}
                </div>
                <div style={{ fontSize: '10px', color: '#333' }}>{c.bloque}</div>
              </div>
              <span style={{ fontSize: '10px', color: c.bpm ? (esActual ? NEON_CYAN : '#2a2a4a') : '#1a1a3a', flexShrink: 0, fontWeight: esActual && c.bpm ? '600' : '400' }}>
                  {c.bpm ? `${c.bpm}♩` : '—'}
                </span>
              {enCache && !esActual && <span style={{ fontSize: '7px', color: '#1a1a3a' }} title="Precargado">●</span>}
              {esActual && <span style={{ color: NEON_CYAN, fontSize: '8px', filter: `drop-shadow(0 0 4px ${NEON_CYAN})` }}>●</span>}
            </div>
          )
        })}
      </div>
    </main>
  )
}

export default function PlayerPage() {
  return (
    <Suspense fallback={<div style={{ background: '#060612', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: '14px' }}>Cargando player...</div>}>
      <PlayerInner />
    </Suspense>
  )
}
