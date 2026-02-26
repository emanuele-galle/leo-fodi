import axios, { AxiosError } from 'axios';

const API_KEY = process.env.SCRAPECREATORS_API_KEY;
const BASE_URL = process.env.SCRAPECREATORS_BASE_URL || 'https://api.scrapecreators.com';

const client = axios.create({
  baseURL: `${BASE_URL}/v1`,
  headers: {
    'x-api-key': API_KEY,
    'Content-Type': 'application/json',
  },
  timeout: 45000, // 45 second timeout
});

// ==================== TYPE DEFINITIONS ====================

export interface GoogleSearchResult {
  url: string;
  title: string;
  description: string;
}

export interface GoogleSearchResponse {
  success: boolean;
  results: GoogleSearchResult[];
}

export interface GoogleSearchParams {
  query: string;
  region?: string; // 2 letter country code (US, UK, CA, IT, etc.)
  num_results?: number; // Number of results to return (default varies by API)
}

// Facebook API Types
export interface FacebookProfileParams {
  url: string; // Facebook profile URL
  get_business_hours?: boolean; // Get business hours
}

export interface FacebookPostsParams {
  url?: string; // Facebook profile URL
  pageId?: string; // Facebook profile page id (faster)
  cursor?: string; // Pagination cursor
}

export interface FacebookPostParams {
  url: string; // Facebook post/reel URL
  get_comments?: boolean; // Get first several comments
  get_transcript?: boolean; // Get video transcript
}

export interface FacebookCommentsParams {
  url: string; // Facebook post URL
  cursor?: string; // Pagination cursor
}

export interface FacebookTranscriptParams {
  url: string; // Facebook post URL
}

export interface FacebookProfile {
  id: string;
  name: string;
  url: string;
  gender?: string;
  coverPhoto?: any;
  profilePhoto?: any;
  pageIntro?: string;
  category?: string;
  address?: string;
  email?: string;
  phone?: string;
  website?: string;
  services?: string;
  priceRange?: string;
  rating?: string;
  ratingCount?: number;
  likeCount?: number;
  followerCount?: number;
  creationDate?: string;
  businessHours?: any[];
  [key: string]: any;
}

export interface FacebookPost {
  id: string;
  text?: string;
  url: string;
  permalink?: string;
  author?: any;
  videoDetails?: any;
  reactionCount?: number;
  commentCount?: number;
  videoViewCount?: number;
  publishTime?: number;
  topComments?: any[];
  [key: string]: any;
}

export interface FacebookPostsResponse {
  success: boolean;
  posts: FacebookPost[];
  cursor?: string;
}

export interface FacebookPostDetailResponse {
  success: boolean;
  post_id: string;
  like_count?: number;
  comment_count?: number;
  share_count?: number;
  view_count?: number;
  description?: string;
  url: string;
  author?: any;
  video?: any;
  music?: any;
  [key: string]: any;
}

export interface FacebookComment {
  id: string;
  text: string;
  created_at: string;
  reply_count: number;
  reaction_count: number;
  author: any;
}

export interface FacebookCommentsResponse {
  success: boolean;
  comments: FacebookComment[];
  cursor?: string;
  has_next_page?: boolean;
}

export interface FacebookTranscriptResponse {
  success: boolean;
  transcript: string;
}

/**
 * Centralized helper function to call ScrapeCreators API
 * Handles logging, costs, and errors.
 */
export async function callScrapeCreators<T = any>(
  endpoint: string,
  params: Record<string, any>
): Promise<T> {
  if (!API_KEY) {
    console.warn(`[ScrapeCreators] ⚠️  SCRAPECREATORS_API_KEY not configured. Call skipped.`);
    throw new Error('ScrapeCreators API Key not configured');
  }

  const startTime = Date.now();
  try {
    console.log(`[ScrapeCreators] 🔄 Calling ${endpoint} with params:`, params);
    const response = await client.get(endpoint, { params });

    const duration = Date.now() - startTime;
    console.log(`[ScrapeCreators] ✅ Success ${endpoint} (${duration}ms)`);

    // TODO: Add cost tracking when ApiCostTracker is available
    // ApiCostTracker.track({
    //   provider: 'scrapecreators',
    //   model: endpoint,
    //   cost: 0.01,
    //   duration,
    // });

    return response.data;

  } catch (error) {
    const duration = Date.now() - startTime;
    const axiosError = error as AxiosError;
    console.error(
      `[ScrapeCreators] ❌ Error calling ${endpoint} (${duration}ms):`,
      axiosError.response?.data || axiosError.message
    );

    // TODO: Add error tracking
    // ApiCostTracker.track({
    //   provider: 'scrapecreators',
    //   model: endpoint,
    //   cost: 0,
    //   duration,
    //   isError: true,
    //   statusCode: axiosError.response?.status,
    // });

    throw new Error(
      (axiosError.response?.data as any)?.message || 'ScrapeCreators API error'
    );
  }
}

// ==================== API FUNCTIONS ====================

