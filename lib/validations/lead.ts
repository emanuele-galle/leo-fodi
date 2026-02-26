import { z } from 'zod'

export const leadSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  location: z.string().min(1, 'Location is required'),
  limit: z.number().int().positive().optional().default(20)
})

export type LeadSearchParams = z.infer<typeof leadSchema>
