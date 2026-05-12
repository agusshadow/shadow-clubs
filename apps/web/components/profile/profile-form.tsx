'use client'

import { useActionState } from 'react'
import { updateProfile } from '@/lib/actions/profile'

interface Props {
  firstName: string
  lastName: string | null
  phone: string | null
}

export function ProfileForm({ firstName, lastName, phone }: Props) {
  const [state, action, isPending] = useActionState(updateProfile, null)

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="first_name">
            Nombre
          </label>
          <input
            id="first_name"
            name="first_name"
            defaultValue={firstName}
            className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="last_name">
            Apellido
          </label>
          <input
            id="last_name"
            name="last_name"
            defaultValue={lastName ?? ''}
            className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="phone">
          Teléfono
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={phone ?? ''}
          placeholder="+54 11 1234-5678"
          className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
        />
      </div>

      {state?.error && <p className="text-destructive text-sm">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-600">Cambios guardados correctamente.</p>}

      <button
        type="submit"
        disabled={isPending}
        className="bg-primary text-primary-foreground w-full rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50"
      >
        {isPending ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}
