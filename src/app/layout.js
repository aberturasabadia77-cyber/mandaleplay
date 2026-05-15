import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Mandale Play — DJ automático con IA',
  description: 'La música perfecta para tu fiesta, sin DJ y sin vueltas. Gratis.',
  keywords: 'DJ automático, música para fiestas, eventos sin DJ, playlist inteligente Argentina',
  openGraph: {
    title: 'Mandale Play',
    description: 'La música de tu fiesta, sin DJ y sin vueltas.',
    url: 'https://mandaleplay.com',
    siteName: 'Mandale Play',
    locale: 'es_AR',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