/**
 * Search Google using ScrapeCreators API
 *
 * @param params - Search parameters
 * @returns Google search results
 *
 * @example
 * ```typescript
 * const results = await searchGoogle({
 *   query: 'Mario Rossi Milano LinkedIn',
 *   region: 'IT',
 *   num_results: 10
 * });
 * ```
 */
export async function searchGoogle(
  params: GoogleSearchParams
): Promise<GoogleSearchResponse> {
  if (!API_KEY) {
    console.warn(`[ScrapeCreators] ⚠️  SCRAPECREATORS_API_KEY not configured. Google Search skipped.`);
    return { success: false, results: [] };
  }

  try {
    console.log(`[ScrapeCreators] 🔍 Google Search: "${params.query}"${params.region ? ` (region: ${params.region})` : ''}`);

    const response = await callScrapeCreators<GoogleSearchResponse>('google/search', params);

    if (response.success && response.results) {
      console.log(`[ScrapeCreators] ✅ Found ${response.results.length} results`);
      return response;
    }

    console.log(`[ScrapeCreators] ⚠️  No results found`);
    return { success: false, results: [] };

  } catch (error) {
    console.error(`[ScrapeCreators] ❌ Google Search failed:`, error);
    return { success: false, results: [] };
  }
}

/**
 * Search for a person's online presence using Google
 * Optimized for OSINT profiling
 *
 * @param name - Person's full name
 * @param additionalInfo - Optional additional search terms (city, company, etc.)
 * @param region - Country code for localized results
 * @returns Google search results
 */
export async function searchPerson(
  name: string,
  additionalInfo?: string,
  region: string = 'IT'
): Promise<GoogleSearchResult[]> {
  const query = additionalInfo
    ? `${name} ${additionalInfo}`
    : name;

  const response = await searchGoogle({
    query,
    region,
    num_results: 20
  });

  return response.results || [];
}

/**
 * Search for a person on a specific platform
 *
 * @param name - Person's full name
 * @param platform - Platform to search on (linkedin, facebook, instagram, etc.)
 * @param additionalInfo - Optional additional search terms
 * @param region - Country code
 * @returns Google search results
 */
export async function searchPersonOnPlatform(
  name: string,
  platform: 'linkedin' | 'facebook' | 'instagram' | 'twitter' | 'youtube',
  additionalInfo?: string,
  region: string = 'IT'
): Promise<GoogleSearchResult[]> {
  const platformDomain = {
    linkedin: 'linkedin.com',
    facebook: 'facebook.com',
    instagram: 'instagram.com',
    twitter: 'twitter.com',
    youtube: 'youtube.com'
  }[platform];

  const query = additionalInfo
    ? `${name} ${additionalInfo} site:${platformDomain}`
    : `${name} site:${platformDomain}`;

  const response = await searchGoogle({
    query,
    region,
    num_results: 10
  });

  return response.results || [];
}

// ==================== FACEBOOK API FUNCTIONS ====================

/**
 * Get public Facebook profile information
 *
 * @param params - Profile parameters (url, get_business_hours)
 * @returns Facebook profile data
 *
 * @example
 * ```typescript
 * const profile = await getFacebookProfile({
 *   url: 'https://www.facebook.com/businessname',
 *   get_business_hours: true
 * });
 * ```
 */
export async function getFacebookProfile(
  params: FacebookProfileParams
): Promise<FacebookProfile | null> {
  if (!API_KEY) {
    console.warn(`[ScrapeCreators] ⚠️  SCRAPECREATORS_API_KEY not configured. Facebook Profile skipped.`);
    return null;
  }

  try {
    console.log(`[ScrapeCreators] 👤 Facebook Profile: ${params.url}`);

    const response = await callScrapeCreators<FacebookProfile>('facebook/profile', params);

    if (response && response.name) {
      console.log(`[ScrapeCreators] ✅ Profile found: ${response.name}`);
      return response;
    }

    console.log(`[ScrapeCreators] ⚠️  No profile data found`);
    return null;

  } catch (error) {
    console.error(`[ScrapeCreators] ❌ Facebook Profile failed:`, error);
    return null;
  }
}

/**
 * Get public Facebook profile posts
 * Returns only posts visible from incognito browser (max 3 per call)
 *
 * @param params - Posts parameters (url or pageId, cursor for pagination)
 * @returns Facebook posts with pagination cursor
 *
 * @example
 * ```typescript
 * const { posts, cursor } = await getFacebookPosts({
 *   url: 'https://www.facebook.com/businessname'
 * });
 *
 * // Get next page
 * const nextPage = await getFacebookPosts({
 *   url: 'https://www.facebook.com/businessname',
 *   cursor: cursor
 * });
 * ```
 */
