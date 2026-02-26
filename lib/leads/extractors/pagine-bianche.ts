import type { BaseExtractor } from './base-extractor'
import type { LeadSearchParams, Lead } from '@/lib/types/lead-extraction'
export const pagineBiancheExtractor: BaseExtractor = { name: 'Pagine Bianche', tipo: 'directory', async extract(params: LeadSearchParams): Promise<Lead[]> { return [] } }
