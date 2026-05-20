'use client'

import { useState, useEffect, useRef } from 'react'

export default function Player() {
  const [plan, setPlan] = useState(null)
  const [songs, setSongs] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [activePlayer, setActivePlayer] = useState('A')

  // Refs para no perder estado en closures
  const playerA = useRef(null)
  const playerB = useRef(null)
  const activeRef = useRef('A')
  const currentIndexRef = useRef(0)
  const songsRef = useRef([])
  const crossfadeTimer = useRef(null)
  const volumeInterval = useRef(null)

  // Cargar plan desde sessionStorage
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

  // Cargar YouTube IFrame API
  useEffect(() => {
    if (!songs.length) return
    window.onYouTubeIframeAPIReady = initPlayers
    if (window.YT?.Player) { initPlayers(); return }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
  }, [songs])

  const initPlayers = () => {
    const config = (id, onReady) => ({
      playerVars: { autoplay: 0, controls: 0, rel: 0, modestbranding: 1, iv_load_policy: 3 },
      events: {
        onReady,
        onStateChange: handleStateChange
      }
    })

    playerA.current = new window.YT.Player('yt-a', config('yt-a', (e) => {
      playerB.current = new window.YT.Player('yt-b', config('yt-b', () => {
        setIsReady(true)
        loadSong(playerA.current, 0)   // A carga canción 0
        preloadSong(playerB.current, 1) // B precarga canción 1
        setTimeout(() => {
          playerA.current.setVolume(100)
          playerA.current.playVideo()
          setIsPlaying(true)
        }, 800)
      }))
    }))
  }

  const loadSong = (player, index) => {
    const s = songsRef.current[index]
    if (!s || !player) return
    player.loadVideoByQuery({ query: s.titulo, startSeconds: s.inicio || 0 })
    player.pauseVideo()
  }

  const preloadSong = (player, index) => {
    const s = songsRef.current[index]
    if (!s || !player) return
    player.cueVideoByQuery({ query: s.titulo, startSeconds: s.inicio || 0 })
  }

  const handleStateChange = (event) => {
    // Cuando la canción activa termina
    if (event.data === window.YT?.PlayerState?.ENDED) {
      advanceToNext()
    }
    if (event.data === 1) setIsPlaying(true)
    if (event.data === 2) setIsPlaying(false)
  }

  const startCrossfadeTimer = (index) => {
    clearTimeout(crossfadeTimer.current)
    // Iniciar crossfade 15 segundos antes del final
    // Como no sabemos la duración exacta, usamos el evento ENDED
    // y hacemos crossfade cuando queda ~15 seg (se puede refinar)
  }

  const crossfade = (fromPlayer, toPlayer, onDone) => {
    clearInterval(volumeInterval.current)
    let vol = 100
    toPlayer.setVolume(0)
    toPlayer.playVideo()

    volumeInterval.current = setInterval(() => {
      vol -= 5
      if (vol <= 0) {
        fromPlayer.setVolume(0)
        fromPlayer.pauseVideo()
        fromPlayer.stopVideo()
        toPlayer.setVolume(100)
        clearInterval(volumeInterval.current)
        onDone()
      } else {
        fromPlayer.setVolume(vol)
        toPlayer.setVolume(100 - vol)
      }
    }, 80) // 80ms × 20 pasos = ~1.6 segundos de crossfade
  }

  const advanceToNext = () => {
    const next = currentIndexRef.current + 1
    if (next >= songsRef.current.length) {
      setIsPlaying(false)
      return
    }

    const from = activeRef.current === 'A' ? playerA.current : playerB.current
    const to   = activeRef.current === 'A' ? playerB.current : playerA.current

    // El player "to" ya tiene la canción precargada lista
    loadSong(to, next)

    setTimeout(() => {
      crossfade(from, to, () => {
        const newActive = activeRef.current === 'A' ? 'B' : 'A'
        activeRef.current = newActive
        currentIndexRef.current = next
        setActivePlayer(newActive)
        setCurrentIndex(next)
        // Precargar la siguiente
        const afterNext = next + 1
        if (afterNext < songsRef.current.length) {
          preloadSong(from, afterNext)
        }
      })
    }, 300)
  }

  const playIndex = (index) => {
    if (index < 0 || index >= songs.length) return
    clearInterval(volumeInterval.current)

    const active = activeRef.current === 'A' ? playerA.current : playerB.current
    const inactive = activeRef.current === 'A' ? playerB.current : playerA.current

    currentIndexRef.current = index
    setCurrentIndex(index)

    active.setVolume(100)
    loadSong(active, index)
    setTimeout(() => active.playVideo(), 500)

    if (index + 1 < songs.length) {
      preloadSong(inactive, index + 1)
    }
  }

  const togglePlay = () => {
    const active = activeRef.current === 'A' ? playerA.current : playerB.current
    if (!active) return
    if (isPlaying) { active.pauseVideo() } else { active.playVideo() }
  }

  const energiaColor = { baja: '#4ade80', media: '#facc15', alta: '#f97316' }
  const currentSong = songs[currentIndex]

  return (
    <main style={{ minHeight: '100vh', background: '#09090b', color: '#fff', fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column', maxWidth: '680px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1a1a1a' }}>
        <button onClick={() => window.location.href = '/evento'}
          style={{ background: 'none', border: '1px solid #333', color: '#888', padding: '6px 14px', borderRadius: '100px', fontSize: '12px', cursor: 'pointer' }}>
          ← Plan
        </button>
        <div style={{ fontSize: '12px', color: '#444', textAlign: 'center', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {plan?.titulo}
        </div>
        <div style={{ fontSize: '12px', color: '#555' }}>{currentIndex + 1} / {songs.length}</div>
      </div>

      {/* Iframes ocultos — DOS jugadores simultáneos */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000', overflow: 'hidden' }}>
        <div id="yt-a" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: activePlayer === 'A' ? 1 : 0, transition: 'opacity 1.5s ease' }} />
        <div id="yt-b" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: activePlayer === 'B' ? 1 : 0, transition: 'opacity 1.5s ease' }} />
        {!isReady && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#09090b' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid #222', borderTop: '3px solid #d4a843', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        )}
      </div>

      {/* Canción actual */}
      <div style={{ padding: '20px', borderBottom: '1px solid #111' }}>
        {currentSong && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: energiaColor[currentSong.energia] || '#d4a843', display: 'inline-block' }} />
              <span style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '2px' }}>{currentSong.bloque}</span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: '500', color: '#fff', lineHeight: 1.3 }}>{currentSong.titulo}</div>
          </>
        )}
      </div>

      {/* Controles */}
      <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'center', gap: '32px', alignItems: 'center', borderBottom: '1px solid #111' }}>
        <button onClick={() => playIndex(currentIndex - 1)} disabled={currentIndex === 0}
          style={{ background: 'none', border: 'none', color: currentIndex === 0 ? '#2a2a2a' : '#666', fontSize: '28px', cursor: currentIndex === 0 ? 'default' : 'pointer' }}>
          ⏮
        </button>
        <button onClick={togglePlay}
          style={{ background: '#d4a843', border: 'none', color: '#000', width: '56px', height: '56px', borderRadius: '50%', fontSize: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button onClick={() => playIndex(currentIndex + 1)} disabled={currentIndex === songs.length - 1}
          style={{ background: 'none', border: 'none', color: currentIndex === songs.length - 1 ? '#2a2a2a' : '#666', fontSize: '28px', cursor: currentIndex === songs.length - 1 ? 'default' : 'pointer' }}>
          ⏭
        </button>
      </div>

      {/* Cola de canciones */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '40px' }}>
        <div style={{ padding: '12px 20px 8px', fontSize: '11px', color: '#444', textTransform: 'uppercase', letterSpacing: '2px' }}>
          Cola · {songs.length} canciones
        </div>
        {songs.map((song, i) => (
          <div key={i} onClick={() => playIndex(i)}
            style={{
              padding: '12px 20px',
              cursor: 'pointer',
              background: i === currentIndex ? '#111' : 'transparent',
              borderLeft: i === currentIndex ? '3px solid #d4a843' : '3px solid transparent',
              opacity: i < currentIndex ? 0.3 : 1,
              transition: 'all .15s'
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: i === currentIndex ? '#d4a843' : '#333', minWidth: '24px', textAlign: 'right' }}>
                {i === currentIndex && isPlaying ? '▶' : i + 1}
              </span>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '13px', color: i === currentIndex ? '#fff' : '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {song.titulo}
                </div>
                <div style={{ fontSize: '11px', color: '#333', marginTop: '2px' }}>{song.bloque}</div>
              </div>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: energiaColor[song.energia] || '#444', flexShrink: 0 }} />
            </div>
          </div>
        ))}
      </div>

    </main>
  )
}
