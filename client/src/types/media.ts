export interface MediaRecorderErrorEvent extends Event {
  error: DOMException;
}

export type AudioMood = 'romantic' | 'happy' | 'reflective' | 'playful' | 'missingYou';
export type VisualizerType = 'wave' | 'bars' | 'circle' | 'heart' | 'none';
