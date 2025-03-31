import { SanityDocument } from "@/types/sanity";

// Type definitions for Sanity schemas

export interface Album {
  _id: string;
  title: string;
  description?: string;
  items?: string[];
  coverImage?: string;
  isPrivate: boolean;
  sharedWith?: string[];
  itemsCount?: number;
  _createdAt?: string;
}

export interface GalleryItem {
  _id: string;
  title: string;
  description?: string;
  tags?: string[];
  date: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  mediaType: 'image' | 'video';
  isFavorite: boolean;
  reactions?: Reaction[];
  location?: {
    lat: number;
    lng: number;
  };
  loveNote?: string;
  views: number;
  category?: 'milestone' | 'everyday' | 'travel' | 'surprise';
  isPrivate: boolean;
  sharedWith?: string[];
}

export interface Reaction {
  emoji: string;
  count: number;
}

export interface AudioMessage {
  _id: string;
  title: string;
  audioUrl: string;
  caption?: string;
  description?: string;
  duration?: number;
  _createdAt: string;
}

export interface LoveLetter {
  _id: string;
  title: string;
  content: any; // Rich text content
  description?: string;
  theme?: {
    primaryColor: string;
    fontFamily: string;
    animation: string;
  };
  effects?: string[];
  letters?: LetterExchange[];
  privacy?: {
    isPrivate: boolean;
    password?: string;
  };
  scheduling?: {
    deliveryDate: string;
    reminder: boolean;
  };
  createdAt: string;
  animations?: {
    openingEffect: 'fold' | 'fade' | 'butterfly' | 'hearts';
    backgroundEffect: 'particles' | 'petals' | 'stars' | 'none';
  };
  isPrivate?: boolean; // Direct property for simpler use
}

export interface LetterExchange {
  author: 'me' | 'partner';
  content: any; // Rich text content
  mood?: 'romantic' | 'playful' | 'nostalgic' | 'passionate';
  attachments?: any[];
  reactions?: {
    emoji: string;
    timestamp: string;
  }[];
  createdAt: string;
}

export interface LandingPage {
  title: string;
  message: string;
}

export interface Snap extends SanityDocument {
  title: string;
  message: string;
  imageUrl?: string;
  duration?: number;
  createdAt: string;
  expiresAt?: string;
  isPrivate?: boolean;
  recipientId?: string;
  viewCount?: number;
  reactions?: {
    emoji: string;
    count: number;
  }[];
}

export interface SnapResponse {
  success: boolean;
  data?: Snap;
  error?: string;
}
