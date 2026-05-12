import { BottomNav } from '@/components/layout/bottom-nav'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col">
      <main className="flex-1 overflow-auto">{children}</main>
      <BottomNav />
    </div>
  )
}
