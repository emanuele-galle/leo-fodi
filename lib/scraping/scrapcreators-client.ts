/**
 * ScrapCreators API Client
 * Official Instagram scraping service with high reliability
 */

import { trackTokenUsage } from '@/lib/ai/token-tracker'

// ==================== LINKEDIN API RESPONSE TYPES ====================

export interface ScrapCreatorsLinkedInResponse {
  success: boolean
  credits_remaining: number
  // Profile data
  name: string
  headline?: string          // Short headline (es: "Senior Manager at Company")
  about?: string            // ⭐ CRITICO: Full bio/summary (2000+ chars)
  summary?: string          // Alias for "about"
  location?: string
  url?: string
  publicProfileUrl?: string
  followers?: string        // Note: returned as string, need parseInt()
  connections?: string      // Note: returned as string, need parseInt()
  // Experience
  experience?: Array<{
    title?: string
    name?: string           // Company name
    employmentType?: string
    startDate?: string
    endDate?: string
    description?: string
    location?: string
    member?: {              // Alternative structure
      roleName?: string
      startDate?: string
      endDate?: string
      description?: string
    }
  }>
  // Education
  education?: Array<{
    schoolName?: string
    name?: string
    degree?: string
    degreeName?: string
    fieldOfStudy?: string
    startDate?: string
    endDate?: string
    member?: {
      description?: string
      startDate?: string
      endDate?: string
    }
  }>
  // Skills
  skills?: Array<string | { name?: string; skillName?: string }>
  // Certifications
  certifications?: Array<{
    name?: string
    title?: string
    authority?: string
    issuer?: string
    dateIssued?: string
    timePeriod?: {
      startDate?: string
    }
  }>
  // Error handling
  error?: string
  message?: string
}

export interface ScrapCreatorsInstagramUser {
  id: string
  username: string
  full_name: string
  biography: string
  bio_links: Array<{
    title: string
    lynx_url?: string
    url: string
    link_type: string
  }>
  external_url: string | null
  edge_followed_by: {
    count: number  // Followers
  }
  edge_follow: {
    count: number  // Following
  }
  is_private: boolean
  is_verified: boolean
  is_business_account: boolean
  is_professional_account: boolean
  profile_pic_url: string
  profile_pic_url_hd: string
  category_name: string | null
  business_email: string | null
  business_phone_number: string | null
  edge_felix_video_timeline?: {
    count: number
    edges: Array<{
      node: {
        id: string
        shortcode: string
        dimensions: { height: number; width: number }
        display_url: string
        is_video: boolean
        video_url?: string
        edge_media_to_caption: {
          edges: Array<{ node: { text: string } }>
        }
        edge_liked_by: { count: number }
        edge_media_to_comment: { count: number }
        taken_at_timestamp: number
        location: any | null
      }
    }>
  }
}

export interface ScrapCreatorsInstagramResponse {
  success: boolean
  credits_remaining: number
  data?: {
    user: ScrapCreatorsInstagramUser
  }
  error?: string
  errorStatus?: number
  message?: string
}

export interface InstagramScrapedData {
  username: string
  full_name: string
  bio: string
  bio_links: string[]
  external_url: string | null
  followers: number
  following: number
  is_verified: boolean
  is_private: boolean
  is_business: boolean
  profile_pic_hd: string
  business_email: string | null
  business_phone: string | null
  category: string | null
  posts_count?: number
  recent_posts?: Array<{
    id: string
    shortcode: string
    caption: string
    likes: number
    comments: number
    timestamp: number
    is_video: boolean
    url: string
    video_url?: string
  }>
}

export class ScrapCreatorsClient {
  private apiKey: string
  private baseUrl = 'https://api.scrapecreators.com'
  private enabled: boolean

  constructor() {
    this.apiKey = process.env.SCRAPECREATORS_API_KEY || ''
    this.enabled = !!this.apiKey

    if (!this.enabled) {
      console.warn('[ScrapCreators] API key not configured - service disabled')
    } else {
      console.log('[ScrapCreators] ✅ Service enabled with API key')
    }
  }

  /**
   * Check if service is available
   */
  isEnabled(): boolean {
    return this.enabled
  }

