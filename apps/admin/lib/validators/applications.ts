import { z } from 'zod'

export const applicationSchema = z.object({
  first_name: z.string().min(1, 'El nombre es requerido').max(50),
  last_name: z.string().min(1, 'El apellido es requerido').max(50),
  email: z.string().email('Email inválido'),
  phone: z.string().min(6, 'Teléfono inválido').max(20),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  club_name: z.string().min(2, 'El nombre del club es requerido').max(100),
  address: z.string().min(5, 'La dirección es requerida').max(200),
  city: z.string().min(2, 'La ciudad es requerida').max(100),
  province: z.string().min(2, 'La provincia es requerida').max(100),
  sport_types: z.array(z.string()).min(1, 'Seleccioná al menos un deporte'),
  additional_info: z.string().max(500).optional(),
  lat: z.preprocess(
    (v) => (v === '' || v == null ? null : parseFloat(String(v))),
    z.number().min(-90).max(90).nullable().optional()
  ),
  lng: z.preprocess(
    (v) => (v === '' || v == null ? null : parseFloat(String(v))),
    z.number().min(-180).max(180).nullable().optional()
  ),
})

export type ApplicationInput = z.infer<typeof applicationSchema>
