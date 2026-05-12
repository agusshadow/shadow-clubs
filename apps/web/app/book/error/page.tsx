import Link from 'next/link'
import { XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  searchParams: Promise<{ reason?: string }>
}

export default async function BookErrorPage({ searchParams }: Props) {
  const { reason } = await searchParams
  const message = reason ?? 'Ocurrió un error al procesar tu reserva.'

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 p-6 text-center">
      <XCircle className="text-destructive h-16 w-16" />
      <div className="space-y-1">
        <h1 className="text-xl font-bold">No se pudo completar la reserva</h1>
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
      <div className="flex w-full max-w-xs flex-col gap-3">
        <Button asChild className="w-full">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  )
}