  /**
   * Track API usage
   */
  private async trackUsage(
    operation: string,
    executionTimeMs: number,
    status: 'success' | 'error' = 'success',
    errorMessage?: string,
    creditsUsed: number = 1 // Each request consumes 1 credit
  ): Promise<void> {
    try {
      // ScrapCreators pricing model:
      // - Each request consumes 1 credit
      // - Typical cost: €10 per 100 credits = €0.10 per credit
      // - Adjust COST_PER_CREDIT based on your plan pricing
      const COST_PER_CREDIT = parseFloat(process.env.SCRAPCREATORS_COST_PER_CREDIT || '0.10')
      const actualCost = creditsUsed * COST_PER_CREDIT

      await trackTokenUsage({
        section: 'osint_profiling',
        operation: `scrapcreators_${operation}`,
        provider: 'other', // ScrapCreators is not AI, but external API
        model: 'scrapcreators-api',
        promptTokens: creditsUsed, // Store credits used (1 per request)
        completionTokens: 0,
        totalTokens: creditsUsed,
        totalCost: status === 'success' ? actualCost : 0, // Cost in EUR
        executionTimeMs,
        status,
        errorMessage,
      })
    } catch (trackError) {
      console.warn('[ScrapCreators] ⚠️  Failed to track API usage:', trackError)
    }
  }

