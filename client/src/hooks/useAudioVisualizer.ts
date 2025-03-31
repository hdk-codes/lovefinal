import { useRef, useEffect } from 'react';

interface VisualizerOptions {
  width: number;
  height: number;
  barWidth?: number;
  barSpacing?: number;
  barColor?: string;
  backgroundColor?: string;
  smoothingTimeConstant?: number;
  fftSize?: number;
}

export const useAudioVisualizer = (audio: HTMLAudioElement | null, options: VisualizerOptions) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const rafIdRef = useRef<number>(0);

  useEffect(() => {
    if (!audio) return;

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyzer = ctx.createAnalyser();
    const source = ctx.createMediaElementSource(audio);

    analyzer.connect(ctx.destination);
    source.connect(analyzer);
    analyzer.fftSize = options.fftSize || 2048;
    analyzer.smoothingTimeConstant = options.smoothingTimeConstant || 0.8;

    audioContextRef.current = ctx;
    sourceNodeRef.current = source;
    analyzerRef.current = analyzer;

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (audioContextRef.current?.state !== 'closed') {
        source.disconnect();
        analyzer.disconnect();
        ctx.close();
      }
    };
  }, [audio, options.fftSize, options.smoothingTimeConstant]);

  const drawVisualizer = (canvas: HTMLCanvasElement, isPlaying: boolean) => {
    if (!analyzerRef.current || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyzer = analyzerRef.current;
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      rafIdRef.current = requestAnimationFrame(draw);
      analyzer.getByteFrequencyData(dataArray);

      ctx.fillStyle = options.backgroundColor || 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = options.barWidth || 2;
      const barSpacing = options.barSpacing || 1;
      const totalWidth = (barWidth + barSpacing);
      const bars = Math.floor(canvas.width / totalWidth);

      ctx.fillStyle = options.barColor || '#ff69b4';

      for (let i = 0; i < bars; i++) {
        const percent = dataArray[i] / 255;
        const height = (canvas.height * percent) * 0.8;
        const x = i * totalWidth;
        const y = canvas.height - height;

        ctx.fillRect(x, y, barWidth, height);
      }
    };

    if (isPlaying) {
      draw();
    } else {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    }
  };

  return {
    drawVisualizer,
    audioContext: audioContextRef.current,
    analyzerNode: analyzerRef.current
  };
};
