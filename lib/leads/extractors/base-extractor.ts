/**
 * Base Extractor Interface
 * All extractors must implement this interface
 */

import type { LeadSearchParams, Lead } from '@/lib/types/lead-extraction'

export interface BaseExtractor {
  name: string
  tipo: 'registro_ufficiale' | 'directory' | 'motore_ricerca' | 'social' | 'aggregatore' | 'altro'
  extract: (params: LeadSearchParams) => Promise<Lead[]>
}

/**
 * Generate unique lead ID
 */
export function generateLeadId(): string {
  return crypto.randomUUID()
}

/**
 * Clean and normalize text
 */
export function normalizeText(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s\-\.àèéìòùÀÈÉÌÒÙ]/gi, '')
}

/**
 * Extract phone numbers from text
 */
export function extractPhoneNumbers(text: string): string[] {
  const patterns = [
    /\+39[\s\-]?\d{2,3}[\s\-]?\d{6,7}/g,
    /0\d{1,3}[\s\-]?\d{6,7}/g,
    /3\d{2}[\s\-]?\d{6,7}/g,
  ]

  const phones: string[] = []

  for (const pattern of patterns) {
    const matches = text.match(pattern)
    if (matches) {
      phones.push(...matches.map((m) => m.replace(/[\s\-]/g, '')))
    }
  }

  return [...new Set(phones)] // Remove duplicates
}

/**
 * Extract emails from text
 */
export function extractEmails(text: string): string[] {
  const pattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
  const matches = text.match(pattern)
  return matches ? [...new Set(matches)] : []
}

/**
 * Extract website URLs from text
 */
export function extractWebsites(text: string): string[] {
  const pattern = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g
  const matches = text.match(pattern)
  return matches ? [...new Set(matches)] : []
}

/**
 * Parse Italian address
 */
export function parseItalianAddress(addressText: string): {
  indirizzo?: string
  cap?: string
  citta?: string
  provincia?: string
} {
  const result: {
    indirizzo?: string
    cap?: string
    citta?: string
    provincia?: string
  } = {}

  // Extract CAP (5 digits)
  const capMatch = addressText.match(/\b\d{5}\b/)
  if (capMatch) {
    result.cap = capMatch[0]
  }

  // Extract provincia (2 uppercase letters in parentheses)
  const provinciaMatch = addressText.match(/\(([A-Z]{2})\)/)
  if (provinciaMatch) {
    result.provincia = provinciaMatch[1]
  }

  // Try to extract city and street
  const parts = addressText.split(',').map((p) => p.trim())
  if (parts.length >= 2) {
    result.indirizzo = parts[0]
    result.citta = parts[1].replace(/\d{5}/, '').replace(/\([A-Z]{2}\)/, '').trim()
  } else {
    result.indirizzo = addressText
  }

  return result
}
