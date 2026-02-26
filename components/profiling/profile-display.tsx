'use client'

import { OSINTProfile } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  User,
  Globe,
  Award,
  Briefcase,
  Target,
  Heart,
  ListChecks,
  MessageCircle,
  ShoppingBag,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

interface ProfileDisplayProps {
  profile: OSINTProfile
  onPlanningClick: () => void
}

export function ProfileDisplay({ profile, onPlanningClick }: ProfileDisplayProps) {
  const SectionCard = ({
    icon: Icon,
    title,
    gradient,
    iconColor,
    children
  }: {
    icon: any,
    title: string,
    gradient: string,
    iconColor: string,
    children: React.ReactNode
  }) => (
    <Card className="border border-gray-200/60 shadow-[0_6px_24px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300">
      <CardHeader className={`relative ${gradient} rounded-t-xl border-b border-gray-200/60 pb-5 overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent pointer-events-none"></div>
        <div className="relative flex items-center gap-3">
          <div className={`p-2 bg-white/80 rounded-lg shadow-sm`}>
            <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${iconColor}`} />
          </div>
          <CardTitle className="text-lg sm:text-xl font-bold text-gray-800">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {children}
      </CardContent>
    </Card>
  )

  const InfoRow = ({ label, value, badge = false }: { label: string, value: any, badge?: boolean }) => (
    <div className="space-y-1.5">
      <p className="font-semibold text-xs sm:text-sm text-gray-600 uppercase tracking-wide">{label}</p>
      {badge ? (
        <div className="flex flex-wrap gap-2">
          {Array.isArray(value) && value.map((item, i) => (
            <Badge key={i} variant="secondary" className="shadow-sm">{item}</Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm sm:text-base text-gray-800 leading-relaxed">{value}</p>
      )}
    </div>
  )

  return (
    <div className="w-full max-w-6xl space-y-6 px-4">
      {/* Success Header */}
      <Card className="border-2 border-blue-600/30 shadow-[0_10px_40px_rgba(59,130,246,0.15),0_3px_12px_rgba(59,130,246,0.1)] bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full mb-4 shadow-lg animate-[bounce_2s_ease-in-out_infinite]">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-700 bg-clip-text text-transparent mb-2">
            Profilo OSINT Completato
          </h2>
          <p className="text-sm sm:text-base text-gray-700 max-w-2xl mx-auto">
            Analisi completa di <span className="font-bold text-blue-700">{profile.identita_presenza_online.nome_completo}</span> pronta per la pianificazione finanziaria
          </p>
        </CardContent>
      </Card>

      {/* Grid Layout - 2 colonne su desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Identità e Presenza Online */}
        <SectionCard
          icon={User}
          title="Identità e Presenza Online"
          gradient="bg-gradient-to-br from-blue-50 via-indigo-50/50 to-blue-50/30"
          iconColor="text-blue-600"
        >
          <InfoRow label="Nome Completo" value={profile.identita_presenza_online.nome_completo} />
          <InfoRow label="Ruoli" value={profile.identita_presenza_online.ruoli_principali} badge />
          {profile.identita_presenza_online.aziende_attuali?.length > 0 && (
            <InfoRow label="Aziende" value={profile.identita_presenza_online.aziende_attuali.join(', ')} />
          )}
          <InfoRow label="Settore" value={profile.identita_presenza_online.settore_principale} />
          <InfoRow label="Località" value={profile.identita_presenza_online.citta_area} />
        </SectionCard>

        {/* Presenza Digitale */}
        <SectionCard
          icon={Globe}
          title="Presenza Digitale"
          gradient="bg-gradient-to-br from-purple-50 via-pink-50/50 to-purple-50/30"
          iconColor="text-purple-600"
        >
          <div className="space-y-2">
            <p className="font-semibold text-xs sm:text-sm text-gray-600 uppercase tracking-wide">Profili Social</p>
            <div className="space-y-2">
              {profile.presenza_digitale.profili_principali.map((profilo, i) => (
                <div key={i} className="bg-gray-50/80 rounded-lg p-3 border border-gray-200/60">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-bold text-sm text-gray-800">{profilo.piattaforma}</p>
                      <p className="text-xs text-blue-600 hover:underline truncate">{profilo.url}</p>
                      {profilo.frequenza_aggiornamento && (
                        <p className="text-xs text-gray-500 mt-1">Frequenza: {profilo.frequenza_aggiornamento}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {profile.presenza_digitale.profili_principali.some(p => p.temi_ricorrenti?.length > 0) && (
            <div>
              <p className="font-semibold text-xs sm:text-sm text-gray-600 uppercase tracking-wide mb-2">Temi Ricorrenti</p>
              <div className="flex flex-wrap gap-2">
                {profile.presenza_digitale.profili_principali.flatMap(p => p.temi_ricorrenti || []).map((tema, i) => (
                  <Badge key={i} variant="outline" className="shadow-sm">{tema}</Badge>
                ))}
              </div>
            </div>
          )}
        </SectionCard>

        {/* Segnali di Autorità */}
        <SectionCard
          icon={Award}
          title="Segnali di Autorità"
          gradient="bg-gradient-to-br from-amber-50 via-yellow-50/50 to-amber-50/30"
          iconColor="text-amber-600"
        >
          {profile.segnali_autorita.premi_certificazioni?.length > 0 && (
            <div>
              <p className="font-semibold text-xs sm:text-sm text-gray-600 uppercase tracking-wide mb-2">Premi e Riconoscimenti</p>
              <ul className="space-y-2">
                {profile.segnali_autorita.premi_certificazioni.map((premio, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-amber-600 mt-0.5">🏆</span>
                    <span className="text-gray-800">{premio}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {profile.segnali_autorita.pubblicazioni?.length > 0 && (
            <div>
              <p className="font-semibold text-xs sm:text-sm text-gray-600 uppercase tracking-wide mb-2">Pubblicazioni</p>
              <ul className="space-y-2">
                {profile.segnali_autorita.pubblicazioni.map((pub, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-amber-600 mt-0.5">📚</span>
                    <span className="text-gray-800">{pub}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <InfoRow label="Livello di Influenza" value={profile.segnali_autorita.livello_influenza} />
        </SectionCard>

        {/* Modello Lavorativo */}
        <SectionCard
          icon={Briefcase}
          title="Modello Lavorativo"
          gradient="bg-gradient-to-br from-emerald-50 via-green-50/50 to-emerald-50/30"
          iconColor="text-emerald-600"
        >
          <InfoRow label="Orari Tipici" value={profile.modello_lavorativo.orari_tipici} />
          {profile.modello_lavorativo.cicli_produttivi?.length > 0 && (
            <div>
              <p className="font-semibold text-xs sm:text-sm text-gray-600 uppercase tracking-wide mb-2">Cicli Produttivi</p>
              <ul className="space-y-1">
                {profile.modello_lavorativo.cicli_produttivi.map((ciclo, i) => (
                  <li key={i} className="text-sm text-gray-800 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    {ciclo}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {profile.modello_lavorativo.fonti_ricavo?.length > 0 && (
            <div>
              <p className="font-semibold text-xs sm:text-sm text-gray-600 uppercase tracking-wide mb-2">Fonti di Ricavo</p>
              <ul className="space-y-1">
                {profile.modello_lavorativo.fonti_ricavo.map((fonte, i) => (
                  <li key={i} className="text-sm text-gray-800 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    {fonte}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {(profile.modello_lavorativo.rischi_operativi?.length > 0 || profile.modello_lavorativo.rischi_legali?.length > 0) && (
            <div className="bg-red-50/50 border border-red-200/60 rounded-lg p-3 space-y-2">
              {profile.modello_lavorativo.rischi_operativi?.length > 0 && (
                <div>
                  <p className="font-semibold text-xs text-red-800 uppercase tracking-wide mb-1">Rischi Operativi</p>
                  <ul className="space-y-1">
                    {profile.modello_lavorativo.rischi_operativi.map((rischio, i) => (
                      <li key={i} className="text-xs text-red-700">{rischio}</li>
                    ))}
                  </ul>
                </div>
              )}
              {profile.modello_lavorativo.rischi_legali?.length > 0 && (
                <div>
                  <p className="font-semibold text-xs text-red-800 uppercase tracking-wide mb-1">Rischi Legali</p>
                  <ul className="space-y-1">
                    {profile.modello_lavorativo.rischi_legali.map((rischio, i) => (
                      <li key={i} className="text-xs text-red-700">{rischio}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Full width sections */}
      <div className="space-y-6">
        {/* Visione e Obiettivi */}
        <SectionCard
          icon={Target}
          title="Visione e Obiettivi"
          gradient="bg-gradient-to-br from-indigo-50 via-blue-50/50 to-indigo-50/30"
          iconColor="text-indigo-600"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-xs sm:text-sm text-gray-600 uppercase tracking-wide mb-2">Obiettivi Dichiarati</p>
              <ul className="space-y-2">
                {profile.visione_obiettivi.obiettivi_dichiarati.map((ob, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-indigo-600 mt-0.5">🎯</span>
                    <span className="text-gray-800">{ob}</span>
                  </li>
                ))}
              </ul>
            </div>
            {profile.visione_obiettivi.aspirazioni_future?.length > 0 && (
              <div>
                <p className="font-semibold text-xs sm:text-sm text-gray-600 uppercase tracking-wide mb-2">Aspirazioni Future</p>
                <ul className="space-y-2">
                  {profile.visione_obiettivi.aspirazioni_future.map((asp, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-indigo-600 mt-0.5">✨</span>
                      <span className="text-gray-800">{asp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <InfoRow label="Rischi Percepiti" value={profile.visione_obiettivi.rischi_percepiti} />
        </SectionCard>

        {/* Stile di Vita */}
        <SectionCard
          icon={Heart}
          title="Stile di Vita"
          gradient="bg-gradient-to-br from-rose-50 via-pink-50/50 to-rose-50/30"
          iconColor="text-rose-600"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <InfoRow label="Interessi" value={profile.stile_vita.interessi_ricorrenti} badge />
            </div>
            <div>
              <InfoRow label="Valori" value={profile.stile_vita.valori_espressi} badge />
            </div>
          </div>
          <InfoRow label="Abitudini" value={profile.stile_vita.abitudini} />
          {profile.stile_vita.eventi_vita_potenziali?.length > 0 && (
            <div>
              <p className="font-semibold text-xs sm:text-sm text-gray-600 uppercase tracking-wide mb-2">Eventi di Vita Potenziali</p>
              <ul className="space-y-2">
                {profile.stile_vita.eventi_vita_potenziali.map((ev, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-rose-600 mt-0.5">🎉</span>
                    <span className="text-gray-800">{ev}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </SectionCard>

        {/* Mappatura Bisogni */}
        <SectionCard
          icon={ListChecks}
          title="Mappatura Bisogni"
          gradient="bg-gradient-to-br from-orange-50 via-amber-50/50 to-orange-50/30"
          iconColor="text-orange-600"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {profile.mappatura_bisogni.bisogni_personali?.length > 0 && (
              <div className="bg-white/80 rounded-lg p-4 border border-gray-200/60">
                <p className="font-bold text-sm text-gray-800 mb-2 flex items-center gap-2">
                  <span>👤</span> Bisogni Personali
                </p>
                <ul className="space-y-1">
                  {profile.mappatura_bisogni.bisogni_personali.map((b, i) => (
                    <li key={i} className="text-xs text-gray-700 flex items-start gap-1">
                      <span className="text-orange-600">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {profile.mappatura_bisogni.bisogni_patrimoniali?.length > 0 && (
              <div className="bg-white/80 rounded-lg p-4 border border-gray-200/60">
                <p className="font-bold text-sm text-gray-800 mb-2 flex items-center gap-2">
                  <span>💰</span> Bisogni Patrimoniali
                </p>
                <ul className="space-y-1">
                  {profile.mappatura_bisogni.bisogni_patrimoniali.map((b, i) => (
                    <li key={i} className="text-xs text-gray-700 flex items-start gap-1">
                      <span className="text-orange-600">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {profile.mappatura_bisogni.bisogni_professionali?.length > 0 && (
              <div className="bg-white/80 rounded-lg p-4 border border-gray-200/60">
                <p className="font-bold text-sm text-gray-800 mb-2 flex items-center gap-2">
                  <span>💼</span> Bisogni Professionali
                </p>
                <ul className="space-y-1">
                  {profile.mappatura_bisogni.bisogni_professionali.map((b, i) => (
                    <li key={i} className="text-xs text-gray-700 flex items-start gap-1">
                      <span className="text-orange-600">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {profile.mappatura_bisogni.orizzonte_temporale && (
            <>
              <Separator className="my-4" />
              <div className="space-y-3">
                <p className="font-bold text-sm text-gray-800 mb-3 flex items-center gap-2">
                  <span>⏱️</span> Orizzonte Temporale
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {profile.mappatura_bisogni.orizzonte_temporale.breve_termine?.length > 0 && (
                    <div className="bg-green-50/80 rounded-lg p-3 border border-green-200/60">
                      <p className="text-xs font-bold text-green-800 mb-1.5">Breve Termine (0-2 anni)</p>
                      <ul className="space-y-1">
                        {profile.mappatura_bisogni.orizzonte_temporale.breve_termine.map((b, i) => (
                          <li key={i} className="text-xs text-gray-700">{b}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {profile.mappatura_bisogni.orizzonte_temporale.medio_termine?.length > 0 && (
                    <div className="bg-yellow-50/80 rounded-lg p-3 border border-yellow-200/60">
                      <p className="text-xs font-bold text-yellow-800 mb-1.5">Medio Termine (3-5 anni)</p>
                      <ul className="space-y-1">
                        {profile.mappatura_bisogni.orizzonte_temporale.medio_termine.map((b, i) => (
                          <li key={i} className="text-xs text-gray-700">{b}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {profile.mappatura_bisogni.orizzonte_temporale.lungo_termine?.length > 0 && (
                    <div className="bg-blue-50/80 rounded-lg p-3 border border-blue-200/60">
                      <p className="text-xs font-bold text-blue-800 mb-1.5">Lungo Termine (5+ anni)</p>
                      <ul className="space-y-1">
                        {profile.mappatura_bisogni.orizzonte_temporale.lungo_termine.map((b, i) => (
                          <li key={i} className="text-xs text-gray-700">{b}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </SectionCard>

        {/* Leve di Ingaggio */}
        <SectionCard
          icon={MessageCircle}
          title="Leve di Ingaggio"
          gradient="bg-gradient-to-br from-cyan-50 via-teal-50/50 to-cyan-50/30"
          iconColor="text-cyan-600"
        >
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border-l-4 border-blue-600">
              <p className="font-semibold text-xs sm:text-sm text-gray-600 uppercase tracking-wide mb-2">Script Apertura</p>
              <p className="text-sm italic text-gray-800 leading-relaxed">
                "{profile.leve_ingaggio.script_apertura}"
              </p>
            </div>
            <div>
              <p className="font-semibold text-xs sm:text-sm text-gray-600 uppercase tracking-wide mb-2">Domande Chiave</p>
              <ul className="space-y-2">
                {profile.leve_ingaggio.domande_intelligenza_emotiva.map((dom, i) => (
                  <li key={i} className="text-sm text-gray-800 bg-white/80 p-3 rounded-lg border border-gray-200/60">
                    {dom}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border-l-4 border-green-600">
              <p className="font-semibold text-xs sm:text-sm text-gray-600 uppercase tracking-wide mb-2">Call-to-Action Soft</p>
              <p className="text-sm font-medium text-green-800">
                {profile.leve_ingaggio.cta_soft}
              </p>
            </div>
          </div>
        </SectionCard>

        {/* Raccomandazioni Prodotti */}
        <SectionCard
          icon={ShoppingBag}
          title="Raccomandazioni Prodotti"
          gradient="bg-gradient-to-br from-teal-50 via-cyan-50/50 to-teal-50/30"
          iconColor="text-teal-600"
        >
          <div className="space-y-3">
            {profile.raccomandazioni_prodotti.map((prod, i) => (
              <div key={i} className="bg-gradient-to-r from-white via-gray-50 to-white rounded-lg border-l-4 border-blue-600 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <p className="font-bold text-base text-gray-800">{prod.prodotto}</p>
                  <Badge
                    className={
                      prod.priorita === 'alta'
                        ? 'bg-red-100 text-red-800 border-red-300 shadow-sm'
                        : prod.priorita === 'media'
                        ? 'bg-yellow-100 text-yellow-800 border-yellow-300 shadow-sm'
                        : 'bg-green-100 text-green-800 border-green-300 shadow-sm'
                    }
                  >
                    Priorità: {prod.priorita}
                  </Badge>
                </div>
                {prod.categoria && (
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">{prod.categoria}</p>
                )}
                <p className="text-sm text-gray-700 leading-relaxed">{prod.motivazione}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* CTA Finale - Pianificazione */}
      <Card className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-500/30 shadow-[0_12px_48px_rgba(245,158,11,0.2),0_4px_16px_rgba(245,158,11,0.15)]">
        <CardContent className="pt-10 pb-10">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full mb-4 shadow-lg">
              <span className="text-4xl">💼</span>
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-700 via-orange-600 to-amber-700 bg-clip-text text-transparent mb-3">
                Pronto per il Passo Successivo?
              </h3>
              <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
                Profilo analizzato con successo. Procedi ora con la <span className="font-bold text-amber-800">pianificazione finanziaria personalizzata</span> basata sui dati raccolti.
              </p>
            </div>
            <Button
              size="lg"
              onClick={onPlanningClick}
              className="text-base sm:text-lg px-8 sm:px-12 py-6 sm:py-7 h-auto bg-gradient-to-br from-amber-600 via-amber-600 to-orange-700 hover:from-amber-700 hover:via-amber-700 hover:to-orange-800 shadow-[0_6px_30px_rgba(245,158,11,0.4),0_2px_8px_rgba(245,158,11,0.25)] hover:shadow-[0_8px_40px_rgba(245,158,11,0.5),0_4px_12px_rgba(245,158,11,0.3)] transition-all duration-300 hover:scale-[1.03] font-bold"
            >
              <span className="text-2xl mr-3">💼</span>
              Avvia Pianificazione Finanziaria
              <ArrowRight className="ml-3 h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
