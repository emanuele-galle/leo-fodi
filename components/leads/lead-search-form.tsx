'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Search, Settings2 } from 'lucide-react'
import { SETTORI_DISPONIBILI, REGIONI_ITALIA, DEFAULT_SOURCES } from '@/lib/types/lead-extraction'
// import type { LeadSearchFormData } from '@/lib/types/lead-extraction'  // Type mismatch with Zod schema

// Validation schema - settore now optional
const leadSearchSchema = z.object({
  name: z.string().min(3, 'Nome ricerca richiesto (min 3 caratteri)'),
  settore: z.string().optional(), // CHANGED: Made optional
  sottocategoria: z.string().optional(),
  fatturato_min: z.string().optional(),
  fatturato_max: z.string().optional(),
  dipendenti_min: z.string().optional(),
  dipendenti_max: z.string().optional(),
  comune: z.string().optional(),
  provincia: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length >= 2,
      'Provincia deve avere almeno 2 caratteri (es. MI, Milano)'
    ),
  regione: z.string().optional(),
  fonti_selezionate: z.array(z.string()).min(1, 'Seleziona almeno una fonte'),
})

type LeadSearchFormData = z.infer<typeof leadSearchSchema>

interface LeadSearchFormProps {
  onSuccess: (data: { searchId: string }) => void
}

