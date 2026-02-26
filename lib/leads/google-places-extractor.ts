import { Client } from '@googlemaps/google-maps-services-js'
import { cache, CacheTTL } from '@/lib/cache/cache-service'

export interface BusinessData {
  name: string
  address?: string
  phone?: string
  website?: string
}

export async function extractFromGooglePlaces(params: {
  query: string
  location: string
  limit?: number
}): Promise<BusinessData[]> {
  const cacheKey = `google:${params.query}:${params.location}`
  const cached = cache.get<BusinessData[]>(cacheKey)

  if (cached) {
    return cached
  }

  try {
    const client = new Client({})
    const response = await client.placesNearby({
      params: {
        key: process.env.GOOGLE_PLACES_API_KEY || '',
        location: params.location,
        keyword: params.query,
        rankby: 'prominence' as any
      }
    })

    const results: BusinessData[] = response.data.results.map(place => ({
      name: place.name || '',
      address: place.vicinity,
      phone: undefined,
      website: undefined
    }))

    cache.set(cacheKey, results, CacheTTL.DAY)
    return results
  } catch (error) {
    console.error('[Google Places] Error:', error)
    return []
  }
}
