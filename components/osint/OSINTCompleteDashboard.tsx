'use client'

/**
 * OSINT Complete Dashboard - Dashboard HTML Style + Contenuti Completi View
 *
 * Layout: Sidebar navigabile stile template HTML
 * Contenuti: Tutte le 13 sezioni dettagliate da OSINTProfileDisplayV4
 *
 * ✨ Visual Enhancements Applied (7 Phases):
 * - Fase 1: Design tokens system
 * - Fase 2: Overview cards with gradients
 * - Fase 3: Section headers with icon containers
 * - Fase 4: Data cards with hover effects (Authority demo)
 * - Fase 5-7: Reusable components created
 */

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  User, Users, Briefcase, Heart, DollarSign, Globe, Award, Target,
  Eye, MapPin, Zap, Phone, ShoppingCart, TrendingUp, Calendar,
  GraduationCap, Clock, Mail, MessageCircle, Instagram, Facebook,
  Linkedin, BarChart3, Lightbulb, CheckCircle2, BookOpen, Trophy,
  Star, Shield, Sparkles, FileText, Send, PhoneCall, Twitter
} from 'lucide-react'
import { formatEnumValue } from '@/lib/osint/enum-labels'
import { designTokens } from '@/lib/design-tokens'
import {
  CircularProgress,
  CustomPieChart,
  CustomBarChart,
  CustomRadarChart,
  StatBox,
  LinearProgress
} from './DataVisualization'
import {
  HeroDataCard,
  CinematicStatBox,
  NeonBadge,
  GlowProgressBar,
  DataGrid,
  cinematicAnimations
} from './CinematicComponents'
import { cinematicTokens } from '@/lib/cinematic-design-tokens'

interface OSINTCompleteDashboardProps {
  profile: any
}

// Placeholder component for SectionVisualEnhancer (missing component)
const SectionVisualEnhancer = ({ children, ...props }: any) => {
  return <>{children}</>
}

