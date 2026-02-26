'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  Users,
  DollarSign,
  History,
  Activity,
  BarChart3,
  Menu,
  X,
  User,
  LogOut,
  Shield,
  ChevronRight,
  TrendingUp,
  UserSearch,
} from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { signOut } from '@/lib/auth/client'

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, isAdmin } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/')
  }

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Admin dashboard dropdown links
  const adminDashboardLinks = [
    {
      href: '/dashboard',
      label: 'Cruscotto',
      icon: BarChart3,
      description: 'Dashboard generale'
    },
    {
      href: '/dashboard/user-approvals',
      label: 'Approvazioni',
      icon: User,
      description: 'Gestione utenti'
    },
    {
      href: '/monitoring/tokens',
      label: 'Monitoraggio AI',
      icon: Activity,
      description: 'Costi e performance'
    },
  ]

  // User navigation with Italian labels
  const userLinks = [
    {
      href: '/dashboard/user',
      label: 'Dashboard',
      icon: BarChart3,
      color: 'from-[#115A23] to-[#1a7a32]', // Verde FODI
      description: 'Panoramica completa'
    },
    {
      href: '/lead-finder',
      label: 'Ricerca Utenti',
      icon: Search,
      color: 'from-[#A2C054] to-[#8BA048]', // Verde Lime
      description: 'Trova prospect qualificati'
    },
    {
      href: '/osint-profiler',
      label: 'Analisi OSINT',
      icon: UserSearch,
      color: 'from-[#91BDE2] to-[#0693e3]', // Azzurro
      description: 'Profila clienti in 30 secondi'
    },
    {
      href: '/financial-planner',
      label: 'Pianificazione',
      icon: TrendingUp,
      color: 'from-[#B15082] to-[#FF2E5F]', // Rosa-Rosso
      description: 'Piani finanziari AI'
    },
  ]

  const historyLinks = [
    { href: '/lead-finder/archivio', label: 'Storico Utenti', icon: Search },
    { href: '/osint-profiler/archivio', label: 'Storico OSINT', icon: Users },
    { href: '/financial-planner/archivio', label: 'Storico Piani', icon: TrendingUp },
  ]

  // Admin gets Dashboard dropdown, regular users get Dashboard link
  // Filter out Dashboard link for admins to avoid duplication
  const navLinks = isAdmin
    ? userLinks.filter(link => link.href !== '/dashboard/user')
    : userLinks

  return (
    <>
      {/* Header - Leonardo Professional Style */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b-2 border-[#115A23]/20 shadow-natural">
        <div className="container mx-auto px-4 lg:px-6 max-w-[1600px]">
          <div className="flex h-20 items-center justify-between lg:grid lg:grid-cols-[auto_1fr_auto] lg:gap-8">
            {/* Logo Section - Leonardo Branding (Compact) - Left */}
            <Link
              href={isAdmin ? '/dashboard' : '/dashboard/user'}
              className="flex items-center gap-2.5 group"
            >
              {/* Logo Icon - Verde Leonardo con effetto 3D */}
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#115A23] via-[#1a7a32] to-[#238238] flex items-center justify-center shadow-natural group-hover:shadow-[0_8px_30px_rgb(17,90,35,0.3)] group-hover:-translate-y-0.5 transition-all duration-300 relative">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6 text-white relative z-10"
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

              {/* Brand Text - Compact Typography */}
              <span className="font-bold text-xl text-[#115A23] leading-none tracking-tight">
                LEO-FODI
              </span>
            </Link>

            {/* Desktop Navigation - Leonardo Extended Palette - Center */}
            <nav className="hidden lg:flex items-center justify-center gap-6">
              {/* Dashboard Dropdown - Admin Only */}
              {isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`
                        flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm
                        transition-all duration-300 touch-target group
                        ${
                          isActive('/dashboard') || isActive('/monitoring')
                            ? 'bg-gradient-to-r from-[#115A23] to-[#1a7a32] text-white shadow-natural'
                            : 'text-[#575757] hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-[#115A23]'
                        }
                      `}
                    >
                      <BarChart3 className="h-4 w-4" strokeWidth={2.5} />
                      <span>Dashboard</span>
                      <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={2.5} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64 border-2 border-[#115A23]/20 rounded-xl shadow-deep p-2">
                    <DropdownMenuLabel className="px-3 py-2 text-[#115A23] font-bold">
                      Gestione Admin
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {adminDashboardLinks.map((link) => {
                      const Icon = link.icon
                      return (
                        <DropdownMenuItem key={link.href} asChild>
                          <Link
                            href={link.href}
                            className="flex items-center gap-3 cursor-pointer py-2.5 px-3 rounded-lg hover:bg-[#115A23]/10 transition-colors"
                          >
                            <Icon className="h-4 w-4 text-[#115A23]" strokeWidth={2.5} />
                            <div className="flex-1">
                              <div className="font-medium text-[#575757]">{link.label}</div>
                              <div className="text-xs text-muted-foreground">{link.description}</div>
                            </div>
                          </Link>
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {navLinks.map((link) => {
                const Icon = link.icon
                const active = isActive(link.href)
                return (
                  <Link key={link.href} href={link.href}>
                    <div
                      className={`
                        group relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-semibold text-sm
                        transition-all duration-300 touch-target overflow-hidden
                        ${
                          active
                            ? `bg-gradient-to-r ${link.color} text-white shadow-natural hover:shadow-deep hover:-translate-y-1`
                            : 'text-[#575757] hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-[#115A23]'
                        }
                      `}
                    >
                      {/* Background glow effect on hover */}
                      {!active && (
                        <div className={`absolute inset-0 bg-gradient-to-r ${link.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                      )}

                      <Icon className="h-4 w-4 relative z-10" strokeWidth={2.5} />
                      <span className="relative z-10">{link.label}</span>

                      {active && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 rounded-full"></div>
                      )}
                    </div>
                  </Link>
                )
              })}

            </nav>

            {/* Right Section - Storico & User Menu - Right */}
            <div className="hidden lg:flex items-center justify-end gap-3">
              {/* History Dropdown - Leonardo Style */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm
                      text-[#575757] hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-[#115A23]
                      transition-all duration-300 touch-target group"
                  >
                    <History className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" strokeWidth={2.5} />
                    <span>Storico</span>
                    <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={2.5} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 border-2 border-[#115A23]/20 rounded-xl shadow-deep p-2">
                  <DropdownMenuLabel className="px-3 py-2 text-[#115A23] font-bold">
                    Archivi
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {historyLinks.map((link) => {
                    const Icon = link.icon
                    return (
                      <DropdownMenuItem key={link.href} asChild>
                        <Link
                          href={link.href}
                          className="flex items-center gap-3 cursor-pointer py-2.5 px-3 rounded-lg hover:bg-[#115A23]/10 transition-colors"
                        >
                          <Icon className="h-4 w-4 text-[#115A23]" strokeWidth={2.5} />
                          <span className="font-medium text-[#575757]">{link.label}</span>
                        </Link>
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu - Leonardo Premium Style */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-2 ml-4 pl-4 border-l-2 border-[#115A23]/20
                      hover:opacity-80 transition-all duration-200 touch-target group"
                  >
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#115A23] to-[#238238] flex items-center justify-center text-white text-sm font-bold shadow-natural group-hover:shadow-deep group-hover:-translate-y-1 transition-all duration-300">
                      {profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 border-2 border-[#115A23]/20 rounded-xl shadow-deep p-3">
                  <DropdownMenuLabel className="px-3 py-3 bg-gradient-to-r from-[#115A23]/10 to-transparent rounded-lg">
                    <div className="flex flex-col space-y-2">
                      <p className="text-base font-bold leading-none text-[#115A23]">
                        {profile?.full_name || 'Utente'}
                      </p>
                      <p className="text-sm leading-none text-[#575757] font-medium">
                        {user?.email}
                      </p>
                      {isAdmin && (
                        <Badge className="mt-2 w-fit bg-gradient-to-r from-[#115A23] to-[#238238] text-white px-3 py-1 shadow-natural">
                          <Shield className="h-3 w-3 mr-1.5" strokeWidth={2.5} />
                          Amministratore
                        </Badge>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-[#FF2E5F] hover:bg-[#FF2E5F]/10 font-semibold py-3 px-3 rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2" strokeWidth={2.5} />
                    Esci dalla piattaforma
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Navigation Toggle */}
            <div className="lg:hidden flex items-center gap-3">
              {/* Mobile User Avatar */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-10 w-10 rounded-lg touch-target">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#115A23] to-[#238238] flex items-center justify-center text-white text-sm font-bold shadow-natural">
                      {profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 border-2 border-[#115A23]/20 rounded-xl shadow-deep p-3">
                  <DropdownMenuLabel className="px-3 py-3 bg-gradient-to-r from-[#115A23]/10 to-transparent rounded-lg">
                    <div className="flex flex-col space-y-2">
                      <p className="text-base font-bold leading-none text-[#115A23]">
                        {profile?.full_name || 'Utente'}
                      </p>
                      <p className="text-sm leading-none text-[#575757]">
                        {user?.email}
                      </p>
                      {isAdmin && (
                        <Badge className="mt-2 w-fit bg-gradient-to-r from-[#115A23] to-[#238238] text-white px-2 py-1 shadow-natural">
                          <Shield className="h-3 w-3 mr-1" strokeWidth={2.5} />
                          Admin
                        </Badge>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-[#FF2E5F] hover:bg-[#FF2E5F]/10 font-semibold py-3 px-3 rounded-lg"
                  >
                    <LogOut className="h-4 w-4 mr-2" strokeWidth={2.5} />
                    Esci
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-[#115A23]/10 transition-colors touch-target"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6 text-[#115A23]" strokeWidth={2.5} />
                ) : (
                  <Menu className="h-6 w-6 text-[#115A23]" strokeWidth={2.5} />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Slide-in - Leonardo Premium */}
      <div
        className={`
          fixed inset-0 z-40 lg:hidden transform transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        ></div>

        {/* Menu Panel */}
        <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between pb-4 border-b-2 border-[#115A23]/20">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#115A23] to-[#238238] flex items-center justify-center shadow-natural">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  </svg>
                </div>
                <span className="font-bold text-xl text-[#115A23]">Menu</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-[#115A23]/10 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-[#575757]" strokeWidth={2.5} />
              </button>
            </div>

            {/* Mobile Admin Dashboard Section */}
            {isAdmin && (
              <div className="space-y-3 pb-4 border-b-2 border-[#115A23]/20">
                <div className="flex items-center gap-2 px-2">
                  <BarChart3 className="h-4 w-4 text-[#115A23]" strokeWidth={2.5} />
                  <span className="text-sm font-bold text-[#115A23] uppercase tracking-wide">
                    Dashboard Admin
                  </span>
                </div>
                {adminDashboardLinks.map((link) => {
                  const Icon = link.icon
                  const active = isActive(link.href)
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${active ? 'bg-[#115A23]/10' : 'bg-gray-50 hover:bg-gray-100'}`}>
                        <Icon className="h-4 w-4 text-[#115A23]" strokeWidth={2.5} />
                        <div className="flex-1">
                          <div className="font-medium text-[#575757]">{link.label}</div>
                          <div className="text-xs text-muted-foreground">{link.description}</div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}

            {/* Mobile Navigation Links */}
            <div className="space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon
                const active = isActive(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div
                      className={`
                        flex items-center gap-3 p-4 rounded-xl transition-all duration-300
                        ${
                          active
                            ? `bg-gradient-to-r ${link.color} text-white shadow-natural`
                            : 'bg-gray-50 text-[#575757] hover:bg-gray-100'
                        }
                      `}
                    >
                      <Icon className="h-5 w-5" strokeWidth={2.5} />
                      <div className="flex-1">
                        <div className="font-semibold">{link.label}</div>
                        <div className={`text-xs mt-0.5 ${active ? 'text-white/80' : 'text-[#575757]'}`}>
                          {link.description}
                        </div>
                      </div>
                      {active && <ChevronRight className="h-4 w-4" strokeWidth={2.5} />}
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Mobile History Section */}
            <div className="space-y-3 pt-4 border-t-2 border-[#115A23]/20">
              <div className="flex items-center gap-2 px-2">
                <History className="h-4 w-4 text-[#115A23]" strokeWidth={2.5} />
                <span className="text-sm font-bold text-[#115A23] uppercase tracking-wide">
                  Archivi
                </span>
              </div>
              {historyLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <Icon className="h-4 w-4 text-[#575757]" strokeWidth={2.5} />
                      <span className="font-medium text-[#575757]">{link.label}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
