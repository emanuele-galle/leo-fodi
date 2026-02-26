/**
 * Zod Schemas per TUTTI i profili OSINT
 * Garantisce output strutturato al 100% da XAI Grok
 *
 * Organizzazione:
 * 1. CareerProfile ✅
 * 2. EducationProfile ✅
 * 3. LifestyleProfile ✅
 * 4. WealthProfile ✅
 * 5. FamilyProfile ✅
 * 6. SocialGraphProfile ✅
 * 7. ContentAnalysisProfile ✅
 * 8. WorkModelProfile ✅
 * 9. VisionGoalsProfile ✅
 * 10. NeedsMappingProfile ✅
 * 11. EngagementProfile ✅
 * 12. AuthoritySignalsProfile ✅
 */

import { z } from 'zod'

// ==================== 1. CAREER PROFILE (già esistente) ====================

export const LivelloProfessionaleEnum = z.enum([
  'junior',
  'mid',
  'senior',
  'executive',
  'imprenditore',
])

export const EsperienzaLavorativaSchema = z.object({
  ruolo: z.string().min(1),
  azienda: z.string().min(1),
  periodo: z.string().min(1),
  settore: z.string().optional(),
  fonte: z.string().min(1),
})

export const ProfessioneAttualeSchema = z.object({
  ruolo: z.string().min(1),
  azienda: z.string().min(1),
  settore: z.string().min(1),
  anzianita_anni: z.number().int().min(0),
  livello: LivelloProfessionaleEnum,
  fonte: z.string().min(1),
})

export const CareerProfileSchema = z.object({
  professione_attuale: ProfessioneAttualeSchema,
  storico_professionale: z.array(EsperienzaLavorativaSchema).min(0),
  competenze_chiave: z.array(z.string()).min(0),
  certificazioni: z.array(z.string()).min(0),
  confidence_score: z.number().int().min(0).max(100),
  fonti_consultate: z.array(z.string()).min(1),
})

export type CareerProfileZod = z.infer<typeof CareerProfileSchema>

// ==================== 2. EDUCATION PROFILE ====================

export const LivelloStudioEnum = z.enum([
  'licenza_media',
  'diploma',
  'laurea_triennale',
  'laurea_magistrale',
  'master',
  'dottorato',
  'non_determinato',
])

export const TitoloStudioMassimoSchema = z.object({
  livello: LivelloStudioEnum.nullable(),
  campo_studio: z.string().nullable().optional(),
  istituzione: z.string().nullable().optional(),
  anno: z.number().int().nullable().optional(),
  fonte: z.string().min(1),
})

export const AltroStudioSchema = z.object({
  tipo: z.string().min(1),
  istituzione: z.string().optional(),
  anno: z.number().int().optional(),
  fonte: z.string().min(1),
})

export const EducationProfileSchema = z.object({
  titolo_studio_massimo: TitoloStudioMassimoSchema,
  altri_studi: z.array(AltroStudioSchema).min(0),
  sintesi_percorso: z.string().min(1),
  confidence_score: z.number().int().min(0).max(100),
  fonti_consultate: z.array(z.string()).min(1),
})

export type EducationProfileZod = z.infer<typeof EducationProfileSchema>

// ==================== 3. LIFESTYLE PROFILE ====================

export const FrequenzaEnum = z.enum(['alta', 'media', 'bassa'])

export const HobbyPassioneSchema = z.object({
  categoria: z.string().min(1),
  descrizione: z.string().min(1),
  frequenza: FrequenzaEnum,
  fonte: z.string().min(1),
})

export const StileVitaTipoEnum = z.enum([
  'sportivo',
  'culturale',
  'mondano',
  'familiare',
  'professionale',
  'misto',
])

export const StileVitaSchema = z.object({
  tipo: StileVitaTipoEnum,
  descrizione: z.string().min(1),
})

export const TipoViaggioEnum = z.enum([
  'lusso',
  'avventura',
  'relax',
  'culturale',
  'business',
  'misto',
])

export const FrequenzaViaggioEnum = z.enum([
  'alta',
  'media',
  'bassa',
  'non_determinato',
])