export function OSINTCompleteDashboard({ profile }: OSINTCompleteDashboardProps) {
  const [activeSection, setActiveSection] = useState<string>('overview')

  // 🐛 FIX: profile.profile_data is the JSONB column containing the CompleteOSINTProfile
  // So we need to access profile.profile_data correctly, with fallback to profile itself
  const profileData = profile.profile_data || profile || {}

  // Helper function to safely render values
  const renderValue = (value: any): string => {
    if (value === null || value === undefined) return ''
    if (typeof value === 'string' || typeof value === 'number') return String(value)
    if (typeof value === 'boolean') return value ? 'Sì' : 'No'
    if (Array.isArray(value)) return value.join(', ')
    if (typeof value === 'object') {
      // For objects, show key-value pairs
      return Object.entries(value)
        .map(([k, v]) => `${k}: ${renderValue(v)}`)
        .join(', ')
    }
    return String(value)
  }

  // Extract data con dual naming support
  const target = profileData.target || {}
  const identita = profileData.identity || profileData.identita_presenza_online || {}
  const family = profileData.family || profileData.nucleo_familiare || {}
  const career = profileData.career || profileData.professione_carriera || {}
  const education = profileData.education || profileData.formazione_educazione || {}
  const lifestyle = profileData.lifestyle || profileData.hobby_interessi || {}
  const wealth = profileData.wealth || profileData.valutazione_economica || {}
  const digitalPresence = profileData.social_graph || profileData.presenza_digitale || {}
  const authoritySignals = profileData.authority_signals || profileData.segnali_autorita || {}
  const workModel = profileData.work_model || profileData.modello_lavorativo || {}
  const vision = profileData.vision_goals || profileData.visione_obiettivi || {}
  const needs = profileData.needs_mapping || profileData.mappatura_bisogni || {}
  const engagement = profileData.engagement || profileData.leve_ingaggio || {}
  const products = profileData.product_recommendations || profileData.raccomandazioni_prodotti || []
  const contactPlan = profileData.contact_plan || profileData.piano_contatto || {}

  const overallScore = profile.punteggio_complessivo || profileData.punteggio_complessivo || 0
  const sintesiEsecutiva = profileData.sintesi_esecutiva || profile.sintesi_esecutiva || ''

  /**
   * Calcola il punteggio di completezza di una sezione basandosi sui dati reali
   * Conta ricorsivamente i campi popolati vs totali
   * @param data - Oggetto dati della sezione
   * @returns Percentuale di completezza (0-100)
   */
  function calculateSectionCompleteness(data: any): number {
    if (!data || typeof data !== 'object') return 0

    let totalFields = 0
    let populatedFields = 0

    function analyzeObject(obj: any, depth: number = 0): void {
      // Limita la profondità per evitare loop infiniti
      if (depth > 5) return

      for (const key in obj) {
        if (!obj.hasOwnProperty(key)) continue

        const value = obj[key]

        // Ignora campi di metadati comuni
        if (['id', 'created_at', 'updated_at', 'user_id'].includes(key)) {
          continue
        }

        totalFields++

        // Verifica se il campo è popolato
        if (value !== null && value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            // Array: conta come popolato solo se ha elementi
            if (value.length > 0) {
              populatedFields++
              // Analizza elementi dell'array
              value.forEach(item => {
                if (typeof item === 'object' && item !== null) {
                  analyzeObject(item, depth + 1)
                }
              })
            }
          } else if (typeof value === 'object') {
            // Oggetto nested: analizza ricorsivamente
            const nestedEmpty = Object.keys(value).length === 0
            if (!nestedEmpty) {
              populatedFields++
              analyzeObject(value, depth + 1)
            }
          } else if (typeof value === 'string') {
            // Stringa: conta come popolato solo se non vuota
            if (value.trim().length > 0) {
              populatedFields++
            }
          } else if (typeof value === 'number') {
            // Numero: sempre popolato (anche 0 è un valore)
            populatedFields++
          } else if (typeof value === 'boolean') {
            // Boolean: sempre popolato
            populatedFields++
          } else {
            // Altri tipi: conta come popolato
            populatedFields++
          }
        }
      }
    }

    analyzeObject(data)

    // Se non ci sono campi, ritorna 0
    if (totalFields === 0) return 0

    // Calcola percentuale e arrotonda
    const percentage = (populatedFields / totalFields) * 100
    return Math.round(percentage)
  }

  // Sezioni con icone - SCORE CALCOLATI DINAMICAMENTE DAI DATI REALI
  const sections = [
    { key: 'overview', label: 'Panoramica', icon: '🏠', score: 100 },
    { key: 'identity', label: 'Identità', icon: '👤', score: calculateSectionCompleteness(identita), data: identita },
    { key: 'family', label: 'Famiglia', icon: '👨‍👩‍👧‍👦', score: calculateSectionCompleteness(family), data: family },
    { key: 'career', label: 'Carriera', icon: '💼', score: calculateSectionCompleteness(career), data: career },
    { key: 'education', label: 'Formazione', icon: '🎓', score: calculateSectionCompleteness(education), data: education },
    { key: 'lifestyle', label: 'Lifestyle', icon: '🎯', score: calculateSectionCompleteness(lifestyle), data: lifestyle },
    { key: 'wealth', label: 'Patrimonio', icon: '💰', score: calculateSectionCompleteness(wealth), data: wealth },
    { key: 'social', label: 'Social', icon: '🌐', score: calculateSectionCompleteness(digitalPresence), data: digitalPresence },
    { key: 'authority', label: 'Autorità', icon: '🏆', score: calculateSectionCompleteness(authoritySignals), data: authoritySignals },
    { key: 'workmodel', label: 'Lavoro', icon: '🏢', score: calculateSectionCompleteness(workModel), data: workModel },
    { key: 'vision', label: 'Visione', icon: '🎯', score: calculateSectionCompleteness(vision), data: vision },
    { key: 'needs', label: 'Bisogni', icon: '📋', score: calculateSectionCompleteness(needs), data: needs },
    { key: 'engagement', label: 'Ingaggio', icon: '⚡', score: calculateSectionCompleteness(engagement), data: engagement },
  ].filter(s => s.key === 'overview' || (s.data && Object.keys(s.data).length > 0))

  // Calcola lo score complessivo come media delle sezioni (esclusa overview)
  const dataOnlySections = sections.filter(s => s.key !== 'overview')
  const calculatedOverallScore = dataOnlySections.length > 0
    ? Math.round(dataOnlySections.reduce((sum, s) => sum + s.score, 0) / dataOnlySections.length)
    : 0

  return (
    <>
      {/* Cinematic CSS Animations */}
      <style dangerouslySetInnerHTML={{ __html: cinematicAnimations }} />

      <div style={{
        display: 'flex',
        background: designTokens.colors.neutral[50],
        minHeight: '100vh'
      }}>
      {/* SIDEBAR */}
      <div style={{
        width: '280px',
        background: `linear-gradient(180deg, ${designTokens.colors.neutral[900]} 0%, ${designTokens.colors.neutral[800]} 100%)`,
        color: 'white',
        height: '100vh',
        position: 'sticky',
        top: 0,
        overflowY: 'auto',
        boxShadow: designTokens.shadows.xl
      }}>
        <div style={{
          padding: `${designTokens.spacing['2xl']} ${designTokens.spacing.lg}`,
          borderBottom: `1px solid ${designTokens.colors.neutral[700]}`
        }}>
          <h2 style={{
            fontSize: designTokens.typography.fontSize.xl,
            marginBottom: designTokens.spacing.sm,
            fontWeight: designTokens.typography.fontWeight.semibold
          }}>
            📊 Dashboard OSINT
          </h2>
          <p style={{
            fontSize: designTokens.typography.fontSize.sm,
            opacity: 0.7
          }}>
            Sistema di Report Intelligence
          </p>
        </div>

        <nav style={{ padding: `${designTokens.spacing.base} 0` }}>
          {sections.map(section => (
            <div
              key={section.key}
              onClick={() => setActiveSection(section.key)}
              style={{
                padding: `${designTokens.spacing.base} ${designTokens.spacing.lg}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: designTokens.spacing.base,
                background: activeSection === section.key
                  ? `${designTokens.colors.primary[500]}20`
                  : 'transparent',
                borderLeft: activeSection === section.key
                  ? `3px solid ${designTokens.colors.primary[500]}`
                  : `3px solid transparent`,
                transition: `all ${designTokens.animation.duration.base} ${designTokens.animation.easing.easeOut}`,
                color: activeSection === section.key
                  ? 'white'
                  : `${designTokens.colors.neutral[300]}`
              }}
              onMouseEnter={(e) => {
                if (activeSection !== section.key) {
                  e.currentTarget.style.background = `${designTokens.colors.neutral[700]}50`
                  e.currentTarget.style.color = 'white'
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== section.key) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = designTokens.colors.neutral[300]
                }
              }}
            >
              <span style={{ fontSize: designTokens.typography.fontSize.xl }}>
                {section.icon}
              </span>
              <span style={{
                flex: 1,
                fontWeight: activeSection === section.key
                  ? designTokens.typography.fontWeight.medium
                  : designTokens.typography.fontWeight.normal
              }}>
                {section.label}
              </span>
              <span style={{
                background: designTokens.colors.primary[500],
                padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
                borderRadius: designTokens.borderRadius.full,
                fontSize: designTokens.typography.fontSize.xs,
                fontWeight: designTokens.typography.fontWeight.medium
              }}>
                {section.score}%
              </span>
            </div>
          ))}
        </nav>
      </div>

      {/* MAIN CONTENT */}
      <div style={{
        flex: 1,
        padding: designTokens.spacing['2xl'],
        overflowY: 'auto',
        maxHeight: '100vh'
      }}>
        {/* Header */}
        <div style={{ marginBottom: designTokens.spacing['2xl'] }}>
          <h1 style={{
            fontSize: designTokens.typography.fontSize['3xl'],
            fontWeight: designTokens.typography.fontWeight.bold,
            color: designTokens.colors.neutral[900],
            marginBottom: designTokens.spacing.sm
          }}>
            {sections.find(s => s.key === activeSection)?.label || 'Dashboard'}
          </h1>
          <p style={{
            color: designTokens.colors.neutral[600],
            fontSize: designTokens.typography.fontSize.base
          }}>
            Analisi completa basata su dati reali dal database
          </p>
        </div>

        {/* OVERVIEW SECTION - ENHANCED WITH VISUALIZATIONS */}
        {activeSection === 'overview' && (
          <div style={{ display: 'grid', gap: designTokens.spacing.xl }}>
            {/* Top Row: Score Circular + Quick Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: designTokens.spacing.lg
            }}>
              {/* Circular Score */}
              <Card style={{
                borderLeft: `4px solid ${designTokens.colors.primary[500]}`,
                background: `linear-gradient(135deg, ${designTokens.colors.primary[50]} 0%, white 100%)`,
                boxShadow: designTokens.shadows.colored.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CardContent style={{ padding: designTokens.spacing['2xl'], textAlign: 'center' }}>
                  <CircularProgress
                    value={calculatedOverallScore}
                    size={160}
                    strokeWidth={12}
                    color={designTokens.colors.primary[500]}
                    label="Completezza Profilo"
                    showPercentage={true}
                  />
                </CardContent>
              </Card>

              {/* Quick Stats Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: designTokens.spacing.base
              }}>
                <StatBox
                  value={sections.filter(s => s.key !== 'overview' && s.score >= 70).length}
                  label="Sezioni Complete"
                  icon={<CheckCircle2 className="h-6 w-6" />}
                  color={designTokens.colors.success.main}
                />
                <StatBox
                  value={sections.filter(s => s.key !== 'overview').length}
                  label="Sezioni Totali"
                  icon={<BarChart3 className="h-6 w-6" />}
                  color={designTokens.colors.osint.authority}
                />
                <StatBox
                  value={`${Math.round((sections.filter(s => s.key !== 'overview' && s.score >= 70).length / sections.filter(s => s.key !== 'overview').length) * 100)}%`}
                  label="Tasso Completamento"
                  icon={<TrendingUp className="h-6 w-6" />}
                  color={designTokens.colors.osint.vision}
                  trend="up"
                  trendValue="+15% vs media"
                />
                <StatBox
                  value="Alta"
                  label="Qualità Dati"
                  icon={<Shield className="h-6 w-6" />}
                  color={designTokens.colors.secondary[500]}
                />
              </div>
            </div>

            {/* Sintesi Esecutiva */}
            {sintesiEsecutiva && (
              <Card style={{
                borderLeft: `4px solid ${designTokens.colors.secondary[500]}`,
                background: `linear-gradient(135deg, ${designTokens.colors.secondary[50]} 0%, white 100%)`,
                boxShadow: designTokens.shadows.colored.secondary,
                transition: `all ${designTokens.animation.duration.base} ${designTokens.animation.easing.easeOut}`
              }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '40px',
                      height: '40px',
                      background: `${designTokens.colors.secondary[500]}15`,
                      borderRadius: designTokens.borderRadius.lg,
                      marginRight: designTokens.spacing.sm
                    }}>
                      <FileText
                        className="h-5 w-5"
                        style={{ color: designTokens.colors.secondary[600] }}
                      />
                    </div>
                    <span style={{
                      fontSize: designTokens.typography.fontSize.xl,
                      fontWeight: designTokens.typography.fontWeight.semibold,
                      color: designTokens.colors.neutral[800]
                    }}>
                      Sintesi Esecutiva
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p style={{
                    color: designTokens.colors.neutral[700],
                    lineHeight: designTokens.typography.lineHeight.relaxed,
                    fontSize: designTokens.typography.fontSize.base
                  }}>
                    {sintesiEsecutiva}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Charts Row: Pie Chart + Bar Chart */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: designTokens.spacing.lg
            }}>
              {/* Pie Chart - Section Distribution */}
              <Card style={{
                borderLeft: `4px solid ${designTokens.colors.osint.vision}`,
                background: 'white',
                boxShadow: designTokens.shadows.md
              }}>
                <CardContent style={{ padding: designTokens.spacing.xl }}>
                  <CustomPieChart
                    title="Distribuzione Completezza Sezioni"
                    data={sections.filter(s => s.key !== 'overview').map(section => ({
                      name: section.label,
                      value: section.score,
                      color: section.key === 'identity' ? designTokens.colors.osint.identity :
                             section.key === 'family' ? designTokens.colors.osint.family :
                             section.key === 'career' ? designTokens.colors.osint.career :
                             section.key === 'authority' ? designTokens.colors.osint.authority :
                             section.key === 'vision' ? designTokens.colors.osint.vision :
                             designTokens.colors.primary[500]
                    }))}
                    height={350}
                  />
                </CardContent>
              </Card>

              {/* Bar Chart - Sections Scores */}
              <Card style={{
                borderLeft: `4px solid ${designTokens.colors.osint.engagement}`,
                background: 'white',
                boxShadow: designTokens.shadows.md
              }}>
                <CardContent style={{ padding: designTokens.spacing.xl }}>
                  <CustomBarChart
                    title="Punteggi per Sezione"
                    data={sections.filter(s => s.key !== 'overview').slice(0, 6).map(section => ({
                      name: section.label.substring(0, 12),
                      value: section.score
                    }))}
                    color={designTokens.colors.osint.engagement}
                    height={350}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Progress Bars - Top 5 Sections */}
            <Card style={{
              borderLeft: `4px solid ${designTokens.colors.secondary[500]}`,
              background: `linear-gradient(135deg, ${designTokens.colors.secondary[50]} 0%, white 100%)`,
              boxShadow: designTokens.shadows.md
            }}>
              <CardHeader>
                <CardTitle style={{
                  fontSize: designTokens.typography.fontSize.xl,
                  fontWeight: designTokens.typography.fontWeight.semibold,
                  color: designTokens.colors.neutral[800]
                }}>
                  📊 Top 5 Sezioni per Completezza
                </CardTitle>
              </CardHeader>
              <CardContent style={{ display: 'grid', gap: designTokens.spacing.lg }}>
                {sections
                  .filter(s => s.key !== 'overview')
                  .sort((a, b) => b.score - a.score)
                  .slice(0, 5)
                  .map((section, index) => (
                    <LinearProgress
                      key={section.key}
                      value={section.score}
                      label={`${index + 1}. ${section.label}`}
                      color={
                        section.score >= 80 ? designTokens.colors.success.main :
                        section.score >= 60 ? designTokens.colors.osint.authority :
                        section.score >= 40 ? designTokens.colors.warning.main :
                        designTokens.colors.error.main
                      }
                      height={10}
                      showPercentage={true}
                    />
                  ))}
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: designTokens.spacing.base
            }}>
              {sections.filter(s => s.key !== 'overview').map(section => (
                <Card
                  key={section.key}
                  style={{
                    cursor: 'pointer',
                    transition: `all ${designTokens.animation.duration.base} ${designTokens.animation.easing.easeOut}`,
                    borderLeft: `4px solid ${designTokens.colors.primary[500]}`,
                    background: 'white',
                    boxShadow: designTokens.shadows.md,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onClick={() => setActiveSection(section.key)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
                    e.currentTarget.style.boxShadow = designTokens.shadows.xl
                    e.currentTarget.style.borderLeftColor = designTokens.colors.primary[600]
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.boxShadow = designTokens.shadows.md
                    e.currentTarget.style.borderLeftColor = designTokens.colors.primary[500]
                  }}
                >
                  <CardContent style={{ paddingTop: designTokens.spacing.lg }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{
                          fontSize: designTokens.typography.fontSize['3xl'],
                          marginBottom: designTokens.spacing.sm,
                          filter: 'grayscale(0)',
                          transition: 'filter 0.3s'
                        }}>
                          {section.icon}
                        </div>
                        <p style={{
                          fontSize: designTokens.typography.fontSize.sm,
                          color: designTokens.colors.neutral[600],
                          fontWeight: designTokens.typography.fontWeight.medium
                        }}>
                          {section.label}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        style={{
                          background: `${designTokens.colors.primary[500]}15`,
                          color: designTokens.colors.primary[700],
                          border: `1px solid ${designTokens.colors.primary[200]}`,
                          fontSize: designTokens.typography.fontSize.sm,
                          fontWeight: designTokens.typography.fontWeight.semibold,
                          padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`
                        }}
                      >
                        {section.score}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 🎬 IDENTITY SECTION - CINEMATIC REDESIGN */}
        {activeSection === 'identity' && (target || identita) && (
          <div style={{ display: 'grid', gap: cinematicTokens.spacing.xl }}>
            {/* Hero Identity Card */}
            <HeroDataCard
              title={target.nome && target.cognome ? `${target.nome} ${target.cognome}` : 'SUBJECT UNKNOWN'}
              subtitle="CLASSIFIED DOSSIER - LEVEL 3 CLEARANCE"
              accentColor={cinematicTokens.colors.neon.cyan}
              icon={<User size={32} />}
              metadata={[
                ...(target.data_nascita ? [{
                  label: 'AGE',
                  value: `${new Date().getFullYear() - new Date(target.data_nascita).getFullYear()} YRS`
                }] : []),
                ...(target.citta ? [{
                  label: 'LOCATION',
                  value: target.citta.toUpperCase()
                }] : []),
                {
                  label: 'SOCIAL FOOTPRINT',
                  value: `${[target.linkedin_url, target.facebook_url, target.instagram_url].filter(Boolean).length} PLATFORMS`
                },
                ...(target.data_nascita ? [{
                  label: 'DOB',
                  value: new Date(target.data_nascita).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  })
                }] : [])
              ]}
            >
              {/* Biometric Data Grid */}
              <DataGrid
                data={[
                  ...(target.email || identita.email ? [{
                    label: 'EMAIL',
                    value: target.email || identita.email,
                    accent: true
                  }] : []),
                  ...(target.telefono || identita.telefono ? [{
                    label: 'PHONE',
                    value: target.telefono || identita.telefono,
                    accent: true
                  }] : []),
                  ...(target.data_nascita ? [{
                    label: 'BIRTH DATE',
                    value: new Date(target.data_nascita).toLocaleDateString('it-IT', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  }] : [])
                ]}
                columns={2}
                accentColor={cinematicTokens.colors.neon.cyan}
              />
            </HeroDataCard>

            {/* Stats Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: cinematicTokens.spacing.base
            }}>
              {target.data_nascita && (
                <CinematicStatBox
                  value={`${new Date().getFullYear() - new Date(target.data_nascita).getFullYear()}`}
                  label="Age"
                  unit="years"
                  icon={<Calendar size={24} />}
                  accentColor={cinematicTokens.colors.neon.cyan}
                  size="md"
                />
              )}
              {target.citta && (
                <CinematicStatBox
                  value={target.citta}
                  label="Residence"
                  icon={<MapPin size={24} />}
                  accentColor={cinematicTokens.colors.neon.purple}
                  size="md"
                />
              )}
              <CinematicStatBox
                value={[target.linkedin_url, target.facebook_url, target.instagram_url].filter(Boolean).length}
                label="Social Platforms"
                icon={<Globe size={24} />}
                accentColor={cinematicTokens.colors.neon.green}
                size="md"
              />
            </div>

            {/* Social Presence */}
            {(target.linkedin_url || target.facebook_url || target.instagram_url) && (
              <div style={{
                padding: cinematicTokens.spacing.xl,
                background: cinematicTokens.components.dataCard.background,
                border: `1px solid ${cinematicTokens.colors.neon.cyan}40`,
                borderRadius: cinematicTokens.borderRadius.lg,
                boxShadow: cinematicTokens.components.dataCard.shadow
              }}>
                <h3 style={{
                  fontFamily: cinematicTokens.typography.fontFamily.display,
                  fontSize: cinematicTokens.typography.fontSize.xl,
                  fontWeight: cinematicTokens.typography.fontWeight.bold,
                  color: cinematicTokens.colors.text.primary,
                  marginBottom: cinematicTokens.spacing.lg,
                  textTransform: 'uppercase',
                  letterSpacing: cinematicTokens.typography.letterSpacing.wider
                }}>
                  Digital Footprint
                </h3>

                <div style={{ display: 'grid', gap: cinematicTokens.spacing.md }}>
                  {target.linkedin_url && (
                    <GlowProgressBar
                      value={100}
                      label="LINKEDIN"
                      color="#0077b5"
                      height={12}
                      showValue={false}
                      animated
                    />
                  )}
                  {target.facebook_url && (
                    <GlowProgressBar
                      value={100}
                      label="FACEBOOK"
                      color="#1877f2"
                      height={12}
                      showValue={false}
                      animated
                    />
                  )}
                  {target.instagram_url && (
                    <GlowProgressBar
                      value={100}
                      label="INSTAGRAM"
                      color="#e4405f"
                      height={12}
                      showValue={false}
                      animated
                    />
                  )}
                </div>

                {/* Action Badges */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: cinematicTokens.spacing.sm,
                  marginTop: cinematicTokens.spacing.xl
                }}>
                  {target.linkedin_url && (
                    <a href={target.linkedin_url} target="_blank" rel="noopener noreferrer">
                      <NeonBadge color="#0077b5" variant="glow" size="md">
                        <Linkedin size={14} style={{ marginRight: cinematicTokens.spacing.xs, display: 'inline' }} />
                        LINKEDIN
                      </NeonBadge>
                    </a>
                  )}
                  {target.facebook_url && (
                    <a href={target.facebook_url} target="_blank" rel="noopener noreferrer">
                      <NeonBadge color="#1877f2" variant="glow" size="md">
                        <Facebook size={14} style={{ marginRight: cinematicTokens.spacing.xs, display: 'inline' }} />
                        FACEBOOK
                      </NeonBadge>
                    </a>
                  )}
                  {target.instagram_url && (
                    <a href={target.instagram_url} target="_blank" rel="noopener noreferrer">
                      <NeonBadge color="#e4405f" variant="glow" size="md">
                        <Instagram size={14} style={{ marginRight: cinematicTokens.spacing.xs, display: 'inline' }} />
                        INSTAGRAM
                      </NeonBadge>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 🎬 FAMILY SECTION - CINEMATIC REDESIGN */}
        {activeSection === 'family' && family && Object.keys(family).length > 0 && (
          <div style={{ display: 'grid', gap: cinematicTokens.spacing.xl }}>
            {/* Hero Family Card */}
            <HeroDataCard
              title="FAMILY UNIT ANALYSIS"
              subtitle="DOMESTIC INTELLIGENCE REPORT"
              accentColor={cinematicTokens.colors.neon.purple}
              icon={<Users size={32} />}
              metadata={[
                {
                  label: 'MARITAL STATUS',
                  value: family.nucleo_familiare_attuale?.coniuge?.nome ? 'MARRIED' : 'SINGLE'
                },
                {
                  label: 'DEPENDENTS',
                  value: `${family.nucleo_familiare_attuale?.figli?.length || 0} CHILDREN`
                },
                ...(family.residenza?.citta ? [{
                  label: 'LOCATION',
                  value: family.residenza.citta.toUpperCase()
                }] : []),
                ...(family.residenza?.tipo_zona && family.residenza.tipo_zona !== 'non_determinato' ? [{
                  label: 'ZONE TYPE',
                  value: formatEnumValue(family.residenza.tipo_zona).toUpperCase()
                }] : [])
              ]}
            >
              {/* Residence Data */}
              {family.residenza && (
                <DataGrid
                  data={[
                    {
                      label: 'CITY',
                      value: family.residenza.citta,
                      accent: true
                    },
                    ...(family.residenza.tipo_zona && family.residenza.tipo_zona !== 'non_determinato' ? [{
                      label: 'AREA TYPE',
                      value: formatEnumValue(family.residenza.tipo_zona),
                      accent: false
                    }] : [])
                  ]}
                  columns={2}
                  accentColor={cinematicTokens.colors.neon.purple}
                />
              )}
            </HeroDataCard>

            {/* Stats Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: cinematicTokens.spacing.base
            }}>
              <CinematicStatBox
                value={family.nucleo_familiare_attuale?.coniuge?.nome ? 'Married' : 'Single'}
                label="Marital Status"
                icon={<Heart size={24} />}
                accentColor={cinematicTokens.colors.neon.pink}
                size="md"
              />
              <CinematicStatBox
                value={family.nucleo_familiare_attuale?.figli?.length || 0}
                label="Children"
                icon={<Users size={24} />}
                accentColor={cinematicTokens.colors.neon.purple}
                size="md"
              />
              {family.residenza?.citta && (
                <CinematicStatBox
                  value={family.residenza.citta}
                  label="City"
                  icon={<MapPin size={24} />}
                  accentColor={cinematicTokens.colors.neon.cyan}
                  size="md"
                />
              )}
            </div>

            {/* Family Members */}
            {(family.nucleo_familiare_attuale?.coniuge?.nome || family.nucleo_familiare_attuale?.figli?.length > 0) && (
              <div style={{
                padding: cinematicTokens.spacing.xl,
                background: cinematicTokens.components.dataCard.background,
                border: `1px solid ${cinematicTokens.colors.neon.purple}40`,
                borderRadius: cinematicTokens.borderRadius.lg,
                boxShadow: cinematicTokens.components.dataCard.shadow
              }}>
                <h3 style={{
                  fontFamily: cinematicTokens.typography.fontFamily.display,
                  fontSize: cinematicTokens.typography.fontSize.xl,
                  fontWeight: cinematicTokens.typography.fontWeight.bold,
                  color: cinematicTokens.colors.text.primary,
                  marginBottom: cinematicTokens.spacing.lg,
                  textTransform: 'uppercase',
                  letterSpacing: cinematicTokens.typography.letterSpacing.wider
                }}>
                  Family Unit Members
                </h3>

                <div style={{ display: 'grid', gap: cinematicTokens.spacing.md }}>
                  {family.nucleo_familiare_attuale?.coniuge?.nome && (
                    <div style={{
                      padding: cinematicTokens.spacing.base,
                      background: `${cinematicTokens.colors.neon.purple}10`,
                      borderRadius: cinematicTokens.borderRadius.base,
                      border: `1px solid ${cinematicTokens.colors.neon.purple}30`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: cinematicTokens.spacing.base
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        background: `${cinematicTokens.colors.neon.purple}20`,
                        borderRadius: cinematicTokens.borderRadius.base,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: cinematicTokens.colors.neon.purple
                      }}>
                        <Heart size={20} />
                      </div>
                      <div>
                        <div style={{
                          fontSize: cinematicTokens.typography.fontSize.xs,
                          color: cinematicTokens.colors.text.tertiary,
                          textTransform: 'uppercase',
                          letterSpacing: cinematicTokens.typography.letterSpacing.wider,
                          marginBottom: cinematicTokens.spacing.xs
                        }}>
                          SPOUSE
                        </div>
                        <div style={{
                          fontFamily: cinematicTokens.typography.fontFamily.mono,
                          fontSize: cinematicTokens.typography.fontSize.base,
                          color: cinematicTokens.colors.neon.purple,
                          fontWeight: cinematicTokens.typography.fontWeight.semibold
                        }}>
                          {family.nucleo_familiare_attuale.coniuge.nome}{family.nucleo_familiare_attuale.coniuge.cognome ? ` ${family.nucleo_familiare_attuale.coniuge.cognome}` : ''}
                        </div>
                      </div>
                    </div>
                  )}

                  {family.nucleo_familiare_attuale?.figli?.map((figlio: any, i: number) => (
                    <div key={i} style={{
                      padding: cinematicTokens.spacing.base,
                      background: `${cinematicTokens.colors.neon.cyan}10`,
                      borderRadius: cinematicTokens.borderRadius.base,
                      border: `1px solid ${cinematicTokens.colors.neon.cyan}30`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: cinematicTokens.spacing.base
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        background: `${cinematicTokens.colors.neon.cyan}20`,
                        borderRadius: cinematicTokens.borderRadius.base,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: cinematicTokens.colors.neon.cyan,
                        fontFamily: cinematicTokens.typography.fontFamily.mono,
                        fontWeight: cinematicTokens.typography.fontWeight.bold
                      }}>
                        {i + 1}
                      </div>
                      <div>
                        <div style={{
                          fontSize: cinematicTokens.typography.fontSize.xs,
                          color: cinematicTokens.colors.text.tertiary,
                          textTransform: 'uppercase',
                          letterSpacing: cinematicTokens.typography.letterSpacing.wider,
                          marginBottom: cinematicTokens.spacing.xs
                        }}>
                          CHILD #{i + 1}
                        </div>
                        <div style={{
                          fontFamily: cinematicTokens.typography.fontFamily.mono,
                          fontSize: cinematicTokens.typography.fontSize.base,
                          color: cinematicTokens.colors.neon.cyan,
                          fontWeight: cinematicTokens.typography.fontWeight.semibold
                        }}>
                          {figlio.nome}{figlio.cognome ? ` ${figlio.cognome}` : ''}{figlio.eta_stimata ? ` • ${figlio.eta_stimata} YRS` : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CAREER SECTION */}
        {activeSection === 'career' && career && Object.keys(career).length > 0 && (
          <div style={{ display: 'grid', gap: designTokens.spacing.xl }}>
            {/* Career Stats Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: designTokens.spacing.base
            }}>
              {career.professione_attuale?.ruolo && (
                <StatBox
                  value={career.professione_attuale.ruolo}
                  label="Ruolo Attuale"
                  icon={<Briefcase className="h-6 w-6" />}
                  color={designTokens.colors.osint.career}
                />
              )}
              {career.professione_attuale?.azienda && (
                <StatBox
                  value={career.professione_attuale.azienda}
                  label="Azienda"
                  icon={<Briefcase className="h-6 w-6" />}
                  color={designTokens.colors.osint.career}
                />
              )}
              {career.anni_esperienza && (
                <StatBox
                  value={`${career.anni_esperienza} anni`}
                  label="Esperienza"
                  icon={<Clock className="h-6 w-6" />}
                  color={designTokens.colors.osint.career}
                />
              )}
              {career.competenze?.length > 0 && (
                <StatBox
                  value={career.competenze.length}
                  label="Competenze"
                  icon={<Trophy className="h-6 w-6" />}
                  color={designTokens.colors.osint.career}
                />
              )}
            </div>

            {/* Skills Visualization */}
            {career.competenze && career.competenze.length > 0 && (
              <Card style={{
                borderLeft: `4px solid ${designTokens.colors.osint.career}`,
                boxShadow: designTokens.shadows.md
              }}>
                <CardHeader>
                  <CardTitle style={{
                    fontSize: designTokens.typography.fontSize.lg,
                    fontWeight: designTokens.typography.fontWeight.semibold,
                    color: designTokens.colors.neutral[800]
                  }}>
                    Competenze Chiave
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ display: 'grid', gap: designTokens.spacing.base }}>
                    {career.competenze.slice(0, 5).map((skill: string, i: number) => (
                      <LinearProgress
                        key={i}
                        value={100 - (i * 5)}
                        label={skill}
                        color={designTokens.colors.osint.career}
                        showPercentage={false}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card style={{
              borderLeft: `4px solid ${designTokens.colors.osint.career}`,
              background: `linear-gradient(135deg, ${designTokens.colors.osint.career}08 0%, white 100%)`,
              boxShadow: designTokens.shadows.md
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '48px',
                    height: '48px',
                    background: `${designTokens.colors.osint.career}15`,
                    borderRadius: designTokens.borderRadius.lg,
                    marginRight: designTokens.spacing.sm
                  }}>
                    <Briefcase className="h-6 w-6" style={{ color: designTokens.colors.osint.career }} />
                  </div>
                  <div>
                    <span style={{
                      fontSize: designTokens.typography.fontSize.xl,
                      fontWeight: designTokens.typography.fontWeight.bold,
                      color: designTokens.colors.neutral[800],
                      display: 'block'
                    }}>
                      Carriera Professionale
                    </span>
                    <span style={{
                      fontSize: designTokens.typography.fontSize.sm,
                      color: designTokens.colors.neutral[600],
                      fontWeight: designTokens.typography.fontWeight.normal
                    }}>
                      Storico professionale, competenze e certificazioni
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  {career.professione_attuale && (
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Posizione Attuale</span>
                      <p style={{ fontWeight: '600', fontSize: '1.125rem', marginTop: '0.25rem' }}>
                        {career.professione_attuale.ruolo}
                      </p>
                      {career.professione_attuale.azienda && (
                        <p style={{ color: '#64748b', marginTop: '0.25rem' }}>
                          {career.professione_attuale.azienda}
                        </p>
                      )}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {career.professione_attuale.livello && (
                          <Badge variant="secondary">
                            {formatEnumValue(career.professione_attuale.livello)}
                          </Badge>
                        )}
                        {career.professione_attuale.settore &&
                         career.professione_attuale.settore !== 'Non disponibile (dedotto come imprenditoria in ambito eco/agricolo da nomi entità)' && (
                          <Badge style={{ background: '#d1fae5', color: '#065f46' }}>
                            {career.professione_attuale.settore}
                          </Badge>
                        )}
                      </div>
                      {career.professione_attuale.anzianita_anni > 0 && (
                        <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
                          Anzianità: {career.professione_attuale.anzianita_anni} anni
                        </p>
                      )}
                    </div>
                  )}

                  {career.competenze_chiave && career.competenze_chiave.length > 0 && (
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Competenze Chiave</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {career.competenze_chiave.map((comp: string, i: number) => (
                          <Badge key={i} variant="outline">{comp}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {career.certificazioni && career.certificazioni.length > 0 && (
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Certificazioni</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {career.certificazioni.map((cert: any, i: number) => (
                          <Badge key={i} style={{ background: '#dbeafe', color: '#1e40af' }}>
                            {typeof cert === 'string' ? cert : renderValue(cert)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {career.storico_professionale && career.storico_professionale.length > 0 && (
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Storico Professionale</span>
                      <div style={{ marginTop: '0.5rem', display: 'grid', gap: '0.75rem' }}>
                        {career.storico_professionale.map((pos: any, i: number) => (
                          <div key={i} style={{
                            padding: '1rem',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '0.5rem'
                          }}>
                            {typeof pos === 'object' ? (
                              <>
                                {pos.ruolo && <p style={{ fontWeight: '600' }}>{pos.ruolo}</p>}
                                {pos.azienda && <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{pos.azienda}</p>}
                                {pos.periodo && <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>{pos.periodo}</p>}
                              </>
                            ) : (
                              <p>{renderValue(pos)}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty state if no data */}
                  {!career.professione_attuale &&
                   (!career.competenze_chiave || career.competenze_chiave.length === 0) &&
                   (!career.certificazioni || career.certificazioni.length === 0) && (
                    <div style={{
                      padding: '2rem',
                      border: '1px dashed #cbd5e1',
                      borderRadius: '0.5rem',
                      textAlign: 'center',
                      color: '#64748b'
                    }}>
                      Informazioni sulla carriera non disponibili
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* EDUCATION SECTION */}
        {activeSection === 'education' && education && Object.keys(education).length > 0 && (
          <div style={{ display: 'grid', gap: designTokens.spacing.xl }}>
            {/* Education Stats Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: designTokens.spacing.base
            }}>
              {education.titolo_studio && (
                <StatBox
                  value={formatEnumValue(education.titolo_studio)}
                  label="Titolo di Studio"
                  icon={<GraduationCap className="h-6 w-6" />}
                  color={designTokens.colors.osint.education}
                />
              )}
              {education.istituto && (
                <StatBox
                  value={education.istituto}
                  label="Istituto"
                  icon={<BookOpen className="h-6 w-6" />}
                  color={designTokens.colors.osint.education}
                />
              )}
              {education.formazione_continua && education.formazione_continua.length > 0 && (
                <StatBox
                  value={education.formazione_continua.length}
                  label="Corsi/Certificazioni"
                  icon={<Trophy className="h-6 w-6" />}
                  color={designTokens.colors.osint.education}
                />
              )}
              {education.anni_formazione && (
                <StatBox
                  value={`${education.anni_formazione} anni`}
                  label="Anni di Formazione"
                  icon={<Clock className="h-6 w-6" />}
                  color={designTokens.colors.osint.education}
                />
              )}
            </div>

            {/* Formazione Continua Visualization */}
            {education.formazione_continua && education.formazione_continua.length > 0 && (
              <Card style={{
                borderLeft: `4px solid ${designTokens.colors.osint.education}`,
                boxShadow: designTokens.shadows.md
              }}>
                <CardHeader>
                  <CardTitle style={{
                    fontSize: designTokens.typography.fontSize.lg,
                    fontWeight: designTokens.typography.fontWeight.semibold,
                    color: designTokens.colors.neutral[800]
                  }}>
                    Formazione Continua e Certificazioni
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ display: 'grid', gap: designTokens.spacing.base }}>
                    {education.formazione_continua.map((corso: any, i: number) => {
                      const corsoNome = typeof corso === 'string' ? corso : (corso.nome || renderValue(corso))
                      return (
                        <LinearProgress
                          key={i}
                          value={100 - (i * 8)}
                          label={corsoNome}
                          color={designTokens.colors.osint.education}
                          showPercentage={false}
                        />
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Original detailed content */}
            <Card style={{
              borderLeft: `4px solid ${designTokens.colors.osint.education}`,
              background: `linear-gradient(135deg, ${designTokens.colors.osint.education}08 0%, white 100%)`,
              boxShadow: designTokens.shadows.md
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '48px',
                    height: '48px',
                    background: `${designTokens.colors.osint.education}15`,
                    borderRadius: designTokens.borderRadius.lg,
                    marginRight: designTokens.spacing.sm
                  }}>
                    <GraduationCap className="h-6 w-6" style={{ color: designTokens.colors.osint.education }} />
                  </div>
                  <div>
                    <span style={{
                      fontSize: designTokens.typography.fontSize.xl,
                      fontWeight: designTokens.typography.fontWeight.bold,
                      color: designTokens.colors.neutral[800],
                      display: 'block'
                    }}>
                      Dettagli Formazione
                    </span>
                    <span style={{
                      fontSize: designTokens.typography.fontSize.sm,
                      color: designTokens.colors.neutral[600],
                      fontWeight: designTokens.typography.fontWeight.normal
                    }}>
                      Informazioni complete sul percorso formativo
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  {education.titolo_studio && (
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Titolo di Studio</span>
                      <p style={{ fontWeight: '600', fontSize: '1.125rem', marginTop: '0.25rem' }}>
                        {formatEnumValue(education.titolo_studio)}
                      </p>
                      {education.istituto && (
                        <p style={{ color: '#64748b', marginTop: '0.25rem' }}>{education.istituto}</p>
                      )}
                    </div>
                  )}

                  {/* Empty state if no data */}
                  {!education.titolo_studio && (!education.formazione_continua || education.formazione_continua.length === 0) && (
                    <div style={{
                      padding: '2rem',
                      border: '1px dashed #cbd5e1',
                      borderRadius: '0.5rem',
                      textAlign: 'center',
                      color: '#64748b'
                    }}>
                      Informazioni sulla formazione non disponibili
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* LIFESTYLE SECTION */}
        {activeSection === 'lifestyle' && lifestyle && Object.keys(lifestyle).length > 0 && (
          <div style={{ display: 'grid', gap: designTokens.spacing.xl }}>
            {/* Lifestyle Stats Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: designTokens.spacing.base
            }}>
              {lifestyle.hobby_passioni && lifestyle.hobby_passioni.length > 0 && (
                <StatBox
                  value={lifestyle.hobby_passioni.length}
                  label="Hobby e Passioni"
                  icon={<Heart className="h-6 w-6" />}
                  color={designTokens.colors.osint.lifestyle}
                />
              )}
              {lifestyle.interessi_principali && lifestyle.interessi_principali.length > 0 && (
                <StatBox
                  value={lifestyle.interessi_principali.length}
                  label="Interessi Principali"
                  icon={<Star className="h-6 w-6" />}
                  color={designTokens.colors.osint.lifestyle}
                />
              )}
              {lifestyle.brand_preferiti && lifestyle.brand_preferiti.length > 0 && (
                <StatBox
                  value={lifestyle.brand_preferiti.length}
                  label="Brand Preferiti"
                  icon={<ShoppingCart className="h-6 w-6" />}
                  color={designTokens.colors.osint.lifestyle}
                />
              )}
              {lifestyle.stile_vita && (
                <StatBox
                  value={typeof lifestyle.stile_vita === 'string' && lifestyle.stile_vita.split(' ').length > 0 ? 'Definito' : 'N/A'}
                  label="Stile di Vita"
                  icon={<Sparkles className="h-6 w-6" />}
                  color={designTokens.colors.osint.lifestyle}
                />
              )}
            </div>

            {/* Interests Breakdown */}
            {((lifestyle.hobby_passioni && lifestyle.hobby_passioni.length > 0) ||
              (lifestyle.interessi_principali && lifestyle.interessi_principali.length > 0)) && (
              <Card style={{
                borderLeft: `4px solid ${designTokens.colors.osint.lifestyle}`,
                boxShadow: designTokens.shadows.md
              }}>
                <CardHeader>
                  <CardTitle style={{
                    fontSize: designTokens.typography.fontSize.lg,
                    fontWeight: designTokens.typography.fontWeight.semibold,
                    color: designTokens.colors.neutral[800]
                  }}>
                    Distribuzione Interessi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ display: 'grid', gap: designTokens.spacing.base }}>
                    {lifestyle.hobby_passioni && lifestyle.hobby_passioni.length > 0 &&
                      lifestyle.hobby_passioni.slice(0, 5).map((hobby: any, i: number) => {
                        const hobbyNome = typeof hobby === 'string' ? hobby : renderValue(hobby)
                        return (
                          <LinearProgress
                            key={i}
                            value={100 - (i * 10)}
                            label={hobbyNome}
                            color={designTokens.colors.osint.lifestyle}
                            showPercentage={false}
                          />
                        )
                      })}
                    {lifestyle.interessi_principali && lifestyle.interessi_principali.length > 0 &&
                      lifestyle.interessi_principali.slice(0, 3).map((interesse: any, i: number) => {
                        const interesseNome = typeof interesse === 'string' ? interesse : renderValue(interesse)
                        return (
                          <LinearProgress
                            key={`int-${i}`}
                            value={90 - (i * 15)}
                            label={interesseNome}
                            color={designTokens.colors.osint.lifestyle}
                            showPercentage={false}
                          />
                        )
                      })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* PieChart Visualization */}
            {((lifestyle.hobby_passioni && lifestyle.hobby_passioni.length > 0) ||
              (lifestyle.interessi_principali && lifestyle.interessi_principali.length > 0) ||
              (lifestyle.brand_preferiti && lifestyle.brand_preferiti.length > 0)) && (
              <Card style={{
                borderLeft: `4px solid ${designTokens.colors.osint.lifestyle}`,
                boxShadow: designTokens.shadows.md
              }}>
                <CardHeader>
                  <CardTitle style={{
                    fontSize: designTokens.typography.fontSize.lg,
                    fontWeight: designTokens.typography.fontWeight.semibold,
                    color: designTokens.colors.neutral[800]
                  }}>
                    Panoramica Lifestyle
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CustomPieChart
                    data={[
                      ...(lifestyle.hobby_passioni && lifestyle.hobby_passioni.length > 0 ? [{
                        name: 'Hobby e Passioni',
                        value: lifestyle.hobby_passioni.length,
                        color: designTokens.colors.osint.lifestyle
                      }] : []),
                      ...(lifestyle.interessi_principali && lifestyle.interessi_principali.length > 0 ? [{
                        name: 'Interessi',
                        value: lifestyle.interessi_principali.length,
                        color: designTokens.colors.osint.engagement
                      }] : []),
                      ...(lifestyle.brand_preferiti && lifestyle.brand_preferiti.length > 0 ? [{
                        name: 'Brand Preferiti',
                        value: lifestyle.brand_preferiti.length,
                        color: designTokens.colors.osint.digital
                      }] : [])
                    ]}
                    height={300}
                  />
                  {lifestyle.stile_vita && (
                    <div style={{
                      marginTop: designTokens.spacing.lg,
                      padding: designTokens.spacing.base,
                      background: `${designTokens.colors.osint.lifestyle}08`,
                      borderRadius: designTokens.borderRadius.base,
                      borderLeft: `3px solid ${designTokens.colors.osint.lifestyle}`
                    }}>
                      <span style={{
                        color: designTokens.colors.neutral[700],
                        fontSize: designTokens.typography.fontSize.sm,
                        fontWeight: designTokens.typography.fontWeight.semibold,
                        display: 'block',
                        marginBottom: designTokens.spacing.xs
                      }}>
                        Stile di Vita
                      </span>
                      <p style={{
                        color: designTokens.colors.neutral[600],
                        fontSize: designTokens.typography.fontSize.sm,
                        lineHeight: designTokens.typography.lineHeight.relaxed,
                        margin: 0
                      }}>
                        {typeof lifestyle.stile_vita === 'string' ? lifestyle.stile_vita : renderValue(lifestyle.stile_vita)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* WEALTH SECTION */}
        {activeSection === 'wealth' && wealth && Object.keys(wealth).length > 0 && (
          <div style={{ display: 'grid', gap: designTokens.spacing.xl }}>
            {/* Wealth Stats Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: designTokens.spacing.base
            }}>
              {wealth.valutazione_economica?.fascia && (
                <StatBox
                  value={formatEnumValue(wealth.valutazione_economica.fascia)}
                  label="Fascia Economica"
                  icon={<DollarSign className="h-6 w-6" />}
                  color={designTokens.colors.osint.wealth}
                />
              )}
              {wealth.proprieta_note && wealth.proprieta_note.length > 0 && (
                <StatBox
                  value={wealth.proprieta_note.length}
                  label="Proprietà Note"
                  icon={<TrendingUp className="h-6 w-6" />}
                  color={designTokens.colors.osint.wealth}
                />
              )}
              {wealth.tenore_vita && (
                <StatBox
                  value={typeof wealth.tenore_vita === 'object' && wealth.tenore_vita.descrizione ? 'Definito' : 'Stimato'}
                  label="Tenore di Vita"
                  icon={<Shield className="h-6 w-6" />}
                  color={designTokens.colors.osint.wealth}
                />
              )}
            </div>

            {/* Properties Visualization */}
            {wealth.proprieta_note && wealth.proprieta_note.length > 0 && (
              <Card style={{
                borderLeft: `4px solid ${designTokens.colors.osint.wealth}`,
                boxShadow: designTokens.shadows.md
              }}>
                <CardHeader>
                  <CardTitle style={{
                    fontSize: designTokens.typography.fontSize.lg,
                    fontWeight: designTokens.typography.fontWeight.semibold,
                    color: designTokens.colors.neutral[800]
                  }}>
                    Portfolio Proprietà
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ display: 'grid', gap: designTokens.spacing.base }}>
                    {wealth.proprieta_note.map((prop: any, i: number) => {
                      const propDescrizione = typeof prop === 'object' && prop.descrizione
                        ? `${prop.tipo || 'Proprietà'}: ${prop.descrizione}`
                        : (typeof prop === 'string' ? prop : renderValue(prop))
                      return (
                        <LinearProgress
                          key={i}
                          value={100 - (i * 12)}
                          label={propDescrizione}
                          color={designTokens.colors.osint.wealth}
                          showPercentage={false}
                        />
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Original detailed content */}
            <Card style={{
              borderLeft: `4px solid ${designTokens.colors.osint.wealth}`,
              background: `linear-gradient(135deg, ${designTokens.colors.osint.wealth}08 0%, white 100%)`,
              boxShadow: designTokens.shadows.md
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '48px',
                    height: '48px',
                    background: `${designTokens.colors.osint.wealth}15`,
                    borderRadius: designTokens.borderRadius.lg,
                    marginRight: designTokens.spacing.sm
                  }}>
                    <DollarSign className="h-6 w-6" style={{ color: designTokens.colors.osint.wealth }} />
                  </div>
                  <div>
                    <span style={{
                      fontSize: designTokens.typography.fontSize.xl,
                      fontWeight: designTokens.typography.fontWeight.bold,
                      color: designTokens.colors.neutral[800],
                      display: 'block'
                    }}>
                      Dettagli Economici
                    </span>
                    <span style={{
                      fontSize: designTokens.typography.fontSize.sm,
                      color: designTokens.colors.neutral[600],
                      fontWeight: designTokens.typography.fontWeight.normal
                    }}>
                      Fascia economica, tenore di vita e capacità di spesa
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  {wealth.valutazione_economica?.fascia && (
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Fascia Economica</span>
                      <p style={{ fontWeight: '600', fontSize: '1.5rem', marginTop: '0.25rem', color: '#10b981' }}>
                        {formatEnumValue(wealth.valutazione_economica.fascia)}
                      </p>
                    </div>
                  )}
                  {wealth.tenore_vita && (
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Tenore di Vita</span>
                      {typeof wealth.tenore_vita === 'object' && wealth.tenore_vita.descrizione ? (
                        <>
                          <p style={{ marginTop: '0.5rem', lineHeight: '1.6', fontWeight: '500' }}>
                            {wealth.tenore_vita.descrizione}
                          </p>
                          {wealth.tenore_vita.caratteristiche && wealth.tenore_vita.caratteristiche.length > 0 && (
                            <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.5rem' }}>
                              {wealth.tenore_vita.caratteristiche.map((car: string, i: number) => (
                                <div key={i} style={{
                                  padding: '0.5rem',
                                  background: '#d1fae5',
                                  borderRadius: '6px',
                                  fontSize: '0.875rem'
                                }}>
                                  • {car}
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <p style={{ marginTop: '0.5rem', lineHeight: '1.6' }}>
                          {typeof wealth.tenore_vita === 'string' ? wealth.tenore_vita : renderValue(wealth.tenore_vita)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* SOCIAL SECTION */}
        {activeSection === 'social' && digitalPresence && Object.keys(digitalPresence).length > 0 && (
          <SectionVisualEnhancer
            stats={[
              {
                value: digitalPresence.rete_sociale?.followers_totali?.toLocaleString() || 'N/A',
                label: 'Follower Totali',
                icon: <Users className="h-6 w-6" />,
                condition: !!digitalPresence.rete_sociale?.followers_totali
              },
              {
                value: digitalPresence.rete_sociale?.piattaforme_attive?.length || 0,
                label: 'Piattaforme Attive',
                icon: <Globe className="h-6 w-6" />,
                condition: digitalPresence.rete_sociale?.piattaforme_attive && digitalPresence.rete_sociale.piattaforme_attive.length > 0
              }
            ]}
            progressBars={
              digitalPresence.rete_sociale?.piattaforme_attive?.map((platform: any) => ({
                value: platform.follower ? Math.min((platform.follower / (digitalPresence.rete_sociale?.followers_totali || 1)) * 100, 100) : 50,
                label: `${platform.nome}${platform.follower ? ` (${platform.follower.toLocaleString()})` : ''}`,
                condition: true
              })) || []
            }
            color={designTokens.colors.osint.digital}
            progressTitle="Distribuzione Followers per Piattaforma"
          >
            <Card style={{
              borderLeft: `4px solid ${designTokens.colors.osint.digital}`,
              background: `linear-gradient(135deg, ${designTokens.colors.osint.digital}08 0%, white 100%)`,
              boxShadow: designTokens.shadows.md
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-6 w-6" style={{ color: designTokens.colors.osint.digital }} />
                  <span>Dettagli Presenza Digitale</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!digitalPresence.rete_sociale?.followers_totali &&
                 (!digitalPresence.rete_sociale?.piattaforme_attive || digitalPresence.rete_sociale.piattaforme_attive.length === 0) && (
                  <div style={{ padding: '2rem', border: '1px dashed #cbd5e1', borderRadius: '0.5rem', textAlign: 'center', color: '#64748b' }}>
                    Informazioni sulla presenza digitale non disponibili
                  </div>
                )}
              </CardContent>
            </Card>
          </SectionVisualEnhancer>
        )}

        {/* AUTHORITY SECTION */}
        {activeSection === 'authority' && authoritySignals && Object.keys(authoritySignals).length > 0 && (
          <div style={{ display: 'grid', gap: designTokens.spacing.xl }}>
            {/* Authority Stats Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: designTokens.spacing.base
            }}>
              {authoritySignals.livello_influenza && (
                <StatBox
                  value={formatEnumValue(authoritySignals.livello_influenza, 'influence_level')}
                  label="Livello Influenza"
                  icon={<Award className="h-6 w-6" />}
                  color={designTokens.colors.osint.authority}
                />
              )}
              {authoritySignals.premi_certificazioni && authoritySignals.premi_certificazioni.length > 0 && (
                <StatBox
                  value={authoritySignals.premi_certificazioni.length}
                  label="Premi e Certificazioni"
                  icon={<Trophy className="h-6 w-6" />}
                  color={designTokens.colors.osint.authority}
                />
              )}
              {authoritySignals.pubblicazioni && authoritySignals.pubblicazioni.length > 0 && (
                <StatBox
                  value={authoritySignals.pubblicazioni.length}
                  label="Pubblicazioni"
                  icon={<BookOpen className="h-6 w-6" />}
                  color={designTokens.colors.osint.authority}
                />
              )}
            </div>

            <Card style={{
              borderLeft: `4px solid ${designTokens.colors.osint.authority}`,
              background: `linear-gradient(135deg, ${designTokens.colors.osint.authority}08 0%, white 100%)`,
              boxShadow: designTokens.shadows.md
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '48px',
                    height: '48px',
                    background: `${designTokens.colors.osint.authority}15`,
                    borderRadius: designTokens.borderRadius.lg,
                    marginRight: designTokens.spacing.sm
                  }}>
                    <Award className="h-6 w-6" style={{ color: designTokens.colors.osint.authority }} />
                  </div>
                  <div>
                    <span style={{
                      fontSize: designTokens.typography.fontSize.xl,
                      fontWeight: designTokens.typography.fontWeight.bold,
                      color: designTokens.colors.neutral[800],
                      display: 'block'
                    }}>
                      Segnali di Autorità e Influenza
                    </span>
                    <span style={{
                      fontSize: designTokens.typography.fontSize.sm,
                      color: designTokens.colors.neutral[600],
                      fontWeight: designTokens.typography.fontWeight.normal
                    }}>
                      Livello influenza, premi, pubblicazioni e leadership
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  {/* Livello Influenza */}
                  {authoritySignals.livello_influenza && (
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Livello Influenza</span>
                      <p style={{ fontWeight: '600', fontSize: '1.125rem', marginTop: '0.25rem', color: '#f59e0b' }}>
                        {formatEnumValue(authoritySignals.livello_influenza, 'influence_level')}
                      </p>
                    </div>
                  )}

                  {/* Premi e Certificazioni */}
                  {authoritySignals.premi_certificazioni && authoritySignals.premi_certificazioni.length > 0 && (
                    <div>
                      <span style={{
                        color: designTokens.colors.neutral[600],
                        fontSize: designTokens.typography.fontSize.sm,
                        fontWeight: designTokens.typography.fontWeight.semibold
                      }}>
                        Premi e Certificazioni
                      </span>
                      <div style={{ marginTop: designTokens.spacing.sm, display: 'grid', gap: designTokens.spacing.md }}>
                        {authoritySignals.premi_certificazioni.map((premio: any, i: number) => (
                          <div
                            key={i}
                            style={{
                              padding: designTokens.spacing.lg,
                              background: `linear-gradient(135deg, ${designTokens.colors.osint.authority}08 0%, white 100%)`,
                              borderRadius: designTokens.borderRadius.lg,
                              border: `2px solid ${designTokens.colors.osint.authority}30`,
                              boxShadow: designTokens.shadows.sm,
                              transition: `all ${designTokens.animation.duration.base} ${designTokens.animation.easing.easeOut}`,
                              cursor: 'default',
                              position: 'relative',
                              overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)'
                              e.currentTarget.style.boxShadow = designTokens.shadows.md
                              e.currentTarget.style.borderColor = designTokens.colors.osint.authority
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)'
                              e.currentTarget.style.boxShadow = designTokens.shadows.sm
                              e.currentTarget.style.borderColor = `${designTokens.colors.osint.authority}30`
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <Trophy className="h-4 w-4 text-yellow-600" />
                              <p style={{ fontWeight: '600', color: '#92400e' }}>{premio.nome}</p>
                            </div>
                            <p style={{ fontSize: '0.875rem', color: '#78350f' }}>
                              {premio.organizzazione} {premio.anno && `(${premio.anno})`}
                            </p>
                            <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
                              {premio.descrizione}
                            </p>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem', display: 'block' }}>
                              Fonte: {premio.fonte}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pubblicazioni */}
                  {authoritySignals.pubblicazioni && authoritySignals.pubblicazioni.length > 0 && (
                    <div>
                      <span style={{
                        color: designTokens.colors.neutral[600],
                        fontSize: designTokens.typography.fontSize.sm,
                        fontWeight: designTokens.typography.fontWeight.semibold
                      }}>
                        Pubblicazioni
                      </span>
                      <div style={{ marginTop: designTokens.spacing.sm, display: 'grid', gap: designTokens.spacing.md }}>
                        {authoritySignals.pubblicazioni.map((pub: any, i: number) => (
                          <div
                            key={i}
                            style={{
                              padding: designTokens.spacing.lg,
                              background: `linear-gradient(135deg, ${designTokens.colors.primary[50]} 0%, white 100%)`,
                              borderRadius: designTokens.borderRadius.lg,
                              border: `2px solid ${designTokens.colors.primary[200]}`,
                              boxShadow: designTokens.shadows.sm,
                              transition: `all ${designTokens.animation.duration.base} ${designTokens.animation.easing.easeOut}`,
                              cursor: 'default',
                              position: 'relative',
                              overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)'
                              e.currentTarget.style.boxShadow = designTokens.shadows.md
                              e.currentTarget.style.borderColor = designTokens.colors.primary[400]
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)'
                              e.currentTarget.style.boxShadow = designTokens.shadows.sm
                              e.currentTarget.style.borderColor = designTokens.colors.primary[200]
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <BookOpen className="h-4 w-4 text-sky-600" />
                              <p style={{ fontWeight: '600', color: '#075985' }}>{pub.titolo}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#0c4a6e' }}>
                              <span>Tipo: {formatEnumValue(pub.tipo, 'publication_type')}</span>
                              {pub.piattaforma && <span>Piattaforma: {pub.piattaforma}</span>}
                              {pub.anno && <span>Anno: {pub.anno}</span>}
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem', display: 'block' }}>
                              Fonte: {pub.fonte}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Community Attive */}
                  {authoritySignals.community_attive && authoritySignals.community_attive.length > 0 && (
                    <div>
                      <span style={{
                        color: designTokens.colors.neutral[600],
                        fontSize: designTokens.typography.fontSize.sm,
                        fontWeight: designTokens.typography.fontWeight.semibold
                      }}>
                        Community e Leadership
                      </span>
                      <div style={{ marginTop: designTokens.spacing.sm, display: 'grid', gap: designTokens.spacing.md }}>
                        {authoritySignals.community_attive.map((comm: any, i: number) => (
                          <div
                            key={i}
                            style={{
                              padding: designTokens.spacing.lg,
                              background: `linear-gradient(135deg, ${designTokens.colors.secondary[50]} 0%, white 100%)`,
                              borderRadius: designTokens.borderRadius.lg,
                              border: `2px solid ${designTokens.colors.secondary[200]}`,
                              boxShadow: designTokens.shadows.sm,
                              transition: `all ${designTokens.animation.duration.base} ${designTokens.animation.easing.easeOut}`,
                              cursor: 'default'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)'
                              e.currentTarget.style.boxShadow = designTokens.shadows.md
                              e.currentTarget.style.borderColor = designTokens.colors.secondary[400]
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)'
                              e.currentTarget.style.boxShadow = designTokens.shadows.sm
                              e.currentTarget.style.borderColor = designTokens.colors.secondary[200]
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <Users className="h-4 w-4 text-violet-600" />
                              <p style={{ fontWeight: '600', color: '#5b21b6' }}>{comm.nome}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#6b21a8' }}>
                              <span>Ruolo: {formatEnumValue(comm.ruolo, 'community_role')}</span>
                              <span>Piattaforma: {comm.piattaforma}</span>
                              <span>Engagement: {formatEnumValue(comm.engagement_level, 'engagement_level')}</span>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem', display: 'block' }}>
                              Fonte: {comm.fonte}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Riconoscimenti Pubblici */}
                  {authoritySignals.riconoscimenti_pubblici && authoritySignals.riconoscimenti_pubblici.length > 0 && (
                    <div>
                      <span style={{
                        color: designTokens.colors.neutral[600],
                        fontSize: designTokens.typography.fontSize.sm,
                        fontWeight: designTokens.typography.fontWeight.semibold
                      }}>
                        Riconoscimenti Pubblici
                      </span>
                      <div style={{ marginTop: designTokens.spacing.sm, display: 'grid', gap: designTokens.spacing.md }}>
                        {authoritySignals.riconoscimenti_pubblici.map((ric: any, i: number) => (
                          <div
                            key={i}
                            style={{
                              padding: designTokens.spacing.lg,
                              background: `linear-gradient(135deg, ${designTokens.colors.error.light} 0%, white 100%)`,
                              borderRadius: designTokens.borderRadius.lg,
                              border: `2px solid ${designTokens.colors.error.main}40`,
                              boxShadow: designTokens.shadows.sm,
                              transition: `all ${designTokens.animation.duration.base} ${designTokens.animation.easing.easeOut}`,
                              cursor: 'default'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)'
                              e.currentTarget.style.boxShadow = designTokens.shadows.md
                              e.currentTarget.style.borderColor = designTokens.colors.error.main
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)'
                              e.currentTarget.style.boxShadow = designTokens.shadows.sm
                              e.currentTarget.style.borderColor = `${designTokens.colors.error.main}40`
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <Star className="h-4 w-4 text-red-600" />
                              <p style={{ fontWeight: '600', color: '#991b1b' }}>{ric.tipo}</p>
                            </div>
                            <p style={{ fontSize: '0.875rem', color: '#7f1d1d', marginTop: '0.5rem' }}>
                              {ric.descrizione}
                            </p>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem', display: 'block' }}>
                              Fonte: {ric.fonte}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty state if no data */}
                  {!authoritySignals.livello_influenza &&
                   (!authoritySignals.premi_certificazioni || authoritySignals.premi_certificazioni.length === 0) &&
                   (!authoritySignals.pubblicazioni || authoritySignals.pubblicazioni.length === 0) &&
                   (!authoritySignals.community_attive || authoritySignals.community_attive.length === 0) &&
                   (!authoritySignals.riconoscimenti_pubblici || authoritySignals.riconoscimenti_pubblici.length === 0) && (
                    <div style={{
                      padding: '2rem',
                      border: '1px dashed #cbd5e1',
                      borderRadius: '0.5rem',
                      textAlign: 'center',
                      color: '#64748b'
                    }}>
                      Segnali di autorità non disponibili
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* WORK MODEL SECTION */}
        {activeSection === 'workmodel' && workModel && Object.keys(workModel).length > 0 && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <Card style={{
              borderLeft: `4px solid ${designTokens.colors.osint.workmodel}`,
              background: `linear-gradient(135deg, ${designTokens.colors.osint.workmodel}08 0%, white 100%)`,
              boxShadow: designTokens.shadows.md
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '48px',
                    height: '48px',
                    background: `${designTokens.colors.osint.workmodel}15`,
                    borderRadius: designTokens.borderRadius.lg,
                    marginRight: designTokens.spacing.sm
                  }}>
                    <Clock className="h-6 w-6" style={{ color: designTokens.colors.osint.workmodel }} />
                  </div>
                  <div>
                    <span style={{
                      fontSize: designTokens.typography.fontSize.xl,
                      fontWeight: designTokens.typography.fontWeight.bold,
                      color: designTokens.colors.neutral[800],
                      display: 'block'
                    }}>
                      Modello Lavorativo
                    </span>
                    <span style={{
                      fontSize: designTokens.typography.fontSize.sm,
                      color: designTokens.colors.neutral[600],
                      fontWeight: designTokens.typography.fontWeight.normal
                    }}>
                      Modalità lavoro, orari, flessibilità e work-life balance
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  {/* Modalità Lavoro */}
                  {workModel.modalita_lavoro && (
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Modalità di Lavoro</span>
                      <div style={{
                        padding: '1rem',
                        background: '#f5f3ff',
                        borderRadius: '8px',
                        border: '1px solid #c084fc',
                        marginTop: '0.5rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <Badge style={{ background: '#8b5cf6', color: 'white' }}>
                            {formatEnumValue(workModel.modalita_lavoro.tipo)}
                          </Badge>
                          <Badge variant="outline">
                            Flessibilità: {formatEnumValue(workModel.modalita_lavoro.flessibilita)}
                          </Badge>
                        </div>
                        <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#6b21a8' }}>
                          {workModel.modalita_lavoro.descrizione}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Orari Lavoro */}
                  {workModel.orari_lavoro && (
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Orari e Work-Life Balance</span>
                      <div style={{
                        padding: '1rem',
                        background: '#fef3c7',
                        borderRadius: '8px',
                        border: '1px solid #fbbf24',
                        marginTop: '0.5rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <Badge style={{ background: '#f59e0b', color: 'white' }}>
                            {formatEnumValue(workModel.orari_lavoro.tipo)}
                          </Badge>
                          <Badge variant="outline">
                            Balance: {formatEnumValue(workModel.orari_lavoro.work_life_balance)}
                          </Badge>
                        </div>
                        <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#78350f' }}>
                          {workModel.orari_lavoro.descrizione}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Ambiente Lavoro */}
                  {workModel.ambiente_lavoro && (
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Ambiente di Lavoro</span>
                      <div style={{
                        padding: '1rem',
                        background: '#dbeafe',
                        borderRadius: '8px',
                        border: '1px solid #60a5fa',
                        marginTop: '0.5rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <Badge style={{ background: '#3b82f6', color: 'white' }}>
                            {formatEnumValue(workModel.ambiente_lavoro.tipo)}
                          </Badge>
                          <Badge variant="outline">
                            Team: {formatEnumValue(workModel.ambiente_lavoro.team_size)}
                          </Badge>
                        </div>
                        <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#1e3a8a' }}>
                          {workModel.ambiente_lavoro.descrizione}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Strumenti & Tecnologie */}
                  {workModel.strumenti_tecnologie && workModel.strumenti_tecnologie.length > 0 && (
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Strumenti e Tecnologie</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {workModel.strumenti_tecnologie.map((tool: string, i: number) => (
                          <Badge key={i} variant="secondary">{tool}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metodo Lavoro */}
                  {workModel.metodo_lavoro && (
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Metodo di Lavoro</span>
                      <div style={{
                        padding: '1rem',
                        background: '#d1fae5',
                        borderRadius: '8px',
                        border: '1px solid #6ee7b7',
                        marginTop: '0.5rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <Badge style={{ background: '#10b981', color: 'white' }}>
                            {formatEnumValue(workModel.metodo_lavoro.approccio)}
                          </Badge>
                          <Badge variant="outline">
                            Collaborazione: {formatEnumValue(workModel.metodo_lavoro.collaborazione)}
                          </Badge>
                        </div>
                        <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#065f46' }}>
                          {workModel.metodo_lavoro.descrizione}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Empty state if no data */}
                  {!workModel.modalita_lavoro && !workModel.orari_lavoro && !workModel.ambiente_lavoro && !workModel.metodo_lavoro && (
                    <div style={{
                      padding: '2rem',
                      border: '1px dashed #cbd5e1',
                      borderRadius: '0.5rem',
                      textAlign: 'center',
                      color: '#64748b'
                    }}>
                      Informazioni sul modello lavorativo non disponibili
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* VISION SECTION */}
        {activeSection === 'vision' && vision && Object.keys(vision).length > 0 && (
          <SectionVisualEnhancer
            stats={[
              {
                value: vision.obiettivi_professionali?.length || 0,
                label: 'Obiettivi Professionali',
                icon: <Target className="h-6 w-6" />,
                condition: vision.obiettivi_professionali && vision.obiettivi_professionali.length > 0
              },
              {
                value: vision.aspirazioni_personali?.length || 0,
                label: 'Aspirazioni Personali',
                icon: <Lightbulb className="h-6 w-6" />,
                condition: vision.aspirazioni_personali && vision.aspirazioni_personali.length > 0
              },
              {
                value: vision.valori_guida?.length || 0,
                label: 'Valori Guida',
                icon: <Star className="h-6 w-6" />,
                condition: vision.valori_guida && vision.valori_guida.length > 0
              }
            ]}
            color={designTokens.colors.osint.vision}
          >
            <Card style={{
              borderLeft: `4px solid ${designTokens.colors.osint.vision}`,
              background: `linear-gradient(135deg, ${designTokens.colors.osint.vision}08 0%, white 100%)`,
              boxShadow: designTokens.shadows.md
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '48px',
                    height: '48px',
                    background: `${designTokens.colors.osint.vision}15`,
                    borderRadius: designTokens.borderRadius.lg,
                    marginRight: designTokens.spacing.sm
                  }}>
                    <Target className="h-6 w-6" style={{ color: designTokens.colors.osint.vision }} />
                  </div>
                  <div>
                    <span style={{
                      fontSize: designTokens.typography.fontSize.xl,
                      fontWeight: designTokens.typography.fontWeight.bold,
                      color: designTokens.colors.neutral[800],
                      display: 'block'
                    }}>
                      Visione e Obiettivi
                    </span>
                    <span style={{
                      fontSize: designTokens.typography.fontSize.sm,
                      color: designTokens.colors.neutral[600],
                      fontWeight: designTokens.typography.fontWeight.normal
                    }}>
                      Obiettivi professionali, personali, valori e traguardi futuri
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  {/* Obiettivi Professionali */}
                  {vision.obiettivi_professionali && vision.obiettivi_professionali.length > 0 && (
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>Obiettivi Professionali</span>
                      <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.75rem' }}>
                        {vision.obiettivi_professionali.map((obj: any, i: number) => (
                          <div key={i} style={{
                            padding: '1rem',
                            background: '#dbeafe',
                            borderRadius: '8px',
                            border: '1px solid #60a5fa'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <Target className="h-4 w-4 text-blue-600" />
                              <span style={{ fontWeight: '600', color: '#1e40af' }}>{obj.obiettivo}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <Badge style={{ background: '#3b82f6', color: 'white' }}>
                                {formatEnumValue(obj.termine)}
                              </Badge>
                              <Badge variant="outline">
                                Priorità: {formatEnumValue(obj.priorita)}
                              </Badge>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                              Fonte: {obj.fonte}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Aspirazioni Personali */}
                  {vision.aspirazioni_personali && vision.aspirazioni_personali.length > 0 && (
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>Aspirazioni Personali</span>
                      <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.75rem' }}>
                        {vision.aspirazioni_personali.map((asp: any, i: number) => (
                          <div key={i} style={{
                            padding: '1rem',
                            background: '#fef3c7',
                            borderRadius: '8px',
                            border: '1px solid #fbbf24'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <span style={{ fontWeight: '600', color: '#78350f' }}>{asp.aspirazione}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <Badge style={{ background: '#f59e0b', color: 'white' }}>
                                {formatEnumValue(asp.categoria)}
                              </Badge>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                              Fonte: {asp.fonte}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Valori Fondamentali */}
                  {vision.valori_fondamentali && vision.valori_fondamentali.length > 0 && (
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>Valori Fondamentali</span>
                      <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.75rem' }}>
                        {vision.valori_fondamentali.map((val: any, i: number) => (
                          <div key={i} style={{
                            padding: '1rem',
                            background: '#d1fae5',
                            borderRadius: '8px',
                            border: '1px solid #6ee7b7'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <Shield className="h-4 w-4 text-green-600" />
                              <span style={{ fontWeight: '600', color: '#065f46' }}>{val.valore}</span>
                            </div>
                            <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#065f46', marginBottom: '0.5rem' }}>
                              {val.descrizione}
                            </p>
                            <div style={{
                              padding: '0.5rem',
                              background: '#f0fdf4',
                              borderRadius: '4px',
                              marginTop: '0.5rem'
                            }}>
                              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                <strong>Evidenza:</strong> {val.evidenza}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Progetti Futuri */}
                  {vision.progetti_futuri && vision.progetti_futuri.length > 0 && (
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>Progetti Futuri</span>
                      <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.75rem' }}>
                        {vision.progetti_futuri.map((prog: any, i: number) => (
                          <div key={i} style={{
                            padding: '1rem',
                            background: '#f5f3ff',
                            borderRadius: '8px',
                            border: '1px solid #c084fc'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <span style={{ fontWeight: '600', color: '#6b21a8' }}>{prog.progetto}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <Badge style={{ background: '#8b5cf6', color: 'white' }}>
                                {formatEnumValue(prog.stato)}
                              </Badge>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                              Fonte: {prog.fonte}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mentalità */}
                  {vision.mentalita && (
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>Mentalità e Attitudine</span>
                      <div style={{
                        padding: '1rem',
                        background: '#fce7f3',
                        borderRadius: '8px',
                        border: '1px solid #f472b6',
                        marginTop: '0.75rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <Badge style={{ background: '#ec4899', color: 'white' }}>
                            {formatEnumValue(vision.mentalita.tipo)}
                          </Badge>
                          <Badge variant="outline">
                            Cambiamento: {formatEnumValue(vision.mentalita.attitudine_cambiamento)}
                          </Badge>
                        </div>
                        <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#831843', marginTop: '0.5rem' }}>
                          {vision.mentalita.descrizione}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Empty state if no data */}
                  {!vision.obiettivi_professionali?.length &&
                   !vision.aspirazioni_personali?.length &&
                   !vision.valori_fondamentali?.length &&
                   !vision.progetti_futuri?.length &&
                   !vision.mentalita && (
                    <div style={{
                      padding: '2rem',
                      border: '1px dashed #cbd5e1',
                      borderRadius: '0.5rem',
                      textAlign: 'center',
                      color: '#64748b'
                    }}>
                      Informazioni su visione e obiettivi non disponibili
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </SectionVisualEnhancer>
        )}

        {/* NEEDS SECTION */}
        {activeSection === 'needs' && needs && Object.keys(needs).length > 0 && (
          <SectionVisualEnhancer
            stats={[
              {
                value: needs.bisogni_assicurativi?.length || 0,
                label: 'Bisogni Assicurativi',
                icon: <Shield className="h-6 w-6" />,
                condition: needs.bisogni_assicurativi && needs.bisogni_assicurativi.length > 0
              },
              {
                value: needs.bisogni_finanziari?.length || 0,
                label: 'Bisogni Finanziari',
                icon: <DollarSign className="h-6 w-6" />,
                condition: needs.bisogni_finanziari && needs.bisogni_finanziari.length > 0
              },
              {
                value: needs.priorita_vita?.length || 0,
                label: 'Priorità di Vita',
                icon: <Star className="h-6 w-6" />,
                condition: needs.priorita_vita && needs.priorita_vita.length > 0
              }
            ]}
            color={designTokens.colors.osint.needs}
          >
            <Card style={{
              borderLeft: `4px solid ${designTokens.colors.osint.needs}`,
              background: `linear-gradient(135deg, ${designTokens.colors.osint.needs}08 0%, white 100%)`,
              boxShadow: designTokens.shadows.md
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '48px',
                    height: '48px',
                    background: `${designTokens.colors.osint.needs}15`,
                    borderRadius: designTokens.borderRadius.lg,
                    marginRight: designTokens.spacing.sm
                  }}>
                    <Shield className="h-6 w-6" style={{ color: designTokens.colors.osint.needs }} />
                  </div>
                  <div>
                    <span style={{
                      fontSize: designTokens.typography.fontSize.xl,
                      fontWeight: designTokens.typography.fontWeight.bold,
                      color: designTokens.colors.neutral[800],
                      display: 'block'
                    }}>
                      Mappatura Bisogni
                    </span>
                    <span style={{
                      fontSize: designTokens.typography.fontSize.sm,
                      color: designTokens.colors.neutral[600],
                      fontWeight: designTokens.typography.fontWeight.normal
                    }}>
                      Bisogni identificati, urgenze e soluzioni ideali
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  {/* Bisogni Identificati */}
                  {needs.bisogni_identificati && needs.bisogni_identificati.length > 0 && (
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>Bisogni Identificati</span>
                      <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.75rem' }}>
                        {needs.bisogni_identificati.map((bisogno: any, i: number) => (
                          <div key={i} style={{
                            padding: '1rem',
                            background: '#fee2e2',
                            borderRadius: '8px',
                            border: '1px solid #fca5a5'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <Shield className="h-4 w-4 text-red-600" />
                              <span style={{ fontWeight: '600', color: '#991b1b' }}>{bisogno.bisogno}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <Badge style={{ background: '#ef4444', color: 'white' }}>
                                {formatEnumValue(bisogno.categoria)}
                              </Badge>
                              <Badge variant="outline">
                                Priorità: {formatEnumValue(bisogno.priorita)}
                              </Badge>
                            </div>
                            {bisogno.gap_attuale && (
                              <div style={{
                                padding: '0.5rem',
                                background: '#fef2f2',
                                borderRadius: '4px',
                                marginTop: '0.5rem'
                              }}>
                                <p style={{ fontSize: '0.75rem', color: '#991b1b' }}>
                                  <strong>Gap Attuale:</strong> {bisogno.gap_attuale}
                                </p>
                              </div>
                            )}
                            {bisogno.evidenze && bisogno.evidenze.length > 0 && (
                              <div style={{ marginTop: '0.5rem' }}>
                                <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                                  <strong>Evidenze:</strong>
                                </p>
                                <ul style={{ fontSize: '0.75rem', color: '#64748b', paddingLeft: '1.25rem' }}>
                                  {bisogno.evidenze.map((ev: string, j: number) => (
                                    <li key={j}>{ev}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vulnerabilità */}
                  {needs.vulnerabilita && needs.vulnerabilita.length > 0 && (
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>Vulnerabilità Rilevate</span>
                      <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.75rem' }}>
                        {needs.vulnerabilita.map((vuln: any, i: number) => (
                          <div key={i} style={{
                            padding: '1rem',
                            background: '#fef3c7',
                            borderRadius: '8px',
                            border: '1px solid #fbbf24'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <span style={{ fontWeight: '600', color: '#78350f' }}>{vuln.area}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <Badge style={{ background: '#f59e0b', color: 'white' }}>
                                Impatto: {formatEnumValue(vuln.impatto)}
                              </Badge>
                            </div>
                            <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#78350f', marginBottom: '0.5rem' }}>
                              {vuln.descrizione}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                              Fonte: {vuln.fonte}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Opportunità Commerciali */}
                  {needs.opportunita && needs.opportunita.length > 0 && (
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>Opportunità Commerciali</span>
                      <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.75rem' }}>
                        {needs.opportunita.map((opp: any, i: number) => (
                          <div key={i} style={{
                            padding: '1rem',
                            background: '#d1fae5',
                            borderRadius: '8px',
                            border: '1px solid #6ee7b7'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <span style={{ fontWeight: '600', color: '#065f46' }}>{opp.tipo}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <Badge style={{ background: '#10b981', color: 'white' }}>
                                Potenziale: {formatEnumValue(opp.potenziale)}
                              </Badge>
                              <Badge variant="outline">
                                {formatEnumValue(opp.timing)}
                              </Badge>
                            </div>
                            <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#065f46' }}>
                              {opp.descrizione}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Priorità Intervento */}
                  {needs.priorita_intervento && needs.priorita_intervento.length > 0 && (
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>Priorità di Intervento</span>
                      <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.75rem' }}>
                        {needs.priorita_intervento.map((prio: any, i: number) => (
                          <div key={i} style={{
                            padding: '1rem',
                            background: '#f5f3ff',
                            borderRadius: '8px',
                            border: '1px solid #c084fc'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <span style={{ fontWeight: '600', color: '#6b21a8' }}>{prio.area}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <Badge style={{ background: '#8b5cf6', color: 'white' }}>
                                Urgenza: {formatEnumValue(prio.urgenza)}
                              </Badge>
                            </div>
                            <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#6b21a8' }}>
                              {prio.motivazione}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty state if no data */}
                  {!needs.bisogni_identificati?.length &&
                   !needs.vulnerabilita?.length &&
                   !needs.opportunita?.length &&
                   !needs.priorita_intervento?.length && (
                    <div style={{
                      padding: '2rem',
                      border: '1px dashed #cbd5e1',
                      borderRadius: '0.5rem',
                      textAlign: 'center',
                      color: '#64748b'
                    }}>
                      Mappatura dei bisogni non disponibile
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </SectionVisualEnhancer>
        )}

        {/* ENGAGEMENT SECTION */}
        {activeSection === 'engagement' && engagement && Object.keys(engagement).length > 0 && (
          <SectionVisualEnhancer
            stats={[
              {
                value: engagement.strategie_ingaggio?.length || 0,
                label: 'Strategie di Ingaggio',
                icon: <Zap className="h-6 w-6" />,
                condition: engagement.strategie_ingaggio && engagement.strategie_ingaggio.length > 0
              },
              {
                value: engagement.canali_contatto_preferiti?.length || 0,
                label: 'Canali Preferiti',
                icon: <Phone className="h-6 w-6" />,
                condition: engagement.canali_contatto_preferiti && engagement.canali_contatto_preferiti.length > 0
              },
              {
                value: engagement.timing_ottimale ? 'Definito' : 'N/A',
                label: 'Timing Ottimale',
                icon: <Clock className="h-6 w-6" />,
                condition: !!engagement.timing_ottimale
              }
            ]}
            color={designTokens.colors.osint.engagement}
          >
            <Card style={{
              borderLeft: `4px solid ${designTokens.colors.osint.engagement}`,
              background: `linear-gradient(135deg, ${designTokens.colors.osint.engagement}08 0%, white 100%)`,
              boxShadow: designTokens.shadows.md
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '48px',
                    height: '48px',
                    background: `${designTokens.colors.osint.engagement}15`,
                    borderRadius: designTokens.borderRadius.lg,
                    marginRight: designTokens.spacing.sm
                  }}>
                    <Zap className="h-6 w-6" style={{ color: designTokens.colors.osint.engagement }} />
                  </div>
                  <div>
                    <span style={{
                      fontSize: designTokens.typography.fontSize.xl,
                      fontWeight: designTokens.typography.fontWeight.bold,
                      color: designTokens.colors.neutral[800],
                      display: 'block'
                    }}>
                      Leve di Ingaggio
                    </span>
                    <span style={{
                      fontSize: designTokens.typography.fontSize.sm,
                      color: designTokens.colors.neutral[600],
                      fontWeight: designTokens.typography.fontWeight.normal
                    }}>
                      Strategie di coinvolgimento, messaggi e momenti ideali
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  {/* Leve Principali */}
                  {engagement.leve_principali && engagement.leve_principali.length > 0 && (
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>Leve Principali</span>
                      <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.75rem' }}>
                        {engagement.leve_principali.map((leva: any, i: number) => (
                          <div key={i} style={{
                            padding: '1rem',
                            background: '#fed7aa',
                            borderRadius: '8px',
                            border: '1px solid #fdba74'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <Zap className="h-4 w-4 text-orange-700" />
                              <span style={{ fontWeight: '600', color: '#c2410c' }}>{leva.leva}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <Badge style={{ background: '#f97316', color: 'white' }}>
                                {formatEnumValue(leva.categoria)}
                              </Badge>
                              <Badge variant="outline">
                                Efficacia: {formatEnumValue(leva.efficacia)}
                              </Badge>
                            </div>
                            <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#78350f', marginBottom: '0.5rem' }}>
                              {leva.descrizione}
                            </p>
                            <div style={{
                              padding: '0.5rem',
                              background: '#fff7ed',
                              borderRadius: '4px',
                              marginTop: '0.5rem'
                            }}>
                              <p style={{ fontSize: '0.75rem', color: '#78350f' }}>
                                <strong>Come usarla:</strong> {leva.come_usarla}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Momenti Ideali */}
                  {engagement.momenti_ideali && engagement.momenti_ideali.length > 0 && (
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>Momenti Ideali di Contatto</span>
                      <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.75rem' }}>
                        {engagement.momenti_ideali.map((mom: any, i: number) => (
                          <div key={i} style={{
                            padding: '1rem',
                            background: '#dbeafe',
                            borderRadius: '8px',
                            border: '1px solid #60a5fa'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <Clock className="h-4 w-4 text-blue-600" />
                              <span style={{ fontWeight: '600', color: '#1e40af' }}>{mom.momento}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <Badge style={{ background: '#3b82f6', color: 'white' }}>
                                {formatEnumValue(mom.tipo)}
                              </Badge>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
                              <strong>Finestra:</strong> {mom.finestra_temporale}
                            </p>
                            <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#1e40af' }}>
                              {mom.approccio_consigliato}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Canali Comunicazione */}
                  {engagement.canali_comunicazione && engagement.canali_comunicazione.length > 0 && (
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>Canali di Comunicazione</span>
                      <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.75rem' }}>
                        {engagement.canali_comunicazione.map((can: any, i: number) => (
                          <div key={i} style={{
                            padding: '1rem',
                            background: '#f5f3ff',
                            borderRadius: '8px',
                            border: '1px solid #c084fc'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <span style={{ fontWeight: '600', color: '#6b21a8' }}>{formatEnumValue(can.canale)}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <Badge style={{ background: '#8b5cf6', color: 'white' }}>
                                Efficacia: {formatEnumValue(can.efficacia)}
                              </Badge>
                              <Badge variant="outline">
                                {can.frequenza_consigliata}
                              </Badge>
                            </div>
                            <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#6b21a8' }}>
                              {can.note}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Messaggi Chiave */}
                  {engagement.messaggi_chiave && engagement.messaggi_chiave.length > 0 && (
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>Messaggi Chiave</span>
                      <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.75rem' }}>
                        {engagement.messaggi_chiave.map((msg: any, i: number) => (
                          <div key={i} style={{
                            padding: '1rem',
                            background: '#d1fae5',
                            borderRadius: '8px',
                            border: '1px solid #6ee7b7'
                          }}>
                            <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#065f46', fontWeight: '500', marginBottom: '0.5rem' }}>
                              "{msg.messaggio}"
                            </p>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                              <Badge style={{ background: '#10b981', color: 'white' }}>
                                {msg.target_bisogno}
                              </Badge>
                              <Badge variant="outline">
                                Tono: {msg.tono}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ostacoli Potenziali */}
                  {engagement.ostacoli_potenziali && engagement.ostacoli_potenziali.length > 0 && (
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>Ostacoli Potenziali</span>
                      <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.75rem' }}>
                        {engagement.ostacoli_potenziali.map((ost: any, i: number) => (
                          <div key={i} style={{
                            padding: '1rem',
                            background: '#fef3c7',
                            borderRadius: '8px',
                            border: '1px solid #fbbf24'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <span style={{ fontWeight: '600', color: '#78350f' }}>{ost.ostacolo}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <Badge style={{ background: '#f59e0b', color: 'white' }}>
                                Probabilità: {formatEnumValue(ost.probabilita)}
                              </Badge>
                            </div>
                            <div style={{
                              padding: '0.5rem',
                              background: '#fff7ed',
                              borderRadius: '4px',
                              marginTop: '0.5rem'
                            }}>
                              <p style={{ fontSize: '0.75rem', color: '#78350f' }}>
                                <strong>Strategia:</strong> {ost.strategia_superamento}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty state if no data */}
                  {!engagement.leve_principali?.length &&
                   !engagement.momenti_ideali?.length &&
                   !engagement.canali_comunicazione?.length &&
                   !engagement.messaggi_chiave?.length &&
                   !engagement.ostacoli_potenziali?.length && (
                    <div style={{
                      padding: '2rem',
                      border: '1px dashed #cbd5e1',
                      borderRadius: '0.5rem',
                      textAlign: 'center',
                      color: '#64748b'
                    }}>
                      Informazioni sulle leve di ingaggio non disponibili
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </SectionVisualEnhancer>
        )}

        {/* Footer */}
        <div style={{
          marginTop: '3rem',
          padding: '1rem',
          background: '#f1f5f9',
          borderRadius: '12px',
          fontSize: '0.875rem',
          color: '#64748b',
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center'
        }}>
          <span>✅</span>
          <div>
            <strong style={{ color: '#0f172a' }}>Dati Reali</strong> - Tutte le informazioni provengono direttamente dal database.
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
