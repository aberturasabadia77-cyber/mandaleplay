import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error || !code) {
      return NextResponse.redirect(new URL('/evento?auth=error', request.url))
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: 'https://www.mandaleplay.com/api/auth/callback/google',
        grant_type: 'authorization_code',
      }),
    })

    const tokens = await tokenResponse.json()

    if (!tokens.access_token) {
      return NextResponse.redirect(new URL('/evento?auth=error', request.url))
    }

    const redirectUrl = new URL('/evento', request.url)
    redirectUrl.searchParams.set('access_token', tokens.access_token)
    redirectUrl.searchParams.set('auth', 'success')

    return NextResponse.redirect(redirectUrl)

  } catch (error) {
    return NextResponse.redirect(new URL('/evento?auth=error', request.url))
  }
}
