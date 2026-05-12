import Link from 'next/link'
import { Search } from 'lucide-react'

const SPORTS = [
  { label: 'Fútbol', value: 'football', emoji: '⚽' },
  { label: 'Tenis', value: 'tennis', emoji: '🎾' },
  { label: 'Pádel', value: 'paddle', emoji: '🏓' },
  { label: 'Básquet', value: 'basketball', emoji: '🏀' },
  { label: 'Vóley', value: 'volleyball', emoji: '🏐' },
  { label: 'Squash', value: 'squash', emoji: '🟡' },
]

export default function HomePage() {
  return (
    <div className="space-y-6 p-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Shadow Clubs</h1>
        <p className="text-muted-foreground text-sm">Encontrá y reservá tu cancha</p>
      </div>

      {/* Search bar */}
      <Link
        href="/explore"
        className="border-input bg-muted flex items-center gap-3 rounded-xl border px-4 py-3"
      >
        <Search className="text-muted-foreground h-4 w-4 shrink-0" />
        <span className="text-muted-foreground text-sm">¿Qué deporte querés jugar?</span>
      </Link>

      {/* Quick sports access */}
      <div className="space-y-3">
        <h2 className="font-semibold">Deportes</h2>
        <div className="grid grid-cols-3 gap-3">
          {SPORTS.map((sport) => (
            <Link
              key={sport.value}
              href={`/explore?sport=${sport.value}`}
              className="bg-muted hover:bg-accent flex flex-col items-center gap-1.5 rounded-xl py-4 transition-colors"
            >
              <span className="text-2xl">{sport.emoji}</span>
              <span className="text-xs font-medium">{sport.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Link
        href="/explore"
        className="bg-primary text-primary-foreground block rounded-xl px-4 py-3 text-center text-sm font-medium"
      >
        Ver todos los clubes →
      </Link>
    </div>
  )
}
