import { Skeleton } from '@/components/ui/skeleton'

export default function ReservationsLoading() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b px-4 pt-5 pb-0">
        <Skeleton className="mb-4 h-6 w-28" />
        <div className="flex gap-1">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-24" />
        </div>
      </header>

      <div className="flex-1 space-y-3 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}
