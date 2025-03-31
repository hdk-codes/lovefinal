import { SanityDocument } from "./sanity";

export interface Snap extends SanityDocument {
  title: string;
  message: string;
  imageUrl?: string;
  media?: {
    asset: {
      _ref: string;
      url?: string;
    };
  };
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
