/**
 * Client Validation Schema
 * Zod schemas for form validation and API input
 */

import { z } from 'zod'

/**
 * Client Form Schema
 * Validates client data input from forms and API requests
 */
export const clientFormSchema = z.object({
  nome: z
    .string()
    .min(2, { message: 'Il nome deve avere almeno 2 caratteri' })
    .max(100, { message: 'Il nome non può superare 100 caratteri' })
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, {
      message: 'Il nome può contenere solo lettere, spazi, apostrofi e trattini',
    }),

  cognome: z
    .string()
    .min(2, { message: 'Il cognome deve avere almeno 2 caratteri' })
    .max(100, { message: 'Il cognome non può superare 100 caratteri' })
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, {
      message: 'Il cognome può contenere solo lettere, spazi, apostrofi e trattini',
    }),

  localita: z
    .string()
    .min(2, { message: 'La località deve avere almeno 2 caratteri' })
    .max(200, { message: 'La località non può superare 200 caratteri' })
    .optional()
    .or(z.literal('')),

  ruolo: z
    .string()
    .min(2, { message: 'Il ruolo deve avere almeno 2 caratteri' })
    .max(200, { message: 'Il ruolo non può superare 200 caratteri' })
    .optional()
    .or(z.literal('')),

  settore: z
    .string()
    .min(2, { message: 'Il settore deve avere almeno 2 caratteri' })
    .max(200, { message: 'Il settore non può superare 200 caratteri' })
    .optional()
    .or(z.literal('')),

  link_social: z
    .array(
      z.string().url({ message: 'Formato URL non valido' }).max(500, {
        message: 'URL troppo lungo (max 500 caratteri)',
      })
    )
    .optional(),

  sito_web: z
    .string()
    .url({ message: 'Formato URL non valido' })
    .max(500, { message: 'URL troppo lungo (max 500 caratteri)' })
    .optional()
    .or(z.literal('')),
})

/**
 * Client ID Schema
 * Validates UUID format for client IDs
 */
export const clientIdSchema = z.object({
  clientId: z.string().uuid({ message: 'ID cliente non valido' }),
})

/**
 * Planning Request Schema
 * Validates request for creating financial plan
 */
export const planningRequestSchema = z.object({
  clientId: z.string().uuid({ message: 'ID cliente non valido' }),
})

/**
 * Type exports for use in components
 */
export type ClientFormData = z.infer<typeof clientFormSchema>
export type ClientIdData = z.infer<typeof clientIdSchema>
export type PlanningRequestData = z.infer<typeof planningRequestSchema>

/**
 * Helper function to transform empty strings to undefined
 * Useful for optional fields that should be null in database
 */
export function transformEmptyToUndefined<T extends Record<string, unknown>>(
  data: T
): T {
  const result = { ...data }

  for (const key in result) {
    if (result[key] === '') {
      (result as any)[key] = undefined
    }
  }

  return result
}

/**
 * Helper function to validate and sanitize social links
 * Removes duplicates and invalid URLs
 */
export function sanitizeSocialLinks(links: string[]): string[] {
  // Remove empty strings
  const nonEmpty = links.filter((link) => link.trim() !== '')

  // Remove duplicates
  const unique = Array.from(new Set(nonEmpty))

  // Validate each URL
  const valid = unique.filter((link) => {
    try {
      new URL(link)
      return true
    } catch {
      return false
    }
  })

  return valid
}
