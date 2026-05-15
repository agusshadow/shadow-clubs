import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import { SwRegister } from '@/components/sw-register'
import { NavProgress } from '@/components/layout/nav-progress'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: 'Shadow Clubs',
  description: 'Reservá tu cancha favorita',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Shadow Clubs' },
}

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geist.variable} h-full antialiased`}>
      <body className="bg-background text-foreground h-full font-sans">
        <NavProgress />
        {children}
        <SwRegister />
      </body>
    </html>
  )
}
