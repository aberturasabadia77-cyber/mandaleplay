// src/app/api/bpm/route.js
// Obtiene el BPM real de una canción usando GetSongBPM API.
// NUNCA inventa BPMs — retorna null si no encuentra la canción.

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const titulo  = searchParams.get('titulo')
  const artista = searchParams.get('artista')

  if (!titulo) return Response.json({ bpm: null, encontrado: false })

  const apiKey = process.env.GETSONGBPM_API_KEY
  if (!apiKey) return Response.json({ bpm: null, encontrado: false, error: 'Sin API key' })

  // Limpia el título: saca paréntesis, "feat.", versiones, etc.
  const limpiarTitulo = (t) => t
    .replace(/\s*[\(\[].*?[\)\]]/g, '')  // quitar (Remix), [Live], etc.
    .replace(/\s*-\s*feat\.?.*$/i, '')      // quitar "- feat. Artista"
    .replace(/\s*-\s*ft\.?.*$/i, '')
    .trim()

  const tituloBuscar = limpiarTitulo(titulo)

  // Intentar búsqueda con artista, y si no encuentra, sin artista
  const intentos = [
    { lookup: tituloBuscar, artist: artista },
    { lookup: tituloBuscar, artist: '' },
    { lookup: titulo,       artist: artista }, // titulo original como fallback
  ]

  for (const { lookup, artist } of intentos) {
    if (!lookup) continue
    try {
      const params = new URLSearchParams({
        api_key: apiKey,
        type: 'song',
        lookup: lookup,
      })
      if (artist) params.set('artist', artist)

      const url = `https://api.getsong.co/search/?${params}`
      const res  = await fetch(url, { next: { revalidate: 86400 } })
      if (!res.ok) continue

      const data = await res.json()
      const resultados = data?.search || []
      if (!resultados.length) continue

      const primero = resultados[0]
      const bpm = primero?.tempo ? Math.round(parseFloat(primero.tempo)) : null
      if (!bpm) continue

      return Response.json({
        bpm,
        encontrado: true,
        cancion: primero?.song_title || titulo,
        artista: primero?.artist?.name || artista,
      })
    } catch (e) {
      console.error('GetSongBPM error:', e.message)
    }
  }

  // No encontrado en ningún intento — retornar null (nunca inventar)
  return Response.json({ bpm: null, encontrado: false })
}
