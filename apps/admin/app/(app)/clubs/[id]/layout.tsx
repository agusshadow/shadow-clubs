import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ClubNav } from '@/components/clubs/club-nav'

interface ClubLayoutProps {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

export default async function ClubLayout({ children, params }: ClubLayoutProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: club } = await supabase.from('clubs').select('id, name').eq('id', id).single()

  if (!club) notFound()

  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground text-sm">
          <Link href="/clubs" className="hover:underline">
            Clubes
          </Link>{' '}
          / {club.name}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">{club.name}</h1>
      </div>

      <ClubNav clubId={id} />

      {children}
    </div>
  )
}
