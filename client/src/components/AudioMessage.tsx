import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Mic, Play, Pause, Calendar, FastForward, Rewind, Volume2, Lock, AlertCircle, Loader2 } from "lucide-react";

interface Reaction {
  emoji: string;
  count: number;
}

interface Background {
  color?: string;
  imageUrl?: string;
  style?: string;
}

interface AudioMessageProps {
  id: string;
  title: string;
  description?: string | null;
  audioUrl: string;
  duration?: number | null;
  date?: string | null;
  backgroundMusic?: { url: string } | null;
  caption?: string | null;
  mood?: 'romantic' | 'happy' | 'reflective' | 'playful' | 'missingYou' | null;
  isPrivate?: boolean | null;
  visualizer?: 'wave' | 'bars' | 'circle' | 'heart' | 'none' | null;
  scheduledFor?: string | null;
  transcript?: string | null;
  reactions?: Reaction[] | null;
  background?: Background | null;
}

const AudioMessage = ({
  id,
  title,
  description = null,
  audioUrl,
  duration = 0,
  date = null,
  backgroundMusic = null,
  caption = null,
  mood = null,
  isPrivate = false,
  visualizer = 'wave',
  scheduledFor = null,
  transcript = null,
  reactions = null,
  background = null,
}: AudioMessageProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || 0);
  const [volume, setVolume] = useState(0.7);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bgMusicVolume, setBgMusicVolume] = useState(0.3);
  const [isHovered, setIsHovered] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const visualizerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Memoized computed values
  const formattedDate = useMemo(() => {
    if (!date) return "No date provided";
    try {
      return format(new Date(date), "MMMM d, yyyy");
    } catch (err) {
      console.warn("Invalid date format:", err);
      return "Invalid date";
    }
  }, [date]);

  const safeBackground = useMemo(() => ({
    color: background?.color || 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    imageUrl: background?.imageUrl || null,
    style: background?.style || '',
  }), [background]);

  const safeReactions = useMemo(() => 
    Array.isArray(reactions) ? reactions : [], 
  [reactions]);

  // Audio initialization with comprehensive error handling
  useEffect(() => {
    const initializeAudio = async () => {
      setIsLoading(true);
      setError(null);
      setIsBuffering(false);

      if (!audioUrl) {
        setError("No audio source provided");
        setIsLoading(false);
        return;
      }

      try {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.volume = Math.max(0, Math.min(1, volume));
        
        audio.addEventListener('loadedmetadata', () => {
          setAudioDuration(audio.duration || duration || 0);
          setIsLoading(false);
        }, { once: true });

        audio.addEventListener('waiting', () => setIsBuffering(true));
        audio.addEventListener('playing', () => setIsBuffering(false));
        audio.addEventListener('error', handleAudioError, { once: true });

        audio.addEventListener('timeupdate', () => {
          setCurrentTime(audio.currentTime);
        });

        audio.addEventListener('ended', handleAudioEnd);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to initialize audio");
        setIsLoading(false);
      }
    };

    initializeAudio();

    return () => cleanupResources();
  }, [audioUrl, duration, volume]);

  // Background music initialization
  useEffect(() => {
    if (!backgroundMusic?.url) return;

    try {
      const bgAudio = new Audio(backgroundMusic.url);
      bgAudio.loop = true;
      bgAudio.volume = Math.max(0, Math.min(1, bgMusicVolume));
      bgMusicRef.current = bgAudio;

      return () => {
        bgMusicRef.current?.pause();
        bgMusicRef.current = null;
      };
    } catch (err) {
      console.warn("Background music initialization failed:", err);
    }
  }, [backgroundMusic?.url, bgMusicVolume]);

  // Cleanup function
  const cleanupResources = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (bgMusicRef.current) {
      bgMusicRef.current.pause();
      bgMusicRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const handleAudioEnd = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    bgMusicRef.current?.pause();
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  }, []);

  const handleAudioError = (e: Event) => {
    const target = e.target as HTMLAudioElement;
    if (target.error) {
      console.error('Audio error:', target.error.message);
    }
  };

  const togglePlay = useCallback(async () => {
    if (!audioRef.current || isLoading || error) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        bgMusicRef.current?.pause();
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      } else {
        await Promise.all([
          audioRef.current.play().catch(err => { throw new Error(`Main audio: ${err.message}`); }),
          bgMusicRef.current?.play().catch(() => null) || Promise.resolve(),
        ]);
        animateVisualizer();
        animateProgress();
      }
      setIsPlaying(prev => !prev);
    } catch (err) {
      setError(err instanceof Error ? `Playback failed: ${err.message}` : "Playback error");
    }
  }, [isPlaying, isLoading, error]);

  const animateVisualizer = useCallback(() => {
    if (!visualizerRef.current || visualizer === 'none') return;

    const bars = visualizerRef.current.children;
    Array.from(bars).forEach((bar, i) => {
      const height = (Math.sin(Date.now() / 200 + i) + 1) * 12 + 4;
      (bar as HTMLElement).style.height = `${height}px`;
    });

    animationRef.current = requestAnimationFrame(animateVisualizer);
  }, [visualizer]);

  const animateProgress = useCallback(() => {
    if (!progressRef.current || !audioRef.current) return;
    const percent = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;
    progressRef.current.style.width = `${Math.min(100, percent)}%`;
    if (isPlaying) requestAnimationFrame(animateProgress);
  }, [currentTime, audioDuration, isPlaying]);

  const seek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !audioDuration || isLoading) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = percent * audioDuration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, [audioDuration, isLoading]);

  const skip = useCallback((seconds: number) => {
    if (!audioRef.current || !audioDuration) return;
    const newTime = Math.max(0, Math.min(audioDuration, audioRef.current.currentTime + seconds));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, [audioDuration]);

  const formatTime = useCallback((seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return (
    <motion.div
      className="audio-message-container relative overflow-hidden rounded-2xl shadow-2xl backdrop-blur-md"
      style={{
        background: safeBackground.color,
        backgroundImage: safeBackground.imageUrl ? `url(${safeBackground.imageUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      role="region"
      aria-label={`Audio message: ${title}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-800/30 bg-black/20">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <Mic size={18} className="text-white" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white truncate">{title || "Untitled"}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Calendar size={14} />
              <span>{formattedDate}</span>
              {isPrivate && <Lock size={14} className="text-indigo-400" />}
              {mood && (
                <span className="text-xs px-2 py-1 bg-indigo-500/20 rounded-full capitalize">
                  {mood}
                </span>
              )}
            </div>
            {description && (
              <p className="text-sm text-gray-400 mt-1 line-clamp-2">{description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Player */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          {error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 text-red-400 p-3 bg-red-900/20 rounded-lg"
              role="alert"
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </motion.div>
          ) : isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2 text-gray-300 py-4"
            >
              <Loader2 size={20} className="animate-spin" />
              <span>Loading audio...</span>
            </motion.div>
          ) : (
            <motion.div
              key="player"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Progress Bar */}
              <div
                className="relative h-2 bg-gray-800/50 rounded-full overflow-hidden cursor-pointer"
                onClick={seek}
                role="progressbar"
                aria-valuenow={currentTime}
                aria-valuemin={0}
                aria-valuemax={audioDuration}
                aria-label="Audio progress"
              >
                <motion.div
                  ref={progressRef}
                  className="absolute h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  initial={false}
                  transition={{ duration: 0.1 }}
                />
                {isBuffering && (
                  <motion.div
                    className="absolute inset-0 bg-gray-500/30"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  />
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <motion.button
                    onClick={() => skip(-10)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full"
                    aria-label="Rewind 10 seconds"
                  >
                    <Rewind size={20} />
                  </motion.button>

                  <motion.button
                    onClick={togglePlay}
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center relative overflow-hidden"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isBuffering}
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    <AnimatePresence mode="wait">
                      {isPlaying ? (
                        <motion.div
                          key="pause"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <Pause size={24} />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="play"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <Play size={24} className="ml-1" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {isBuffering && (
                      <motion.div
                        className="absolute inset-0 bg-black/30 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <Loader2 size={20} className="animate-spin" />
                      </motion.div>
                    )}
                  </motion.button>

                  <motion.button
                    onClick={() => skip(10)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full"
                    aria-label="Fast forward 10 seconds"
                  >
                    <FastForward size={20} />
                  </motion.button>
                </div>

                {/* Visualizer */}
                <motion.div
                  ref={visualizerRef}
                  className={`visualizer ${visualizer || 'wave'}`}
                  animate={isPlaying ? { opacity: 1, scale: 1 } : { opacity: 0.5, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  aria-hidden="true"
                >
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="bar" />
                  ))}
                </motion.div>

                {/* Time & Volume */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-300 tabular-nums">
                    {formatTime(currentTime)} / {formatTime(audioDuration)}
                  </span>
                  <motion.div
                    className="flex items-center gap-2 overflow-hidden"
                    animate={{ width: isHovered ? 'auto' : 0, opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Volume2 size={16} className="text-gray-300 flex-shrink-0" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-20 accent-indigo-500"
                      aria-label="Volume control"
                    />
                  </motion.div>
                </div>
              </div>

              {/* Additional Info */}
              {(backgroundMusic || safeReactions.length > 0 || caption) && (
                <motion.div
                  className="space-y-3"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {backgroundMusic && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Background Volume</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={bgMusicVolume}
                        onChange={(e) => setBgMusicVolume(parseFloat(e.target.value))}
                        className="w-24 accent-indigo-500"
                        aria-label="Background music volume"
                      />
                    </div>
                  )}

                  {safeReactions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {safeReactions.map((reaction, i) => (
                        <motion.span
                          key={i}
                          className="text-sm px-2 py-1 bg-gray-800/50 rounded-full flex items-center gap-1"
                          whileHover={{ scale: 1.05 }}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          {reaction.emoji} <span>{reaction.count}</span>
                        </motion.span>
                      ))}
                    </div>
                  )}

                  {caption && (
                    <p className="text-sm text-gray-300 italic">{caption}</p>
                  )}
                </motion.div>
              )}

              {transcript && (
                <motion.div
                  className="mt-2 p-2 bg-gray-800/30 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p className="text-xs text-gray-400">Transcript: {transcript}</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scheduled Info */}
      {scheduledFor && (
        <div className="p-2 text-center text-xs text-gray-400 bg-black/20">
          Scheduled for: {scheduledFor}
        </div>
      )}

      {/* Styles */}
      <style>
        {`
          .audio-message-container {
            max-width: 640px;
            margin: 0 auto;
            color: white;
            background-blend-mode: overlay;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          }
          /* ...rest of your styles... */
        `}
      </style>

      {/* Remove the jsx property from style tag */}
      <style>
        {`
          /* ...existing styles... */
        `}
      </style>

      <style>
        {`
        .audio-message-container {
          /* your styles here */
        }
        `}
      </style>

      <style>
        {`
        .audio-message-container {
          max-width: 640px;
          margin: 0 auto;
          color: white;
          background-blend-mode: overlay;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .visualizer {
          display: flex;
          align-items: flex-end;
          gap: 3px;
          height: 28px;
          width: 120px;
          overflow: hidden;
        }

        .bar {
          width: 4px;
          background: linear-gradient(to top, #6366f1, #a855f7);
          border-radius: 4px;
          transition: height 0.1s ease;
        }

        .wave .bar {
          animation: wave 1.5s ease infinite;
          animation-delay: calc(var(--i) * 0.1s);
        }

        .heart .bar {
          clip-path: path('M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z');
        }

        .circle .bar {
          border-radius: 50%;
          width: 6px;
        }

        .bars .bar {
          border-radius: 2px;
        }

        input[type=range] {
          -webkit-appearance: none;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          transition: all 0.2s ease;
        }

        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #a855f7;
          cursor: pointer;
          box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
        }

        input[type=range]:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        @keyframes wave {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }

        .visualizer .bar {
          --i: calc(var(--index));
        }

        :where(.visualizer .bar) {
          --index: 0;
        }

        .visualizer .bar:nth-child(1) { --index: 1; }
        .visualizer .bar:nth-child(2) { --index: 2; }
        .visualizer .bar:nth-child(3) { --index: 3; }
        .visualizer .bar:nth-child(4) { --index: 4; }
        .visualizer .bar:nth-child(5) { --index: 5; }
        .visualizer .bar:nth-child(6) { --index: 6; }
        .visualizer .bar:nth-child(7) { --index: 7; }
        .visualizer .bar:nth-child(8) { --index: 8; }
        .visualizer .bar:nth-child(9) { --index: 9; }
        .visualizer .bar:nth-child(10) { --index: 10; }
        .visualizer .bar:nth-child(11) { --index: 11; }
        .visualizer .bar:nth-child(12) { --index: 12; }
      `}</style>
    </motion.div>
  );
};

export default AudioMessage;