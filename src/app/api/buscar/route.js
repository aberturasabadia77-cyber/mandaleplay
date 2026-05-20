// src/app/api/buscar/route.js
// Busca en YouTube desde el servidor y devuelve el videoId del primer resultado.
// Sin API key — parsea el HTML de resultados de YouTube.

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')
  if (!q) return Response.json({ error: 'Sin query' }, { status: 400 })

  try {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}&sp=EgIQAQ%3D%3D`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'es-AR,es;q=0.9',
        'Accept': 'text/html',
      },
      next: { revalidate: 3600 }, // cachea 1h por query
    })

    const html = await res.text()

    // El primer "videoId" en el HTML es siempre el primer resultado de búsqueda
    const match = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/)
    if (!match) throw new Error('No se encontró videoId')

    const videoId = match[1]
    return Response.json({ videoId })

  } catch (e) {
    console.error('Error buscando en YouTube:', e.message)
    return Response.json({ error: e.message }, { status: 500 })
  }
}
