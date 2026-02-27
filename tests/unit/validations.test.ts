import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// Re-define schemas inline to avoid importing the full app dependency tree
const clientFormSchema = z.object({
  nome: z.string().min(2).max(100).regex(/^[a-zA-ZÀ-ÿ\s'-]+$/),
  cognome: z.string().min(2).max(100).regex(/^[a-zA-ZÀ-ÿ\s'-]+$/),
  localita: z.string().min(2).max(200).optional().or(z.literal('')),
  ruolo: z.string().min(2).max(200).optional().or(z.literal('')),
  settore: z.string().min(2).max(200).optional().or(z.literal('')),
  link_social: z.array(z.string().url().max(500)).optional(),
  sito_web: z.string().url().max(500).optional().or(z.literal('')),
})

const leadsExtractSchema = z.object({
  name: z.string().min(1),
  settore: z.string().optional(),
  fonti_selezionate: z.array(z.string()).min(1),
  sottocategoria: z.string().optional(),
  codice_ateco: z.array(z.string()).optional(),
  fatturato_min: z.string().optional(),
  fatturato_max: z.string().optional(),
  dipendenti_min: z.string().optional(),
  dipendenti_max: z.string().optional(),
  anno_fondazione_min: z.string().optional(),
  anno_fondazione_max: z.string().optional(),
  rating_min: z.number().optional(),
  comune: z.string().optional(),
  provincia: z.string().optional(),
  regione: z.string().optional(),
  nazione: z.string().optional(),
})

const osintProfileSchema = z.object({
  nome: z.string().min(2),
  cognome: z.string().min(2),
  email: z.string().email().optional(),
  data_nascita: z.string().optional(),
  citta: z.string().optional(),
  linkedin_url: z.string().url().optional().or(z.literal('')),
  facebook_url: z.string().url().optional().or(z.literal('')),
  instagram_url: z.string().url().optional().or(z.literal('')),
  consenso_profilazione: z.boolean(),
  data_consenso: z.string().min(1),
  note: z.string().optional(),
  id: z.string().optional(),
  sync: z.boolean().optional(),
})

describe('clientFormSchema', () => {
  it('should accept valid client data', () => {
    const result = clientFormSchema.safeParse({
      nome: 'Mario',
      cognome: 'Rossi',
      localita: 'Milano',
      ruolo: 'CEO',
      settore: 'Tech',
    })
    expect(result.success).toBe(true)
  })

  it('should accept Italian accented names', () => {
    const result = clientFormSchema.safeParse({
      nome: 'Émanuele',
      cognome: "D'Angelo-Müller",
    })
    expect(result.success).toBe(true)
  })

  it('should reject short names', () => {
    const result = clientFormSchema.safeParse({
      nome: 'M',
      cognome: 'Rossi',
    })
    expect(result.success).toBe(false)
  })

  it('should reject names with numbers', () => {
    const result = clientFormSchema.safeParse({
      nome: 'Mario123',
      cognome: 'Rossi',
    })
    expect(result.success).toBe(false)
  })

  it('should accept empty optional fields', () => {
    const result = clientFormSchema.safeParse({
      nome: 'Mario',
      cognome: 'Rossi',
      localita: '',
      sito_web: '',
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid URLs in link_social', () => {
    const result = clientFormSchema.safeParse({
      nome: 'Mario',
      cognome: 'Rossi',
      link_social: ['not-a-url'],
    })
    expect(result.success).toBe(false)
  })

  it('should accept valid URLs in link_social', () => {
    const result = clientFormSchema.safeParse({
      nome: 'Mario',
      cognome: 'Rossi',
      link_social: ['https://linkedin.com/in/mario-rossi'],
    })
    expect(result.success).toBe(true)
  })
})

describe('leadsExtractSchema', () => {
  it('should accept valid lead search params', () => {
    const result = leadsExtractSchema.safeParse({
      name: 'Dentisti Milano',
      fonti_selezionate: ['google_places'],
      settore: 'sanita',
      comune: 'Milano',
    })
    expect(result.success).toBe(true)
  })

  it('should reject empty name', () => {
    const result = leadsExtractSchema.safeParse({
      name: '',
      fonti_selezionate: ['google_places'],
    })
    expect(result.success).toBe(false)
  })

  it('should reject empty fonti_selezionate', () => {
    const result = leadsExtractSchema.safeParse({
      name: 'Test',
      fonti_selezionate: [],
    })
    expect(result.success).toBe(false)
  })

  it('should accept optional financial filters', () => {
    const result = leadsExtractSchema.safeParse({
      name: 'Test',
      fonti_selezionate: ['google_places'],
      fatturato_min: '100000',
      fatturato_max: '500000',
      dipendenti_min: '10',
    })
    expect(result.success).toBe(true)
  })
})

describe('osintProfileSchema', () => {
  it('should accept valid profile request', () => {
    const result = osintProfileSchema.safeParse({
      nome: 'Mario',
      cognome: 'Rossi',
      consenso_profilazione: true,
      data_consenso: '2026-02-27',
      citta: 'Milano',
    })
    expect(result.success).toBe(true)
  })

  it('should reject without consenso_profilazione', () => {
    const result = osintProfileSchema.safeParse({
      nome: 'Mario',
      cognome: 'Rossi',
      data_consenso: '2026-02-27',
    })
    expect(result.success).toBe(false)
  })

  it('should reject short names', () => {
    const result = osintProfileSchema.safeParse({
      nome: 'M',
      cognome: 'R',
      consenso_profilazione: true,
      data_consenso: '2026-02-27',
    })
    expect(result.success).toBe(false)
  })

  it('should accept empty social URLs', () => {
    const result = osintProfileSchema.safeParse({
      nome: 'Mario',
      cognome: 'Rossi',
      consenso_profilazione: true,
      data_consenso: '2026-02-27',
      linkedin_url: '',
      facebook_url: '',
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid email format', () => {
    const result = osintProfileSchema.safeParse({
      nome: 'Mario',
      cognome: 'Rossi',
      email: 'not-an-email',
      consenso_profilazione: true,
      data_consenso: '2026-02-27',
    })
    expect(result.success).toBe(false)
  })

  it('should accept valid social URLs', () => {
    const result = osintProfileSchema.safeParse({
      nome: 'Mario',
      cognome: 'Rossi',
      consenso_profilazione: true,
      data_consenso: '2026-02-27',
      linkedin_url: 'https://linkedin.com/in/mario-rossi',
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid social URLs', () => {
    const result = osintProfileSchema.safeParse({
      nome: 'Mario',
      cognome: 'Rossi',
      consenso_profilazione: true,
      data_consenso: '2026-02-27',
      linkedin_url: 'not-a-url',
    })
    expect(result.success).toBe(false)
  })
})