export const ViaggiSchema = z.object({
  frequenza: FrequenzaViaggioEnum,
  destinazioni_preferite: z.array(z.string()).min(0),
  tipo_viaggio: TipoViaggioEnum,
})

export const LifestyleProfileSchema = z.object({
  hobby_passioni: z.array(HobbyPassioneSchema).min(0),
  interessi_principali: z.array(z.string()).min(0),
  stile_vita: StileVitaSchema,
  viaggi: ViaggiSchema,
  brand_preferiti: z.array(z.string()).min(0),
  attivita_ricorrenti: z.array(z.string()).min(0),
  confidence_score: z.number().int().min(0).max(100),
  fonti_consultate: z.array(z.string()).min(1),
})

export type LifestyleProfileZod = z.infer<typeof LifestyleProfileSchema>

// ==================== 4. WEALTH PROFILE ====================

export const FasciaEconomicaEnum = z.enum([
  'bassa',
  'media-bassa',
  'media',
  'media-alta',
  'alta',
  'molto_alta',
  'non_determinato',
])

export const ValutazioneEconomicaSchema = z.object({
  fascia: FasciaEconomicaEnum,
  reddito_stimato_annuo: z
    .object({
      min: z.number().int().min(0),
      max: z.number().int().min(0),
    })
    .optional(),
  patrimonio_stimato: z
    .object({
      min: z.number().int().min(0),
      max: z.number().int().min(0),
    })
    .optional(),
  confidence: z.number().int().min(0).max(100),
})

export const TipoIndicatoreRicchezzaEnum = z.enum([
  'residenza',
  'auto',
  'viaggi',
  'brand',
  'proprietà',
  'investimenti',
  'altro',
])

export const PesoEnum = z.enum(['alto', 'medio', 'basso'])

export const IndicatoreRicchezzaSchema = z.object({
  tipo: TipoIndicatoreRicchezzaEnum.nullable(),
  descrizione: z.string().min(1),
  peso: PesoEnum,
  fonte: z.string().min(1),
})

export const TenoreVitaSchema = z.object({
  descrizione: z.string().min(1),
  caratteristiche: z.array(z.string()).min(0),
})

export const TipoProprietaEnum = z.enum([
  'immobile',
  'veicolo',
  'barca',
  'altro',
])

export const ProprietaNotaSchema = z.object({
  tipo: TipoProprietaEnum,
  descrizione: z.string().min(1),
  valore_stimato: z.number().int().min(0).nullable().optional(),
  fonte: z.string().min(1),
})

export const WealthProfileSchema = z.object({
  valutazione_economica: ValutazioneEconomicaSchema,
  indicatori_ricchezza: z.array(IndicatoreRicchezzaSchema).min(0),
  tenore_vita: TenoreVitaSchema,
  proprieta_note: z.array(ProprietaNotaSchema).min(0),
  confidence_score: z.number().int().min(0).max(100),
  fonti_consultate: z.array(z.string()).min(1),
})

export type WealthProfileZod = z.infer<typeof WealthProfileSchema>

// ==================== 5. FAMILY PROFILE ====================

export const StatoCivileEnum = z.enum([
  'single',
  'fidanzato',
  'sposato',
  'convivente',
  'separato',
  'divorziato',
  'vedovo',
  'non_determinato',
])

export const TipoZonaEnum = z.enum([
  'centro',
  'periferia',
  'residenziale',
  'popolare',
  'esclusiva',
  'non_determinato',
])

export const ResidenzaSchema = z.object({
  citta: z.string().min(1),
  zona: z.string().optional(),
  tipo_abitazione: z.string().optional(),
  tipo_zona: TipoZonaEnum,
  indicatori_ricchezza: z.array(z.string()).min(0),
  fonte: z.string().min(1),
})

