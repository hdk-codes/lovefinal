import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
// import { SparklesCore } from './ui/sparkles';
import { HoverBorderGradient } from './ui/hover-border-gradient';
import { MeteorEffect } from './ui/meteor-effect';
import { LampContainer } from './ui/lamp';
import { WavyBackground } from './ui/wavy-background';

import {
  Mic,
  Play,
  Pause,
  Download,
  Camera,
  ChevronRight,
  Eraser,
  Palette,
  Wand2,
  FileImage,
  Share,
  Save,
  Trash2,
  Check
} from 'lucide-react';

import {
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Tooltip,
  Typography,
  Zoom,
  Grid,
  Chip,
  Stack,
  IconButton,
  Slider as MuiSlider
} from '@mui/material';

import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeProvider';
import html2canvas from 'html2canvas';

interface AudioProcessorProps {
  audioUrl?: string;
  onThumbnailGenerated?: (imageUrl: string, metadata: any) => void;
  isDarkMode?: boolean;
}

// List of background patterns for thumbnails
const backgroundPatterns = [
  {
    name: 'waves',
    colors: ['#FF6B6B', '#800000'],
    pattern: 'radial-gradient(circle at center, var(--color1) 0%, var(--color2) 70%)',
  },
  {
    name: 'stripes',
    colors: ['#7B68EE', '#4B0082'],
    pattern: 'repeating-linear-gradient(45deg, var(--color1), var(--color1) 10px, var(--color2) 10px, var(--color2) 20px)',
  },
  {
    name: 'dots',
    colors: ['#00CED1', '#008B8B'],
    pattern: 'radial-gradient(circle at 20% 20%, var(--color1) 0%, var(--color1) 2px, transparent 2px), radial-gradient(circle at 80% 40%, var(--color2) 0%, var(--color2) 2px, transparent 2px), radial-gradient(circle at 40% 60%, var(--color1) 0%, var(--color1) 2px, transparent 2px), radial-gradient(circle at 60% 80%, var(--color2) 0%, var(--color2) 2px, transparent 2px)',
  },
  {
    name: 'circuit',
    colors: ['#FF8C00', '#FF4500'],
    pattern: 'linear-gradient(135deg, var(--color1) 0%, var(--color2) 100%)',
  },
  {
    name: 'geometric',
    colors: ['#9370DB', '#4B0082'],
    pattern: 'linear-gradient(45deg, var(--color1) 25%, transparent 25%), linear-gradient(-45deg, var(--color1) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--color1) 75%), linear-gradient(-45deg, transparent 75%, var(--color1) 75%)',
  }
];

// Audio shapes that can be used in the thumbnail
const audioShapes = [
  'waveform',
  'circle',
  'bars',
  'spectrum',
  'spiral'
];

// Generate waveform points for visualization
const generateWaveformData = (count: number) => {
  return Array.from({ length: count }, () => Math.random() * 100);
};

const generateRandomGradient = () => {
  const colors = [
    '#FF6B6B', '#800000', '#7B68EE', '#4B0082', 
    '#00CED1', '#008B8B', '#FF8C00', '#FF4500',
    '#9370DB', '#4B0082', '#FFD700', '#FFA500'
  ];
  
  const color1 = colors[Math.floor(Math.random() * colors.length)];
  let color2 = colors[Math.floor(Math.random() * colors.length)];
  
  // Ensure the second color is different from the first
  while (color2 === color1) {
    color2 = colors[Math.floor(Math.random() * colors.length)];
  }
  
  return [color1, color2];
};

