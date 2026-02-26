import type { BaseExtractor } from './base-extractor'
import type { LeadSearchParams, Lead } from '@/lib/types/lead-extraction'
export const googleSearchExtractor: BaseExtractor = { name: 'Google Search', tipo: 'motore_ricerca', async extract(params: LeadSearchParams): Promise<Lead[]> { return [] } }
