import { extractFromGooglePlaces } from './google-places-extractor'

export interface BusinessData {
  name: string
  address?: string
  phone?: string
  website?: string
  email?: string
}

export async function extractBusinessData(params: {
  query: string
  location: string
  limit?: number
}): Promise<BusinessData[]> {
  try {
    // Try Google Places first
    if (process.env.GOOGLE_PLACES_API_KEY) {
      return await extractFromGooglePlaces(params)
    }

    return []
  } catch (error) {
    console.error('[Data Extractor] Error:', error)
    return []
  }
}
