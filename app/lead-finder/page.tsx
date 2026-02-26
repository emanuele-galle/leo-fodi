'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { LeadSearchForm } from '@/components/leads/lead-search-form'
import { LeadDetailsDialog } from '@/components/leads/lead-details-dialog'
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
  Search,
  Download,
  Eye,
  UserPlus,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  ScanLine,
  History,
  MapPin,
  MoreVertical,
  Check,
  X,
  CircleOff,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Lead, LeadContactStatus, ContactStatus } from '@/lib/types/lead-extraction'
import ExcelJS from 'exceljs'

function LeadFinderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchId, setSearchId] = useState<string | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [contactStatuses, setContactStatuses] = useState<Record<string, LeadContactStatus>>({})
  const [statusFilter, setStatusFilter] = useState<ContactStatus | 'all'>('all')
  const [searchStatus, setSearchStatus] = useState<any>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [enrichmentLoadingId, setEnrichmentLoadingId] = useState<string | null>(null)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)

  // Load search from URL parameter if present
  useEffect(() => {
    const urlSearchId = searchParams.get('searchId')
    if (urlSearchId) {
      setSearchId(urlSearchId)
      setIsPolling(true)
    }
  }, [searchParams])

  // Poll for results when search is running
  useEffect(() => {
    if (!searchId || !isPolling) return

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/leads/extract?searchId=${searchId}`)
        if (!response.ok) return

        const data = await response.json()
        console.log('🔍 Polling data received:', {
          searchId,
          status: data.search?.status,
          leadsCount: data.leads?.length,
          leads: data.leads,
          rawData: data
        })
        setSearchStatus(data.search)
        setLeads(data.leads)

        // Stop polling when completed or failed
        if (data.search.status === 'completed' || data.search.status === 'failed') {
          setIsPolling(false)
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 3000) // Poll every 3 seconds

    return () => clearInterval(interval)
  }, [searchId, isPolling])

  // Load contact statuses when leads change
  useEffect(() => {
    if (leads.length === 0) {
      setContactStatuses({})
      return
    }

    loadContactStatuses(leads.map(l => l.id))
  }, [leads])

  const loadContactStatuses = async (leadIds: string[]) => {
    if (leadIds.length === 0) return

    try {
      const response = await fetch(`/api/leads/contact-status?leadIds=${leadIds.join(',')}`)
      if (!response.ok) return

      const data = await response.json()
      setContactStatuses(data.statuses || {})
    } catch (error) {
      console.error('Error loading contact statuses:', error)
    }
  }

  const handleSetContactStatus = async (leadId: string, status: ContactStatus) => {
    try {
      const response = await fetch('/api/leads/contact-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, contactStatus: status }),
      })

      if (!response.ok) {
        throw new Error('Errore durante l\'aggiornamento dello stato')
      }

      const data = await response.json()

      // Update local state
      setContactStatuses(prev => ({
        ...prev,
        [leadId]: data.status,
      }))

      alert('✅ Stato aggiornato con successo')
    } catch (error) {
      console.error('Error setting contact status:', error)
      alert(`❌ Errore: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`)
    }
  }

  const handleSearchSuccess = (data: { searchId: string }) => {
    setSearchId(data.searchId)
    setIsPolling(true)
    setLeads([])
  }

  const handleWebEnrichment = async (lead: Lead) => {
    if (!lead.id) return

    setEnrichmentLoadingId(lead.id)

    try {
      const response = await fetch(`/api/leads/web-enrichment/${lead.id}`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error("Errore durante l'arricchimento web")
      }

      const result = await response.json()

      // Update lead in state
      setLeads((prevLeads) =>
        prevLeads.map((l) =>
          l.id === lead.id ? result.lead : l
        )
      )

      alert(`✅ Arricchimento completato!\n\nNuovi dati trovati per ${lead.ragione_sociale}`)
    } catch (error) {
      console.error('Web enrichment error:', error)
      alert(`❌ Errore durante l'arricchimento: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`)
    } finally {
      setEnrichmentLoadingId(null)
    }
  }

  const handleExportCSV = async () => {
    if (leads.length === 0) return

    // Formato identico al file Excel "CREAZIONE LISTA PROSPECT.xlsx"
    // Colonne: COGNOME E NOME PROSPECT | RECAPITO_TELEFONICO_CELLULARE

    // Crea un nuovo workbook con ExcelJS
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Sheet1')

    // Imposta larghezza colonne
    worksheet.columns = [
      { header: 'COGNOME E NOME PROSPECT', key: 'nome', width: 40 },
      { header: 'RECAPITO_TELEFONICO_CELLULARE', key: 'telefono', width: 25 },
    ]

    // Applica stile rosso alla riga header (riga 1)
    worksheet.getRow(1).eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFF0000' }, // Rosso
      }
      cell.font = {
        color: { argb: 'FFFFFFFF' }, // Testo bianco
        bold: true,
      }
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'left',
      }
    })

    // Aggiungi i dati dei lead
    filteredLeads.forEach((lead) => {
      worksheet.addRow({
        nome: lead.ragione_sociale || '',
        telefono: lead.telefono_principale || '',
      })
    })

    // Genera il file Excel e scaricalo
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `lista_prospect_${searchId}_${Date.now()}.xlsx`
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-blue-500">
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

  const getRowBackgroundColor = (leadId: string) => {
    const status = contactStatuses[leadId]?.contact_status
    if (!status || status === 'none') return ''
    if (status === 'contacted') return 'bg-green-100 hover:bg-green-200 border-l-4 border-green-600'
    if (status === 'do_not_contact') return 'bg-red-100 hover:bg-red-200 border-l-4 border-red-600'
    return ''
  }

  const getContactTooltip = (leadId: string) => {
    const status = contactStatuses[leadId]
    if (!status || status.contact_status === 'none') return undefined

    const statusText = status.contact_status === 'contacted' ? 'Contattato' : 'Non contattare'
    const userName = status.user?.name || 'Utente sconosciuto'
    const date = new Date(status.contacted_at).toLocaleDateString('it-IT')

    return `${statusText} da ${userName} il ${date}`
  }

  // Filter leads based on contact status
  const filteredLeads = leads.filter((lead) => {
    if (statusFilter === 'all') return true

    const status = contactStatuses[lead.id]?.contact_status

    if (statusFilter === 'none') {
      return !status || status === 'none'
    }

    return status === statusFilter
  })

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-white via-[#A2C054]/10 to-white py-8 px-4">
        <div className="container mx-auto max-w-6xl space-y-8 fade-in-up">
        {/* Hero Header - Verde Lime Growth */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#A2C054] via-[#8BA048] to-[#A2C054] p-8 md:p-12 shadow-deep">
          {/* Decorative Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-natural">
                <Search className="h-9 w-9 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  Lead Generation Intelligente
                </h1>
                <p className="text-white/80 text-sm font-medium">Sistema Multi-Source AI</p>
              </div>
            </div>

            <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-3xl">
              Trasforma ore di ricerca manuale in{' '}
              <span className="font-bold border-b-4 border-white/40">pipeline pronte in 60 secondi</span>{' '}
              con contatti verificati e qualificati
            </p>

            {/* Benefits Quick Pills */}
            <div className="flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30">
                <CheckCircle2 className="h-4 w-4 text-white" strokeWidth={2.5} />
                <span className="text-sm font-semibold text-white">5+ fonti aggregate</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30">
                <CheckCircle2 className="h-4 w-4 text-white" strokeWidth={2.5} />
                <span className="text-sm font-semibold text-white">Email & telefoni verificati</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30">
                <CheckCircle2 className="h-4 w-4 text-white" strokeWidth={2.5} />
                <span className="text-sm font-semibold text-white">Export Excel immediato</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Form */}
        {!searchId && (
          <div className="w-full">
            <LeadSearchForm onSuccess={handleSearchSuccess} />
          </div>
        )}

        {/* Results Section */}
        {searchId && (
          <div className="space-y-6">
            {/* Status Card - Verde Lime */}
            {searchStatus && (
              <Card className="card-premium border-2 border-[#A2C054]/20 shadow-deep">
                <CardHeader className="relative overflow-hidden bg-gradient-to-r from-[#A2C054]/20 via-[#A2C054]/10 to-transparent border-b-2 border-[#A2C054]/20">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#A2C054] to-[#8BA048] flex items-center justify-center shadow-natural">
                        <ScanLine className="h-6 w-6 text-white" strokeWidth={2.5} />
                      </div>
                      <div>
                        <CardTitle className="text-xl sm:text-2xl text-[#A2C054] font-bold">Ricerca: {searchStatus.name}</CardTitle>
                        <CardDescription className="text-sm sm:text-base mt-1 font-medium">
                          Settore: {searchStatus.settore} | Area: {searchStatus.comune || searchStatus.regione || 'Italia'}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="bg-[#A2C054]/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-[#A2C054]/30">
                      {getStatusBadge(searchStatus.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
                    <div className="text-center p-4 sm:p-5 card-premium bg-gradient-to-br from-[#A2C054]/10 to-[#A2C054]/5 border-[#A2C054]/30 shadow-natural hover:shadow-deep transition-all duration-200">
                      <div className="text-2xl sm:text-3xl font-bold text-[#A2C054]">
                        {searchStatus.leads_trovati}
                      </div>
                      <div className="text-xs sm:text-sm text-slate-700 mt-1 font-semibold">Lead Trovati</div>
                    </div>
                    <div className="text-center p-4 sm:p-5 card-premium bg-gradient-to-br from-[#91BDE2]/10 to-[#91BDE2]/5 border-[#91BDE2]/30 shadow-natural hover:shadow-deep transition-all duration-200">
                      <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                        {searchStatus.leads_validati}
                      </div>
                      <div className="text-xs sm:text-sm text-slate-700 mt-1 font-semibold">Lead Validati</div>
                    </div>
                    <div className="text-center p-4 sm:p-5 card-premium bg-gradient-to-br from-[#B15082]/10 to-[#B15082]/5 border-[#B15082]/30 shadow-natural hover:shadow-deep transition-all duration-200">
                      <div className="text-2xl sm:text-3xl font-bold text-[#B15082]">
                        {searchStatus.fonti_consultate}
                      </div>
                      <div className="text-xs sm:text-sm text-slate-700 mt-1 font-semibold">Fonti Consultate</div>
                    </div>
                    <div className="text-center p-4 sm:p-5 card-premium bg-gradient-to-br from-[#F8AC3D]/10 to-[#F8AC3D]/5 border-[#F8AC3D]/30 shadow-natural hover:shadow-deep transition-all duration-200">
                      <div className="text-2xl sm:text-3xl font-bold text-[#F8AC3D]">
                        {isPolling ? <span className="shimmer">...</span> : '100%'}
                      </div>
                      <div className="text-xs sm:text-sm text-slate-700 mt-1 font-semibold">Completamento</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions & Filters - Verde Lime */}
            {leads.length > 0 && (
              <div className="space-y-3">
                {/* Filters */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-semibold text-slate-700">Filtra per stato:</span>
                  <Button
                    size="sm"
                    variant={statusFilter === 'all' ? 'default' : 'outline'}
                    onClick={() => setStatusFilter('all')}
                    className={statusFilter === 'all' ? 'bg-[#A2C054] hover:bg-[#8BA048]' : ''}
                  >
                    Tutti ({leads.length})
                  </Button>
                  <Button
                    size="sm"
                    variant={statusFilter === 'none' ? 'default' : 'outline'}
                    onClick={() => setStatusFilter('none')}
                    className={statusFilter === 'none' ? 'bg-slate-500 hover:bg-slate-600' : ''}
                  >
                    <CircleOff className="h-3.5 w-3.5 mr-1" />
                    Da contattare ({leads.filter(l => !contactStatuses[l.id] || contactStatuses[l.id]?.contact_status === 'none').length})
                  </Button>
                  <Button
                    size="sm"
                    variant={statusFilter === 'contacted' ? 'default' : 'outline'}
                    onClick={() => setStatusFilter('contacted')}
                    className={statusFilter === 'contacted' ? 'bg-green-600 hover:bg-green-700 text-white' : 'border-green-600 text-green-700 hover:bg-green-50'}
                  >
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Contattati ({leads.filter(l => contactStatuses[l.id]?.contact_status === 'contacted').length})
                  </Button>
                  <Button
                    size="sm"
                    variant={statusFilter === 'do_not_contact' ? 'default' : 'outline'}
                    onClick={() => setStatusFilter('do_not_contact')}
                    className={statusFilter === 'do_not_contact' ? 'bg-red-600 hover:bg-red-700 text-white' : 'border-red-600 text-red-700 hover:bg-red-50'}
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Non contattare ({leads.filter(l => contactStatuses[l.id]?.contact_status === 'do_not_contact').length})
                  </Button>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-end fade-in">
                  <Button
                    variant="outline"
                    onClick={() => setSearchId(null)}
                    className="h-12 border-2 border-[#A2C054]/30 text-[#A2C054] hover:bg-[#A2C054]/10 shadow-natural hover:shadow-deep font-semibold rounded-xl transition-all duration-200 touch-target w-full sm:w-auto"
                  >
                    <Search className="h-5 w-5 mr-2" strokeWidth={2.5} />
                    Nuova Ricerca
                  </Button>
                  <Button
                    onClick={handleExportCSV}
                    className="h-12 flex items-center justify-center gap-2 bg-gradient-to-r from-[#A2C054] to-[#8BA048] hover:shadow-deep hover:-translate-y-1 transition-all duration-200 touch-target w-full sm:w-auto text-white font-semibold rounded-xl shadow-natural"
                  >
                    <Download className="h-5 w-5" strokeWidth={2.5} />
                    Esporta Excel ({filteredLeads.length})
                  </Button>
                </div>
              </div>
            )}

            {/* Leads Table - Verde Lime */}
            {leads.length > 0 && (
              <Card className="card-premium border-2 border-[#A2C054]/20 shadow-deep">
                <CardHeader className="relative overflow-hidden bg-gradient-to-r from-[#A2C054]/20 via-[#A2C054]/10 to-transparent border-b-2 border-[#A2C054]/20">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#A2C054] to-[#8BA048] flex items-center justify-center shadow-natural">
                      <Search className="h-6 w-6 text-white" strokeWidth={2.5} />
                    </div>
                    <CardTitle className="text-xl sm:text-2xl text-[#A2C054] font-bold">
                      Lead Trovati ({filteredLeads.length} di {leads.length})
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-slate-50/80 to-transparent border-b-2 border-slate-200">
                          <TableHead className="font-bold text-slate-700">Ragione Sociale</TableHead>
                          <TableHead className="font-bold text-slate-700">Città</TableHead>
                          <TableHead className="font-bold text-slate-700">Telefono</TableHead>
                          <TableHead className="font-bold text-slate-700">Email</TableHead>
                          <TableHead className="font-bold text-slate-700">Sito Web</TableHead>
                          <TableHead className="font-bold text-slate-700">Fonte</TableHead>
                          <TableHead className="font-bold text-slate-700 text-right">Azioni</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLeads.map((lead) => (
                          <TableRow
                            key={lead.id}
                            className={`${getRowBackgroundColor(lead.id)} transition-all duration-200 border-b border-slate-100`}
                            title={getContactTooltip(lead.id)}
                          >
                            <TableCell className="font-semibold text-slate-800">
                              {lead.ragione_sociale}
                              {lead.partita_iva && (
                                <div className="text-xs text-slate-500 font-normal mt-0.5">P.IVA: {lead.partita_iva}</div>
                              )}
                            </TableCell>
                            <TableCell className="text-slate-700">
                              {lead.citta} <span className="text-slate-500">({lead.provincia})</span>
                            </TableCell>
                            <TableCell className="font-mono text-sm text-slate-700">{lead.telefono_principale || <span className="text-slate-400">-</span>}</TableCell>
                            <TableCell className="text-sm text-slate-700">{lead.email_principale || <span className="text-slate-400">-</span>}</TableCell>
                            <TableCell>
                              {lead.sito_web ? (
                                <a
                                  href={lead.sito_web}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-700 hover:underline text-sm font-medium transition-colors"
                                >
                                  {lead.sito_web.replace(/^https?:\/\//, '').slice(0, 30)}
                                </a>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs font-semibold bg-slate-100 text-slate-700">
                                {lead.fonte_primaria || 'N/D'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2 justify-end">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="touch-target border-[#A2C054]/30 text-[#A2C054] hover:bg-[#A2C054]/10 hover:border-[#A2C054]/50 transition-all"
                                      title="Gestisci stato contatto"
                                    >
                                      <MoreVertical className="h-3.5 w-3.5" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => handleSetContactStatus(lead.id, 'contacted')}
                                      className="text-green-700 focus:text-green-800 focus:bg-green-100 font-medium"
                                    >
                                      <Check className="h-4 w-4 mr-2" />
                                      Contattato
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleSetContactStatus(lead.id, 'do_not_contact')}
                                      className="text-red-700 focus:text-red-800 focus:bg-red-100 font-medium"
                                    >
                                      <X className="h-4 w-4 mr-2" />
                                      Non contattare
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleSetContactStatus(lead.id, 'none')}
                                      className="text-slate-600 focus:text-slate-700"
                                    >
                                      <CircleOff className="h-4 w-4 mr-2" />
                                      Resetta stato
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedLead(lead)
                                    setDetailsDialogOpen(true)
                                  }}
                                  title="Visualizza dettagli completi"
                                  className="touch-target border-[#A2C054]/30 text-[#A2C054] hover:bg-[#A2C054]/10 hover:border-[#A2C054]/50 transition-all"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleWebEnrichment(lead)}
                                  disabled={enrichmentLoadingId === lead.id}
                                  title="Arricchimento Dati - Cerca informazioni aggiuntive sul web"
                                  className="bg-gradient-to-r from-[#91BDE2] to-[#0693e3] hover:shadow-md shadow-natural interactive touch-target text-white"
                                >
                                  {enrichmentLoadingId === lead.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <ScanLine className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden p-4 space-y-3">
                    {filteredLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="card-premium bg-gradient-to-br from-white to-slate-50/50 border-slate-200 p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-800 text-base">{lead.ragione_sociale}</h3>
                            {lead.partita_iva && (
                              <p className="text-xs text-slate-500 mt-0.5">P.IVA: {lead.partita_iva}</p>
                            )}
                          </div>
                          <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-700">
                            {lead.fonte_primaria || 'N/D'}
                          </Badge>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-slate-700">
                            <MapPin className="h-4 w-4 text-amber-600" />
                            <span>{lead.citta} ({lead.provincia})</span>
                          </div>
                          {lead.telefono_principale && (
                            <div className="flex items-center gap-2 text-slate-700 font-mono">
                              📞 {lead.telefono_principale}
                            </div>
                          )}
                          {lead.email_principale && (
                            <div className="flex items-center gap-2 text-slate-700 text-xs">
                              ✉️ {lead.email_principale}
                            </div>
                          )}
                          {lead.sito_web && (
                            <div className="flex items-center gap-2">
                              <a
                                href={lead.sito_web}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 hover:underline text-xs font-medium"
                              >
                                🌐 {lead.sito_web.replace(/^https?:\/\//, '').slice(0, 30)}
                              </a>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-slate-200">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedLead(lead)
                              setDetailsDialogOpen(true)
                            }}
                            className="flex-1 touch-target hover:bg-blue-50 hover:border-blue-300"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Dettagli
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleWebEnrichment(lead)}
                            disabled={enrichmentLoadingId === lead.id}
                            className="flex-1 bg-gradient-to-br from-fuchsia-500 to-pink-600 hover:from-fuchsia-600 hover:to-pink-700 shadow-md hover:shadow-lg interactive touch-target text-white"
                          >
                            {enrichmentLoadingId === lead.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <ScanLine className="h-4 w-4 mr-1" />
                                OSINT
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Loading State */}
            {isPolling && leads.length === 0 && (
              <div className="flex items-center justify-center py-12 fade-in">
                <div className="text-center space-y-4 card-premium p-8 max-w-md">
                  <div className="relative">
                    <div className="absolute inset-0 gradient-warm opacity-20 blur-2xl rounded-full"></div>
                    <Loader2 className="h-16 w-16 animate-spin text-amber-600 mx-auto relative z-10" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg text-slate-800 font-semibold">
                      Estrazione in corso...
                    </p>
                    <p className="text-sm text-slate-600">
                      Stiamo consultando le fonti disponibili per trovare i migliori lead
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                    <div className="shimmer w-full h-1 bg-gradient-to-r from-amber-200 to-orange-200 rounded-full"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Lead Details Dialog */}
        <LeadDetailsDialog
          lead={selectedLead}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
        />
        </div>
      </div>
    </>
  )
}

// Wrapper con Suspense per useSearchParams
export default function LeadFinderPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    }>
      <LeadFinderContent />
    </Suspense>
  )
}
