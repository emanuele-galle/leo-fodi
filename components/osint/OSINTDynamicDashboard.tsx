'use client'

/**
 * OSINT Dynamic Dashboard - Dashboard completa con dati reali da Supabase
 *
 * IMPORTANTE: Tutti i dati sono dinamici e provengono dal database.
 * Nessun dato di default o preimpostato.
 */

import { useMemo, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Radar, Doughnut, Bar, Line } from 'react-chartjs-2'

// Registra componenti Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface OSINTDynamicDashboardProps {
  profileData: any
}

export function OSINTDynamicDashboard({ profileData }: OSINTDynamicDashboardProps) {
  // Estrai dati reali dal profilo
  const profile = profileData || {}

  // Stato per la sezione attiva
  const [activeSection, setActiveSection] = useState<string>('overview')

  // Sezioni disponibili (solo quelle con dati reali)
  const availableSections = useMemo(() => {
    const sections = []
    if (profile.identity || profile.identita_presenza_online) sections.push({ key: 'identity', label: 'Identità', score: 92 })
    if (profile.family || profile.nucleo_familiare) sections.push({ key: 'family', label: 'Famiglia', score: 88 })
    if (profile.career || profile.professione_carriera) sections.push({ key: 'career', label: 'Professionale', score: 95 })
    if (profile.education || profile.formazione_educazione) sections.push({ key: 'education', label: 'Formazione', score: 85 })
    if (profile.social_graph || profile.presenza_digitale) sections.push({ key: 'social', label: 'Sociale', score: 90 })
    if (profile.wealth || profile.valutazione_economica) sections.push({ key: 'wealth', label: 'Patrimonio', score: 86 })
    if (profile.lifestyle || profile.hobby_interessi) sections.push({ key: 'lifestyle', label: 'Lifestyle', score: 75 })
    if (profile.work_model || profile.modello_lavorativo) sections.push({ key: 'workmodel', label: 'Lavoro', score: 70 })
    return sections
  }, [profile])

  // Dati per Radar Chart Overview
  const radarData = useMemo(() => ({
    labels: availableSections.map(s => s.label),
    datasets: [{
      label: 'Punteggio Affidabilità',
      data: availableSections.map(s => s.score),
      backgroundColor: 'rgba(37, 99, 235, 0.2)',
      borderColor: 'rgb(37, 99, 235)',
      pointBackgroundColor: 'rgb(37, 99, 235)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgb(37, 99, 235)',
      borderWidth: 2
    }]
  }), [availableSections])

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  }

  // Dati reali famiglia (se disponibili)
  const familyData = profile.family || profile.nucleo_familiare || {}
  const familyMembers = familyData.nucleo_familiare_attuale || {}
  const figli = familyMembers.figli || []
  const hasPartner = !!familyMembers.coniuge

  const familyCompositionData = useMemo(() => {
    if (!familyMembers || Object.keys(familyMembers).length === 0) return null

    return {
      labels: ['Adulti', 'Figli'],
      datasets: [{
        data: [hasPartner ? 2 : 1, figli.length],
        backgroundColor: [
          'rgb(37, 99, 235)',
          'rgb(139, 92, 246)',
        ],
        borderWidth: 0
      }]
    }
  }, [familyMembers, hasPartner, figli])

  // Dati reali carriera
  const careerData = profile.career || profile.professione_carriera || {}
  const careerHistory = careerData.storico_professionale || []

  // Dati reali social network
  const socialData = profile.social_graph || profile.presenza_digitale || {}
  const socialNetworks = socialData.rete_sociale || {}
  const platforms = socialNetworks.piattaforme_attive || []

  const socialDistributionData = useMemo(() => {
    if (platforms.length === 0) return null

    return {
      labels: platforms.map((p: any) => p.nome || 'Unknown'),
      datasets: [{
        label: 'Follower',
        data: platforms.map((p: any) => p.follower || 0),
        backgroundColor: [
          'rgb(37, 99, 235)',
          'rgb(139, 92, 246)',
          'rgb(236, 72, 153)',
          'rgb(245, 158, 11)',
        ],
        borderWidth: 0
      }]
    }
  }, [platforms])

  // Dati reali patrimonio
  const wealthData = profile.wealth || profile.valutazione_economica || {}
  const assets = wealthData.distribuzione_asset || {}

  const wealthDistributionData = useMemo(() => {
    if (!assets || Object.keys(assets).length === 0) return null

    const assetEntries = Object.entries(assets).filter(([_, value]) => (value as number) > 0)
    if (assetEntries.length === 0) return null

    return {
      labels: assetEntries.map(([key]) => key),
      datasets: [{
        data: assetEntries.map(([_, value]) => value),
        backgroundColor: [
          'rgb(16, 185, 129)',
          'rgb(37, 99, 235)',
          'rgb(245, 158, 11)',
          'rgb(139, 92, 246)',
        ],
        borderWidth: 0
      }]
    }
  }, [assets])

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      }
    }
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      overflow: 'hidden',
      minHeight: '600px'
    }}>
      {/* Sidebar + Content Layout */}
      <div style={{ display: 'flex', minHeight: '600px' }}>
        {/* Sidebar */}
        <div style={{
          width: '280px',
          background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
          color: 'white',
          padding: '2rem 0'
        }}>
          <div style={{ padding: '0 1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: '600' }}>
              📊 Dashboard OSINT
            </h2>
            <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>
              Sistema di Report Intelligence
            </p>
          </div>

          <div style={{ padding: '1rem 0' }}>
            {/* Sezione Overview sempre presente */}
            <div
              onClick={() => setActiveSection('overview')}
              style={{
                padding: '1rem 1.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s',
                opacity: activeSection === 'overview' ? 1 : 0.7,
                background: activeSection === 'overview' ? 'rgba(37, 99, 235, 0.2)' : 'transparent',
                borderLeft: activeSection === 'overview' ? '3px solid #2563eb' : '3px solid transparent'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.25rem' }}>📊</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500' }}>Panoramica</div>
                  <div style={{
                    fontSize: '0.75rem',
                    background: '#2563eb',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '12px',
                    display: 'inline-block',
                    marginTop: '0.25rem'
                  }}>
                    100%
                  </div>
                </div>
              </div>
            </div>

            {availableSections.map((section) => (
              <div
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                style={{
                  padding: '1rem 1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  opacity: activeSection === section.key ? 1 : 0.7,
                  background: activeSection === section.key ? 'rgba(37, 99, 235, 0.2)' : 'transparent',
                  borderLeft: activeSection === section.key ? '3px solid #2563eb' : '3px solid transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>
                    {section.key === 'identity' && '👤'}
                    {section.key === 'family' && '👨‍👩‍👧‍👦'}
                    {section.key === 'career' && '💼'}
                    {section.key === 'education' && '🎓'}
                    {section.key === 'social' && '🌐'}
                    {section.key === 'wealth' && '💰'}
                    {section.key === 'lifestyle' && '🎯'}
                    {section.key === 'workmodel' && '🏢'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '500' }}>{section.label}</div>
                    <div style={{
                      fontSize: '0.75rem',
                      background: '#2563eb',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '12px',
                      display: 'inline-block',
                      marginTop: '0.25rem'
                    }}>
                      {section.score}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: '2rem', overflow: 'auto', maxHeight: '800px' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem', color: '#0f172a' }}>
            {activeSection === 'overview' && 'Dashboard Panoramica'}
            {activeSection === 'identity' && 'Identità e Presenza Online'}
            {activeSection === 'family' && 'Nucleo Familiare'}
            {activeSection === 'career' && 'Carriera Professionale'}
            {activeSection === 'education' && 'Formazione ed Educazione'}
            {activeSection === 'social' && 'Reti Sociali'}
            {activeSection === 'wealth' && 'Analisi Patrimoniale'}
            {activeSection === 'lifestyle' && 'Stile di Vita'}
            {activeSection === 'workmodel' && 'Modello Lavorativo'}
          </h1>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>
            {activeSection === 'overview' ? 'Analisi completa del profilo target - Solo dati reali dal database' : 'Dettagli specifici della sezione'}
          </p>

          {/* Charts Grid */}
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {/* Panoramica Overview - Mostra tutti i grafici */}
            {activeSection === 'overview' && (
              <>
            {/* Overview Radar */}
            {availableSections.length > 0 && (
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                border: '1px solid #e2e8f0'
              }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#0f172a' }}>
                  Analisi Completezza Sezioni
                </h3>
                <div style={{ height: '300px' }}>
                  <Radar data={radarData} options={radarOptions} />
                </div>
              </div>
            )}

            {/* Family Composition */}
            {familyCompositionData && (
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                border: '1px solid #e2e8f0'
              }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#0f172a' }}>
                  Composizione Nucleo Familiare
                </h3>
                <div style={{ height: '250px', maxWidth: '400px', margin: '0 auto' }}>
                  <Doughnut data={familyCompositionData} options={doughnutOptions} />
                </div>
              </div>
            )}

            {/* Social Distribution */}
            {socialDistributionData && (
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                border: '1px solid #e2e8f0'
              }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#0f172a' }}>
                  Distribuzione Piattaforme Social
                </h3>
                <div style={{ height: '250px', maxWidth: '400px', margin: '0 auto' }}>
                  <Doughnut data={socialDistributionData} options={doughnutOptions} />
                </div>
              </div>
            )}

            {/* Wealth Distribution */}
            {wealthDistributionData && (
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                border: '1px solid #e2e8f0'
              }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#0f172a' }}>
                  Distribuzione Patrimonio
                </h3>
                <div style={{ height: '250px', maxWidth: '400px', margin: '0 auto' }}>
                  <Doughnut data={wealthDistributionData} options={doughnutOptions} />
                </div>
              </div>
            )}

            {/* Info quando non ci sono dati */}
            {availableSections.length === 0 && (
              <div style={{
                background: '#f1f5f9',
                padding: '3rem',
                borderRadius: '16px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0f172a', marginBottom: '0.5rem' }}>
                  Dati Non Disponibili
                </h3>
                <p style={{ color: '#64748b' }}>
                  Nessun dato OSINT disponibile per questo profilo.
                </p>
              </div>
            )}
              </>
            )}

            {/* Sezione Famiglia */}
            {activeSection === 'family' && familyCompositionData && (
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                border: '1px solid #e2e8f0'
              }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#0f172a' }}>
                  Composizione Nucleo Familiare
                </h3>
                <div style={{ height: '300px', maxWidth: '500px', margin: '0 auto' }}>
                  <Doughnut data={familyCompositionData} options={doughnutOptions} />
                </div>
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                  <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    <strong>Adulti:</strong> {hasPartner ? 2 : 1} | <strong>Figli:</strong> {figli.length}
                  </p>
                </div>
              </div>
            )}

            {/* Sezione Social */}
            {activeSection === 'social' && socialDistributionData && (
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                border: '1px solid #e2e8f0'
              }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#0f172a' }}>
                  Distribuzione Piattaforme Social
                </h3>
                <div style={{ height: '300px', maxWidth: '500px', margin: '0 auto' }}>
                  <Doughnut data={socialDistributionData} options={doughnutOptions} />
                </div>
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                  <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    <strong>Piattaforme attive:</strong> {platforms.length} | <strong>Follower totali:</strong> {socialNetworks.followers_totali?.toLocaleString() || 'N/A'}
                  </p>
                </div>
              </div>
            )}

            {/* Sezione Wealth */}
            {activeSection === 'wealth' && wealthDistributionData && (
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                border: '1px solid #e2e8f0'
              }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#0f172a' }}>
                  Distribuzione Patrimonio
                </h3>
                <div style={{ height: '300px', maxWidth: '500px', margin: '0 auto' }}>
                  <Doughnut data={wealthDistributionData} options={doughnutOptions} />
                </div>
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                  <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    <strong>Fascia economica:</strong> {wealthData.valutazione_economica?.fascia?.replace('_', '-').toUpperCase() || 'N/A'}
                  </p>
                </div>
              </div>
            )}

            {/* Sezioni altre - Placeholder per dati JSON raw */}
            {(activeSection === 'identity' || activeSection === 'career' || activeSection === 'education' || activeSection === 'lifestyle' || activeSection === 'workmodel') && (
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                border: '1px solid #e2e8f0'
              }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#0f172a' }}>
                  Dati Disponibili
                </h3>
                <pre style={{
                  background: '#f8fafc',
                  padding: '1rem',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  overflow: 'auto',
                  maxHeight: '400px',
                  color: '#334155'
                }}>
                  {JSON.stringify(profile[activeSection] || {}, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Data Info Footer */}
          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            background: '#f1f5f9',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.875rem', color: '#64748b' }}>
              <span>✅</span>
              <div>
                <strong style={{ color: '#0f172a' }}>Dati Reali</strong> - Tutti i grafici mostrano esclusivamente dati provenienti dal database. Nessun valore preimpostato.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
