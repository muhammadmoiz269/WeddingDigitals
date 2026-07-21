/**
 * Server-side helper — Google Places API (New) review fetcher.
 *
 * Uses the hardcoded Place ID for "Shahi Bulawa" to fetch reviews
 * directly, bypassing the Text Search step entirely.
 */

export interface GoogleReview {
  authorName: string;
  authorPhotoUrl?: string;
  rating: number;
  text: string;
  relativeTime: string;
}

export interface PlaceReviewData {
  reviews: GoogleReview[];
  rating: number;
  totalRatings: number;
}

// Hardcoded Place ID for Shahi Bulawa
// const PLACE_ID = 'ChIJUU-GSEE_sz4RLLo-W55ciBE';
const PLACE_ID = 'ChIJO4wfvx4RQY4RgMcRtiARFJM'

export const MAPS_URL = `https://search.google.com/local/reviews?placeid=${PLACE_ID}`;
const EMPTY: PlaceReviewData = { reviews: [], rating: 0, totalRatings: 0 };

// ─── Fetch Place Details & Reviews (Places API New) ──────────────────────────
async function fetchWithNewAPI(apiKey: string): Promise<PlaceReviewData> {
  const url = `https://places.googleapis.com/v1/places/${PLACE_ID}`;

  console.log('[GoogleReviews] Fetching from Places API (New):', url);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'displayName,rating,userRatingCount,reviews',
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`[GoogleReviews] New API failed (${res.status}):`, errorBody);
      return EMPTY;
    }

    const data = await res.json();
    console.log('[GoogleReviews] New API response keys:', Object.keys(data));

    return parseNewAPIResponse(data);
  } catch (error) {
    console.error('[GoogleReviews] New API fetch error:', error);
    return EMPTY;
  }
}

// ─── Fallback: Legacy Places API ─────────────────────────────────────────────
async function fetchWithLegacyAPI(apiKey: string): Promise<PlaceReviewData> {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=rating,user_ratings_total,reviews&reviews_sort=newest&key=${apiKey}`;

  console.log('[GoogleReviews] Trying legacy Places API...');

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`[GoogleReviews] Legacy API HTTP error (${res.status}):`, errorBody);
      return EMPTY;
    }

    const data = await res.json();

    if (data.status !== 'OK') {
      console.error('[GoogleReviews] Legacy API status:', data.status, data.error_message || '');
      return EMPTY;
    }

    const result = data.result;
    if (!result) return EMPTY;

    const reviews: GoogleReview[] = (result.reviews || [])
      .filter((r: any) => r.text && r.text.trim().length > 0)
      .map((r: any) => ({
        authorName: r.author_name || 'Anonymous',
        authorPhotoUrl: r.profile_photo_url || undefined,
        rating: r.rating || 5,
        text: r.text,
        relativeTime: r.relative_time_description || '',
      }));

    console.log(`[GoogleReviews] Legacy API returned ${reviews.length} reviews`);

    return {
      reviews,
      rating: result.rating || 0,
      totalRatings: result.user_ratings_total || 0,
    };
  } catch (error) {
    console.error('[GoogleReviews] Legacy API fetch error:', error);
    return EMPTY;
  }
}

// ─── Parse New API response ──────────────────────────────────────────────────
function parseNewAPIResponse(data: any): PlaceReviewData {
  const reviews: GoogleReview[] = (data.reviews || [])
    .filter((r: any) => r.text?.text && r.text.text.trim().length > 0)
    .map((r: any) => ({
      authorName: r.authorAttribution?.displayName || 'Anonymous',
      authorPhotoUrl: r.authorAttribution?.photoUri || undefined,
      rating: r.rating || 5,
      text: r.text.text,
      relativeTime: r.relativePublishTimeDescription || '',
    }));

  console.log(`[GoogleReviews] Parsed ${reviews.length} reviews, rating: ${data.rating}`);

  return {
    reviews,
    rating: data.rating || 0,
    totalRatings: data.userRatingCount || 0,
  };
}

// ─── Public Function ─────────────────────────────────────────────────────────
export async function fetchGoogleReviews(): Promise<PlaceReviewData> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.warn('[GoogleReviews] No GOOGLE_PLACES_API_KEY set — using fallback reviews');
    return EMPTY;
  }

  console.log('[GoogleReviews] API key found, length:', apiKey.length);

  // Try New API first
  let result = await fetchWithNewAPI(apiKey);

  // If New API returned no reviews, try Legacy API
  if (result.reviews.length === 0) {
    console.log('[GoogleReviews] New API returned no reviews, trying legacy API...');
    result = await fetchWithLegacyAPI(apiKey);
  }

  console.log(`[GoogleReviews] Final result: ${result.reviews.length} reviews, rating: ${result.rating}`);
  return result;
}