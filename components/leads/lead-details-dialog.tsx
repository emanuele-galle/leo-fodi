'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Building2, MapPin, Phone, Mail, Globe, Linkedin, Facebook, Instagram, User, BriefcaseBusiness } from 'lucide-react'
import type { Lead } from '@/lib/types/lead-extraction'

interface LeadDetailsDialogProps {
  lead: Lead | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LeadDetailsDialog({ lead, open, onOpenChange }: LeadDetailsDialogProps) {
  if (!lead) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-800 flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            {lead.ragione_sociale}
          </DialogTitle>
          <DialogDescription>
            Dettagli completi del lead estratto
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informazioni Aziendali */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <BriefcaseBusiness className="h-5 w-5 text-blue-600" />
              Informazioni Aziendali
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              {lead.partita_iva && (
                <div>
                  <span className="text-sm font-semibold text-gray-600">Partita IVA:</span>
                  <p className="text-base">{lead.partita_iva}</p>
                </div>
              )}
              {lead.codice_fiscale && (
                <div>
                  <span className="text-sm font-semibold text-gray-600">Codice Fiscale:</span>
                  <p className="text-base">{lead.codice_fiscale}</p>
                </div>
              )}
              {lead.nome_commerciale && (
                <div>
                  <span className="text-sm font-semibold text-gray-600">Nome Commerciale:</span>
                  <p className="text-base">{lead.nome_commerciale}</p>
                </div>
              )}
              {lead.settore && (
                <div>
                  <span className="text-sm font-semibold text-gray-600">Settore:</span>
                  <p className="text-base">{lead.settore}</p>
                </div>
              )}
              {lead.categoria && (
                <div>
                  <span className="text-sm font-semibold text-gray-600">Categoria:</span>
                  <p className="text-base">{lead.categoria}</p>
                </div>
              )}
              {lead.codice_ateco && (
                <div>
                  <span className="text-sm font-semibold text-gray-600">Codice ATECO:</span>
                  <p className="text-base">{lead.codice_ateco}</p>
                </div>
              )}
              {lead.forma_giuridica && (
                <div>
                  <span className="text-sm font-semibold text-gray-600">Forma Giuridica:</span>
                  <p className="text-base">{lead.forma_giuridica}</p>
                </div>
              )}
              {lead.anno_fondazione && (
                <div>
                  <span className="text-sm font-semibold text-gray-600">Anno Fondazione:</span>
                  <p className="text-base">{lead.anno_fondazione}</p>
                </div>
              )}
            </div>
          </section>

          <Separator />

          {/* Dati Economici */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Dati Economici</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-green-50 p-4 rounded-lg">
              {lead.fatturato && (
                <div>
                  <span className="text-sm font-semibold text-gray-600">Fatturato:</span>
                  <p className="text-base font-bold text-green-700">€ {lead.fatturato.toLocaleString()}</p>
                </div>
              )}
              {lead.dipendenti && (
                <div>
                  <span className="text-sm font-semibold text-gray-600">Dipendenti:</span>
                  <p className="text-base font-bold text-blue-700">{lead.dipendenti}</p>
                </div>
              )}
              {lead.rating_creditizio && (
                <div>
                  <span className="text-sm font-semibold text-gray-600">Rating:</span>
                  <Badge variant="default" className="mt-1">{lead.rating_creditizio}</Badge>
                </div>
              )}
            </div>
          </section>

          <Separator />

          {/* Sede e Localizzazione */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <MapPin className="h-5 w-5 text-red-600" />
              Sede e Localizzazione
            </h3>
            <div className="bg-red-50 p-4 rounded-lg space-y-2">
              {lead.indirizzo && <p className="text-base">{lead.indirizzo}</p>}
              <p className="text-base">
                {lead.cap && `${lead.cap} - `}
                {lead.citta} ({lead.provincia})
                {lead.regione && `, ${lead.regione}`}
              </p>
              {lead.nazione && <p className="text-sm text-gray-600">{lead.nazione}</p>}
            </div>
          </section>

          <Separator />

          {/* Contatti */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Phone className="h-5 w-5 text-purple-600" />
              Contatti
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-purple-50 p-4 rounded-lg">
              {lead.telefono_principale && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-purple-600" />
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Tel. Principale:</span>
                    <p className="text-base">{lead.telefono_principale}</p>
                  </div>
                </div>
              )}
              {lead.telefono_mobile && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-purple-600" />
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Mobile:</span>
                    <p className="text-base">{lead.telefono_mobile}</p>
                  </div>
                </div>
              )}
              {lead.telefono_whatsapp && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-green-600" />
                  <div>
                    <span className="text-sm font-semibold text-gray-600">WhatsApp:</span>
                    <p className="text-base">{lead.telefono_whatsapp}</p>
                  </div>
                </div>
              )}
              {lead.telefono_centralino && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-purple-600" />
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Centralino:</span>
                    <p className="text-base">{lead.telefono_centralino}</p>
                  </div>
                </div>
              )}
              {lead.email_principale && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Email:</span>
                    <p className="text-base">{lead.email_principale}</p>
                  </div>
                </div>
              )}
              {lead.email_pec && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <div>
                    <span className="text-sm font-semibold text-gray-600">PEC:</span>
                    <p className="text-base">{lead.email_pec}</p>
                  </div>
                </div>
              )}
              {lead.sito_web && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-600" />
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Sito Web:</span>
                    <a
                      href={lead.sito_web}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base text-blue-600 hover:underline"
                    >
                      {lead.sito_web}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </section>

          <Separator />

          {/* Social Media */}
          {(lead.linkedin_url || lead.facebook_url || lead.instagram_url || lead.altri_social) && (
            <>
              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">Social Media</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg">
                  {lead.linkedin_url && (
                    <div className="flex items-center gap-2">
                      <Linkedin className="h-4 w-4 text-blue-700" />
                      <a
                        href={lead.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base text-blue-600 hover:underline"
                      >
                        LinkedIn
                      </a>
                    </div>
                  )}
                  {lead.facebook_url && (
                    <div className="flex items-center gap-2">
                      <Facebook className="h-4 w-4 text-blue-600" />
                      <a
                        href={lead.facebook_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base text-blue-600 hover:underline"
                      >
                        Facebook
                      </a>
                    </div>
                  )}
                  {lead.instagram_url && (
                    <div className="flex items-center gap-2">
                      <Instagram className="h-4 w-4 text-pink-600" />
                      <a
                        href={lead.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base text-pink-600 hover:underline"
                      >
                        Instagram
                      </a>
                    </div>
                  )}
                  {lead.altri_social && Object.entries(lead.altri_social).map(([platform, url]) => (
                    <div key={platform} className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-600" />
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base text-blue-600 hover:underline"
                      >
                        {platform}
                      </a>
                    </div>
                  ))}
                </div>
              </section>
              <Separator />
            </>
          )}

          {/* Referenti */}
          {lead.referenti && lead.referenti.length > 0 && (
            <>
              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <User className="h-5 w-5 text-orange-600" />
                  Referenti
                </h3>
                <div className="space-y-3">
                  {lead.referenti.map((ref, index) => (
                    <div key={index} className="bg-orange-50 p-4 rounded-lg">
                      <p className="font-semibold text-base">
                        {ref.nome} {ref.cognome}
                      </p>
                      {ref.ruolo && <p className="text-sm text-gray-600">{ref.ruolo}</p>}
                      <div className="mt-2 space-y-1">
                        {ref.telefono && (
                          <p className="text-sm flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            {ref.telefono}
                          </p>
                        )}
                        {ref.email && (
                          <p className="text-sm flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            {ref.email}
                          </p>
                        )}
                        {ref.linkedin && (
                          <a
                            href={ref.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center gap-2"
                          >
                            <Linkedin className="h-3 w-3" />
                            LinkedIn
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              <Separator />
            </>
          )}

          {/* Metadata */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Metadata & Validazione</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg text-sm">
              <div>
                <span className="font-semibold text-gray-600">Fonte Primaria:</span>
                <p>{lead.fonte_primaria || 'N/D'}</p>
              </div>
              {lead.fonti_consultate && lead.fonti_consultate.length > 0 && (
                <div>
                  <span className="font-semibold text-gray-600">Fonti Consultate:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {lead.fonti_consultate.map((fonte, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {fonte}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <span className="font-semibold text-gray-600">Stato Validazione:</span>
                <Badge
                  variant={lead.validazione_status === 'validated' ? 'default' : 'secondary'}
                  className="ml-2"
                >
                  {lead.validazione_status}
                </Badge>
              </div>
              <div>
                <span className="font-semibold text-gray-600">Data Estrazione:</span>
                <p>{new Date(lead.data_estrazione).toLocaleString('it-IT')}</p>
              </div>
              {lead.ultima_verifica && (
                <div>
                  <span className="font-semibold text-gray-600">Ultima Verifica:</span>
                  <p>{new Date(lead.ultima_verifica).toLocaleString('it-IT')}</p>
                </div>
              )}
              <div>
                <span className="font-semibold text-gray-600">Priorità:</span>
                <Badge
                  variant={
                    lead.priorita === 'alta' ? 'destructive' : lead.priorita === 'media' ? 'default' : 'secondary'
                  }
                  className="ml-2"
                >
                  {lead.priorita}
                </Badge>
              </div>
            </div>
          </section>

          {/* Note */}
          {lead.note && (
            <>
              <Separator />
              <section className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Note</h3>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-base">{lead.note}</p>
                </div>
              </section>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
