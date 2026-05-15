import { Skeleton } from '@/components/ui/skeleton'

export default function ClubDetailLoading() {
  return (
    <div className="pb-6">
      {/* Hero */}
      <Skeleton className="aspect-[16/7] w-full rounded-none" />

      <div className="space-y-5 px-4 pt-6">
        {/* Name + badges */}
        <div className="space-y-2">
          <Skeleton className="h-7 w-2/3" />
          <div className="flex gap-1.5">
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Info */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </div>

        {/* Courts */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-36" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>

        {/* CTA */}
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  )
}
