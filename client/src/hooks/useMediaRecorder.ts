import { useState, useRef, useCallback, useEffect } from 'react';
import { MediaRecorderErrorEvent } from '../types/media';

interface MediaRecorderConfig {
  mimeType?: string;
  audioBitsPerSecond?: number;
  timeslice?: number;
}

interface MediaRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  error: Error | null;
}

export const useMediaRecorder = (config: MediaRecorderConfig = {}) => {
  const [state, setState] = useState<MediaRecorderState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    error: null,
  });

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const stream = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    if (stream.current) {
      stream.current.getTracks().forEach(track => track.stop());
    }
    if (mediaRecorder.current) {
      if (mediaRecorder.current.state !== 'inactive') {
        mediaRecorder.current.stop();
      }
    }
    chunks.current = [];
  }, []);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  const startRecording = useCallback(async () => {
    try {
      cleanup();
      chunks.current = [];

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      stream.current = mediaStream;
      const recorder = new MediaRecorder(mediaStream, {
        mimeType: config.mimeType || 'audio/webm;codecs=opus',
        audioBitsPerSecond: config.audioBitsPerSecond || 128000
      });

      recorder.addEventListener('dataavailable', (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      });

      recorder.addEventListener('stop', () => {
        setState(prev => ({ ...prev, isRecording: false }));
      });

      recorder.addEventListener('error', (event: Event) => {
        setState(prev => ({
          ...prev,
          error: (event as MediaRecorderErrorEvent).error
        }));
      });

      mediaRecorder.current = recorder;
      recorder.start(config.timeslice || 1000);

      setState(prev => ({
        ...prev,
        isRecording: true,
        error: null,
        duration: 0
      }));

      timerRef.current = window.setInterval(() => {
        setState(prev => ({
          ...prev,
          duration: prev.duration + 1
        }));
      }, 1000);

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as Error
      }));
    }
  }, [config]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current?.state === 'recording') {
      mediaRecorder.current.stop();
      cleanup();
      const blob = new Blob(chunks.current, {
        type: config.mimeType || 'audio/webm;codecs=opus'
      });
      return blob;
    }
    return null;
  }, [config.mimeType, cleanup]);

  return {
    ...state,
    startRecording,
    stopRecording,
    getBlob: () => new Blob(chunks.current, { type: config.mimeType }),
    clearRecording: cleanup
  };
};
