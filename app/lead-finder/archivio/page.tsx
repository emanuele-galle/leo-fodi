'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
  Search,
  Calendar,
  MapPin,
  Database,
  ArrowRight,
  Loader2,
  Plus,
  Trash2,
  UserCircle,
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface LeadSearch {
  id: string
  searchName: string
  comune: string | null
  settore: string | null
  createdAt: string
  leadCount: number
  userEmail?: string
  userFullName?: string
}

export default function LeadFinderArchivioPage() {
  const [searches, setSearches] = useState<LeadSearch[]>([])
  const [filteredSearches, setFilteredSearches] = useState<LeadSearch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [searchToDelete, setSearchToDelete] = useState<LeadSearch | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUserAdmin, setIsUserAdmin] = useState(false)

  // Load searches on mount
  useEffect(() => {
    loadSearches()
  }, [])

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredSearches(searches)
    } else {
      const filtered = searches.filter(
        (search) =>
          search.searchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          search.comune?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          search.settore?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredSearches(filtered)
    }
  }, [searchTerm, searches])

  const loadSearches = async () => {
    try {
      setIsLoading(true)

      const response = await fetch('/api/lead-finder/archive')
      if (!response.ok) {
        console.error('Error loading searches:', response.statusText)
        return
      }

      const data = await response.json()
      setSearches(data.searches || [])
      setFilteredSearches(data.searches || [])
      setIsUserAdmin(data.isAdmin || false)

      console.log(`Loaded ${(data.searches || []).length} searches successfully`)
    } catch (error) {
      console.error('Exception loading searches:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleDeleteClick = (search: LeadSearch) => {
    setSearchToDelete(search)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!searchToDelete) return

    try {
      setIsDeleting(true)

      const response = await fetch(`/api/leads/searches?searchId=${searchToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Errore durante l\'eliminazione della ricerca')
      }

      // Rimuovi la ricerca dalla lista
      setSearches(prev => prev.filter(s => s.id !== searchToDelete.id))
      setFilteredSearches(prev => prev.filter(s => s.id !== searchToDelete.id))

      console.log(`Ricerca "${searchToDelete.searchName}" eliminata con successo`)

    } catch (error) {
      console.error('Errore eliminazione ricerca:', error)
      alert('Errore durante l\'eliminazione della ricerca')
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setSearchToDelete(null)
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50/40 via-gray-50/30 to-zinc-50/20 py-8 px-4">
        <div className="container mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-800 via-gray-700 to-zinc-800 bg-clip-text text-transparent flex items-center gap-3 drop-shadow-sm">
              <History className="h-10 w-10 text-slate-700" />
              Storico Lead
            </h1>
            <p className="text-base sm:text-lg text-gray-700 mt-2">
              Tutte le ricerche e i lead estratti
            </p>
          </div>
          <Link href="/lead-finder">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all">
              <Plus className="h-4 w-4 mr-2" />
              Nuova Ricerca
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50/50 to-white shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Ricerche Totali</p>
                  <p className="text-3xl font-bold text-blue-700">
                    {isLoading ? '...' : searches.length}
                  </p>
                </div>
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                  <Search className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Lead Estratti</p>
                  <p className="text-3xl font-bold text-emerald-700">
                    {isLoading
                      ? '...'
                      : searches.reduce((sum, s) => sum + s.leadCount, 0)}
                  </p>
                </div>
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md">
                  <Database className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-white shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Media per Ricerca</p>
                  <p className="text-3xl font-bold text-purple-700">
                    {isLoading
                      ? '...'
                      : searches.length > 0
                      ? Math.round(
                          searches.reduce((sum, s) => sum + s.leadCount, 0) / searches.length
                        )
                      : 0}
                  </p>
                </div>
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                  <Calendar className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Table */}
        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50/50 to-transparent">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl sm:text-2xl text-slate-800">
                  Ricerche Archiviate
                </CardTitle>
                <CardDescription>
                  Storico completo di tutte le estrazioni lead
                </CardDescription>
              </div>
              <div className="w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cerca per nome, comune, settore..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-slate-600" />
              </div>
            ) : filteredSearches.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>
                  {searchTerm
                    ? 'Nessuna ricerca trovata con questi criteri'
                    : 'Nessuna ricerca effettuata ancora'}
                </p>
                <Link href="/lead-finder">
                  <Button variant="outline" className="mt-4">
                    Inizia la prima ricerca
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome Ricerca</TableHead>
                    <TableHead>Localit\u00e0</TableHead>
                    <TableHead>Settore</TableHead>
                    <TableHead className="text-center">Lead Estratti</TableHead>
                    {isUserAdmin && <TableHead>Utente</TableHead>}
                    <TableHead>Data Creazione</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSearches.map((search) => (
                    <TableRow key={search.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium">{search.searchName}</TableCell>
                      <TableCell>
                        {search.comune && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <MapPin className="h-3 w-3" />
                            <span>{search.comune}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {search.settore && (
                          <Badge variant="secondary">{search.settore}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className="font-mono font-semibold text-emerald-700 border-emerald-300"
                        >
                          {search.leadCount}
                        </Badge>
                      </TableCell>
                      {isUserAdmin && (
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <UserCircle className="h-4 w-4 text-slate-600" />
                            <div>
                              <div className="font-medium">{search.userFullName || 'N/D'}</div>
                              <div className="text-xs text-gray-500">{search.userEmail || 'N/D'}</div>
                            </div>
                          </div>
                        </TableCell>
                      )}
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(search.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/lead-finder?searchId=${search.id}`}>
                            <Button variant="ghost" size="sm">
                              Visualizza
                              <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(search)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare la ricerca <strong>&quot;{searchToDelete?.searchName}&quot;</strong>?
              <br />
              <br />
              Questa azione eliminer\u00e0 definitivamente la ricerca e tutti i {searchToDelete?.leadCount || 0} lead associati.
              <br />
              <strong className="text-red-600">Questa operazione non pu\u00f2 essere annullata.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminazione...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Elimina
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
