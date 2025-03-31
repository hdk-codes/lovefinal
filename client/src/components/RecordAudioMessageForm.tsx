import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from '@tanstack/react-query';
import { Mic, Square, Play, Pause, Trash, Heart, Sun, Moon } from 'lucide-react';
import { client } from "@/lib/sanity";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from 'framer-motion';
import type { AudioMood, VisualizerType } from '@/types/audio';

interface RecordAudioMessageFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const checkAudioSupport = async (): Promise<boolean> => {
  try {
    // First check if we have permission
    const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
    
    if (permissionStatus.state === 'denied') {
      throw new Error('Microphone permission denied');
    }

    // Initialize audio context first for iOS
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContext();
    await audioContext.resume();

    // Request permission explicitly
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (err) {
    console.error('Audio support check failed:', err);
    if ((err as Error).name === 'NotAllowedError' || (err as Error).message?.includes('permission')) {
      // Use function component state setter instead of global
      return false;
    }
    return false;
  }
};

const getSupportedMimeType = (): string => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  let types = [];
  
  if (isIOS) {
    types = [
      'audio/mp4',
      'audio/mp4;codecs=mp4a',
      'audio/aac',
      'audio/wav'
    ];
  } else if (isMobile) {
    types = [
      'audio/webm',
      'audio/mp4',
      'audio/aac',
      'audio/ogg',
      'audio/wav'
    ];
  } else {
    types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
      'audio/wav'
    ];
  }

  // First try with MediaRecorder.isTypeSupported
  let supportedType = types.find(type => {
    try {
      return MediaRecorder.isTypeSupported(type);
    } catch (e) {
      return false;
    }
  });

  // Fallback to a basic type if nothing is supported
  if (!supportedType) {
    supportedType = 'audio/wav';
    console.warn('Falling back to WAV format');
  }

  console.log('Selected MIME type:', supportedType);
  return supportedType;
};

