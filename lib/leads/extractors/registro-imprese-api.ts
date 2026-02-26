/**
 * Registro Imprese API Extractor
 * Integrazione con API Telemaco di InfoCamere (CCIAA)
 *
 * STATO: NON DISPONIBILE
 * L'API InfoCamere Telemaco richiede credenziali speciali
 * e processo di approvazione che attualmente non è accessibile.
 *
 * Alternative disponibili:
 * - google_places: Dati business verificati da Google
 * - pagine_gialle_headless: Scraping headless con Puppeteer
 */

import type { BaseExtractor } from './base-extractor'
import type { LeadSearchParams, Lead } from '@/lib/types/lead-extraction'

export const registroImpreseApiExtractor: BaseExtractor = {
  name: 'Registro Imprese (API Telemaco) - Non Disponibile',
  tipo: 'registro_ufficiale',

  async extract(params: LeadSearchParams): Promise<Lead[]> {
    console.log('[RegistroImpreseAPI] ⚠️  InfoCamere Telemaco API - Attualmente non disponibile')
    console.warn('[RegistroImpreseAPI] Servizio temporaneamente non accessibile')
    console.warn('[RegistroImpreseAPI] Usa "google_places" o "pagine_gialle_headless" per dati reali')

    // Service not currently available - return empty array
    return []
  },
}