const AudioThumbnailCreator: React.FC<AudioProcessorProps> = ({
  audioUrl = '',
  onThumbnailGenerated,
  isDarkMode = false
}) => {
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [thumbnailImage, setThumbnailImage] = useState<string | null>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [selectedPattern, setSelectedPattern] = useState(0);
  const [selectedShape, setSelectedShape] = useState('waveform');
  const [colorPalette, setColorPalette] = useState<string[]>(['#FF6B6B', '#800000']);
  const [title, setTitle] = useState('My Audio');
  const [imageScale, setImageScale] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number>(0);
  const thumbnailRef = useRef<HTMLDivElement>(null);
  
  const { theme } = useTheme();
  const isDark = isDarkMode || theme === 'dark';

  useEffect(() => {
    // Initialize audio context and waveform data
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    setAudioContext(context);
    
    // Generate initial random waveform data for visualization
    setWaveformData(generateWaveformData(60));
    
    // Set up the audio element
    if (audioUrl) {
      loadAudio(audioUrl);
    }
    
    return () => {
      if (audioContext) {
        audioContext.close();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioUrl]);
  
  const loadAudio = async (url: string) => {
    setIsLoading(true);
    try {
      if (!audioContext) return;
      
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const decodedData = await audioContext.decodeAudioData(arrayBuffer);
      
      setAudioBuffer(decodedData);
      setDuration(decodedData.duration);
      
      // Create actual waveform data from the audio buffer
      const channelData = decodedData.getChannelData(0);
      const dataPoints = 60;
      const blockSize = Math.floor(channelData.length / dataPoints);
      const waveform = [];
      
      for (let i = 0; i < dataPoints; i++) {
        const start = blockSize * i;
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(channelData[start + j]);
        }
        const average = sum / blockSize;
        waveform.push(average * 100);
      }
      
      setWaveformData(waveform);
      
      // Set up audio element
      if (!audioRef.current) {
        audioRef.current = new Audio(url);
        audioRef.current.addEventListener('timeupdate', updateProgress);
        audioRef.current.addEventListener('ended', () => setIsPlaying(false));
      } else {
        audioRef.current.src = url;
      }
      
    } catch (error) {
      console.error('Error loading audio:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateProgress = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };
  
  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };
  
  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    
    const seekTime = value[0];
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const randomizeColors = () => {
    const [color1, color2] = generateRandomGradient();
    setColorPalette([color1, color2]);
  };
  
  const handleBackgroundImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setBackgroundImage(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const clearBackgroundImage = () => {
    setBackgroundImage(null);
  };
  
  const generateThumbnail = async () => {
    if (!thumbnailRef.current) return;
    
    setIsLoading(true);
    
    try {
      const canvas = await html2canvas(thumbnailRef.current, { 
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true
      });
      
      const imageUrl = canvas.toDataURL('image/png');
      setThumbnailImage(imageUrl);
      
      if (onThumbnailGenerated) {
        onThumbnailGenerated(imageUrl, {
          title,
          pattern: backgroundPatterns[selectedPattern].name,
          shape: selectedShape,
          colors: colorPalette,
          waveform: waveformData
        });
      }
    } catch (error) {
      console.error('Error generating thumbnail:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const downloadThumbnail = () => {
    if (!thumbnailImage) return;
    
    const link = document.createElement('a');
    link.href = thumbnailImage;
    link.download = `${title.replace(/\s+/g, '-').toLowerCase()}-thumbnail.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const renderAudioShape = () => {
    if (selectedShape === 'waveform') {
      return (
        <div className="flex items-end h-16 gap-[2px] px-2 w-full">
          {waveformData.map((height, i) => {
            const progressPercent = (currentTime / duration) * 100;
            const isActive = (i / waveformData.length) * 100 <= progressPercent;
            
            return (
              <motion.div
                key={i}
                className={cn(
                  "rounded-full",
                  isActive
                    ? "bg-gradient-to-t"
                    : isDark
                    ? "bg-[#4A4A4A]"
                    : "bg-[#E6D9F2]"
                )}
                animate={{
                  height: `${Math.max(height * 0.7, 5)}%`,
                }}
                style={{ 
                  minHeight: 4, 
                  width: i % 3 === 0 ? 3 : 2,
                  background: isActive 
                    ? `linear-gradient(to top, ${colorPalette[0]}, ${colorPalette[1]})` 
                    : undefined,
                }}
              />
            );
          })}
        </div>
      );
    }
    
    if (selectedShape === 'circle') {
      return (
        <div className="h-24 flex items-center justify-center relative">
          <div className="relative">
            {waveformData.map((point, i) => {
              const angle = (i / waveformData.length) * 360;
              const size = ((point / 100) * 15) + 5;
              const distance = 30 + ((point / 100) * 10);
              const x = Math.cos(angle * (Math.PI / 180)) * distance;
              const y = Math.sin(angle * (Math.PI / 180)) * distance;
              const progressPercent = (currentTime / duration) * 100;
              const isActive = (i / waveformData.length) * 100 <= progressPercent;
              
              return (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: size,
                    height: size,
                    transform: `translate(${x}px, ${y}px)`,
                    background: isActive ? colorPalette[0] : isDark ? "#4A4A4A" : "#E6D9F2",
                    boxShadow: isActive ? `0 0 10px ${colorPalette[0]}` : "none",
                    opacity: isActive ? 0.9 : 0.4,
                    left: 0,
                    top: 0,
                    marginLeft: -size/2,
                    marginTop: -size/2,
                  }}
                />
              );
            })}
            
            {/* Center circle */}
            <div
              className="absolute rounded-full left-0 top-0"
              style={{ 
                width: 20, 
                height: 20, 
                background: `radial-gradient(circle, ${colorPalette[0]} 0%, ${colorPalette[1]} 100%)`,
                boxShadow: `0 0 20px ${colorPalette[0]}`,
                left: 0,
                top: 0,
                marginLeft: -10,
                marginTop: -10,
              }}
            />
          </div>
        </div>
      );
    }
    
    if (selectedShape === 'bars') {
      return (
        <div className="flex items-center justify-center h-16 gap-[4px] px-2 w-full">
          {waveformData.slice(0, 20).map((height, i) => {
            const progressPercent = (currentTime / duration) * 100;
            const isActive = (i / 20) * 100 <= progressPercent;
            
            return (
              <motion.div
                key={i}
                className={cn(
                  "rounded-sm w-3",
                  isActive
                    ? "bg-gradient-to-t"
                    : isDark
                    ? "bg-[#4A4A4A]"
                    : "bg-[#E6D9F2]"
                )}
                animate={{
                  height: `${Math.max(height * 0.5, 10)}%`,
                }}
                style={{ 
                  minHeight: 10, 
                  background: isActive 
                    ? `linear-gradient(to top, ${colorPalette[0]}, ${colorPalette[1]})` 
                    : undefined,
                }}
              />
            );
          })}
        </div>
      );
    }
    
    if (selectedShape === 'spectrum') {
      return (
        <div className="h-16 relative overflow-hidden">
          <svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 800 100" 
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={colorPalette[0]} />
                <stop offset="100%" stopColor={colorPalette[1]} />
              </linearGradient>
            </defs>
            
            <path
              d={`M 0,50 ${waveformData.map((p, i) => {
                const x = (i / (waveformData.length - 1)) * 800;
                const y = 50 - (p / 100) * 40;
                return `L ${x},${y}`;
              }).join(" ")} L 800,50 L 800,100 L 0,100 Z`}
              fill="url(#waveGradient)"
            />
            
            <path
              d={`M 0,50 ${waveformData.map((p, i) => {
                const x = (i / (waveformData.length - 1)) * 800;
                const y = 50 + (p / 100) * 40;
                return `L ${x},${y}`;
              }).join(" ")} L 800,50 L 800,100 L 0,100 Z`}
              fill="url(#waveGradient)"
              fillOpacity="0.5"
            />
            
            {/* Progress overlay */}
            <rect
              x="0"
              y="0"
              width={`${(currentTime / duration) * 100}%`}
              height="100"
              fill="url(#waveGradient)"
              fillOpacity="0.15"
            />
          </svg>
        </div>
      );
    }
    
    if (selectedShape === 'spiral') {
      return (
        <div className="h-24 flex items-center justify-center relative">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* <SparklesCore
              id="spiralSparks"
              background="transparent"
              minSize={0.6}
              maxSize={1.4}
              particleDensity={30}
              className="w-full h-full"
              particleColor={colorPalette[0]}
              speed={0.5}
            /> */}
            
            <div className="relative w-24 h-24">
              {Array.from({ length: 5 }).map((_, ringIndex) => (
                <div
                  key={`ring-${ringIndex}`}
                  className="absolute rounded-full"
                  style={{
                    border: `2px solid ${colorPalette[ringIndex % 2]}`,
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: `${(ringIndex + 1) * 20}%`,
                    height: `${(ringIndex + 1) * 20}%`,
                    opacity: 0.7 - (ringIndex * 0.1),
                    boxShadow: `0 0 15px ${colorPalette[ringIndex % 2]}`,
                  }}
                />
              ))}
              
              <div 
                className="absolute left-1/2 top-1/2 w-4 h-4 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  background: `radial-gradient(circle, ${colorPalette[0]} 0%, ${colorPalette[1]} 100%)`,
                  boxShadow: `0 0 10px ${colorPalette[0]}`,
                }}
              />
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  const getBackgroundStyle = () => {
    if (backgroundImage) {
      return {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: `brightness(${brightness}%) contrast(${contrast}%)`,
      };
    }
    
    const pattern = backgroundPatterns[selectedPattern];
    const style = pattern.pattern
      .replace('var(--color1)', colorPalette[0])
      .replace('var(--color2)', colorPalette[1]);
    
    return {
      background: style,
      filter: `brightness(${brightness}%) contrast(${contrast}%)`,
    };
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Audio Player Control */}
      {audioUrl && (
        <HoverBorderGradient
          containerClassName="p-[1px] rounded-xl"
          className={cn(
            "p-4 rounded-xl",
            isDark ? "bg-[#1A0F2A]/90" : "bg-white/90",
            "backdrop-blur-md"
          )}
        >
          <div className="mb-4">
            <Typography variant="h6" className={isDark ? "text-[#E6D9F2]" : "text-[#4A4A4A]"}>
              Preview Audio
            </Typography>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              size="icon"
              className={cn(
                "rounded-full",
                "bg-gradient-to-r",
                isDark 
                  ? "from-[#FF6B6B] to-[#800000] text-white" 
                  : "from-[#800000] to-[#FF6B6B] text-white"
              )}
              onClick={togglePlayback}
              disabled={isLoading}
            >
              {isLoading ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : isPlaying ? (
                <Pause size={18} />
              ) : (
                <Play size={18} />
              )}
            </Button>
            
            <div className="flex-1">
              <Slider
                value={[currentTime]}
                max={duration}
                step={0.01}
                onValueChange={handleSeek}
                disabled={isLoading || duration === 0}
                className={isDark ? "accent-[#FF6B6B]" : "accent-[#800000]"}
              />
              <div className="flex justify-between mt-1">
                <Typography variant="caption" className={isDark ? "text-[#E6D9F2]/70" : "text-[#4A4A4A]/70"}>
                  {formatTime(currentTime)}
                </Typography>
                <Typography variant="caption" className={isDark ? "text-[#E6D9F2]/70" : "text-[#4A4A4A]/70"}>
                  {formatTime(duration)}
                </Typography>
              </div>
            </div>
          </div>
        </HoverBorderGradient>
      )}
      
      {/* Thumbnail Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Thumbnail Preview */}
        <div>
          <HoverBorderGradient
            containerClassName="p-[1px] rounded-xl"
            className={cn(
              "p-4 rounded-xl",
              isDark ? "bg-[#1A0F2A]/90" : "bg-white/90",
              "backdrop-blur-md"
            )}
          >
            <div className="mb-4 flex justify-between items-center">
              <Typography variant="h6" className={isDark ? "text-[#E6D9F2]" : "text-[#4A4A4A]"}>
                Thumbnail Preview
              </Typography>
              
              <div className="flex gap-2">
                <Tooltip title="Download Thumbnail">
                  <IconButton
                    size="small"
                    onClick={downloadThumbnail}
                    disabled={!thumbnailImage}
                    className={cn(
                      isDark ? "text-[#E6D9F2]" : "text-[#4A4A4A]",
                      "hover:text-[#FF6B6B]"
                    )}
                  >
                    <Download size={16} />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Share Thumbnail">
                  <IconButton
                    size="small"
                    disabled={!thumbnailImage}
                    className={cn(
                      isDark ? "text-[#E6D9F2]" : "text-[#4A4A4A]",
                      "hover:text-[#FF6B6B]"
                    )}
                  >
                    <Share size={16} />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
            
            {/* Thumbnail Preview */}
            <div className="relative">
              <div 
                ref={thumbnailRef}
                className="relative overflow-hidden rounded-lg shadow-lg"
                style={{ 
                  width: '100%',
                  height: 280,
                  transform: `scale(${imageScale})`,
                  transformOrigin: 'center',
                  transition: 'transform 0.3s ease',
                }}
              >
                {/* Background */}
                <div 
                  className="absolute inset-0 z-0"
                  style={getBackgroundStyle()}
                />
                
                {/* Content */}
                <div className="absolute inset-0 z-10 flex flex-col justify-between p-4">
                  {/* Title */}
                  <div className="mb-3">
                    <Typography 
                      variant="h5" 
                      className="font-bold text-white drop-shadow-lg"
                      style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                    >
                      {title}
                    </Typography>
                  </div>
                  
                  {/* Audio visualization */}
                  <div className="flex-1 flex items-center justify-center">
                    {renderAudioShape()}
                  </div>
                  
                  {/* Audio info bar */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="bg-black/30 backdrop-blur-sm px-3 py-1 rounded-lg">
                      <Typography variant="caption" className="text-white">
                        {formatTime(duration)}
                      </Typography>
                    </div>
                    
                    <div className="flex gap-1">
                      <Chip 
                        label="Audio"
                        size="small"
                        sx={{
                          background: `${colorPalette[0]}80`,
                          color: 'white',
                          backdropFilter: 'blur(4px)',
                          '& .MuiChip-label': { px: 1, fontSize: '0.65rem' }
                        }}
                      />
                      
                      {selectedShape === 'waveform' && (
                        <Chip 
                          label="Waveform"
                          size="small"
                          sx={{
                            background: `${colorPalette[1]}80`,
                            color: 'white',
                            backdropFilter: 'blur(4px)',
                            '& .MuiChip-label': { px: 1, fontSize: '0.65rem' }
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Generated thumbnail preview */}
              {thumbnailImage && (
                <Zoom in={!!thumbnailImage}>
                  <div className="mt-4">
                    <Paper
                      elevation={3}
                      className="p-2 bg-black/5 backdrop-blur-sm"
                    >
                      <Typography 
                        variant="caption" 
                        className={isDark ? "text-[#E6D9F2]" : "text-[#4A4A4A]"}
                        sx={{ display: 'block', mb: 1 }}
                      >
                        Generated Thumbnail:
                      </Typography>
                      <img 
                        src={thumbnailImage} 
                        alt="Generated thumbnail"
                        className="w-full h-auto rounded"
                      />
                    </Paper>
                  </div>
                </Zoom>
              )}
            </div>
          </HoverBorderGradient>
        </div>
        
        {/* Right Column - Controls */}
        <div>
          <HoverBorderGradient
            containerClassName="p-[1px] rounded-xl"
            className={cn(
              "p-4 rounded-xl",
              isDark ? "bg-[#1A0F2A]/90" : "bg-white/90",
              "backdrop-blur-md"
            )}
          >
            <div className="mb-4">
              <Typography variant="h6" className={isDark ? "text-[#E6D9F2]" : "text-[#4A4A4A]"}>
                Customize Thumbnail
              </Typography>
            </div>
            
            {/* Title Input */}
            <TextField
              label="Thumbnail Title"
              variant="outlined"
              size="small"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              margin="normal"
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: isDark ? "#E6D9F2" : "#4A4A4A",
                  "& fieldset": {
                    borderColor: isDark ? "#FF6B6B" : "#800000",
                  },
                  "&:hover fieldset": {
                    borderColor: isDark ? "#FF8787" : "#A52A2A",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: isDark ? "#FF6B6B" : "#800000",
                  }
                },
                "& .MuiInputLabel-root": { 
                  color: isDark ? "#E6D9F2" : "#4A4A4A",
                  "&.Mui-focused": {
                    color: isDark ? "#FF6B6B" : "#800000",
                  }
                },
              }}
            />
            
            {/* Pattern Selection */}
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel sx={{ color: isDark ? "#E6D9F2" : "#4A4A4A" }}>Background Pattern</InputLabel>
              <Select
                value={selectedPattern}
                label="Background Pattern"
                onChange={(e) => setSelectedPattern(Number(e.target.value))}
                sx={{
                  color: isDark ? "#E6D9F2" : "#4A4A4A",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: isDark ? "#FF6B6B" : "#800000",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: isDark ? "#FF8787" : "#A52A2A",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: isDark ? "#FF6B6B" : "#800000",
                  }
                }}
              >
                {backgroundPatterns.map((pattern, index) => (
                  <MenuItem key={pattern.name} value={index}>
                    {pattern.name.charAt(0).toUpperCase() + pattern.name.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {/* Audio Shape Selection */}
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel sx={{ color: isDark ? "#E6D9F2" : "#4A4A4A" }}>Audio Visualization</InputLabel>
              <Select
                value={selectedShape}
                label="Audio Visualization"
                onChange={(e) => setSelectedShape(e.target.value)}
                sx={{
                  color: isDark ? "#E6D9F2" : "#4A4A4A",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: isDark ? "#FF6B6B" : "#800000",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: isDark ? "#FF8787" : "#A52A2A",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: isDark ? "#FF6B6B" : "#800000",
                  }
                }}
              >
                {audioShapes.map((shape) => (
                  <MenuItem key={shape} value={shape}>
                    {shape.charAt(0).toUpperCase() + shape.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {/* Color Controls */}
            <div className="mt-3">
              <div className="flex justify-between items-center mb-2">
                <Typography variant="subtitle2" className={isDark ? "text-[#E6D9F2]" : "text-[#4A4A4A]"}>
                  Color Palette
                </Typography>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={randomizeColors}
                  className={cn(
                    isDark ? "text-[#E6D9F2] border-[#E6D9F2]/30" : "text-[#4A4A4A] border-[#4A4A4A]/30"
                  )}
                >
                  <Palette size={14} className="mr-1" /> Randomize
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-3">
                {colorPalette.map((color, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded-md border border-gray-300"
                      style={{ backgroundColor: color }}
                    />
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => {
                        const newColors = [...colorPalette];
                        newColors[index] = e.target.value;
                        setColorPalette(newColors);
                      }}
                      className="w-full h-8 cursor-pointer rounded border border-gray-300"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Background Image Upload */}
            <div className="mt-3">
              <div className="flex justify-between items-center mb-2">
                <Typography variant="subtitle2" className={isDark ? "text-[#E6D9F2]" : "text-[#4A4A4A]"}>
                  Background Image
                </Typography>
                {backgroundImage && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={clearBackgroundImage}
                    className="text-red-500 border-red-500/30"
                  >
                    <Eraser size={14} className="mr-1" /> Clear
                  </Button>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  id="background-image-upload"
                  className="hidden"
                  onChange={handleBackgroundImageChange}
                />
                <label htmlFor="background-image-upload" className="flex-1">
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start",
                      isDark ? "text-[#E6D9F2] border-[#E6D9F2]/30" : "text-[#4A4A4A] border-[#4A4A4A]/30"
                    )}
                    asChild
                  >
                    <span>
                      <FileImage size={16} className="mr-2" />
                      {backgroundImage ? 'Change Image' : 'Upload Image'}
                    </span>
                  </Button>
                </label>
              </div>
              
              {backgroundImage && (
                <div className="mt-2 rounded-md overflow-hidden border border-gray-300 h-20">
                  <img 
                    src={backgroundImage} 
                    alt="Background preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            
            {/* Image Adjustments */}
            <div className="mt-3">
              <Typography variant="subtitle2" className={isDark ? "text-[#E6D9F2]" : "text-[#4A4A4A]"}>
                Image Adjustments
              </Typography>
              
              <div className="mt-2">
                <div className="flex justify-between">
                  <Typography variant="caption" className={isDark ? "text-[#E6D9F2]" : "text-[#4A4A4A]"}>
                    Scale
                  </Typography>
                  <Typography variant="caption" className={isDark ? "text-[#E6D9F2]" : "text-[#4A4A4A]"}>
                    {imageScale.toFixed(1)}×
                  </Typography>
                </div>
                <MuiSlider
                  size="small"
                  min={0.5}
                  max={1.5}
                  step={0.1}
                  value={imageScale}
                  onChange={(_, value) => setImageScale(value as number)}
                  sx={{
                    color: isDark ? "#FF6B6B" : "#800000",
                    marginTop: 0,
                  }}
                />
              </div>
              
              <div className="mt-1">
                <div className="flex justify-between">
                  <Typography variant="caption" className={isDark ? "text-[#E6D9F2]" : "text-[#4A4A4A]"}>
                    Brightness
                  </Typography>
                  <Typography variant="caption" className={isDark ? "text-[#E6D9F2]" : "text-[#4A4A4A]"}>
                    {brightness}%
                  </Typography>
                </div>
                <MuiSlider
                  size="small"
                  min={50}
                  max={150}
                  value={brightness}
                  onChange={(_, value) => setBrightness(value as number)}
                  sx={{
                    color: isDark ? "#FF6B6B" : "#800000",
                  }}
                />
              </div>
              
              <div className="mt-1">
                <div className="flex justify-between">
                  <Typography variant="caption" className={isDark ? "text-[#E6D9F2]" : "text-[#4A4A4A]"}>
                    Contrast
                  </Typography>
                  <Typography variant="caption" className={isDark ? "text-[#E6D9F2]" : "text-[#4A4A4A]"}>
                    {contrast}%
                  </Typography>
                </div>
                <MuiSlider
                  size="small"
                  min={50}
                  max={150}
                  value={contrast}
                  onChange={(_, value) => setContrast(value as number)}
                  sx={{
                    color: isDark ? "#FF6B6B" : "#800000",
                  }}
                />
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                className={cn(
                  isDark ? "text-[#E6D9F2] border-[#E6D9F2]/30" : "text-[#4A4A4A] border-[#4A4A4A]/30"
                )}
                onClick={() => {
                  setTitle('My Audio');
                  setSelectedPattern(0);
                  setSelectedShape('waveform');
                  setColorPalette(['#FF6B6B', '#800000']);
                  setImageScale(1);
                  setBrightness(100);
                  setContrast(100);
                  setBackgroundImage(null);
                }}
              >
                <Eraser size={16} className="mr-1" /> Reset
              </Button>
              
              <Button
                onClick={generateThumbnail}
                className={cn(
                  "bg-gradient-to-r",
                  isDark 
                    ? "from-[#FF6B6B] to-[#800000] text-white hover:from-[#FF8787] hover:to-[#A52A2A]" 
                    : "from-[#800000] to-[#FF6B6B] text-white hover:from-[#A52A2A] hover:to-[#FF8787]"
                )}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <CircularProgress size={16} sx={{ color: 'white', mr: 1 }} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 size={16} className="mr-1" /> Generate Thumbnail
                  </>
                )}
              </Button>
            </div>
          </HoverBorderGradient>
        </div>
      </div>
    </div>
  );
};

export default AudioThumbnailCreator;