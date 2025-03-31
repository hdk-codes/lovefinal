import { client } from './sanity'; // Ensure this points to the correct Sanity client file
import { queries } from './query-utils'; // Ensure this points to the correct query utilities file

// Only cache read-only queries that don't need real-time updates
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Selective caching based on query type
async function selectiveCachedFetch<T>(key: string, fetcher: () => Promise<T>, shouldCache = false): Promise<T> {
  if (!shouldCache) {
    return fetcher();
  }

  const now = Date.now();
  const cached = cache.get(key) as CacheEntry<T> | undefined;
  
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return cached.data;
  }
  
  const result = await fetcher();
  cache.set(key, { data: result, timestamp: now });
  return result;
}

export const dataProvider = {
  letters: () => client.fetch<any>(queries.loveLetters),
  recentContent: () => client.fetch<any>(queries.getRecentContent),
  audioMessages: () => client.fetch<any>(queries.getAudioMessages),
  
  // Cached queries (static content)
  landingPage: () => selectiveCachedFetch('landingPage', () => client.fetch<any>(queries.getLandingPage), true),
  featuredItems: () => selectiveCachedFetch('featuredItems', () => client.fetch<any>(queries.getFeaturedItems), true),
  
  // Real-time queries with params
  albums: (params = {}) => client.fetch<any>(queries.albums, params),
  galleryItems: (params = {}) => client.fetch<any>(queries.getGalleryItems, params),
};

export const fetchLoveLetters = async () => {
  return client.fetch(queries.loveLetters); // Ensure `queries.loveLetters` exists
};

export const fetchAlbums = async () => {
  return client.fetch(queries.albums, { identity: 'current-user' }); // Ensure `queries.albums` exists
};

export const fetchGalleryFeatured = async () => {
  return client.fetch(queries.galleryFeatured); // Ensure `queries.galleryFeatured` exists
};

export const fetchData = async (endpoint: string) => {
  switch (endpoint) {
    case '/api/love-letters':
      return fetchLoveLetters();
    case '/api/albums':
      return fetchAlbums();
    case '/api/gallery/featured':
      return fetchGalleryFeatured();
    default:
      throw new Error(`No data fetcher found for endpoint: ${endpoint}`);
  }
};