  /**
   * Scrape Instagram profile data
   */
  async scrapeInstagram(handle: string): Promise<InstagramScrapedData> {
    if (!this.enabled) {
      throw new Error('ScrapCreators API key not configured')
    }

    const startTime = Date.now()

    try {
      console.log(`[ScrapCreators] Scraping Instagram profile: @${handle}`)

      const response = await fetch(`${this.baseUrl}/v1/instagram/profile?handle=${encodeURIComponent(handle)}`, {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey,
        },
      })

      if (!response.ok) {
        throw new Error(`ScrapCreators API error: ${response.status} ${response.statusText}`)
      }

      const data: ScrapCreatorsInstagramResponse = await response.json()

      const executionTime = Date.now() - startTime

      if (!data.success) {
        console.error(`[ScrapCreators] ❌ Failed: ${data.message || data.error}`)
        throw new Error(data.message || data.error || 'Unknown error')
      }

      if (!data.data) {
        throw new Error('No data returned from API')
      }

      console.log(`[ScrapCreators] ✅ Success in ${executionTime}ms. Credits remaining: ${data.credits_remaining}`)

      // Track successful API usage
      await this.trackUsage('instagram', executionTime, 'success')

      // Transform API response to our internal format
      return this.transformInstagramData(data.data.user)

    } catch (error) {
      const executionTime = Date.now() - startTime
      console.error(`[ScrapCreators] ❌ Instagram scraping failed (${executionTime}ms):`, error)

      // Track failed API usage
      await this.trackUsage('instagram', executionTime, 'error', error instanceof Error ? error.message : 'Unknown error')

      throw error
    }
  }

  /**
   * Scrape LinkedIn profile data
   */
  async scrapeLinkedIn(profileUrl: string): Promise<any> {
    if (!this.enabled) {
      throw new Error('ScrapCreators API key not configured')
    }

    const startTime = Date.now()

    try {
      console.log(`[ScrapCreators] Scraping LinkedIn profile: ${profileUrl}`)

      const response = await fetch(`${this.baseUrl}/v1/linkedin/profile?url=${encodeURIComponent(profileUrl)}`, {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey,
        },
      })

      if (!response.ok) {
        throw new Error(`ScrapCreators API error: ${response.status} ${response.statusText}`)
      }

      const data: ScrapCreatorsLinkedInResponse = await response.json()

      const executionTime = Date.now() - startTime

      if (!data.success) {
        console.error(`[ScrapCreators] ❌ LinkedIn scraping failed: ${data.message || data.error}`)
        throw new Error(data.message || data.error || 'Unknown error')
      }

      console.log(`[ScrapCreators] ✅ LinkedIn success in ${executionTime}ms. Credits remaining: ${data.credits_remaining}`)

      // Log bio extraction status
      if (data.about || data.summary) {
        const bioLength = (data.about || data.summary || '').length
        console.log(`[ScrapCreators] 📝 Bio/About extracted: ${bioLength} chars ${bioLength > 500 ? '(RICH DATA ⭐)' : ''}`)
      } else {
        console.warn(`[ScrapCreators] ⚠️  No bio/about field found in response`)
      }

      // Track successful API usage
      await this.trackUsage('linkedin', executionTime, 'success')

      // FIX: LinkedIn data is in the root response, not in data.data
      // Response format: { success, credits_remaining, name, location, experience, ... }
      const { success, credits_remaining, ...profileData } = data
      return profileData as Omit<ScrapCreatorsLinkedInResponse, 'success' | 'credits_remaining'>

    } catch (error) {
      const executionTime = Date.now() - startTime
      console.error(`[ScrapCreators] ❌ LinkedIn scraping failed (${executionTime}ms):`, error)

      // Track failed API usage
      await this.trackUsage('linkedin', executionTime, 'error', error instanceof Error ? error.message : 'Unknown error')

      throw error
    }
  }

  /**
   * Scrape Facebook profile data
   */
  async scrapeFacebook(profileUrl: string): Promise<any> {
    if (!this.enabled) {
      throw new Error('ScrapCreators API key not configured')
    }

    const startTime = Date.now()

    try {
      console.log(`[ScrapCreators] Scraping Facebook profile: ${profileUrl}`)

      const response = await fetch(`${this.baseUrl}/v1/facebook/profile?url=${encodeURIComponent(profileUrl)}`, {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey,
        },
      })

      if (!response.ok) {
        throw new Error(`ScrapCreators API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      const executionTime = Date.now() - startTime

      if (!data.success) {
        console.error(`[ScrapCreators] ❌ Facebook scraping failed: ${data.message || data.error}`)
        throw new Error(data.message || data.error || 'Unknown error')
      }

      // FIX: Handle private profiles gracefully
      if (data.account_status === 'private') {
        console.warn(`[ScrapCreators] ⚠️  Facebook profile is private: ${data.message}`)
        throw new Error(`Profile is private: ${data.message || 'No public data available'}`)
      }

      console.log(`[ScrapCreators] ✅ Facebook success in ${executionTime}ms. Credits remaining: ${data.credits_remaining}`)

      // FIXED: Data is in the response root, not in data.data
      // ScrapeCreators returns: { success, credits_remaining, name, id, followerCount, ... }
      // NOT: { success, data: { name, id, ... } }
      console.log('[ScrapCreators] ✅ Facebook data extracted:', {
        name: data.name,
        followers: data.followerCount,
        likes: data.likeCount,
        status: data.account_status
      })

      // Track successful API usage
      await this.trackUsage('facebook', executionTime, 'success')

      // Return the full response object (excluding API metadata)
      const { success, credits_remaining, ...profileData } = data
      return profileData

    } catch (error) {
      const executionTime = Date.now() - startTime
      console.error(`[ScrapCreators] ❌ Facebook scraping failed (${executionTime}ms):`, error)

      // Track failed API usage
      await this.trackUsage('facebook', executionTime, 'error', error instanceof Error ? error.message : 'Unknown error')

      throw error
    }
  }

  /**
   * Transform ScrapCreators response to our internal format
   */
  private transformInstagramData(user: ScrapCreatorsInstagramUser): InstagramScrapedData {
    // FIX CRITICO: Estrai post dal FEED (edge_owner_to_timeline_media), non solo IGTV
    const timelineEdges = (user as any).edge_owner_to_timeline_media?.edges || []

    const recentPosts = timelineEdges.map((edge: any) => {
      const post = edge.node
      const caption = post.edge_media_to_caption?.edges[0]?.node?.text || ''

      // Estrai hashtags dalla caption
      const hashtags = caption.match(/#\w+/g) || []

      // Estrai mentions dalla caption
      const mentions = caption.match(/@[\w.]+/g) || []

      // Estrai location
      const location = post.location ? {
        id: post.location.id,
        name: post.location.name,
        slug: post.location.slug,
      } : undefined

      // Estrai utenti taggati
      const tagged_users = post.edge_media_to_tagged_user?.edges?.map((edge: any) => ({
        username: edge.node.user?.username,
        full_name: edge.node.user?.full_name,
      })) || []

      return {
        id: post.id,
        shortcode: post.shortcode,
        caption,
        hashtags,  // NUOVO: lista hashtags estratti
        mentions,  // NUOVO: lista mentions estratti
        location,  // NUOVO: dati location del post
        tagged_users,  // NUOVO: utenti taggati nel post
        likes: post.edge_liked_by?.count || 0,
        comments: post.edge_media_to_comment?.count || 0,
        video_views: post.video_view_count || undefined,  // NUOVO: views per video
        timestamp: post.taken_at_timestamp,
        is_video: post.is_video,
        url: post.display_url,
        video_url: post.video_url,
        thumbnail: post.thumbnail_src,  // NUOVO: thumbnail del post
      }
    })

    return {
      username: user.username,
      full_name: user.full_name,
      bio: user.biography,
      bio_links: user.bio_links.map(link => link.url),
      external_url: user.external_url,
      followers: user.edge_followed_by.count,
      following: user.edge_follow.count,
      is_verified: user.is_verified,
      is_private: user.is_private,
      is_business: user.is_business_account,
      profile_pic_hd: user.profile_pic_url_hd,
      business_email: user.business_email,
      business_phone: user.business_phone_number,
      category: user.category_name,
      posts_count: (user as any).edge_owner_to_timeline_media?.count || 0,
      recent_posts: recentPosts.length > 0 ? recentPosts : undefined,
    }
  }

  /**
   * Scrape LinkedIn company data
   */
  async scrapeLinkedInCompany(companyUrl: string): Promise<any> {
    if (!this.enabled) {
      throw new Error('ScrapCreators API key not configured')
    }

    const startTime = Date.now()

    try {
      console.log(`[ScrapCreators] Scraping LinkedIn company: ${companyUrl}`)

      const response = await fetch(`${this.baseUrl}/v1/linkedin/company?url=${encodeURIComponent(companyUrl)}`, {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey,
        },
      })

      if (!response.ok) {
        throw new Error(`ScrapCreators API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      const executionTime = Date.now() - startTime

      if (!data.success) {
        console.error(`[ScrapCreators] ❌ LinkedIn company scraping failed: ${data.message || data.error}`)
        throw new Error(data.message || data.error || 'Unknown error')
      }

      console.log(`[ScrapCreators] ✅ LinkedIn company success in ${executionTime}ms. Credits remaining: ${data.credits_remaining}`)

      return data

    } catch (error) {
      const executionTime = Date.now() - startTime
      console.error(`[ScrapCreators] ❌ LinkedIn company scraping failed (${executionTime}ms):`, error)
      throw error
    }
  }

  /**
   * Scrape LinkedIn post data
   */
  async scrapeLinkedInPost(postUrl: string): Promise<any> {
    if (!this.enabled) {
      throw new Error('ScrapCreators API key not configured')
    }

    const startTime = Date.now()

    try {
      console.log(`[ScrapCreators] Scraping LinkedIn post: ${postUrl}`)

      const response = await fetch(`${this.baseUrl}/v1/linkedin/post?url=${encodeURIComponent(postUrl)}`, {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey,
        },
      })

      if (!response.ok) {
        throw new Error(`ScrapCreators API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      const executionTime = Date.now() - startTime

      if (!data.success) {
        console.error(`[ScrapCreators] ❌ LinkedIn post scraping failed: ${data.message || data.error}`)
        throw new Error(data.message || data.error || 'Unknown error')
      }

      console.log(`[ScrapCreators] ✅ LinkedIn post success in ${executionTime}ms. Credits remaining: ${data.credits_remaining}`)

      return data

    } catch (error) {
      const executionTime = Date.now() - startTime
      console.error(`[ScrapCreators] ❌ LinkedIn post scraping failed (${executionTime}ms):`, error)
      throw error
    }
  }

  /**
   * Get remaining credits (makes a lightweight request to check)
   */
  async getCreditsRemaining(): Promise<number> {
    try {
      // Use a non-existent handle to get credits without consuming one
      const response = await fetch(`${this.baseUrl}/instagram/profile`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ handle: '_nonexistent_check_credits_' }),
      })

      const data: ScrapCreatorsInstagramResponse = await response.json()
      return data.credits_remaining || 0
    } catch (error) {
      console.error('[ScrapCreators] Failed to check credits:', error)
      return -1
    }
  }
}