export function LeadSearchForm({ onSuccess }: LeadSearchFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [selectedSources, setSelectedSources] = useState<string[]>([
    'google_places', // PRIORITY 1: Best reliability (95%)
    'pagine_gialle', // PRIORITY 2: Local businesses (50 leads)
    'kompass', // PRIORITY 2: B2B/Manufacturing (50 leads)
    'europages', // PRIORITY 2: Export/Import (50 leads)
  ])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LeadSearchFormData>({
    resolver: zodResolver(leadSearchSchema),
    defaultValues: {
      name: '',
      settore: '',
      sottocategoria: '',
      comune: '',
      provincia: '',
      regione: '',
      fonti_selezionate: ['google_places', 'pagine_gialle', 'kompass', 'europages'],
    },
  })

  const settore = watch('settore')

  const handleSourceToggle = (sourceId: string) => {
    const newSources = selectedSources.includes(sourceId)
      ? selectedSources.filter((s) => s !== sourceId)
      : [...selectedSources, sourceId]

    setSelectedSources(newSources)
    setValue('fonti_selezionate', newSources)
  }

  const onSubmit = async (data: LeadSearchFormData) => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/leads/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          fonti_selezionate: selectedSources,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Errore durante l\'avvio della ricerca')
      }

      const result = await response.json()

      onSuccess({
        searchId: result.searchId,
      })
    } catch (error) {
      console.error('Error submitting lead search:', error)
      alert(
        error instanceof Error
          ? error.message
          : 'Errore durante l\'avvio della ricerca. Riprova.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full border-2 border-[#A2C054]/20 shadow-deep bg-white rounded-2xl">
      <CardHeader className="relative overflow-hidden bg-gradient-to-r from-[#A2C054]/20 via-[#A2C054]/10 to-transparent border-b-2 border-[#A2C054]/20">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#A2C054] to-[#8BA048] flex items-center justify-center shadow-natural">
            <Search className="h-6 w-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <CardTitle className="text-xl sm:text-2xl text-[#A2C054] font-bold">
              Lead Finder - Nuova Ricerca
            </CardTitle>
            <CardDescription className="text-sm sm:text-base font-medium">
              Configura i parametri per estrarre lead qualificati da fonti pubbliche
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Nome Ricerca */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-foreground">
              Nome Ricerca *
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="es. Ristoranti Milano Q1 2025"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Settore */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="settore" className="text-sm font-semibold text-foreground">
                Settore
              </Label>
              <Select
                onValueChange={(value) => setValue('settore', value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona settore" />
                </SelectTrigger>
                <SelectContent>
                  {SETTORI_DISPONIBILI.map((settore) => (
                    <SelectItem key={settore.value} value={settore.value}>
                      {settore.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.settore && (
                <p className="text-sm text-red-600">{errors.settore.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sottocategoria" className="text-sm font-semibold text-foreground">
                Sottocategoria
              </Label>
              <Input
                id="sottocategoria"
                {...register('sottocategoria')}
                placeholder="es. Pizzerie, Trattorie"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Area Geografica */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              📍 Area Geografica
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="comune" className="text-sm font-semibold text-foreground">
                  Comune
                </Label>
                <Input
                  id="comune"
                  {...register('comune')}
                  placeholder="es. Milano, S. Giovanni (varianti accettate)"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  💡 Accetta varianti: maiuscole/minuscole, abbreviazioni (S. = San), accenti
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="provincia" className="text-sm font-semibold text-foreground">
                  Provincia
                </Label>
                <Input
                  id="provincia"
                  {...register('provincia')}
                  placeholder="es. MI oppure Milano (min 2 caratteri)"
                  disabled={isLoading}
                />
                {errors.provincia && (
                  <p className="text-sm text-red-600">{errors.provincia.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="regione" className="text-sm font-semibold text-foreground">
                  Regione
                </Label>
                <Select
                  onValueChange={(value) => setValue('regione', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona regione" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONI_ITALIA.map((regione) => (
                      <SelectItem key={regione} value={regione}>
                        {regione}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  💡 Cerca in tutte le province della regione selezionata
                </p>
              </div>
            </div>
          </div>

          {/* Filtri Avanzati */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2"
            >
              <Settings2 className="h-4 w-4" />
              {showAdvanced ? 'Nascondi' : 'Mostra'} Filtri Avanzati
            </Button>

            {showAdvanced && (
              <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
                <h4 className="font-semibold text-foreground">Filtri Economici/Strutturali</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">
                      Fatturato Minimo (€)
                    </Label>
                    <Input
                      type="number"
                      {...register('fatturato_min')}
                      placeholder="es. 50000"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">
                      Fatturato Massimo (€)
                    </Label>
                    <Input
                      type="number"
                      {...register('fatturato_max')}
                      placeholder="es. 500000"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">
                      Dipendenti Minimo
                    </Label>
                    <Input
                      type="number"
                      {...register('dipendenti_min')}
                      placeholder="es. 3"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">
                      Dipendenti Massimo
                    </Label>
                    <Input
                      type="number"
                      {...register('dipendenti_max')}
                      placeholder="es. 50"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Selezione Fonti */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              🔍 Fonti di Estrazione *
            </h3>
            <p className="text-sm text-gray-600">
              Seleziona le fonti da cui estrarre i contatti (più fonti = più risultati ma più tempo)
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DEFAULT_SOURCES.filter(source => source.attivo).map((source) => (
                <div
                  key={source.id}
                  className="flex items-start space-x-3 border rounded-lg p-3 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Checkbox
                    id={source.id}
                    checked={selectedSources.includes(source.id)}
                    onCheckedChange={() => handleSourceToggle(source.id)}
                    disabled={isLoading}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={source.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {source.nome}
                      <span
                        className={`ml-2 text-xs px-2 py-0.5 rounded ${
                          source.affidabilita_media >= 90
                            ? 'bg-green-100 text-green-800'
                            : source.affidabilita_media >= 70
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {source.affidabilita_media}% affidabilità
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">{source.descrizione}</p>
                  </div>
                </div>
              ))}
            </div>

            {errors.fonti_selezionate && (
              <p className="text-sm text-red-600">{errors.fonti_selezionate.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full mt-6 bg-gradient-to-br from-green-600 via-green-600 to-green-700 hover:from-green-700 hover:via-green-700 hover:to-green-800 text-white font-bold shadow-[0_4px_20px_rgba(34,197,94,0.3),0_1px_4px_rgba(34,197,94,0.2)] hover:shadow-[0_6px_30px_rgba(34,197,94,0.4),0_2px_8px_rgba(34,197,94,0.25)] transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            disabled={isLoading || selectedSources.length === 0}
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Estrazione in corso...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                <span>Avvia Estrazione Lead</span>
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