export const FamilyProfileSchema = z.object({
  nucleo_familiare_attuale: z.object({
    coniuge: z
      .object({
        nome: z.string().nullable(),
        cognome: z.string().nullable().optional(),
        fonte: z.string().nullable(),
      })
      .nullable()
      .optional(),
    figli: z
      .array(
        z.object({
          nome: z.string().nullable(),
          eta_stimata: z.number().int().min(0).nullable().optional(),
          fonte: z.string().nullable(),
        })
      )
      .nullable()
      .optional(),
    altri_familiari: z
      .array(
        z.object({
          relazione: z.string().nullable(),
          nome: z.string().nullable(),
          fonte: z.string().nullable(),
        })
      )
      .nullable()
      .optional(),
  }),
  nucleo_familiare_precedente: z
    .object({
      ex_coniuge: z
        .object({
          nome: z.string().nullable(),
          periodo: z.string().nullable().optional(),
          fonte: z.string().nullable(),
        })
        .nullable()
        .optional(),
      note: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  residenza: z.object({
    citta: z.string().min(1),
    quartiere: z.string().optional(),
    tipo_zona: TipoZonaEnum,
    indicatori_ricchezza: z.array(z.string()).min(0),
    fonte: z.string().min(1),
  }),
  confidence_score: z.number().int().min(0).max(100),
  fonti_consultate: z.array(z.string()).min(1),
})

export type FamilyProfileZod = z.infer<typeof FamilyProfileSchema>

// ==================== 6. SOCIAL GRAPH PROFILE ====================

export const DimensioneReteEnum = z.enum([
  'piccola',
  'media',
  'grande',
  'molto_grande',
])

export const ReteSocialeSchema = z.object({
  dimensione: DimensioneReteEnum,
  followers_totali: z.number().int().min(0).optional(),
  following_totali: z.number().int().min(0).optional(),
  engagement_rate: z.number().min(0).max(100).optional(),
})

export const TipoRelazioneEnum = z.enum([
  'familiare',
  'amico',
  'collega',
  'professionale',
  'altro',
])

export const InfluenzaEnum = z.enum(['alta', 'media', 'bassa'])

export const ConnessioneChiaveSchema = z.object({
  nome: z.string().min(1),
  relazione: TipoRelazioneEnum,
  influenza: InfluenzaEnum,
  fonte: z.string().min(1),
})

export const AttivitaEnum = z.enum(['alta', 'media', 'bassa'])

export const GruppoAppartenenzaSchema = z.object({
  nome: z.string().min(1),
  tipo: z.string().min(1),
  attivita: AttivitaEnum,
  fonte: z.string().min(1),
})

export const SocialGraphProfileSchema = z.object({
  rete_sociale: ReteSocialeSchema,
  connessioni_chiave: z.array(ConnessioneChiaveSchema).min(0),
  gruppi_appartenenza: z.array(GruppoAppartenenzaSchema).min(0),
  comunita_interesse: z.array(z.string()).min(0),
  influencer_seguiti: z.array(z.string()).min(0),
  confidence_score: z.number().int().min(0).max(100),
  fonti_consultate: z.array(z.string()).min(1),
})

export type SocialGraphProfileZod = z.infer<typeof SocialGraphProfileSchema>

// ==================== 7. CONTENT ANALYSIS PROFILE ====================

export const AnalisiContenutiSchema = z.object({
  post_analizzati: z.number().int().min(0),
  periodo_analisi: z.string().min(1),
  piattaforme: z.array(z.string()).min(0),
})

export const SentimentEnum = z.enum(['positivo', 'neutro', 'negativo'])

export const TemaRicorrenteSchema = z.object({
  tema: z.string().min(1),
  frequenza: z.number().int().min(0),
  sentiment: SentimentEnum,
})

export const TonoEnum = z.enum([
  'formale',
  'informale',
  'professionale',
  'colloquiale',
  'misto',
])

export const EmojiUsageEnum = z.enum(['alto', 'medio', 'basso'])

export const LinguaggioComunicazioneSchema = z.object({
  tono: TonoEnum,
  stile: z.string().min(1),
  emoji_usage: EmojiUsageEnum,
})

export const DettaglioImmagineSchema = z.object({
  url: z.string().url(),
  thumbnail_url: z.string().url().optional(),
  brand_identificati: z.array(z.string()).min(0),
  luoghi: z.array(z.string()).min(0),
  attivita: z.array(z.string()).min(0),
})

export const ImmaginiAnalizzateSchema = z.object({
  totale: z.number().int().min(0),
  luoghi_riconosciuti: z.array(z.string()).min(0),
  oggetti_ricorrenti: z.array(z.string()).min(0),
  brand_visibili: z.array(z.string()).min(0),
  dettagli_immagini: z.array(DettaglioImmagineSchema).min(0).optional(),
})

export const ContentAnalysisProfileSchema = z.object({
  analisi_contenuti: AnalisiContenutiSchema,
  temi_ricorrenti: z.array(TemaRicorrenteSchema).min(0),
  linguaggio_comunicazione: LinguaggioComunicazioneSchema,
  valori_emergenti: z.array(z.string()).min(0),
  brand_mentions: z.array(z.string()).min(0),
  location_frecuenti: z.array(z.string()).min(0),
  persone_menzionate: z.array(z.string()).min(0),
  immagini_analizzate: ImmaginiAnalizzateSchema,
  confidence_score: z.number().int().min(0).max(100),
  fonti_consultate: z.array(z.string()).min(1),
})

export type ContentAnalysisProfileZod = z.infer<
  typeof ContentAnalysisProfileSchema
>

// ==================== 8. WORK MODEL PROFILE ====================

export const TipoModalitaLavoroEnum = z.enum([
  'remoto',
  'ibrido',
  'ufficio',
  'autonomo',
  'non_determinato',
])

export const FlessibilitaEnum = z.enum([
  'alta',
  'media',
  'bassa',
  'non_determinato',
])

export const ModalitaLavoroSchema = z.object({
  tipo: TipoModalitaLavoroEnum,
  flessibilita: FlessibilitaEnum,
  descrizione: z.string().min(1),
  fonte: z.string().min(1),
})

export const TipoOrariEnum = z.enum([
  'standard',
  'flessibile',
  'turni',
  'indipendente',
  'non_determinato',
])

export const WorkLifeBalanceEnum = z.enum([
  'ottimo',
  'buono',
  'medio',
  'scarso',
  'non_determinato',
])

export const OrariLavoroSchema = z.object({
  tipo: TipoOrariEnum,
  work_life_balance: WorkLifeBalanceEnum,
  descrizione: z.string().min(1),
})

export const TipoAmbienteEnum = z.enum([
  'corporate',
  'startup',
  'pmi',
  'freelance',
  'imprenditore',
  'non_determinato',
])

export const TeamSizeEnum = z.enum([
  'solo',
  'piccolo',
  'medio',
  'grande',
  'non_determinato',
])

export const AmbienteLavoroSchema = z.object({
  tipo: TipoAmbienteEnum,
  team_size: TeamSizeEnum,
  descrizione: z.string().min(1),
})

export const ApproccioEnum = z.enum([
  'agile',
  'tradizionale',
  'ibrido',
  'non_determinato',
])

export const CollaborazioneEnum = z.enum([
  'alta',
  'media',
  'bassa',
  'non_determinato',
])

export const MetodoLavoroSchema = z.object({
  approccio: ApproccioEnum,
  collaborazione: CollaborazioneEnum,
  descrizione: z.string().min(1),
})

export const WorkModelProfileSchema = z.object({
  modalita_lavoro: ModalitaLavoroSchema,
  orari_lavoro: OrariLavoroSchema,
  ambiente_lavoro: AmbienteLavoroSchema,
  strumenti_tecnologie: z.array(z.string()).min(0),
  metodo_lavoro: MetodoLavoroSchema,
  confidence_score: z.number().int().min(0).max(100),
  fonti_consultate: z.array(z.string()).min(1),
})

export type WorkModelProfileZod = z.infer<typeof WorkModelProfileSchema>

// ==================== 9. VISION GOALS PROFILE ====================

export const TermineEnum = z.enum(['breve', 'medio', 'lungo'])

export const PrioritaEnum = z.enum(['alta', 'media', 'bassa'])

export const ObbiettivoProfessionaleSchema = z.object({
  obiettivo: z.string().min(1),
  termine: TermineEnum,
  priorita: PrioritaEnum,
  fonte: z.string().min(1),
})

export const CategoriaAspirazioneEnum = z.enum([
  'carriera',
  'famiglia',
  'lifestyle',
  'crescita_personale',
  'altro',
])

export const AspirazionePersonaleSchema = z.object({
  aspirazione: z.string().min(1),
  categoria: CategoriaAspirazioneEnum,
  fonte: z.string().min(1),
})

export const ValoreFondamentaleSchema = z.object({
  valore: z.string().min(1),
  descrizione: z.string().min(1),
  evidenza: z.string().min(1),
})

export const StatoProgettoEnum = z.enum([
  'idea',
  'pianificazione',
  'in_corso',
  'completato',
])

export const ProgettoFuturoSchema = z.object({
  progetto: z.string().min(1),
  stato: StatoProgettoEnum,
  fonte: z.string().min(1),
})

export const TipoMentalitaEnum = z.enum(['crescita', 'statica', 'misto'])

export const AttitudineCambiamentoEnum = z.enum(['alta', 'media', 'bassa'])

export const MentalitaSchema = z.object({
  tipo: TipoMentalitaEnum,
  descrizione: z.string().min(1),
  attitudine_cambiamento: AttitudineCambiamentoEnum,
})

export const VisionGoalsProfileSchema = z.object({
  obiettivi_professionali: z.array(ObbiettivoProfessionaleSchema).min(0),
  aspirazioni_personali: z.array(AspirazionePersonaleSchema).min(0),
  valori_fondamentali: z.array(ValoreFondamentaleSchema).min(0),
  progetti_futuri: z.array(ProgettoFuturoSchema).min(0),
  mentalita: MentalitaSchema,
  confidence_score: z.number().int().min(0).max(100),
  fonti_consultate: z.array(z.string()).min(1),
})

export type VisionGoalsProfileZod = z.infer<typeof VisionGoalsProfileSchema>

// ==================== 10. NEEDS MAPPING PROFILE ====================

export const CategoriaBisognoEnum = z.enum([
  'sicurezza',
  'protezione_famiglia',
  'crescita_patrimonio',
  'previdenza',
  'salute',
  'lifestyle',
  'altro',
])

export const BisognoIdentificatoSchema = z.object({
  categoria: CategoriaBisognoEnum.nullable(),
  bisogno: z.string().min(1),
  priorita: PrioritaEnum,
  evidenze: z.array(z.string()).min(0),
  gap_attuale: z.string().min(1),
})

export const ImpattoEnum = z.enum(['alto', 'medio', 'basso'])

export const VulnerabilitaSchema = z.object({
  area: z.string().min(1),
  descrizione: z.string().min(1),
  impatto: ImpattoEnum,
  fonte: z.string().min(1),
})

export const PotenzialeEnum = z.enum(['alto', 'medio', 'basso'])

export const TimingEnum = z.enum([
  'immediato',
  'breve_termine',
  'medio_termine',
])

export const OpportunitaSchema = z.object({
  tipo: z.string().min(1),
  descrizione: z.string().min(1),
  potenziale: PotenzialeEnum,
  timing: TimingEnum,
})

export const UrgenzaEnum = z.enum(['alta', 'media', 'bassa'])

export const PrioritaInterventoSchema = z.object({
  area: z.string().min(1),
  urgenza: UrgenzaEnum,
  motivazione: z.string().min(1),
})

export const NeedsMappingProfileSchema = z.object({
  bisogni_identificati: z.array(BisognoIdentificatoSchema).min(0),
  vulnerabilita: z.array(VulnerabilitaSchema).min(0),
  opportunita: z.array(OpportunitaSchema).min(0),
  priorita_intervento: z.array(PrioritaInterventoSchema).min(0),
  confidence_score: z.number().int().min(0).max(100),
  fonti_consultate: z.array(z.string()).min(1),
})

export type NeedsMappingProfileZod = z.infer<typeof NeedsMappingProfileSchema>

// ==================== 11. ENGAGEMENT PROFILE ====================

export const CategoriaLevaEnum = z.enum([
  'emotiva',
  'razionale',
  'sociale',
  'aspirazionale',
])

export const EfficaciaEnum = z.enum(['alta', 'media', 'bassa'])

export const LevaPrincipaleSchema = z.object({
  leva: z.string().min(1),
  categoria: CategoriaLevaEnum,
  efficacia: EfficaciaEnum,
  descrizione: z.string().min(1),
  come_usarla: z.string().min(1),
})

export const TipoMomentoEnum = z.enum([
  'life_event',
  'stagionale',
  'professionale',
  'altro',
])

export const MomentoIdealeSchema = z.object({
  momento: z.string().min(1),
  tipo: TipoMomentoEnum.nullable(),
  finestra_temporale: z.string().min(1),
  approccio_consigliato: z.string().min(1),
})

export const TipoCanaleEnum = z.enum([
  'email',
  'linkedin',
  'instagram',
  'whatsapp',
  'telefono',
  'evento',
  'altro',
])

export const CanaleComunicazioneSchema = z.object({
  canale: TipoCanaleEnum,
  efficacia: EfficaciaEnum,
  frequenza_consigliata: z.string().min(1),
  note: z.string().min(1),
})

export const MessaggioChiaveSchema = z.object({
  messaggio: z.string().min(1),
  target_bisogno: z.string().min(1),
  tono: z.string().min(1),
})

export const ProbabilitaEnum = z.enum(['alta', 'media', 'bassa'])

export const OstacoloPotenzzialeSchema = z.object({
  ostacolo: z.string().min(1),
  probabilita: ProbabilitaEnum,
  strategia_superamento: z.string().min(1),
})

export const EngagementProfileSchema = z.object({
  leve_principali: z.array(LevaPrincipaleSchema).min(0),
  momenti_ideali: z.array(MomentoIdealeSchema).min(0),
  canali_comunicazione: z.array(CanaleComunicazioneSchema).min(0),
  messaggi_chiave: z.array(MessaggioChiaveSchema).min(0),
  ostacoli_potenziali: z.array(OstacoloPotenzzialeSchema).min(0),
  confidence_score: z.number().int().min(0).max(100),
  fonti_consultate: z.array(z.string()).min(1),
})

export type EngagementProfileZod = z.infer<typeof EngagementProfileSchema>

// ==================== 12. AUTHORITY SIGNALS PROFILE ====================

export const LivelloInfluenzaEnum = z.enum([
  'micro',
  'emerging',
  'established',
  'macro',
  'celebrity',
  'niche_expert',
  'non_determinato',
])

export const PremioCertificazioneSchema = z.object({
  nome: z.string().min(1),
  organizzazione: z.string().min(1),
  anno: z.string().nullable(),
  descrizione: z.string().min(1),
  fonte: z.string().min(1),
})

export const TipoPubblicazioneEnum = z.enum([
  'articolo',
  'libro',
  'paper',
  'post',
  'altro',
])

export const PubblicazioneSchema = z.object({
  titolo: z.string().min(1),
  tipo: TipoPubblicazioneEnum,
  piattaforma: z.string().nullable(),
  anno: z.string().nullable(),
  fonte: z.string().min(1),
})

export const RuoloCommunityEnum = z.enum([
  'membro',
  'moderatore',
  'leader',
  'fondatore',
  'altro',
])

export const EngagementLevelEnum = z.enum(['alto', 'medio', 'basso'])

export const CommunityAttivaSchema = z.object({
  nome: z.string().min(1),
  ruolo: RuoloCommunityEnum,
  piattaforma: z.string().min(1),
  engagement_level: EngagementLevelEnum,
  fonte: z.string().min(1),
})

export const RiconoscimentoPubblicoSchema = z.object({
  tipo: z.string().min(1),
  descrizione: z.string().min(1),
  fonte: z.string().min(1),
})

export const AuthoritySignalsProfileSchema = z.object({
  livello_influenza: LivelloInfluenzaEnum,
  premi_certificazioni: z.array(PremioCertificazioneSchema).min(0),
  pubblicazioni: z.array(PubblicazioneSchema).min(0),
  community_attive: z.array(CommunityAttivaSchema).min(0),
  riconoscimenti_pubblici: z.array(RiconoscimentoPubblicoSchema).min(0),
  confidence_score: z.number().int().min(0).max(100),
  fonti_consultate: z.array(z.string()).min(1),
})

export type AuthoritySignalsProfileZod = z.infer<typeof AuthoritySignalsProfileSchema>
