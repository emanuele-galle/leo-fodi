'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  Archive,
  Eye,
  Search,
  Calendar,
  User,
  Loader2,
  Download,
  Trash2,
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

interface ProfileArchive {
  id: string
  targetId: string
  createdAt: string
  nome: string
  cognome: string
  profileData: any
  punteggioComplessivo: number
  completezzaProfilo: number
  userId?: string
}

export default function OSINTArchivioPage() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<ProfileArchive[]>([])
  const [filteredProfiles, setFilteredProfiles] = useState<ProfileArchive[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [profileToDelete, setProfileToDelete] = useState<ProfileArchive | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Load profiles on mount
  useEffect(() => {
    loadProfiles()
  }, [])

  // Filter profiles based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredProfiles(profiles)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = profiles.filter(
      (profile) =>
        profile.nome.toLowerCase().includes(query) ||
        profile.cognome.toLowerCase().includes(query) ||
        profile.profileData?.target?.citta?.toLowerCase().includes(query)
    )
    setFilteredProfiles(filtered)
  }, [searchQuery, profiles])

  const loadProfiles = async () => {
    try {
      setIsLoading(true)

      const response = await fetch('/api/osint/archive')
      if (!response.ok) {
        console.error('Error loading profiles:', response.statusText)
        return
      }

      const data = await response.json()
      const profilesList = data.profiles || []

      setProfiles(profilesList)
      setFilteredProfiles(profilesList)
      console.log(`Loaded ${profilesList.length} profiles successfully`)
    } catch (error) {
      console.error('Exception loading profiles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewProfile = (profileId: string) => {
    router.push(`/osint-profiler/view/${profileId}`)
  }

  const handleDeleteClick = (profile: ProfileArchive) => {
    setProfileToDelete(profile)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!profileToDelete) return

    try {
      setIsDeleting(true)

      const response = await fetch(`/api/osint/archive?id=${profileToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        console.error('Error deleting profile:', response.statusText)
        alert('Errore durante l\'eliminazione del profilo')
        return
      }

      // Rimuovi il profilo dalla lista
      setProfiles(prev => prev.filter(p => p.id !== profileToDelete.id))
      setFilteredProfiles(prev => prev.filter(p => p.id !== profileToDelete.id))

      console.log(`Profilo "${profileToDelete.nome} ${profileToDelete.cognome}" eliminato`)
    } catch (error) {
      console.error('Exception deleting profile:', error)
      alert('Errore durante l\'eliminazione del profilo')
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setProfileToDelete(null)
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

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50/40 via-indigo-50/30 to-purple-50/20 py-8 sm:py-12 px-4">
        <div className="container mx-auto max-w-7xl space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 bg-clip-text text-transparent flex items-center gap-3 sm:gap-4 drop-shadow-sm">
                <Archive className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600" />
                Archivio Ricerche OSINT
              </h1>
              <p className="text-base sm:text-lg text-gray-700 mt-2">
                Consulta e gestisci tutte le profilazioni OSINT effettuate
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/osint-profiler')}
              className="shadow-sm hover:shadow-md transition-all"
            >
              Nuova Ricerca
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="border border-blue-600/20 shadow-[0_6px_24px_rgba(59,130,246,0.12)]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-gray-400" />
              <Input
                placeholder="Cerca per nome, cognome, localit\u00e0 o settore..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border border-blue-600/20 bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{profiles.length}</div>
                <div className="text-sm text-gray-600 mt-1">Profili Totali</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-indigo-600/20 bg-gradient-to-br from-indigo-50 to-indigo-100/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">{filteredProfiles.length}</div>
                <div className="text-sm text-gray-600 mt-1">Risultati Filtrati</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-purple-600/20 bg-gradient-to-br from-purple-50 to-purple-100/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {profiles.filter((p) => {
                    const date = new Date(p.createdAt)
                    const now = new Date()
                    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
                    return diffDays <= 30
                  }).length}
                </div>
                <div className="text-sm text-gray-600 mt-1">Ultimi 30 giorni</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profiles Table */}
        <Card className="border border-blue-600/10 shadow-[0_6px_24px_rgba(0,0,0,0.08)]">
          <CardHeader className="bg-gradient-to-r from-blue-50/50 to-transparent">
            <CardTitle className="text-xl sm:text-2xl text-blue-800">
              Profili OSINT ({filteredProfiles.length})
            </CardTitle>
            <CardDescription>
              Clicca su un profilo per visualizzare i dettagli completi
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              </div>
            ) : filteredProfiles.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {searchQuery ? (
                  <>
                    <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nessun profilo trovato per &quot;{searchQuery}&quot;</p>
                  </>
                ) : (
                  <>
                    <Archive className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nessun profilo OSINT ancora creato</p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        router.push('/osint-profiler')
                      }}
                      className="mt-4"
                    >
                      Crea il primo profilo
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Localit\u00e0</TableHead>
                    <TableHead>Analizzato da</TableHead>
                    <TableHead>Data Creazione</TableHead>
                    <TableHead>Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-600" />
                          <div>
                            {profile.nome} {profile.cognome}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{profile.profileData?.target?.citta || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {profile.userId ? (
                            <span className="font-mono text-xs">{profile.userId.substring(0, 8)}...</span>
                          ) : (
                            <span className="text-gray-400 italic">N/A</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          {formatDate(profile.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewProfile(profile.id)}
                            title="Visualizza profilo completo"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteClick(profile)}
                            title="Elimina profilo"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
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
              Sei sicuro di voler eliminare il profilo OSINT di <strong>&quot;{profileToDelete?.nome} {profileToDelete?.cognome}&quot;</strong>?
              <br />
              <br />
              Questa azione eliminer\u00e0 definitivamente il profilo e tutti i dati associati.
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
