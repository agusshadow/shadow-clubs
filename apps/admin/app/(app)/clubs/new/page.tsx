import { ClubForm } from '@/components/clubs/club-form'
import { createClub } from '@/lib/actions/clubs'

export default function NewClubPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nuevo club</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Completá los datos para registrar un nuevo complejo
        </p>
      </div>
      <ClubForm action={createClub} submitLabel="Crear club" />
    </div>
  )
}
