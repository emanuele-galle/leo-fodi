'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  History,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  ArrowLeft,
  Trash2,
} from 'lucide-react'

interface LeadSearch {
  id: string
  name: string
  settore: string
  comune?: string
  provincia?: string
  regione?: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  leads_trovati: number
  leads_validati: number
  fonti_consultate: number
  created_at: string
  updated_at: string
}

export default function SearchHistoryPage() {
  const router = useRouter()
  const [searches, setSearches] = useState<LeadSearch[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSearchHistory()
  }, [])

  const fetchSearchHistory = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/leads/searches')
      if (!response.ok) throw new Error('Failed to fetch search history')

      const data = await response.json()
      setSearches(data.searches || [])
    } catch (error) {
      console.error('Error fetching search history:', error)
      alert('Errore nel caricamento dello storico ricerche')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteSearch = async (searchId: string, searchName: string) => {
    // Conferma prima di eliminare
    const confirmed = window.confirm(
      `Sei sicuro di voler eliminare la ricerca "${searchName}"?\n\n` +
      `Questa azione eliminerà anche tutti i lead associati e non può essere annullata.`
    )

    if (!confirmed) return

    try {
      const response = await fetch(`/api/leads/searches?searchId=${searchId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Errore durante l\'eliminazione della ricerca')
      }

      // Rimuovi la ricerca dalla lista locale
      setSearches(searches.filter(s => s.id !== searchId))
      alert('✅ Ricerca eliminata con successo')
    } catch (error) {
      console.error('Error deleting search:', error)
      alert(`❌ Errore: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-500">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completata
          </Badge>
        )
      case 'running':
        return (
          <Badge className="bg-blue-500">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            In corso
          </Badge>
        )
      case 'failed':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Fallita
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const getLocationString = (search: LeadSearch) => {
    if (search.comune) return search.comune
    if (search.provincia) return search.provincia
    if (search.regione) return search.regione
    return 'Italia'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/40 via-emerald-50/30 to-green-50/20 py-8 sm:py-12 px-4">
      <div className="container mx-auto max-w-7xl space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-700 via-green-600 to-green-700 bg-clip-text text-transparent flex items-center gap-3 sm:gap-4 drop-shadow-sm">
              <History className="h-10 w-10 sm:h-12 sm:w-12 text-green-600" />
              Storico Ricerche
            </h1>
            <p className="text-base sm:text-lg text-gray-700 max-w-3xl leading-relaxed">
              Visualizza tutte le ricerche effettuate e i lead trovati
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/lead-finder')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Torna al Lead Finder
          </Button>
        </div>

        {/* Searches Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
              <p className="text-lg text-gray-600">
                Caricamento storico ricerche...
              </p>
            </div>
          </div>
        ) : searches.length === 0 ? (
          <Card className="border border-green-600/20 shadow-lg">
            <CardContent className="py-12 text-center">
              <History className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Nessuna ricerca trovata
              </h3>
              <p className="text-gray-600 mb-6">
                Non hai ancora effettuato ricerche. Inizia creando una nuova ricerca lead.
              </p>
              <Button
                onClick={() => router.push('/lead-finder')}
                className="bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                Crea Nuova Ricerca
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border border-green-600/10 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50/50 to-transparent">
              <CardTitle className="text-xl sm:text-2xl text-green-800">
                Ricerche Effettuate ({searches.length})
              </CardTitle>
              <CardDescription>
                Clicca su una ricerca per visualizzare i lead trovati
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome Ricerca</TableHead>
                    <TableHead>Settore</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Lead Trovati</TableHead>
                    <TableHead>Lead Validati</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searches.map((search) => (
                    <TableRow key={search.id}>
                      <TableCell className="font-medium">
                        {search.name}
                      </TableCell>
                      <TableCell>{search.settore}</TableCell>
                      <TableCell>{getLocationString(search)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {search.leads_trovati}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-500">
                          {search.leads_validati}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(search.status)}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(search.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // Navigate to lead finder with this search ID
                              router.push(`/lead-finder?searchId=${search.id}`)
                            }}
                            title="Visualizza lead"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Visualizza
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteSearch(search.id, search.name)}
                            title="Elimina ricerca"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
