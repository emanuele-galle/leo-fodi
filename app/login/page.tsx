'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Lock, Mail, LogIn, UserPlus, Shield, Target, TrendingUp, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn.email({ email, password })

      if (result.error) {
        throw new Error(result.error.message || 'Errore di autenticazione')
      }

      await new Promise(resolve => setTimeout(resolve, 500))
      window.location.href = '/dashboard'
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Errore durante il login. Verifica le credenziali.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* LEFT SIDE - Hero Section con Gradiente Leonardo */}
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

        {/* Main Content - Transformation Focus (85/15 Rule) */}
        <div className="relative z-10 space-y-10">
          <div className="space-y-6">
            <h1 className="text-5xl font-bold text-white leading-tight">
              Trasforma i tuoi dati in{' '}
              <span className="text-white/90 border-b-4 border-white/40">decisioni vincenti</span>
            </h1>
            <p className="text-xl text-white/90 leading-relaxed max-w-lg">
              Profila clienti in tempo reale, genera lead qualificati e crea piani finanziari personalizzati con l&apos;intelligenza artificiale.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 gap-5">
            <div className="flex items-start gap-4 p-5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-natural hover:shadow-deep hover:-translate-y-1 transition-all duration-200">
              <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-white">Profilazione OSINT Istantanea</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Analizza profili digitali completi in 30 secondi invece di ore di ricerca manuale
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-natural hover:shadow-deep hover:-translate-y-1 transition-all duration-200">
              <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-white">Lead Qualificati su Misura</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Genera automaticamente liste di prospect verificati e pronti da contattare
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-natural hover:shadow-deep hover:-translate-y-1 transition-all duration-200">
              <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-white">Piani Finanziari Personalizzati</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Crea strategie assicurative su misura che chiudono pi\u00f9 vendite
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-white/70 text-sm">
            <Shield className="inline h-4 w-4 mr-1" />
            Dati protetti con crittografia end-to-end
          </p>
        </div>
      </div>

      {/* RIGHT SIDE - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center space-y-3 mb-8">
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

          {/* Form Header */}
          <div className="space-y-3">
            <h2 className="text-4xl font-bold text-foreground">Bentornato</h2>
            <p className="text-lg text-muted-foreground">
              Accedi per sbloccare il potenziale dei tuoi dati
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-lg bg-[#cf2e2e]/10 border-2 border-[#cf2e2e]">
                <p className="text-sm text-[#cf2e2e] font-medium">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="esempio@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-12 h-14 rounded-xl border-2 border-border bg-white hover:border-[#115A23]/30 focus:border-[#115A23] transition-colors text-base font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-12 h-14 rounded-xl border-2 border-border bg-white hover:border-[#115A23]/30 focus:border-[#115A23] transition-colors text-base font-medium"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-gradient-to-r from-[#115A23] to-[#1a7a32] text-white rounded-xl font-semibold text-lg shadow-natural hover:shadow-deep hover:-translate-y-1 transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Accesso in corso...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-6 w-6" />
                  Accedi alla piattaforma
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-muted-foreground font-medium">Non hai un account?</span>
              </div>
            </div>

            {/* Register Link */}
            <Link href="/register" className="block">
              <Button
                type="button"
                variant="outline"
                className="w-full h-14 border-2 border-[#115A23] text-[#115A23] hover:bg-[#115A23] hover:text-white rounded-xl font-semibold text-lg transition-all duration-200"
              >
                <UserPlus className="mr-2 h-6 w-6" />
                Crea un nuovo account
              </Button>
            </Link>
          </form>

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
