'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Clock, LogOut, CheckCircle2, Mail, Shield, Bell, RefreshCw } from 'lucide-react'
import { signOut } from '@/lib/auth-client'
import { useAuth } from '@/components/auth/AuthProvider'

export default function PendingApprovalPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (user) {
      // If user is already approved, redirect
      if (user.approved) {
        router.push(user.role === 'admin' ? '/dashboard' : '/')
      }
    }
  }, [user, router])

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const checkApprovalStatus = async () => {
    setChecking(true)
    try {
      // Force a session refresh by reloading
      window.location.reload()
    } catch (error) {
      console.error('Error checking approval:', error)
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* LEFT SIDE - Hero Section Verde Leonardo */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#115A23] via-[#1a7a32] to-[#238238] p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
        </div>

        {/* Logo & Brand */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="h-14 w-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-natural">
              <svg
                viewBox="0 0 24 24"
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-white">LEO-FODI</span>
              <span className="text-sm text-white/80 font-medium">Powered by FODI S.r.l.</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-6">
            <h1 className="text-5xl font-bold text-white leading-tight">
              Benvenuto nella{' '}
              <span className="text-white/90 border-b-4 border-white/40">nostra community</span>
            </h1>
            <p className="text-xl text-white/90 leading-relaxed max-w-lg">
              Il tuo account \u00e8 quasi pronto. Stiamo verificando le tue informazioni per garantire la massima sicurezza a tutti gli utenti.
            </p>
          </div>

          {/* Timeline Visual */}
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-[#115A23]" strokeWidth={2.5} />
                </div>
                <div className="w-0.5 h-16 bg-white/30 mt-2"></div>
              </div>
              <div className="space-y-1 pt-2">
                <h3 className="text-lg font-semibold text-white">Registrazione Completata</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Il tuo account \u00e8 stato creato con successo
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 animate-pulse">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="w-0.5 h-16 bg-white/30 mt-2"></div>
              </div>
              <div className="space-y-1 pt-2">
                <h3 className="text-lg font-semibold text-white">Verifica in Corso</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Un amministratore sta verificando le tue credenziali
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <Bell className="h-6 w-6 text-white/60" />
                </div>
              </div>
              <div className="space-y-1 pt-2">
                <h3 className="text-lg font-semibold text-white/70">Notifica di Approvazione</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Riceverai una email quando sarai approvato
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-white/70 text-sm">
            <Shield className="inline h-4 w-4 mr-1" />
            Processo di approvazione manuale per la tua sicurezza
          </p>
        </div>
      </div>

      {/* RIGHT SIDE - Status & Actions */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-lg space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#115A23] to-[#238238] flex items-center justify-center shadow-natural">
                <svg
                  viewBox="0 0 24 24"
                  className="h-7 w-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-[#115A23]">LEO-FODI</h1>
                <p className="text-xs text-muted-foreground font-medium">AI Intelligence Platform</p>
              </div>
            </div>
          </div>

          {/* Status Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#115A23]/10 mb-2 relative">
              <div className="absolute inset-0 bg-[#115A23]/20 rounded-full animate-ping"></div>
              <Clock className="relative h-10 w-10 text-[#115A23]" />
            </div>
            <h2 className="text-4xl font-bold text-foreground">Account in Verifica</h2>
            <p className="text-lg text-muted-foreground">
              La tua richiesta di accesso \u00e8 in fase di approvazione
            </p>
          </div>

          {/* Status Card */}
          <div className="bg-[#115A23]/5 rounded-2xl p-6 border-2 border-[#115A23]/20">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#115A23] to-[#1a7a32] flex items-center justify-center shadow-natural">
                  <Mail className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-lg text-[#115A23]">
                  In Attesa di Approvazione
                </h3>
                <p className="text-sm text-foreground leading-relaxed">
                  Il tuo account <span className="font-semibold text-[#115A23]">{user?.email || ''}</span> \u00e8 stato creato con successo. Un amministratore verificher\u00e0 le tue credenziali per garantire la massima sicurezza.
                </p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#115A23]" />
              Come Funziona
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#115A23] text-white font-bold flex items-center justify-center text-sm">
                  1
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground leading-relaxed">
                    <span className="font-semibold">Notifica Inviata:</span> L&apos;amministratore ha ricevuto la tua richiesta di accesso
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#115A23] text-white font-bold flex items-center justify-center text-sm">
                  2
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground leading-relaxed">
                    <span className="font-semibold">Verifica Credenziali:</span> Controlliamo le tue informazioni per garantire sicurezza
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#115A23]/30 text-[#115A23] font-bold flex items-center justify-center text-sm">
                  3
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <span className="font-semibold">Conferma Email:</span> Riceverai una notifica quando sarai approvato
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={checkApprovalStatus}
              disabled={checking}
              className="w-full h-14 bg-gradient-to-r from-[#115A23] to-[#1a7a32] text-white rounded-xl font-semibold text-lg shadow-natural hover:shadow-deep hover:-translate-y-1 transition-all duration-200"
            >
              {checking ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Verifica in corso...
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Verifica Stato Approvazione
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full h-14 border-2 border-border hover:bg-accent rounded-xl font-semibold text-lg transition-all duration-200"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Esci dal Sistema
            </Button>
          </div>

          {/* Support Info */}
          <div className="text-center pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Hai bisogno di assistenza?{' '}
              <span className="font-semibold text-foreground">Contatta l&apos;amministratore</span>
            </p>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground pt-4">
            <span className="inline-flex items-center gap-1">
              Sviluppato da <span className="font-semibold text-foreground">Fodi S.r.l.</span>
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
