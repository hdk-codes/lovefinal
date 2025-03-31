import { client } from './sanity';
import groq from 'groq';

export const queries = {
  // Messages and content
  getLetters: groq`*[_type == "letter"] | order(_createdAt desc)`,
  getRecentContent: groq`*[_type in ["letter", "audioMessage", "photo"]] | order(_createdAt desc)[0...10]`,
  getAudioMessages: groq`*[_type == "audioMessage"] | order(_createdAt desc)`,
  
  // Static content
  getLandingPage: groq`*[_type == "landingPage"][0]`,
  getFeaturedItems: groq`*[_type == "featuredItem"] | order(priority desc)`,
  
  // Collection queries
  getAlbums: groq`*[_type == "album"] | order(_createdAt desc)`,
  getGalleryItems: groq`*[_type == "galleryItem"] | order(_createdAt desc)`,

  // Legacy queries (for compatibility)
  loveLetters: groq`*[_type == "letter"] | order(_createdAt desc)`,
  albums: groq`*[_type == "album"] | order(_createdAt desc)`,
  galleryFeatured: groq`*[_type == "galleryItem" && featured == true] | order(_createdAt desc)[0...6]`
};

export const queryFns = {
  getLoveLetters: async () => {
    return client.fetch(queries.loveLetters);
  },
  
  getAlbums: async () => {
    return client.fetch(queries.albums, { identity: 'current-user' });
  },
  
  getFeaturedGalleryItems: async () => {
    return client.fetch(queries.galleryFeatured);
  }
};
