import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import groq from 'groq';

// Add groq export
export { groq };

if (!import.meta.env.VITE_SANITY_PROJECT_ID) {
  throw new Error('Missing VITE_SANITY_PROJECT_ID environment variable');
}

// Simplified client configuration
export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2023-05-03',
  token: import.meta.env.VITE_SANITY_TOKEN,
  useCdn: false
});

// Simplified query helper
export async function fetchSanityQuery<T>(query: string, params = {}): Promise<T> {
  return client.fetch(query, params);
}

export const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
}

// Add this utility function
export async function uploadAudioToSanity(audioFile: File) {
  try {
    return await client.assets.upload('file', audioFile, {
      contentType: audioFile.type,
      filename: audioFile.name
    });
  } catch (error) {
    console.error('Sanity upload error:', error);
    throw new Error('Failed to upload audio file to Sanity');
  }
}

// Queries
export const getLettersQuery = `*[_type == "loveLetter"] | order(createdAt desc) {
  _id,
  title,
  content,
  theme,
  effects,
  createdAt,
  "author": author->name,
  "coverImage": theme.primaryColor
}`;

export const getAlbumsQuery = `*[_type == "album" && !isPrivate || sharedWith[0] == $identity] | order(_createdAt desc) {
  _id,
  title,
  description,
  "coverImage": coverImage.asset->url,
  "itemsCount": count(items),
  isPrivate
}`;

export const getGalleryItemsQuery = `*[_type == "galleryItem" && !isPrivate || sharedWith[0] == $identity] | order(date desc) {
  _id,
  title,
  description,
  date,
  mediaType,
  "mediaUrl": media.asset->url,
  "thumbnailUrl": thumbnail.asset->url,
  isFavorite,
  reactions,
  views,
  category
}`;

export const getLandingPageQuery = `*[_type == "landing"][0] {
  title,
  message
}`;

// Update the audio messages query to include all fields
export const getAudioMessagesQuery = `*[_type == "audioMessage"] | order(_createdAt desc) {
  _id,
  title,
  audioFile {
    asset-> {
      url,
      _id,
      _ref
    }
  },
  caption,
  description,
  mood,
  duration,
  isPrivate,
  visualizer,
  reactions,
  background,
  _createdAt
}`;

export const getFeaturedItemsQuery = `*[_type == "galleryItem" && isFavorite == true] | order(views desc) [0...4] {
  _id,
  title,
  "mediaUrl": media.asset->url,
  "thumbnailUrl": thumbnail.asset->url,
  reactions
}`;

// Additional queries for enhanced features

// Get a single love letter by ID
export const getLoveLetterByIdQuery = `*[_type == "loveLetter" && _id == $id][0] {
  _id,
  title,
  content,
  theme,
  effects,
  createdAt,
  "author": author->name,
  "coverImage": theme.primaryColor,
  privacy,
  scheduling,
  animations,
  letters
}`;

// Get album with all its items
export const getAlbumWithItemsQuery = `*[_type == "album" && _id == $id][0] {
  ...,
  "coverImage": coverImage.asset->url,
  "items": *[_type == "galleryItem" && references($id)] {
    _id,
    title,
    description,
    date,
    mediaType,
    "mediaUrl": media.asset->url,
    "thumbnailUrl": thumbnail.asset->url,
    isFavorite,
    reactions,
    views,
    category,
    tags
  }
}`;

// Get gallery items by tag
export const getGalleryItemsByTagQuery = `*[_type == "galleryItem" && $tag in tags] | order(date desc) {
  _id,
  title,
  description,
  date,
  mediaType,
  "mediaUrl": media.asset->url,
  "thumbnailUrl": thumbnail.asset->url,
  isFavorite,
  reactions,
  views,
  category,
  tags
}`;

// Get a single audio message
export const getAudioMessageByIdQuery = `*[_type == "audioMessage" && _id == $id][0] {
  _id,
  title,
  "audioUrl": audioFile.asset->url,
  caption,
  description,
  duration,
  _createdAt,
  mood,
  visualizer,
  transcript,
  background
}`;

// Get birthday cards
export const getBirthdayCardsQuery = `*[_type == "birthdayCard"] | order(_createdAt desc) {
  _id,
  title,
  messages,
  "images": images[] {
    "url": asset->url,
    alt,
    caption
  },
  background,
  createdAt
}`;

// Search across content types
export const searchContentQuery = `*[
  _type in ["loveLetter", "album", "galleryItem", "audioMessage"] &&
  (title match $query || description match $query)
] | order(_createdAt desc) {
  _id,
  _type,
  title,
  description,
  ... _type == "galleryItem" => {
    "mediaUrl": media.asset->url,
    date,
    category
  },
  ... _type == "album" => {
    "coverImage": coverImage.asset->url,
    "itemsCount": count(items)
  },
  ... _type == "loveLetter" => {
    createdAt,
    "coverColor": theme.primaryColor
  },
  ... _type == "audioMessage" => {
    "audioUrl": audioFile.asset->url,
    duration,
    _createdAt
  }
}`;

// Recent content across all types
export const getRecentContentQuery = `{
  "loveLetters": *[_type == "loveLetter"] | order(_createdAt desc)[0...5] {
    _id,
    title,
    content,
    theme,
    createdAt
  },
  "albums": *[_type == "album"] | order(_createdAt desc)[0...5] {
    _id,
    title,
    description,
    "coverImage": coverImage.asset->url,
    "itemsCount": count(items)
  },
  "galleryItems": *[_type == "galleryItem"] | order(date desc)[0...5] {
    _id,
    title,
    "mediaUrl": media.asset->url,
    date,
    category
  },
  "audioMessages": *[_type == "audioMessage"] | order(_createdAt desc)[0...5] {
    _id,
    title,
    "audioUrl": audioFile.asset->url,
    duration,
    _createdAt
  }
}`;
