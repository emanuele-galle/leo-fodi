'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clientFormSchema, type ClientFormData } from '@/lib/validations/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Plus, X } from 'lucide-react'

interface ClientFormProps {
  onSuccess: (data: { clientId: string; profileId: string }) => void
}

export function ClientForm({ onSuccess }: ClientFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [socialLinks, setSocialLinks] = useState<string[]>([''])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      nome: '',
      cognome: '',
      localita: '',
      ruolo: '',
      settore: '',
      link_social: [''],
      sito_web: '',
    },
  })

  const addSocialLink = () => {
    const newLinks = [...socialLinks, '']
    setSocialLinks(newLinks)
    setValue('link_social', newLinks)
  }

  const removeSocialLink = (index: number) => {
    const newLinks = socialLinks.filter((_, i) => i !== index)
    setSocialLinks(newLinks)
    setValue('link_social', newLinks)
  }

  const updateSocialLink = (index: number, value: string) => {
    const newLinks = [...socialLinks]
    newLinks[index] = value
    setSocialLinks(newLinks)
    setValue('link_social', newLinks)
  }

  const onSubmit = async (data: ClientFormData) => {
    setIsLoading(true)

    try {
      // Filter out empty social links
      const filteredData = {
        ...data,
        link_social: data.link_social?.filter((link) => link.trim() !== '') || [],
      }

      const response = await fetch('/api/profiling', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filteredData),
      })

      if (!response.ok) {
        const text = await response.text()
        console.error('API Error Response:', text)

        // Try to parse error message
        try {
          const errorData = JSON.parse(text)
          throw new Error(errorData.error || 'Errore durante la profilazione')
        } catch {
          throw new Error('Errore durante la profilazione. Verifica la configurazione.')
        }
      }

      const result = await response.json()

      onSuccess({
        clientId: result.clientId,
        profileId: result.profileId,
      })
    } catch (error) {
      console.error('Error submitting form:', error)

      // Show user-friendly error message
      const errorMessage = error instanceof Error
        ? error.message
        : 'Errore durante la profilazione. Riprova.'

      alert(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl border border-blue-600/20 shadow-[0_10px_40px_rgba(59,130,246,0.15),0_3px_12px_rgba(59,130,246,0.1)] bg-white">
      <CardHeader className="relative bg-gradient-to-br from-blue-50 via-indigo-50/50 to-blue-50/30 rounded-t-xl border-b border-blue-100 pb-6 overflow-hidden">
        {/* Subtle overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>

        <div className="relative">
          <CardTitle className="text-2xl sm:text-3xl text-blue-800 font-bold drop-shadow-sm flex items-center gap-3">
            <span className="text-3xl sm:text-4xl">📋</span>
            Inserimento Dati Cliente
          </CardTitle>
          <CardDescription className="text-sm sm:text-base text-gray-700 mt-2 leading-relaxed">
            Compila i dati del cliente per avviare la profilazione OSINT avanzata
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-6 pb-8 px-6 sm:px-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Nome e Cognome */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nome" className="text-sm font-semibold text-foreground">Nome *</Label>
              <Input
                id="nome"
                {...register('nome')}
                placeholder="Mario"
                disabled={isLoading}
              />
              {errors.nome && (
                <p className="text-sm text-red-600">{errors.nome.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cognome" className="text-sm font-semibold text-foreground">Cognome *</Label>
              <Input
                id="cognome"
                {...register('cognome')}
                placeholder="Rossi"
                disabled={isLoading}
              />
              {errors.cognome && (
                <p className="text-sm text-red-600">{errors.cognome.message}</p>
              )}
            </div>
          </div>

          {/* Località */}
          <div className="space-y-2">
            <Label htmlFor="localita" className="text-sm font-semibold text-foreground">Località</Label>
            <Input
              id="localita"
              {...register('localita')}
              placeholder="Milano"
              disabled={isLoading}
            />
            {errors.localita && (
              <p className="text-sm text-red-600">{errors.localita.message}</p>
            )}
          </div>

          {/* Ruolo */}
          <div className="space-y-2">
            <Label htmlFor="ruolo" className="text-sm font-semibold text-foreground">Ruolo</Label>
            <Input
              id="ruolo"
              {...register('ruolo')}
              placeholder="CEO, Manager, Founder, Professionista"
              disabled={isLoading}
            />
            {errors.ruolo && (
              <p className="text-sm text-red-600">{errors.ruolo.message}</p>
            )}
          </div>

          {/* Link Social */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground">Link Profili Social</Label>
            {socialLinks.map((link, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={link}
                  onChange={(e) => updateSocialLink(index, e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  disabled={isLoading}
                />
                {socialLinks.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeSocialLink(index)}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSocialLink}
              disabled={isLoading}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi Link Social
            </Button>
            {errors.link_social && (
              <p className="text-sm text-red-600">{errors.link_social.message}</p>
            )}
          </div>

          {/* Sito Web */}
          <div className="space-y-2">
            <Label htmlFor="sito_web" className="text-sm font-semibold text-foreground">Sito Web</Label>
            <Input
              id="sito_web"
              {...register('sito_web')}
              placeholder="https://esempio.com"
              disabled={isLoading}
            />
            {errors.sito_web && (
              <p className="text-sm text-red-600">{errors.sito_web.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full mt-6 bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 hover:from-blue-700 hover:via-blue-700 hover:to-blue-800 text-white font-bold shadow-[0_4px_20px_rgba(59,130,246,0.3),0_1px_4px_rgba(59,130,246,0.2)] hover:shadow-[0_6px_30px_rgba(59,130,246,0.4),0_2px_8px_rgba(59,130,246,0.25)] transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping opacity-75">
                    <Loader2 className="h-5 w-5" />
                  </div>
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
                <span className="animate-pulse font-semibold">Profilazione in corso...</span>
                <div className="flex gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="h-1.5 w-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="h-1.5 w-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xl">🔍</span>
                <span>Avvia Profilazione OSINT</span>
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
