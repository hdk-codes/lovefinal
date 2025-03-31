export type AudioMood = 'romantic' | 'happy' | 'reflective' | 'playful' | 'missingYou';
export type VisualizerType = 'wave' | 'bars' | 'circle' | 'heart' | 'none';

export interface AudioReaction {
  emoji: string;
  count: number;
}

export interface MessageBackground {
  color: string;
  imageUrl: string;
  style: string;
}

export interface AudioMessage {
  _id: string;
  title: string;
  audioFile: {
    asset: {
      url: string;
      _ref: string;
    };
  };
  caption?: string;
  description?: string;
  mood: AudioMood;
  duration: number;
  isPrivate: boolean;
  backgroundMusic?: {
    asset: {
      url: string;
      _ref: string;
    };
  };
  visualizer: VisualizerType;
  scheduledFor?: string;
  transcript?: string;
  reactions: AudioReaction[];
  background?: MessageBackground;
  _createdAt: string;
}
