'use client'

import { FinancialPlan } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Target,
  TrendingUp,
  ListOrdered,
  Receipt,
  ShoppingBag,
  CheckCircle2,
  Calendar,
  DollarSign,
  Shield,
  FileText,
} from 'lucide-react'

interface FinancialPlanDisplayProps {
  plan: FinancialPlan
}

export function FinancialPlanDisplay({ plan }: FinancialPlanDisplayProps) {
  return (
    <div className="w-full max-w-5xl space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 border-4 border-primary shadow-2xl">
        <CardHeader className="text-center py-8">
          <CardTitle className="text-4xl font-bold text-primary mb-3">💼 Piano Finanziario Personalizzato</CardTitle>
          <CardDescription className="text-lg text-gray-700">
            Analisi completa e raccomandazioni strategiche basate sul profilo OSINT
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Obiettivi Finanziari */}
      <Card className="border-2 border-primary/10">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl border-b border-border">
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-xl">Obiettivi Finanziari</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Breve Termine */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              <h3 className="font-semibold text-lg">Breve Termine (0-2 anni)</h3>
            </div>
            <div className="space-y-2 pl-6">
              {plan.obiettivi_finanziari.breve_termine.map((ob, i) => (
                <div key={i} className="border-l-2 border-orange-400 pl-3 py-1">
                  <p className="font-medium">{ob.obiettivo}</p>
                  {ob.importo_stimato && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="h-3 w-3" />
                      <span>{ob.importo_stimato}</span>
                    </div>
                  )}
                  {ob.tempistica && (
                    <p className="text-sm text-gray-600">{ob.tempistica}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Medio Termine */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <h3 className="font-semibold text-lg">Medio Termine (3-5 anni)</h3>
            </div>
            <div className="space-y-2 pl-6">
              {plan.obiettivi_finanziari.medio_termine.map((ob, i) => (
                <div key={i} className="border-l-2 border-blue-400 pl-3 py-1">
                  <p className="font-medium">{ob.obiettivo}</p>
                  {ob.importo_stimato && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="h-3 w-3" />
                      <span>{ob.importo_stimato}</span>
                    </div>
                  )}
                  {ob.tempistica && (
                    <p className="text-sm text-gray-600">{ob.tempistica}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Lungo Termine */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <h3 className="font-semibold text-lg">Lungo Termine (5+ anni)</h3>
            </div>
            <div className="space-y-2 pl-6">
              {plan.obiettivi_finanziari.lungo_termine.map((ob, i) => (
                <div key={i} className="border-l-2 border-purple-400 pl-3 py-1">
                  <p className="font-medium">{ob.obiettivo}</p>
                  {ob.importo_stimato && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="h-3 w-3" />
                      <span>{ob.importo_stimato}</span>
                    </div>
                  )}
                  {ob.tempistica && (
                    <p className="text-sm text-gray-600">{ob.tempistica}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analisi Gap */}
      <Card className="border-2 border-primary/10">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-xl border-b border-border">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl">Analisi Gap</CardTitle>
          </div>
          <CardDescription className="text-base mt-2">
            Confronto tra situazione attuale e obiettivi target
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Liquidità */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                Liquidità di Sicurezza
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-600">Attuale:</span>{' '}
                  <span className="font-medium">{plan.analisi_gap.liquidita_sicurezza.attuale}</span>
                </p>
                <p>
                  <span className="text-gray-600">Obiettivo:</span>{' '}
                  <span className="font-medium">{plan.analisi_gap.liquidita_sicurezza.obiettivo}</span>
                </p>
              </div>
            </div>

            {/* Previdenza */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                Previdenza Integrativa
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-600">Attuale:</span>{' '}
                  <span className="font-medium">{plan.analisi_gap.previdenza_integrativa.attuale}</span>
                </p>
                <p>
                  <span className="text-gray-600">Obiettivo:</span>{' '}
                  <span className="font-medium">{plan.analisi_gap.previdenza_integrativa.obiettivo}</span>
                </p>
              </div>
            </div>

            {/* Protezione Reddito */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-600" />
                Protezione Reddito
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-600">Attuale:</span>{' '}
                  <span className="font-medium">{plan.analisi_gap.protezione_reddito.attuale}</span>
                </p>
                <p>
                  <span className="text-gray-600">Obiettivo:</span>{' '}
                  <span className="font-medium">{plan.analisi_gap.protezione_reddito.obiettivo}</span>
                </p>
              </div>
            </div>

            {/* Rischi Professionali */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-red-600" />
                Rischi Professionali
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-600">Coperti:</span>{' '}
                  <span className="font-medium">{plan.analisi_gap.rischi_professionali.coperti}</span>
                </p>
                <p>
                  <span className="text-gray-600">Scoperti:</span>{' '}
                  <span className="font-medium text-red-600">
                    {plan.analisi_gap.rischi_professionali.scoperti}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sequenza Raccomandata */}
      <Card className="border-2 border-primary/10">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-t-xl border-b border-border">
          <div className="flex items-center gap-2">
            <ListOrdered className="h-6 w-6 text-orange-600" />
            <CardTitle className="text-xl">Sequenza Raccomandata</CardTitle>
          </div>
          <CardDescription className="text-base mt-2">Ordine prioritario degli interventi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {plan.sequenza_raccomandata.map((item, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center">
                  {i + 1}
                </div>
                <div className="flex-grow">
                  <p className="font-semibold">{item.azione}</p>
                  <p className="text-sm text-gray-600">{item.tempistica}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Spunti Fiscali */}
      <Card className="border-2 border-primary/10">
        <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 rounded-t-xl border-b border-border">
          <div className="flex items-center gap-2">
            <Receipt className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl">Spunti Fiscali</CardTitle>
          </div>
          <CardDescription className="text-base mt-2">Opportunità di ottimizzazione fiscale</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {plan.spunti_fiscali.deducibilita?.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Deducibilità</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {plan.spunti_fiscali.deducibilita.map((ded, i) => (
                  <li key={i}>{ded}</li>
                ))}
              </ul>
            </div>
          )}

          {plan.spunti_fiscali.ltc && (
            <div>
              <h4 className="font-semibold mb-2">Long Term Care (LTC)</h4>
              <p className="text-sm">{plan.spunti_fiscali.ltc}</p>
            </div>
          )}

          {plan.spunti_fiscali.rc_professionale && (
            <div>
              <h4 className="font-semibold mb-2">RC Professionale</h4>
              <p className="text-sm">{plan.spunti_fiscali.rc_professionale}</p>
            </div>
          )}

          {plan.spunti_fiscali.strumenti_autonomi_impresa?.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Strumenti Autonomi/Impresa</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {plan.spunti_fiscali.strumenti_autonomi_impresa.map((str, i) => (
                  <li key={i}>{str}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Raccomandazioni Prodotti */}
      <Card className="border-2 border-primary/10">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-xl border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-xl">Raccomandazioni Prodotti</CardTitle>
          </div>
          <CardDescription className="text-base mt-2">Prodotti assicurativi consigliati</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {plan.raccomandazioni_prodotti.map((prod, i) => (
            <div
              key={i}
              className="border-l-4 border-blue-500 pl-4 py-3 bg-gradient-to-r from-blue-50 to-transparent rounded-r"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-lg">{prod.tipologia}</h4>
                <Badge
                  variant={
                    prod.priorita === 'alta'
                      ? 'default'
                      : prod.priorita === 'media'
                      ? 'secondary'
                      : 'outline'
                  }
                  className="text-xs"
                >
                  {prod.priorita}
                </Badge>
              </div>
              <p className="text-sm text-gray-700 mb-2">{prod.razionale}</p>
              {prod.vantaggio_fiscale && (
                <div className="flex items-start gap-2 bg-green-50 p-2 rounded border border-green-200">
                  <Receipt className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-800">{prod.vantaggio_fiscale}</p>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Sintesi di Valore */}
      <Card className="bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 border-4 border-purple-400 shadow-2xl">
        <CardHeader className="py-6">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-7 w-7 text-purple-600" />
            <CardTitle className="text-2xl">Sintesi di Valore</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Trigger Idoneità */}
          {plan.sintesi_valore.trigger_idoneita?.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Trigger di Idoneità</h4>
              <div className="flex flex-wrap gap-2">
                {plan.sintesi_valore.trigger_idoneita.map((trigger, i) => (
                  <Badge key={i} variant="secondary" className="text-sm">
                    {trigger}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Checklist Finale */}
          {plan.sintesi_valore.checklist_finale?.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Checklist Finale</h4>
              <div className="space-y-2">
                {plan.sintesi_valore.checklist_finale.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Script Appuntamento */}
          {plan.sintesi_valore.script_appuntamento && (
            <div>
              <h4 className="font-semibold mb-2">Script per Appuntamento Cliente</h4>
              <div className="bg-white p-4 rounded-lg border border-purple-200">
                <p className="text-sm italic text-gray-700">
                  &ldquo;{plan.sintesi_valore.script_appuntamento}&rdquo;
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
