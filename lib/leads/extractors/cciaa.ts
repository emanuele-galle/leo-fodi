import type { BaseExtractor } from './base-extractor'
import type { LeadSearchParams, Lead } from '@/lib/types/lead-extraction'
export const cciaExtractor: BaseExtractor = { name: 'CCIAA', tipo: 'registro_ufficiale', async extract(params: LeadSearchParams): Promise<Lead[]> { return [] } }
