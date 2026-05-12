import { z } from 'zod'

export const courtSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  sport: z.enum(['football', 'tennis', 'paddle', 'basketball', 'volleyball', 'squash', 'other']),
  surface: z.enum(['grass', 'synthetic_grass', 'clay', 'hard', 'wood', 'concrete', 'other']),
  is_indoor: z.boolean().default(false),
  capacity: z.coerce.number().int().min(1).max(50).default(2),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
})

export const slotTemplateSchema = z.object({
  day_of_week: z.coerce.number().int().min(0).max(6),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  price_ars: z.coerce.number().min(0, 'El precio no puede ser negativo'),
  is_active: z.boolean().default(true),
})

export type CourtFormValues = z.infer<typeof courtSchema>
export type SlotTemplateFormValues = z.infer<typeof slotTemplateSchema>
