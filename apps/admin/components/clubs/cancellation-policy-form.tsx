'use client'

import { useTransition, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Policy {
  hours_before_start: number
  refund_type: string
  refund_percentage: number | null
  is_active: boolean
}

interface Props {
  clubId: string
  policy: Policy | null
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean }>
}

export function CancellationPolicyForm({ policy, action }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [refundType, setRefundType] = useState(policy?.refund_type ?? 'none')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSaved(false)
    const formData = new FormData(e.currentTarget)
    formData.set('refund_type', refundType)
    startTransition(async () => {
      const result = await action(formData)
      if (result?.error) setError(result.error)
      else setSaved(true)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="hours_before_start">Horas mínimas de anticipación</Label>
          <Input
            id="hours_before_start"
            name="hours_before_start"
            type="number"
            min={0}
            max={720}
            defaultValue={policy?.hours_before_start ?? 24}
          />
          <p className="text-muted-foreground text-xs">
            El usuario puede cancelar hasta estas horas antes del turno.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Tipo de reembolso</Label>
          <Select value={refundType} onValueChange={setRefundType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Reembolso completo</SelectItem>
              <SelectItem value="partial">Reembolso parcial</SelectItem>
              <SelectItem value="none">Sin reembolso</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" name="refund_type" value={refundType} />
        </div>

        {refundType === 'partial' && (
          <div className="space-y-2">
            <Label htmlFor="refund_percentage">Porcentaje de reembolso (%)</Label>
            <Input
              id="refund_percentage"
              name="refund_percentage"
              type="number"
              min={0}
              max={100}
              step={5}
              defaultValue={policy?.refund_percentage ?? 50}
            />
          </div>
        )}
      </div>

      <input type="hidden" name="is_active" value="true" />

      {error && <p className="text-destructive text-sm">{error}</p>}
      {saved && <p className="text-sm text-green-600">Política guardada correctamente.</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Guardando...' : 'Guardar política'}
      </Button>
    </form>
  )
}
