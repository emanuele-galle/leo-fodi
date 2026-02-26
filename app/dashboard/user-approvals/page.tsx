'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { UserCheck, UserX, Clock, CheckCircle2, XCircle, Loader2, RefreshCw, Search, Trash2, Mail, Lock, Edit } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface UserProfile {
  id: string
  email: string
  name: string | null
  role: string
  approved: boolean
  createdAt: string
  updatedAt: string
}

export default function UserApprovalsPage() {
  const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([])
  const [approvedUsers, setApprovedUsers] = useState<UserProfile[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  // Edit dialogs state
  const [editEmailDialog, setEditEmailDialog] = useState(false)
  const [editPasswordDialog, setEditPasswordDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/users/list')
      if (!response.ok) throw new Error('Failed to fetch users')

      const data = await response.json()
      setPendingUsers(data.pendingUsers || [])
      setApprovedUsers(data.approvedUsers || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      alert('Errore nel caricamento degli utenti')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Filter approved users based on search query
  const filteredApprovedUsers = approvedUsers.filter((user) => {
    const query = searchQuery.toLowerCase()
    return (
      user.email.toLowerCase().includes(query) ||
      (user.name && user.name.toLowerCase().includes(query)) ||
      user.role.toLowerCase().includes(query)
    )
  })

  const handleApprove = async (userId: string) => {
    setProcessingId(userId)
    try {
      const response = await fetch('/api/admin/users/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Errore')
      }

      alert('Utente approvato con successo!')
      fetchUsers()
    } catch (error: any) {
      console.error('Error approving user:', error)
      alert(`Errore nell'approvazione dell'utente: ${error?.message || 'Errore sconosciuto'}`)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (userId: string) => {
    if (!confirm('Sei sicuro di voler rifiutare questo utente? L\'account verr\u00e0 eliminato.')) {
      return
    }

    setProcessingId(userId)
    try {
      const response = await fetch('/api/admin/users/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Errore')
      }

      alert('Utente rifiutato e rimosso')
      fetchUsers()
    } catch (error) {
      console.error('Error rejecting user:', error)
      alert('Errore nel rifiuto dell\'utente')
    } finally {
      setProcessingId(null)
    }
  }

  const handleDeleteApproved = async (userId: string, userEmail: string) => {
    if (!confirm(`Sei sicuro di voler eliminare l'utente "${userEmail}"? Questa azione non pu\u00f2 essere annullata.`)) {
      return
    }

    setProcessingId(userId)
    try {
      const response = await fetch('/api/admin/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Errore')
      }

      alert('Utente eliminato con successo')
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Errore nell\'eliminazione dell\'utente')
    } finally {
      setProcessingId(null)
    }
  }

  const openEditEmailDialog = (user: UserProfile) => {
    setSelectedUser(user)
    setNewEmail(user.email)
    setEditEmailDialog(true)
  }

  const openEditPasswordDialog = (user: UserProfile) => {
    setSelectedUser(user)
    setNewPassword('')
    setConfirmPassword('')
    setEditPasswordDialog(true)
  }

  const handleUpdateEmail = async () => {
    if (!selectedUser) return

    if (!newEmail || !newEmail.includes('@')) {
      alert('Inserisci un indirizzo email valido')
      return
    }

    setProcessingId(selectedUser.id)
    try {
      const response = await fetch('/api/admin/users/update-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          newEmail,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Errore nell\'aggiornamento dell\'email')
      }

      alert('Email aggiornata con successo')
      setEditEmailDialog(false)
      fetchUsers()
    } catch (error: any) {
      console.error('Error updating email:', error)
      alert(`Errore nell'aggiornamento dell'email: ${error?.message || 'Errore sconosciuto'}`)
    } finally {
      setProcessingId(null)
    }
  }

  const handleUpdatePassword = async () => {
    if (!selectedUser) return

    if (!newPassword || newPassword.length < 6) {
      alert('La password deve essere di almeno 6 caratteri')
      return
    }

    if (newPassword !== confirmPassword) {
      alert('Le password non corrispondono')
      return
    }

    setProcessingId(selectedUser.id)
    try {
      const response = await fetch('/api/admin/users/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Errore nell\'aggiornamento della password')
      }

      alert('Password aggiornata con successo')
      setEditPasswordDialog(false)
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      console.error('Error updating password:', error)
      alert(`Errore nell'aggiornamento della password: ${error?.message || 'Errore sconosciuto'}`)
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-white via-[#115A23]/5 to-white py-8 px-4">
        <div className="container mx-auto max-w-6xl space-y-8">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3 drop-shadow-sm">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <UserCheck className="h-7 w-7 text-white" />
                </div>
                Gestione Approvazioni Utenti
              </h1>
              <p className="text-lg text-slate-600">
                Approva o rifiuta le richieste di accesso alla piattaforma
              </p>
            </div>
            <Button
              onClick={fetchUsers}
              disabled={loading}
              variant="outline"
              className="shadow-sm hover:shadow-md transition-all"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Aggiorna
            </Button>
          </div>

          {/* Tabs for Pending and Approved Users */}
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="pending" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600">
                <Clock className="h-4 w-4 mr-2" />
                In Attesa ({pendingUsers.length})
              </TabsTrigger>
              <TabsTrigger value="approved" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Approvati ({approvedUsers.length})
              </TabsTrigger>
            </TabsList>

            {/* Pending Users Tab */}
            <TabsContent value="pending" className="mt-6">
              <Card className="border-none bg-gradient-to-br from-white to-orange-50/30 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-orange-50/50 via-amber-50/30 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-slate-800 flex items-center gap-2">
                    <Clock className="h-6 w-6 text-amber-600" />
                    Utenti In Attesa
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    {pendingUsers.length} {pendingUsers.length === 1 ? 'utente in attesa' : 'utenti in attesa'} di approvazione
                  </CardDescription>
                </div>
                {pendingUsers.length > 0 && (
                  <Badge className="bg-amber-500 text-white text-lg px-4 py-2">
                    {pendingUsers.length}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                </div>
              ) : pendingUsers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex h-16 w-16 rounded-full bg-emerald-100 items-center justify-center mb-4">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                  </div>
                  <p className="text-lg text-slate-600 font-medium">
                    Nessun utente in attesa di approvazione
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    Tutte le richieste sono state gestite
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome Completo</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Ruolo</TableHead>
                        <TableHead>Data Registrazione</TableHead>
                        <TableHead className="text-right">Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.name || 'N/D'}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{user.role}</Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString('it-IT', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApprove(user.id)}
                                disabled={processingId === user.id}
                                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-md hover:shadow-lg transition-all"
                              >
                                {processingId === user.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    Approva
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(user.id)}
                                disabled={processingId === user.id}
                                className="shadow-md hover:shadow-lg transition-all"
                              >
                                {processingId === user.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Rifiuta
                                  </>
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
            </TabsContent>

            {/* Approved Users Tab */}
            <TabsContent value="approved" className="mt-6">
              <Card className="border-none bg-gradient-to-br from-white to-emerald-50/30 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-transparent">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl text-slate-800 flex items-center gap-2">
                        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                        Tutti gli Utenti Approvati
                      </CardTitle>
                      <CardDescription className="text-base mt-1">
                        {approvedUsers.length} {approvedUsers.length === 1 ? 'utente approvato' : 'utenti approvati'} - Cerca per nome, email o ruolo
                      </CardDescription>
                    </div>
                    <Badge className="bg-emerald-500 text-white text-lg px-4 py-2">
                      {filteredApprovedUsers.length}
                    </Badge>
                  </div>

                  {/* Search Bar */}
                  <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Cerca per nome, email o ruolo..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white/50 border-emerald-200 focus:border-emerald-400"
                    />
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
                    </div>
                  ) : filteredApprovedUsers.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="inline-flex h-16 w-16 rounded-full bg-slate-100 items-center justify-center mb-4">
                        <Search className="h-8 w-8 text-slate-400" />
                      </div>
                      <p className="text-lg text-slate-600 font-medium">
                        Nessun utente trovato
                      </p>
                      <p className="text-sm text-slate-500 mt-2">
                        Prova a modificare i criteri di ricerca
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome Completo</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Ruolo</TableHead>
                            <TableHead>Data Registrazione</TableHead>
                            <TableHead>Stato</TableHead>
                            <TableHead className="text-right">Azioni</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredApprovedUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">
                                {user.name || 'N/D'}
                              </TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                  {user.role}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {new Date(user.createdAt).toLocaleDateString('it-IT', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-emerald-500">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Approvato
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openEditEmailDialog(user)}
                                    disabled={processingId === user.id}
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 shadow-sm hover:shadow-md transition-all"
                                    title="Modifica email"
                                  >
                                    <Mail className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openEditPasswordDialog(user)}
                                    disabled={processingId === user.id}
                                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-200 shadow-sm hover:shadow-md transition-all"
                                    title="Modifica password"
                                  >
                                    <Lock className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteApproved(user.id, user.email)}
                                    disabled={processingId === user.id}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 shadow-sm hover:shadow-md transition-all"
                                    title="Elimina utente"
                                  >
                                    {processingId === user.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Edit Email Dialog */}
      <Dialog open={editEmailDialog} onOpenChange={setEditEmailDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Mail className="h-6 w-6 text-blue-600" />
              Modifica Email Utente
            </DialogTitle>
            <DialogDescription>
              Modifica l&apos;indirizzo email per <strong>{selectedUser?.name || selectedUser?.email}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="currentEmail">Email Corrente</Label>
              <Input
                id="currentEmail"
                value={selectedUser?.email || ''}
                disabled
                className="bg-slate-50"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="newEmail">Nuova Email</Label>
              <Input
                id="newEmail"
                type="email"
                placeholder="nuova.email@esempio.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="focus:border-blue-400"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditEmailDialog(false)}
              disabled={processingId === selectedUser?.id}
            >
              Annulla
            </Button>
            <Button
              onClick={handleUpdateEmail}
              disabled={processingId === selectedUser?.id || !newEmail}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              {processingId === selectedUser?.id ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Aggiornamento...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Aggiorna Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Password Dialog */}
      <Dialog open={editPasswordDialog} onOpenChange={setEditPasswordDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Lock className="h-6 w-6 text-purple-600" />
              Modifica Password Utente
            </DialogTitle>
            <DialogDescription>
              Imposta una nuova password per <strong>{selectedUser?.name || selectedUser?.email}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="newPassword">Nuova Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Minimo 6 caratteri"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="focus:border-purple-400"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Conferma Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Ripeti la password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="focus:border-purple-400"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditPasswordDialog(false)}
              disabled={processingId === selectedUser?.id}
            >
              Annulla
            </Button>
            <Button
              onClick={handleUpdatePassword}
              disabled={processingId === selectedUser?.id || !newPassword || !confirmPassword}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
            >
              {processingId === selectedUser?.id ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Aggiornamento...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Aggiorna Password
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
