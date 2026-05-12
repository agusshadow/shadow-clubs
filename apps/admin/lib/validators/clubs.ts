import { z } from 'zod'

export const clubSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  address: z.string().min(5, 'Ingresá la dirección completa'),
  city: z.string().min(2, 'Ingresá la ciudad'),
  province: z.string().min(2, 'Ingresá la provincia'),
  lat: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : parseFloat(String(v))),
    z.number().min(-90).max(90).nullable()
  ),
  lng: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : parseFloat(String(v))),
    z.number().min(-180).max(180).nullable()
  ),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  is_active: z.boolean().default(true),
})

export type ClubFormValues = {
  name: string
  description?: string
  address: string
  city: string
  province: string
  lat?: string
  lng?: string
  phone?: string
  email?: string
  website?: string
  is_active: boolean
}