export function RecordAudioMessageForm({ onSuccess, onCancel }: RecordAudioMessageFormProps) {
  const [title, setTitle] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [mood, setMood] = useState<AudioMood>('romantic');
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [visualizer, setVisualizer] = useState<VisualizerType>('wave');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [pitch, setPitch] = useState<number>(1);
  const [speed, setSpeed] = useState<number>(1);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);
  const maxDuration = 120;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isBrave = navigator.userAgent.includes('Brave');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const streamRef = useRef<MediaStream | null>(null);

  const { toast } = useToast();

  const moods: { label: string; value: AudioMood }[] = [
    { label: 'Romantic', value: 'romantic' },
    { label: 'Happy', value: 'happy' },
    { label: 'Missing You', value: 'missingYou' },
  ];

  const visualizers: { label: string; value: VisualizerType }[] = [
    { label: 'Wave', value: 'wave' },
    { label: 'Bars', value: 'bars' },
    { label: 'Heart', value: 'heart' },
  ];

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    setTheme(savedTheme || 'dark');
    return () => { isMountedRef.current = false; };
  }, []);

  const toggleTheme = (): void => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleError = (message: string, error: unknown): void => {
    if (!isMountedRef.current) return;
    console.error(message, error);
    setError(message);
    toast({ title: "Oops!", description: message, variant: "destructive" });
  };

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const blob = formData.get('audioFile') as Blob;
      const audioFile = new File([blob], `${title || 'recording'}.mp3`, { type: 'audio/mpeg' });
      const asset = await client.assets.upload('file', audioFile);
      if (!asset?._id) throw new Error('Asset upload failed');
      const doc = { 
        _type: 'audioMessage', 
        title, 
        audioFile: { _type: 'file', asset: { _type: 'reference', _ref: asset._id } }, 
        caption, 
        mood, 
        duration: recordingTime, 
        isPrivate, 
        visualizer, 
        pitch, 
        speed, 
        _createdAt: new Date().toISOString() 
      };
      return await client.create(doc);
    },
    onSuccess: () => {
      if (!isMountedRef.current) return;
      toast({ title: "Sent with Love!", description: "Your audio message is on its way!" });
      resetForm();
      onSuccess?.();
    },
    onError: (err) => handleError("Failed to send your love note", err),
  });

  useEffect(() => {
    audioRef.current = new Audio();
    const handleEnded = () => { if (isMountedRef.current) setIsPlaying(false); };
    audioRef.current.addEventListener('ended', handleEnded);
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('ended', handleEnded);
        audioRef.current.src = '';
        audioRef.current = null;
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (audioBlob && isMountedRef.current) {
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.playbackRate = speed;
      }
      drawWaveform();
      return () => {
        URL.revokeObjectURL(url);
        if (audioRef.current) audioRef.current.src = '';
      };
    }
  }, [audioBlob, speed]);

  useEffect(() => {
    const initAudio = async () => {
      try {
        // Request permission immediately on component mount
        if (isMobile) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop());
        }
        setIsSupported(true);
      } catch (err) {
        console.error('Audio init error:', err);
        if ((err as Error).name === 'NotAllowedError') {
          setPermissionDenied(true);
        } else {
          setIsSupported(false);
        }
      }
    };
    initAudio();
  }, []);

  const startRecording = async (): Promise<void> => {
    try {
      setError(null);
      setPermissionDenied(false);

      // Clean up any existing recordings first
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        audioChunksRef.current = [];
      }

      // Ensure stream is released
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Request permission with optimal constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        }
      });

      streamRef.current = stream;

      // Try to get supported MIME type
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      }

      const recorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: isMobile ? 32000 : 128000
      });

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.addEventListener('dataavailable', (e: BlobEvent) => {
        if (e.data.size > 0 && isMountedRef.current) {
          audioChunksRef.current.push(e.data);
        }
      });

      recorder.addEventListener('stop', () => {
        if (!isMountedRef.current) return;
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(audioBlob);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      });

      recorder.addEventListener('error', (event: Event) => {
        handleError('Recording failed', (event as MediaRecorderErrorEvent).error);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      });

      recorder.start(isMobile ? 1000 : 500);
      setIsRecording(true);

      // Start the timer
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => {
        if (isMountedRef.current) {
          setRecordingTime((prev) => {
            if (prev + 1 >= maxDuration) {
              stopRecording();
              return maxDuration;
            }
            return prev + 1;
          });
        }
      }, 1000);

    } catch (err: unknown) {
      console.error('Recording error:', err);
      const error = err as Error;
      
      if (error.name === 'NotAllowedError' || error.message?.includes('permission')) {
        setPermissionDenied(true);
        handleError("Microphone access needed. Please allow it in your settings.", err);
      } else {
        handleError(`Recording failed: ${error.message}`, err);
      }
      
      setIsRecording(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const stopRecording = (): void => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (isMountedRef.current) setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const togglePlayback = (): void => {
    if (!audioRef.current || !audioUrl || !isMountedRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((err) => handleError("Playback failed", err));
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetForm = (): void => {
    if (!isMountedRef.current) return;
    setTitle('');
    setCaption('');
    setMood('romantic');
    setIsPrivate(false);
    setVisualizer('wave');
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setError(null);
    setPitch(1);
    setSpeed(1);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!isMountedRef.current) return;
    
    // Only check for title if we have audio recording and permissions
    if (!audioBlob) return handleError("Record a sweet message first", null);
    if (permissionDenied) return handleError("Please allow microphone access first", null);
    if (!title) return handleError("Give your love note a title", null);
    
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      
      const finalBlob = isMobile ? 
        await convertAudioToCompatibleFormat(audioBlob) : 
        audioBlob;
      
      formData.append('audioFile', finalBlob);
      await uploadMutation.mutateAsync(formData);
    } catch (err) {
      handleError("Failed to process audio", err);
    } finally {
      if (isMountedRef.current) setIsSubmitting(false);
    }
  };

  // Add this new helper function
  const convertAudioToCompatibleFormat = async (blob: Blob): Promise<Blob> => {
    // For now, just return the original blob
    // In a future enhancement, you could add actual audio conversion here
    return blob;
  };

  const drawWaveform = async (): Promise<void> => {
    if (!canvasRef.current || !audioBlob || !isMountedRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const audioContext = new AudioContext();
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const data = audioBuffer.getChannelData(0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = theme === 'light' ? '#f472b6' : '#f9a8d4';
    ctx.lineWidth = 2;
    const step = Math.floor(data.length / canvas.width);
    const amp = canvas.height / 2;
    ctx.beginPath();
    for (let i = 0; i < canvas.width; i++) {
      const min = Math.min(...data.slice(i * step, (i + 1) * step));
      const max = Math.max(...data.slice(i * step, (i + 1) * step));
      const x = i;
      const y1 = amp + min * amp;
      const y2 = amp + max * amp;
      ctx.moveTo(x, y1);
      ctx.lineTo(x, y2);
    }
    ctx.stroke();
  };

  const requestMicrophonePermission = async (): Promise<void> => {
    try {
      // For iOS, we need user interaction
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContext();
        await audioContext.resume();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissionDenied(false);
      await startRecording();
    } catch (err) {
      setPermissionDenied(true);
      handleError("Please allow microphone access in your browser settings", err);
    }
  };

  const handleRecordButtonClick = async () => {
    if (isRecording) {
      stopRecording();
      return;
    }

    try {
      // Check microphone permission first
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      if (permissionStatus.state === 'denied') {
        setPermissionDenied(true);
        handleError("Please allow microphone access in your browser settings", null);
        return;
      }

      // For iOS, we need to handle the audio context first
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        try {
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          const audioContext = new AudioContext();
          await audioContext.resume();
        } catch (err) {
          console.error('iOS audio context error:', err);
        }
      }

      await startRecording();
    } catch (err) {
      if ((err as Error).name === 'NotAllowedError' || (err as Error).message?.includes('permission')) {
        setPermissionDenied(true);
        handleError("Microphone access needed. Please allow it in your settings.", err);
      } else {
        handleError("Failed to start recording", err);
      }
    }
  };

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Convert Float32Array to regular array before iteration
  const processAudioData = (audioData: Float32Array) => {
    const dataArray = Array.from(audioData);
    return dataArray.map((value) => Math.abs(value));
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={`w-full max-w-md mx-auto rounded-2xl shadow-lg p-4 ${
        theme === 'light' ? 'bg-rose-50 text-rose-900' : 'bg-red-950 text-rose-100'
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Heart size={20} fill={theme === 'light' ? '#f43f5e' : '#fda4af'} /> Whisper of Love
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="rounded-full"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </Button>
      </div>

      {!isSupported ? (
        <div className="p-4 text-center rounded-lg bg-red-100 dark:bg-red-900">
          <p className="text-sm text-red-600 dark:text-red-200">
            Audio recording is not supported on your device or browser. Try using Chrome or Safari.
          </p>
        </div>
      ) : permissionDenied ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 text-center rounded-lg bg-yellow-100 dark:bg-yellow-900"
        >
          <p className="text-sm text-yellow-600 dark:text-yellow-200 mb-2">
            Microphone access is blocked. Please enable it in your device settings:
            {isMobile ? " Settings > Apps > Browser > Permissions" : " Browser Settings > Microphone"}
          </p>
          <Button
            onClick={requestMicrophonePermission}
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            Try Again
          </Button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-2 rounded-lg text-sm ${
                  theme === 'light' ? 'bg-red-100 text-red-700' : 'bg-red-900 text-red-200'
                }`}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-3">
            <div>
              <Label className="text-sm">Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Heart’s Song"
                className={`text-sm rounded-lg ${
                  theme === 'light' ? 'bg-rose-100 border-rose-200' : 'bg-red-900 border-red-800'
                } focus:ring-2 focus:ring-rose-400`}
              />
            </div>
            <div>
              <Label className="text-sm">Caption</Label>
              <Input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="For You, Always"
                className={`text-sm rounded-lg ${
                  theme === 'light' ? 'bg-rose-100 border-rose-200' : 'bg-red-900 border-red-800'
                } focus:ring-2 focus:ring-rose-400`}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs">Mood</Label>
              <Select value={mood} onValueChange={(value: AudioMood) => setMood(value)}>
                <SelectTrigger className={`text-sm ${theme === 'light' ? 'bg-rose-100' : 'bg-red-900'}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {moods.map(({ label, value }) => (
                    <SelectItem key={value} value={value} className="text-sm">{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Visualizer</Label>
              <Select value={visualizer} onValueChange={(value: VisualizerType) => setVisualizer(value)}>
                <SelectTrigger className={`text-sm ${theme === 'light' ? 'bg-rose-100' : 'bg-red-900'}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {visualizers.map(({ label, value }) => (
                    <SelectItem key={value} value={value} className="text-sm">{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between bg-opacity-50 p-2 rounded-lg">
              <Label className="text-xs">Private</Label>
              <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Pitch ({pitch.toFixed(1)}x)</Label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
                className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${
                  theme === 'light' ? 'bg-rose-200' : 'bg-rose-800'
                }`}
              />
            </div>
            <div>
              <Label className="text-xs">Speed ({speed.toFixed(1)}x)</Label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${
                  theme === 'light' ? 'bg-rose-200' : 'bg-rose-800'
                }`}
              />
            </div>
          </div>

          <motion.div
            className={`p-3 rounded-xl ${
              theme === 'light' ? 'bg-rose-100' : 'bg-gradient-to-br from-red-900 to-rose-950'
            }`}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-center text-sm mb-2">
              {isRecording
                ? `${formatTime(recordingTime)} / ${formatTime(maxDuration)}`
                : audioBlob
                ? `${formatTime(recordingTime)}`
                : "Speak Your Love"}
            </p>
            {audioBlob && (
              <canvas
                ref={canvasRef}
                width={300}
                height={60}
                className="w-full mb-3 rounded-md"
                aria-label="Audio waveform"
              />
            )}
            <div className="flex justify-center gap-3">
              {!audioBlob ? (
                <motion.div whileTap={{ scale: 0.9 }}>
                  <Button
                    onClick={handleRecordButtonClick}
                    className={`rounded-full w-12 h-12 flex items-center justify-center shadow-md ${
                      isRecording
                        ? theme === 'light' ? 'bg-rose-500' : 'bg-rose-700'
                        : theme === 'light' ? 'bg-red-400' : 'bg-red-600'
                    }`}
                    aria-label={isRecording ? 'Stop' : 'Record'}
                  >
                    {isRecording ? <Square size={20} /> : <Mic size={20} />}
                  </Button>
                </motion.div>
              ) : (
                <>
                  <motion.div whileTap={{ scale: 0.9 }}>
                    <Button
                      onClick={togglePlayback}
                      className={`rounded-full w-10 h-10 flex items-center justify-center shadow-md ${
                        theme === 'light' ? 'bg-rose-200 text-rose-700' : 'bg-rose-800 text-rose-200'
                      }`}
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    </Button>
                  </motion.div>
                  <motion.div whileTap={{ scale: 0.9 }}>
                    <Button
                      onClick={() => setAudioBlob(null)}
                      className="rounded-full w-10 h-10 flex items-center justify-center shadow-md bg-red-500 text-white"
                      aria-label="Discard"
                    >
                      <Trash size={18} />
                    </Button>
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>

          <motion.div
            className="flex justify-end gap-2 mt-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              variant="ghost"
              onClick={onCancel}
              className={theme === 'light' ? 'text-rose-700' : 'text-rose-300'}
              aria-label="Cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !audioBlob}
              className={`rounded-full px-6 ${
                theme === 'light'
                  ? 'bg-gradient-to-r from-red-400 to-rose-500'
                  : 'bg-gradient-to-r from-red-600 to-rose-700'
              } shadow-lg`}
              aria-label="Send"
            >
              {isSubmitting ? 'Sending...' : 'Send Love'}
            </Button>
          </motion.div>
        </form>
      )}
    </motion.div>
  );
}

export default RecordAudioMessageForm;

interface MediaRecorderErrorEvent extends Event {
  error: DOMException;
}