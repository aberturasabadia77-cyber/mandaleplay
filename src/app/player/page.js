'use client'

import { useState, useEffect, useRef } from 'react'

export default function Player() {
  const [plan, setPlan] = useState(null)
  const [songs, setSongs] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [activePlayer, setActivePlayer] = useState('A')

  const playerA = useRef(null)
  const playerB = useRef(null)
  const activeRef = useRef('A')
  const currentIndexRef = useRef(0)
  const songsRef = useRef([])
  const isTransitioning = useRef(false)
  const volumeInterval = useRef(null)

  // Cargar plan
  useEffect(() => {
    const saved = sessionStorage.getItem('mandaleplay_plan')
    if (!saved) { window.location.href = '/evento'; return }
    const p = JSON.parse(saved)
    setPlan(p)
    const all = []
    for (const bloque of p.bloques || []) {
      for (const c of bloque.canciones_sugeridas || []) {
        all.push({
          titulo: typeof c === 'string' ? c : c.titulo,
          inicio: typeof c === 'object' ? (c.inicio || 0) : 0,
          bloque: bloque.nombre,
          energia: bloque.energia
        })
      }
    }
    setSongs(all)
    songsRef.current = all
  }, [])

  // Cargar YouTube API
  useEffect(() => {
    if (!songs.length) return
    window.onYouTubeIframeAPIReady = initPlayers
    if (window.YT?.Player) { initPlayers(); return }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
  }, [songs])

  const makePlayerConfig = (onReadyCb) => ({
    playerVars: {
      autoplay: 0,
      controls: 0,
      rel: 0,
      modestbranding: 1,
      iv_load_policy: 3,
      playsinline: 1,
    },
    events: {
      onReady: onReadyCb,
      onStateChange: onStateChange,
      onError: onError,
    }
  })

  const initPlayers = () => {
    if (playerA.current) return

    playerA.current = new window.YT.Player('yt-a', makePlayerConfig((e) => {
      playerB.current = new window.YT.Player('yt-b', makePlayerConfig(() => {
        setIsReady(true)
        // Arrancar primera canción en A
        const first = songsRef.current[0]
        if (first) {
          playerA.current.setVolume(100)
          playerA.current.loadVideoByQuery({ query: first.titulo, startSeconds: first.inicio || 0 })
        }
        // Precargar segunda en B (sin reproducir)
        const second = songsRef.current[1]
        if (second) {
          playerB.current.setVolume(0)
          playerB.current.cueVideoByQuery({ query: second.titulo, startSeconds: second.inicio || 0 })
        }
      }))
    }))
  }

  const onStateChange = (event) => {
    const YT = window.YT?.PlayerState
    if (!YT) return

    if (event.data === YT.PLAYING) {
      setIsPlaying(true)
    }
    if (event.data === YT.PAUSED) {
      setIsPlaying(false)
    }
    // Canción terminó — avanzar
    if (event.data === YT.ENDED) {
      goToNext()
    }
  }

  const onError = (event) => {
    // Error de reproducción → skip automático
    console.log('Video error, skipping:', event.data)
    const next = currentIndexRef.current + 1
    if (next < songsRef.current.length) {
      goToNext()
    }
  }

  const goToNext = () => {
    const next = currentIndexRef.current + 1
    if (next >= songsRef.current.length) {
      setIsPlaying(false)
      return
    }
    playAt(next)
  }

  const playAt = (index) => {
    if (index < 0 || index >= songsRef.current.length) return
    if (isTransitioning.current) return

    clearInterval(volumeInterval.current)

    const song = songsRef.current[index]
    const active = activeRef.current === 'A' ? playerA.current : playerB.current
    const inactive = activeRef.current === 'A' ? playerB.current : playerA.current

    if (!active || !inactive || !song) return

    currentIndexRef.current = index
    setCurrentIndex(index)

    // Si el inactivo ya tiene la canción precargada (siguiente en cola)
    const isPreloaded = index === currentIndexRef.current + 1

    // Siempre cargar en el inactivo y hacer crossfade
    isTransitioning.current = true

    inactive.setVolume(0)
    inactive.loadVideoByQuery({
      query: song.titulo,
      startSeconds: song.inicio || 0
    })

    setTimeout(() => {
      inactive.playVideo()
      doCrossfade(active, inactive, () => {
        // Swap activo
        const newActive = activeRef.current === 'A' ? 'B' : 'A'
        activeRef.current = newActive
        setActivePlayer(newActive)
        isTransitioning.current = false

        // Precargar la siguiente en el ahora-inactivo
        const nextIndex = index + 1
        if (nextIndex < songsRef.current.length) {
          const nextSong = songsRef.current[nextIndex]
          active.setVolume(0)
          active.cueVideoByQuery({
            query: nextSong.titulo,
            startSeconds: nextSong.inicio || 0
          })
        }
      })
    }, 1500)
  }

  const doCrossfade = (from, to, onDone) => {
    clearInterval(volumeInterval.current)
    let vol = 100
    volumeInterval.current = setInterval(() => {
      vol -= 5
      if (vol <= 0) {
        from.setVolume(0)
        from.pauseVideo()
        to.setVolume(100)
        clearInterval(volumeInterval.current)
        onDone()
      } else {
        try {
          from.setVolume(vol)
          to.setVolume(100 - vol)
        } catch {}
      }
    }, 60) // ~1.2 segundos de crossfade
  }

  const togglePlay = () => {
    const active = activeRef.current === 'A' ? playerA.current : playerB.current
    if (!active) return
    if (isPlaying) {
      active.pauseVideo()
    } else {
      active.playVideo()
    }
  }

  const energiaColor = { baja: '#4ade80', media: '#facc15', alta: '#f97316' }
  const currentSong = songs[currentIndex]

  return (
    <main style={{
      minHeight: '100vh',
      background: '#09090b',
      color: '#fff',
      fontFamily: 'system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      maxWidth: '680px',
      margin: '0 auto'
    }}>

      {/* Header */}
      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1a1a1a' }}>
        <button onClick={() => window.location.href = '/evento'}
          style={{ background: 'none', border: '1px solid #333', color: '#888', padding: '6px 14px', borderRadius: '100px', fontSize: '12px', cursor: 'pointer' }}>
          ← Plan
        </button>
        <div style={{ fontSize: '12px', color: '#444', textAlign: 'center', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {plan?.titulo}
        </div>
        <div style={{ fontSize: '12px', color: '#555' }}>{currentIndex + 1} / {songs.length}</div>
      </div>

      {/* Dos iframes superpuestos — crossfade visual */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000' }}>
        <div id="yt-a" style={{
          position: 'absolute', inset: 0,
          opacity: activePlayer === 'A' ? 1 : 0,
          transition: 'opacity 1.2s ease',
          pointerEvents: activePlayer === 'A' ? 'auto' : 'none'
        }} />
        <div id="yt-b" style={{
          position: 'absolute', inset: 0,
          opacity: activePlayer === 'B' ? 1 : 0,
          transition: 'opacity 1.2s ease',
          pointerEvents: activePlayer === 'B' ? 'auto' : 'none'
        }} />
        {!isReady && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#09090b', gap: '16px' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid #222', borderTop: '3px solid #d4a843', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            <p style={{ color: '#444', fontSize: '13px' }}>Cargando player...</p>
          </div>
        )}
      </div>

      {/* Canción actual */}
      <div style={{ padding: '18px 20px', borderBottom: '1px solid #111' }}>
        {currentSong ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: energiaColor[currentSong.energia] || '#d4a843', display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '2px' }}>{currentSong.bloque}</span>
            </div>
            <div style={{ fontSize: '19px', fontWeight: '500', color: '#fff', lineHeight: 1.3 }}>{currentSong.titulo}</div>
          </>
        ) : (
          <div style={{ fontSize: '14px', color: '#444' }}>Cargando canción...</div>
        )}
      </div>

      {/* Controles */}
      <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'center', gap: '36px', alignItems: 'center', borderBottom: '1px solid #111' }}>
        <button
          onClick={() => playAt(currentIndex - 1)}
          disabled={currentIndex === 0}
          style={{ background: 'none', border: 'none', color: currentIndex === 0 ? '#2a2a2a' : '#666', fontSize: '26px', cursor: currentIndex === 0 ? 'default' : 'pointer', lineHeight: 1 }}>
          ⏮
        </button>
        <button
          onClick={togglePlay}
          style={{ background: '#d4a843', border: 'none', color: '#000', width: '58px', height: '58px', borderRadius: '50%', fontSize: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button
          onClick={() => playAt(currentIndex + 1)}
          disabled={currentIndex === songs.length - 1}
          style={{ background: 'none', border: 'none', color: currentIndex === songs.length - 1 ? '#2a2a2a' : '#666', fontSize: '26px', cursor: currentIndex === songs.length - 1 ? 'default' : 'pointer', lineHeight: 1 }}>
          ⏭
        </button>
      </div>

      {/* Cola */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '32px' }}>
        <div style={{ padding: '14px 20px 8px', fontSize: '11px', color: '#444', textTransform: 'uppercase', letterSpacing: '2px' }}>
          Cola · {songs.length} canciones
        </div>
        {songs.map((song, i) => (
          <div
            key={i}
            onClick={() => playAt(i)}
            style={{
              padding: '11px 20px',
              cursor: 'pointer',
              background: i === currentIndex ? '#111' : 'transparent',
              borderLeft: i === currentIndex ? '3px solid #d4a843' : '3px solid transparent',
              opacity: i < currentIndex ? 0.3 : 1,
              transition: 'background .15s'
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: i === currentIndex ? '#d4a843' : '#333', minWidth: '22px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                {i === currentIndex && isPlaying ? '▶' : i + 1}
              </span>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '13px', color: i === currentIndex ? '#fff' : '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {song.titulo}
                </div>
                <div style={{ fontSize: '11px', color: '#333', marginTop: '2px' }}>{song.bloque}</div>
              </div>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: energiaColor[song.energia] || '#2a2a2a', flexShrink: 0 }} />
            </div>
          </div>
        ))}
      </div>

    </main>
  )
}
