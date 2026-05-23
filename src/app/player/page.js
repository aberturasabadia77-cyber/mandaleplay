'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Suspense } from 'react'

const ENERGIA_COLOR = { baja: '#4ade80', media: '#facc15', alta: '#f97316' }

// ── Dos bandejas: A y B alternadas ────────────────────────────────────────────
// Mientras A reproduce, B carga en silencio el siguiente video
// pausado en el segundo exacto de enganche (inicio).
// Al terminar A → B sube volumen y arranca, A pasa a cargar el siguiente.

function PlayerInner() {
  const router = useRouter()

  // Referencias de los dos iframes
  const divA       = useRef(null)
  const divB       = useRef(null)
  const playerA    = useRef(null)
  const playerB    = useRef(null)
  const activa     = useRef('A')   // cuál bandeja está reproduciendo
  const iniciando  = useRef(false)
  const listos     = useRef(0)     // cuántos players están listos (espera los 2)

  const cancionesR = useRef([])
  const indiceR    = useRef(0)
  const skipTimerR = useRef(null)
  const loadTimerR = useRef(null)
  const fadeTimer  = useRef(null)
  const progresoT  = useRef(null)
  const prefetchCache = useRef({}) // { indice: videoId }

  const [canciones,    setCanciones]    = useState([])
  const [indiceActual, setIndiceActual] = useState(0)
  const [nombreEvento, setNombreEvento] = useState('')
  const [estado,       setEstado]       = useState('cargando')
  const [progreso,     setProgreso]     = useState(0)

  // Leer sessionStorage
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('mandale_plan')
      if (!raw) return
      const { canciones: lista, nombre } = JSON.parse(raw)
      if (nombre) setNombreEvento(nombre)
      if (lista?.length) { setCanciones(lista); cancionesR.current = lista }
    } catch (e) { console.error(e) }
  }, [])

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const getActivo   = () => activa.current === 'A' ? playerA.current : playerB.current
  const getEspera   = () => activa.current === 'A' ? playerB.current : playerA.current

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

  // Busca videoId y guarda en cache
  const buscarVideoId = async (idx) => {
    if (prefetchCache.current[idx]) return prefetchCache.current[idx]
    const lista = cancionesR.current
    if (idx < 0 || idx >= lista.length) return null
    const c     = lista[idx]
    const query = `${c.titulo} ${c.artista} audio`
    try {
      const res  = await fetch(`/api/buscar?q=${encodeURIComponent(query)}`)
      const json = await res.json()
      if (json.videoId) { prefetchCache.current[idx] = json.videoId }
      return json.videoId || null
    } catch { return null }
  }

  // Crossfade: baja el activo, sube el que espera
  const crossfade = (duracion = 1500) => {
    const activo = getActivo()
    const espera = getEspera()
    if (!activo || !espera) return

    const pasos  = 20
    const intervalo = duracion / pasos
    let paso = 0

    const tick = setInterval(() => {
      paso++
      const volEspera = Math.round((paso / pasos) * 100)
      const volActivo = Math.round(((pasos - paso) / pasos) * 100)
      try {
        espera.setVolume(volEspera)
        activo.setVolume(volActivo)
      } catch {}
      if (paso >= pasos) {
        clearInterval(tick)
        try { activo.pauseVideo(); activo.setVolume(0) } catch {}
      }
    }, intervalo)
  }

  // Pre-carga la bandeja en espera con el siguiente video
  const precargarEnEspera = async (idx) => {
    const espera  = getEspera()
    const lista   = cancionesR.current
    if (!espera || idx < 0 || idx >= lista.length) return

    const videoId = await buscarVideoId(idx)
    if (!videoId) return

    const inicio = lista[idx].inicio || 0
    try {
      // Carga el video en silencio y pausado en el segundo de enganche
      espera.setVolume(0)
      espera.cueVideoById({ videoId, startSeconds: inicio })
      console.log(`Bandeja ${activa.current === 'A' ? 'B' : 'A'} precargada: [${idx}] ${lista[idx].titulo}`)
    } catch (e) { console.warn('Error precargando:', e) }
  }

  // Inicia el seguimiento de progreso y dispara la precarga al 70%
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

      // Al 70% → precargar el siguiente en la bandeja en espera
      if (pct > 0.7 && !precargado) {
        precargado = true
        const sig = indiceR.current + 1
        precargarEnEspera(sig)
      }

      // Al 90% → hacer play en silencio para terminar de bufferear
      if (pct > 0.9) {
        const espera = getEspera()
        try {
          const s = espera?.getPlayerState?.()
          if (s === 5) { // 5 = cued (listo para reproducir)
            espera.playVideo()
            espera.setVolume(0)
          }
        } catch {}
      }
    }, 800)
  }

  // Carga una canción en la bandeja activa con crossfade
  const cargarPorIndice = async (idx, sinCrossfade = false) => {
    const lista = cancionesR.current
    if (idx < 0 || idx >= lista.length) return

    limpiarTimers()
    indiceR.current = idx
    setIndiceActual(idx)
    setProgreso(0)

    const lista_c  = lista[idx]
    const videoId  = await buscarVideoId(idx)

    if (!videoId) {
      setEstado('error')
      agendarAutoSkip(1000)
      return
    }

    const espera = getEspera()
    const activo = getActivo()

    // ¿El video ya está precargado en la bandeja en espera?
    const yaPrecargado = prefetchCache.current[idx] &&
      espera?.getPlayerState?.() !== undefined

    if (!sinCrossfade && yaPrecargado) {
      // Crossfade suave: espera ya tiene el video listo
      setEstado('playing')
      try {
        espera.setVolume(0)
        espera.playVideo()
      } catch {}
      crossfade(1200)
      // Swap de bandejas
      activa.current = activa.current === 'A' ? 'B' : 'A'
      iniciarProgreso()
    } else {
      // Carga normal en la bandeja activa
      setEstado('cargando')
      try {
        activo.setVolume(100)
        activo.loadVideoById({ videoId, startSeconds: lista_c.inicio || 0 })
      } catch {}

      loadTimerR.current = setTimeout(() => {
        const s = getActivo()?.getPlayerState?.()
        if (s !== 1 && s !== 3) agendarAutoSkip(0)
      }, 10000)
    }

    // Precarga inmediata del siguiente
    setTimeout(() => precargarEnEspera(idx + 1), 2000)
  }

  // ── Init de los dos players ──────────────────────────────────────────────────
  useEffect(() => {
    if (canciones.length === 0 || iniciando.current) return
    iniciando.current = true

    const onPlayerListo = () => {
      listos.current++
      if (listos.current < 2) return // esperar que los dos estén listos
      // Los dos players están listos → arrancar
      cargarPorIndice(0, true)
      setTimeout(() => precargarEnEspera(1), 3000)
    }

    const crearPlayers = () => {
      const config = (div, ref, esPrincipal) => {
        ref.current = new window.YT.Player(div, {
          height: '100%', width: '100%',
          playerVars: {
            autoplay: esPrincipal ? 1 : 0,
            controls: 0, rel: 0,
            modestbranding: 1, iv_load_policy: 3,
            fs: 0, disablekb: 1, playsinline: 1,
          },
          events: {
            onReady: onPlayerListo,
            onStateChange: ({ data }) => {
              const S = window.YT.PlayerState
              // Solo escuchar eventos del player ACTIVO
              const esActivo = (esPrincipal && activa.current === 'A') ||
                               (!esPrincipal && activa.current === 'B')
              if (!esActivo) return

              if (data === S.PLAYING) {
                limpiarTimers()
                setEstado('playing')
                iniciarProgreso()
              }
              if (data === S.PAUSED) { clearInterval(progresoT.current) }
              if (data === S.ENDED) {
                // Si la bandeja en espera ya tiene el siguiente → crossfade
                const sig = indiceR.current + 1
                if (sig < cancionesR.current.length) {
                  cargarPorIndice(sig)
                }
              }
            },
            onError: () => {
              const esActivo = (esPrincipal && activa.current === 'A') ||
                               (!esPrincipal && activa.current === 'B')
              if (!esActivo) return
              setEstado('error')
              delete prefetchCache.current[indiceR.current]
              agendarAutoSkip(800)
            },
          },
        })
      }

      crearPlayers_inner = () => {
        config(divA.current, playerA, true)
        config(divB.current, playerB, false)
      }
      crearPlayers_inner()
    }

    let crearPlayers_inner = () => {}

    if (window.YT?.Player) {
      crearPlayers()
    } else {
      const tag = document.createElement('script')
      tag.src   = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
      window.onYouTubeIframeAPIReady = crearPlayers
    }

    return limpiarTimers
  }, [canciones])

  const actual      = canciones[indiceActual] || {}
  const energyColor = ENERGIA_COLOR[actual.energia] || '#d4a843'

  return (
    <main style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #1a1a1a', flexShrink: 0 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: '1px solid #333', color: '#888', padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px' }}>← Plan</button>
        <span style={{ color: '#888', fontSize: '13px', flex: 1, textAlign: 'center', padding: '0 10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nombreEvento}</span>
        <span style={{ color: '#555', fontSize: '13px', flexShrink: 0 }}>{indiceActual + 1} / {canciones.length}</span>
      </div>

      {/* Dos iframes — solo se ve el activo */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '640px', margin: '0 auto', flexShrink: 0 }}>
        <div style={{ paddingTop: '56.25%', position: 'relative', background: '#111' }}>

          {/* Bandeja A */}
          <div ref={divA} style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            zIndex: activa.current === 'A' ? 2 : 1,
          }} />

          {/* Bandeja B */}
          <div ref={divB} style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            zIndex: activa.current === 'B' ? 2 : 1,
          }} />

          {/* Overlays */}
          {estado === 'error' && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,10,0.93)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>
              <div style={{ fontSize: '34px', marginBottom: '10px' }}>⚠️</div>
              <p style={{ color: '#aaa', fontSize: '14px', margin: '0 0 6px' }}>Video no disponible</p>
              <p style={{ color: '#555', fontSize: '12px' }}>Pasando a la siguiente canción...</p>
            </div>
          )}
          {estado === 'cargando' && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,10,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20, pointerEvents: 'none' }}>
              <span style={{ color: '#d4a843', fontSize: '14px', letterSpacing: '1px' }}>Buscando...</span>
            </div>
          )}
        </div>

        {/* Barra de progreso */}
        <div style={{ height: '3px', background: '#1a1a1a' }}>
          <div style={{ height: '100%', background: energyColor, width: `${progreso}%`, transition: 'width .8s linear' }} />
        </div>
      </div>

      {/* Info */}
      <div style={{ textAlign: 'center', padding: '16px 20px 4px' }}>
        {actual.bloque && (
          <div style={{ fontSize: '10px', letterSpacing: '2px', marginBottom: '6px', textTransform: 'uppercase', color: energyColor }}>
            {actual.bloque}
          </div>
        )}
        <div style={{ fontSize: '19px', fontWeight: '300', lineHeight: 1.3, marginBottom: '6px' }}>
          {actual.titulo} <span style={{ color: '#555' }}>—</span> {actual.artista}
        </div>
        {actual.bpm && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#111', border: `1px solid ${energyColor}44`, borderRadius: '100px', padding: '4px 12px' }}>
            <span style={{ fontSize: '10px', color: energyColor }}>♩</span>
            <span style={{ fontSize: '12px', color: energyColor, fontWeight: '600' }}>{actual.bpm} BPM</span>
          </div>
        )}
      </div>

      {/* Controles */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '28px', alignItems: 'center', padding: '14px 0 18px' }}>
        <button onClick={() => cargarPorIndice(indiceActual - 1, true)} disabled={indiceActual === 0}
          style={{ background: 'none', border: 'none', color: indiceActual === 0 ? '#2a2a2a' : '#666', fontSize: '26px', cursor: indiceActual === 0 ? 'default' : 'pointer' }}>⏮</button>
        <button onClick={() => {
          const p = getActivo()
          const s = p?.getPlayerState?.()
          if (s === 1) p.pauseVideo()
          else p?.playVideo()
        }} style={{ background: energyColor, border: 'none', color: '#000', width: '58px', height: '58px', borderRadius: '50%', fontSize: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 20px ${energyColor}44`, transition: 'background .3s' }}>▶</button>
        <button onClick={() => cargarPorIndice(indiceActual + 1, true)} disabled={indiceActual === canciones.length - 1}
          style={{ background: 'none', border: 'none', color: indiceActual === canciones.length - 1 ? '#2a2a2a' : '#666', fontSize: '26px', cursor: indiceActual === canciones.length - 1 ? 'default' : 'pointer' }}>⏭</button>
      </div>

      {/* Cola */}
      <div style={{ flex: 1, overflowY: 'auto', maxWidth: '640px', width: '100%', margin: '0 auto', padding: '0 12px 40px' }}>
        <div style={{ fontSize: '10px', color: '#444', letterSpacing: '2px', marginBottom: '10px', padding: '0 4px' }}>
          COLA · {canciones.length} CANCIONES
        </div>
        {canciones.map((c, i) => {
          const esActual = i === indiceActual
          const color    = ENERGIA_COLOR[c.energia] || '#d4a843'
          const enCache  = !!prefetchCache.current[i]
          return (
            <div key={i} onClick={() => cargarPorIndice(i, true)} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 10px', borderRadius: '8px', cursor: 'pointer',
              background: esActual ? '#1a1400' : 'transparent',
              borderLeft: esActual ? `3px solid ${color}` : '3px solid transparent',
              marginBottom: '1px', transition: 'background .15s',
            }}
              onMouseEnter={e => { if (!esActual) e.currentTarget.style.background = '#141414' }}
              onMouseLeave={e => { if (!esActual) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ color: '#333', fontSize: '11px', minWidth: '18px', textAlign: 'right' }}>{i + 1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', color: esActual ? '#fff' : '#bbb', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {c.titulo} <span style={{ color: '#444' }}>—</span> {c.artista}
                </div>
                <div style={{ fontSize: '10px', color: '#444' }}>{c.bloque}</div>
              </div>
              {c.bpm && (
                <span style={{ fontSize: '10px', color: esActual ? color : '#333', flexShrink: 0, fontWeight: esActual ? '600' : '400' }}>
                  {c.bpm}♩
                </span>
              )}
              {enCache && !esActual && <span style={{ fontSize: '7px', color: '#2a2a2a' }} title="Precargado">●</span>}
              {esActual && <span style={{ color, fontSize: '8px' }}>●</span>}
            </div>
          )
        })}
      </div>
    </main>
  )
}

export default function PlayerPage() {
  return (
    <Suspense fallback={<div style={{ background: '#0a0a0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: '14px' }}>Cargando player...</div>}>
      <PlayerInner />
    </Suspense>
  )
}
