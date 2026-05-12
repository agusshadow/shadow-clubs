'use client'

import { useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { createClient } from '@shadow-clubs/supabase'
import { updateClubImages } from '@/lib/actions/clubs'

interface Props {
  clubId: string
  coverUrl: string | null
  logoUrl: string | null
}

export function ClubImageUpload({ clubId, coverUrl, logoUrl }: Props) {
  const [cover, setCover] = useState(coverUrl)
  const [logo, setLogo] = useState(logoUrl)
  const [uploading, setUploading] = useState<'cover' | 'logo' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const coverRef = useRef<HTMLInputElement>(null)
  const logoRef = useRef<HTMLInputElement>(null)
  const [, startTransition] = useTransition()

  async function handleUpload(file: File, type: 'cover' | 'logo') {
    setError(null)
    setUploading(type)

    const ext = file.name.split('.').pop()
    const path = `${clubId}/${type}-${Date.now()}.${ext}`

    const supabase = createClient()
    const { error: uploadError } = await supabase.storage
      .from('clubs')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setError('Error al subir la imagen. Intentá de nuevo.')
      setUploading(null)
      return
    }

    const { data } = supabase.storage.from('clubs').getPublicUrl(path)
    const publicUrl = data.publicUrl

    if (type === 'cover') setCover(publicUrl)
    else setLogo(publicUrl)

    startTransition(() => {
      updateClubImages(clubId, {
        cover_url: type === 'cover' ? publicUrl : (cover ?? undefined),
        logo_url: type === 'logo' ? publicUrl : (logo ?? undefined),
      })
    })

    setUploading(null)
  }

  function onFileChange(type: 'cover' | 'logo') {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      handleUpload(file, type)
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Cover */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Imagen de portada</p>
        <p className="text-muted-foreground text-xs">
          Se muestra en la card y en el header del club. Recomendado: 1200×400px.
        </p>
        <div
          className="hover:border-primary relative h-40 w-full cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition-colors"
          onClick={() => coverRef.current?.click()}
        >
          {cover ? (
            <Image src={cover} alt="Portada" fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground text-sm">
                {uploading === 'cover' ? 'Subiendo...' : 'Hacé clic para subir portada'}
              </p>
            </div>
          )}
          {uploading === 'cover' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <p className="text-sm font-medium text-white">Subiendo...</p>
            </div>
          )}
        </div>
        <input
          ref={coverRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={onFileChange('cover')}
        />
        {cover && (
          <button
            type="button"
            onClick={() => coverRef.current?.click()}
            className="text-muted-foreground text-xs underline underline-offset-2"
          >
            Cambiar imagen
          </button>
        )}
      </div>

      {/* Logo */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Logo del club</p>
        <p className="text-muted-foreground text-xs">
          Se muestra sobre la portada. Recomendado: 200×200px.
        </p>
        <div
          className="hover:border-primary relative h-24 w-24 cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition-colors"
          onClick={() => logoRef.current?.click()}
        >
          {logo ? (
            <Image src={logo} alt="Logo" fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center p-2 text-center">
              <p className="text-muted-foreground text-xs">
                {uploading === 'logo' ? 'Subiendo...' : 'Logo'}
              </p>
            </div>
          )}
          {uploading === 'logo' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <p className="text-xs font-medium text-white">Subiendo...</p>
            </div>
          )}
        </div>
        <input
          ref={logoRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={onFileChange('logo')}
        />
        {logo && (
          <button
            type="button"
            onClick={() => logoRef.current?.click()}
            className="text-muted-foreground text-xs underline underline-offset-2"
          >
            Cambiar logo
          </button>
        )}
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  )
}
