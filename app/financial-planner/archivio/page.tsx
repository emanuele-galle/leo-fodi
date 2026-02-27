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
  FolderArchive,
  Eye,
  Search,
  Calendar,
  User,
  Loader2,
  Trash2,
  FileDown,
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

interface FinancialPlanArchive {
  id: string
  profileId: string
  createdAt: string
  clientNome: string
  clientCognome: string
  clientLocalita: string
  obiettiviFinanziari: any
  raccomandazioniProdotti: any
}

export default function FinancialPlannerArchivioPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<FinancialPlanArchive[]>([])
  const [filteredPlans, setFilteredPlans] = useState<FinancialPlanArchive[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [planToDelete, setPlanToDelete] = useState<FinancialPlanArchive | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Load plans on mount
  useEffect(() => {
    loadPlans()
  }, [])

  // Filter plans based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredPlans(plans)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = plans.filter(
      (plan) =>
        plan.clientNome.toLowerCase().includes(query) ||
        plan.clientCognome.toLowerCase().includes(query) ||
        plan.clientLocalita?.toLowerCase().includes(query)
    )
    setFilteredPlans(filtered)
  }, [searchQuery, plans])

  const loadPlans = async () => {
    try {
      setIsLoading(true)

      const response = await fetch('/api/financial-planner/archive')
      if (!response.ok) {
        console.error('Error loading financial plans:', response.statusText)
        return
      }

      const data = await response.json()
      const plansList = data.plans || []

      setPlans(plansList)
      setFilteredPlans(plansList)
    } catch (error) {
      console.error('Exception loading financial plans:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewPlan = (planId: string) => {
    router.push(`/financial-planner/view/${planId}`)
  }

  const handleDeleteClick = (plan: FinancialPlanArchive) => {
    setPlanToDelete(plan)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!planToDelete) return

    try {
      setIsDeleting(true)

      const response = await fetch(`/api/financial-planner/archive?id=${planToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        console.error('Error deleting financial plan:', response.statusText)
        alert('Errore durante l\'eliminazione del piano')
        return
      }

      // Rimuovi il piano dalla lista
      setPlans(prev => prev.filter(p => p.id !== planToDelete.id))
      setFilteredPlans(prev => prev.filter(p => p.id !== planToDelete.id))

      console.log(`Piano finanziario "${planToDelete.clientNome} ${planToDelete.clientCognome}" eliminato`)
    } catch (error) {
      console.error('Exception deleting financial plan:', error)
      alert('Errore durante l\'eliminazione del piano')
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setPlanToDelete(null)
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
      <div className="min-h-screen bg-gradient-to-br from-emerald-50/40 via-teal-50/30 to-cyan-50/20 py-8 sm:py-12 px-4">
        <div className="container mx-auto max-w-7xl space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-700 bg-clip-text text-transparent flex items-center gap-3 sm:gap-4 drop-shadow-sm">
                <FolderArchive className="h-10 w-10 sm:h-12 sm:w-12 text-emerald-600" />
                Archivio Pianificazioni Finanziarie
              </h1>
              <p className="text-base sm:text-lg text-gray-700 mt-2">
                Consulta e gestisci tutte le pianificazioni finanziarie create
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/financial-planner')}
              className="shadow-sm hover:shadow-md transition-all"
            >
              Nuova Pianificazione
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="border border-emerald-600/20 shadow-[0_6px_24px_rgba(16,185,129,0.12)]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-gray-400" />
              <Input
                placeholder="Cerca per nome, cognome o localit\u00e0..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border border-emerald-600/20 bg-gradient-to-br from-emerald-50 to-emerald-100/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">{plans.length}</div>
                <div className="text-sm text-gray-600 mt-1">Piani Totali</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-teal-600/20 bg-gradient-to-br from-teal-50 to-teal-100/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600">{filteredPlans.length}</div>
                <div className="text-sm text-gray-600 mt-1">Risultati Filtrati</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-cyan-600/20 bg-gradient-to-br from-cyan-50 to-cyan-100/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-600">
                  {plans.filter((p) => {
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

        {/* Plans Table */}
        <Card className="border border-emerald-600/10 shadow-[0_6px_24px_rgba(0,0,0,0.08)]">
          <CardHeader className="bg-gradient-to-r from-emerald-50/50 to-transparent">
            <CardTitle className="text-xl sm:text-2xl text-emerald-800">
              Pianificazioni Finanziarie ({filteredPlans.length})
            </CardTitle>
            <CardDescription>
              Clicca su un piano per visualizzare i dettagli completi
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
              </div>
            ) : filteredPlans.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {searchQuery ? (
                  <>
                    <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nessun piano trovato per &quot;{searchQuery}&quot;</p>
                  </>
                ) : (
                  <>
                    <FolderArchive className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nessun piano finanziario ancora creato</p>
                    <Button
                      variant="outline"
                      onClick={() => router.push('/financial-planner')}
                      className="mt-4"
                    >
                      Crea il primo piano
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
                  {filteredPlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-emerald-600" />
                          <div>
                            {plan.clientNome} {plan.clientCognome}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{plan.clientLocalita || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-400 italic">N/A</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          {formatDate(plan.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewPlan(plan.id)}
                            title="Visualizza piano completo"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`/api/export/financial-pdf?planId=${plan.id}`, '_blank')}
                            title="Scarica piano PDF"
                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          >
                            <FileDown className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteClick(plan)}
                            title="Elimina piano"
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
              Sei sicuro di voler eliminare il piano finanziario di <strong>&quot;{planToDelete?.clientNome} {planToDelete?.clientCognome}&quot;</strong>?
              <br />
              <br />
              Questa azione eliminer\u00e0 definitivamente il piano e tutti i dati associati.
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
