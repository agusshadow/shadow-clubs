import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { createClient } from '@/lib/supabase/server'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const firstName = user.user_metadata?.first_name ?? ''
  const lastName = user.user_metadata?.last_name ?? ''
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || user.email || 'Usuario'

  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          email={user.email!}
          fullName={fullName}
          avatarUrl={user.user_metadata?.avatar_url}
        />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
