'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Suspense } from 'react'

function PlayerInner() {
  const router = useRouter()

  const ytDivRef   = useRef(null)
  const playerRef  = useRef(null)
  const cancionesR = useRef([])
  const indiceR    = useRef(0)
  const skipTimerR = useRef(null)
  const loadTimerR = useRef(null)
  const iniciando  = useRef(false)

  const [canciones,    setCanciones]    = useState([])
  const [indiceActual, setIndiceActual] = useState(0)
  const [nombreEvento, setNombreEvento] = useState('')
  const [estado,       setEstado]       = useState('cargando')

  // ── Leer datos desde sessionStorage ──────────────────────────────────────
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('mandale_plan')
      if (!raw) { console.error('No hay datos en sessionStorage'); return }
      const { canciones: lista, nombre } = JSON.parse(raw)
      if (nombre) setNombreEvento(nombre)
      if (lista?.length) { setCanciones(lista); cancionesR.current = lista }
    } catch (e) { console.error('Error leyendo sessionStorage:', e) }
  }, [])

  // ── Helpers ───────────────────────────────────────────────────────────────
  const limpiarTimers = () => {
    clearTimeout(skipTimerR.current)
    clearTimeout(loadTimerR.current)
  }

  const agendarAutoSkip = (ms = 1800) => {
    limpiarTimers()
    skipTimerR.current = setTimeout(() => {
      const siguiente = indiceR.current + 1
      if (siguiente < cancionesR.current.length) cargarPorIndice(siguiente)
    }, ms)
  }

  const cargarPorIndice = async (idx) => {
    const lista = cancionesR.current
    if (!playerRef.current || idx < 0 || idx >= lista.length) return

    limpiarTimers()
    indiceR.current = idx
    setIndiceActual(idx)
    setEstado('cargando')

    const c     = lista[idx]
    const query = `${c.titulo} ${c.artista} audio`

    try {
      // Buscar el videoId desde el servidor (sin API key)
      const res  = await fetch(`/api/buscar?q=${encodeURIComponent(query)}`)
      const json = await res.json()

      if (!json.videoId) {
        console.warn('Sin videoId para:', query)
        agendarAutoSkip(500)
        return
      }

      playerRef.current.loadVideoById({
        videoId:      json.videoId,
        startSeconds: c.inicio || 0,
      })

      // Si en 10s no arrancó → skip
      loadTimerR.current = setTimeout(() => {
        const s = playerRef.current?.getPlayerState?.()
        if (s !== 1 && s !== 3) agendarAutoSkip(0)
      }, 10000)

    } catch (e) {
      console.warn('Error buscando canción:', e)
      agendarAutoSkip(1500)
    }
  }

  // ── Init IFrame API ───────────────────────────────────────────────────────
  useEffect(() => {
    if (canciones.length === 0 || iniciando.current) return
    iniciando.current = true

    const crearPlayer = () => {
      if (playerRef.current) return
      playerRef.current = new window.YT.Player(ytDivRef.current, {
        height: '100%',
        width:  '100%',
        playerVars: {
          autoplay: 1, controls: 0, rel: 0,
          modestbranding: 1, iv_load_policy: 3,
          fs: 0, disablekb: 1, playsinline: 1,
        },
        events: {
          onReady: () => cargarPorIndice(0),
          onStateChange: ({ data }) => {
            const S = window.YT.PlayerState
            if (data === S.PLAYING) { limpiarTimers(); setEstado('playing') }
            if (data === S.ENDED)   { agendarAutoSkip(800) }
          },
          onError: ({ data }) => {
            console.warn('YT error:', data)
            setEstado('error')
            agendarAutoSkip(1800)
          },
        },
      })
    }

    if (window.YT?.Player) crearPlayer()
    else {
      const tag = document.createElement('script')
      tag.src   = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
      window.onYouTubeIframeAPIReady = crearPlayer
    }

    return limpiarTimers
  }, [canciones])

  const actual = canciones[indiceActual] || {}

  return (
    <main style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #1a1a1a', flexShrink: 0 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: '1px solid #333', color: '#888', padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px' }}>← Plan</button>
        <span style={{ color: '#888', fontSize: '13px', flex: 1, textAlign: 'center', padding: '0 10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nombreEvento}</span>
        <span style={{ color: '#555', fontSize: '13px', flexShrink: 0 }}>{indiceActual + 1} / {canciones.length}</span>
      </div>

      {/* Video */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '640px', margin: '0 auto', flexShrink: 0 }}>
        <div style={{ paddingTop: '56.25%', position: 'relative', background: '#111' }}>
          <div ref={ytDivRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />

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
      </div>

      {/* Info */}
      <div style={{ textAlign: 'center', padding: '18px 20px 4px' }}>
        {actual.bloque && (
          <div style={{ fontSize: '10px', color: '#d4a843', letterSpacing: '2px', marginBottom: '6px', textTransform: 'uppercase' }}>
            {actual.bloque} · {actual.momento}
          </div>
        )}
        <div style={{ fontSize: '19px', fontWeight: '300', lineHeight: 1.3 }}>
          {actual.titulo} <span style={{ color: '#555' }}>—</span> {actual.artista}
        </div>
      </div>

      {/* Controles */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '28px', alignItems: 'center', padding: '16px 0 20px' }}>
        <button onClick={() => cargarPorIndice(indiceActual - 1)} disabled={indiceActual === 0}
          style={{ background: 'none', border: 'none', color: indiceActual === 0 ? '#2a2a2a' : '#666', fontSize: '26px', cursor: indiceActual === 0 ? 'default' : 'pointer' }}>⏮</button>
        <button onClick={() => {
          const s = playerRef.current?.getPlayerState?.()
          if (s === 1) playerRef.current.pauseVideo()
          else playerRef.current?.playVideo()
        }} style={{ background: '#d4a843', border: 'none', color: '#000', width: '58px', height: '58px', borderRadius: '50%', fontSize: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(212,168,67,0.3)' }}>▶</button>
        <button onClick={() => cargarPorIndice(indiceActual + 1)} disabled={indiceActual === canciones.length - 1}
          style={{ background: 'none', border: 'none', color: indiceActual === canciones.length - 1 ? '#2a2a2a' : '#666', fontSize: '26px', cursor: indiceActual === canciones.length - 1 ? 'default' : 'pointer' }}>⏭</button>
      </div>

      {/* Cola */}
      <div style={{ flex: 1, overflowY: 'auto', maxWidth: '640px', width: '100%', margin: '0 auto', padding: '0 12px 40px' }}>
        <div style={{ fontSize: '10px', color: '#444', letterSpacing: '2px', marginBottom: '10px', padding: '0 4px' }}>
          COLA · {canciones.length} CANCIONES
        </div>
        {canciones.map((c, i) => {
          const esActual = i === indiceActual
          return (
            <div key={i} onClick={() => cargarPorIndice(i)} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 10px', borderRadius: '8px', cursor: 'pointer',
              background: esActual ? '#1a1400' : 'transparent',
              borderLeft: esActual ? '3px solid #d4a843' : '3px solid transparent',
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
                <div style={{ fontSize: '10px', color: '#444' }}>{c.bloque} · {c.momento}</div>
              </div>
              {esActual && <span style={{ color: '#d4a843', fontSize: '8px' }}>●</span>}
            </div>
          )
        })}
      </div>
    </main>
  )
}

export default function PlayerPage() {
  return (
    <Suspense fallback={
      <div style={{ background: '#0a0a0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: '14px' }}>
        Cargando player...
      </div>
    }>
      <PlayerInner />
    </Suspense>
  )
}
