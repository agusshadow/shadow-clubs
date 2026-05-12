import { z } from 'zod'

export const cancellationPolicySchema = z.object({
  hours_before_start: z.coerce.number().int().min(0, 'Debe ser 0 o más').max(720),
  refund_type: z.enum(['full', 'partial', 'none']),
  refund_percentage: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : parseFloat(String(v))),
    z.number().min(0).max(100).nullable()
  ),
  is_active: z.boolean().default(true),
})

export type CancellationPolicyValues = z.infer<typeof cancellationPolicySchema>
