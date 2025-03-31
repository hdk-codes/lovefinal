export type AudioMood = 'romantic' | 'happy' | 'missingYou' | 'reflective' | 'playful';

export type VisualizerType = 'wave' | 'bars' | 'heart';

export interface AudioMessage {
  _id: string;
  title: string;
  audioFile: {
    asset: {
      url: string;
      _ref: string;
    }
  };
  caption?: string;
  description?: string;
  mood?: AudioMood;
  duration?: number;
  isPrivate: boolean;
  visualizer: VisualizerType;
  background?: {
    color: string;
    imageUrl: string;
    style: string;
  };
  _createdAt: string;
  audioUrl?: string;
}

export interface AudioRecordingConfig {
  maxDuration?: number;
  mimeType?: string;
  audioBitsPerSecond?: number;
  sampleRate?: number;
  channelCount?: number;
}

export interface AudioVisualizerOptions {
  width: number;
  height: number;
  barWidth?: number;
  barSpacing?: number;
  barColor?: string;
  backgroundColor?: string;
  smoothingTimeConstant?: number;
  fftSize?: number;
}