export async function getFacebookPosts(
  params: FacebookPostsParams
): Promise<FacebookPostsResponse> {
  if (!API_KEY) {
    console.warn(`[ScrapeCreators] ⚠️  SCRAPECREATORS_API_KEY not configured. Facebook Posts skipped.`);
    return { success: false, posts: [] };
  }

  try {
    const identifier = params.pageId || params.url;
    console.log(`[ScrapeCreators] 📄 Facebook Posts: ${identifier}${params.cursor ? ' (page ' + params.cursor.substring(0, 10) + '...)' : ''}`);

    const response = await callScrapeCreators<FacebookPostsResponse>('facebook/profile/posts', params);

    if (response.success && response.posts) {
      console.log(`[ScrapeCreators] ✅ Found ${response.posts.length} posts`);
      return response;
    }

    console.log(`[ScrapeCreators] ⚠️  No posts found`);
    return { success: false, posts: [] };

  } catch (error) {
    console.error(`[ScrapeCreators] ❌ Facebook Posts failed:`, error);
    return { success: false, posts: [] };
  }
}

/**
 * Get a public Facebook post or reel by URL
 *
 * @param params - Post parameters (url, get_comments, get_transcript)
 * @returns Facebook post details
 *
 * @example
 * ```typescript
 * const post = await getFacebookPost({
 *   url: 'https://www.facebook.com/reel/123456',
 *   get_comments: true,
 *   get_transcript: true
 * });
 * ```
 */
export async function getFacebookPost(
  params: FacebookPostParams
): Promise<FacebookPostDetailResponse | null> {
  if (!API_KEY) {
    console.warn(`[ScrapeCreators] ⚠️  SCRAPECREATORS_API_KEY not configured. Facebook Post skipped.`);
    return null;
  }

  try {
    console.log(`[ScrapeCreators] 📝 Facebook Post: ${params.url}`);

    const response = await callScrapeCreators<FacebookPostDetailResponse>('facebook/post', params);

    if (response.success && response.post_id) {
      console.log(`[ScrapeCreators] ✅ Post found: ${response.post_id}`);
      return response;
    }

    console.log(`[ScrapeCreators] ⚠️  No post data found`);
    return null;

  } catch (error) {
    console.error(`[ScrapeCreators] ❌ Facebook Post failed:`, error);
    return null;
  }
}

/**
 * Get comments from a Facebook post or reel
 *
 * @param params - Comments parameters (url, cursor for pagination)
 * @returns Facebook comments with pagination cursor
 *
 * @example
 * ```typescript
 * const { comments, cursor, has_next_page } = await getFacebookComments({
 *   url: 'https://www.facebook.com/post/123456'
 * });
 *
 * // Get next page
 * if (has_next_page) {
 *   const nextPage = await getFacebookComments({
 *     url: 'https://www.facebook.com/post/123456',
 *     cursor: cursor
 *   });
 * }
 * ```
 */
export async function getFacebookComments(
  params: FacebookCommentsParams
): Promise<FacebookCommentsResponse> {
  if (!API_KEY) {
    console.warn(`[ScrapeCreators] ⚠️  SCRAPECREATORS_API_KEY not configured. Facebook Comments skipped.`);
    return { success: false, comments: [] };
  }

  try {
    console.log(`[ScrapeCreators] 💬 Facebook Comments: ${params.url}${params.cursor ? ' (page ' + params.cursor.substring(0, 10) + '...)' : ''}`);

    const response = await callScrapeCreators<FacebookCommentsResponse>('facebook/post/comments', params);

    if (response.success && response.comments) {
      console.log(`[ScrapeCreators] ✅ Found ${response.comments.length} comments`);
      return response;
    }

    console.log(`[ScrapeCreators] ⚠️  No comments found`);
    return { success: false, comments: [] };

  } catch (error) {
    console.error(`[ScrapeCreators] ❌ Facebook Comments failed:`, error);
    return { success: false, comments: [] };
  }
}

/**
 * Get transcript of a Facebook post/reel video
 *
 * @param params - Transcript parameters (url)
 * @returns Video transcript text
 *
 * @example
 * ```typescript
 * const { transcript } = await getFacebookTranscript({
 *   url: 'https://www.facebook.com/reel/123456'
 * });
 *
 * console.log('Video says:', transcript);
 * ```
 */
export async function getFacebookTranscript(
  params: FacebookTranscriptParams
): Promise<FacebookTranscriptResponse> {
  if (!API_KEY) {
    console.warn(`[ScrapeCreators] ⚠️  SCRAPECREATORS_API_KEY not configured. Facebook Transcript skipped.`);
    return { success: false, transcript: '' };
  }

  try {
    console.log(`[ScrapeCreators] 🎬 Facebook Transcript: ${params.url}`);

    const response = await callScrapeCreators<FacebookTranscriptResponse>('facebook/post/transcript', params);

    if (response.success && response.transcript) {
      console.log(`[ScrapeCreators] ✅ Transcript found (${response.transcript.length} chars)`);
      return response;
    }

    console.log(`[ScrapeCreators] ⚠️  No transcript found`);
    return { success: false, transcript: '' };

  } catch (error) {
    console.error(`[ScrapeCreators] ❌ Facebook Transcript failed:`, error);
    return { success: false, transcript: '' };
  }
}
