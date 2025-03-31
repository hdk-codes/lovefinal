// import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { client } from "@/lib/sanity";
// import groq from "groq";
// import toast from "react-hot-toast";
// // Aceternity UI components
// import { FloatingNav } from "./ui/floating-navbar";
// import { SparklesCore } from "./ui/sparkles";
// import { TextRevealCard } from "./ui/text-reveal-card"; 
// import { BackgroundGradientAnimation } from "./ui/background-gradient-animation";
// import { HoverBorderGradient } from "./ui/hover-border-gradient";
// import { Spotlight } from "./ui/spotlight";
// import { CardHoverEffect, CardContainer } from "./ui/card-hover-effect";
// import { WavyBackground } from "./ui/wavy-background";
// import { MeteorEffect } from "./ui/meteor-effect";
// import { LampContainer } from "./ui/lamp";
// import { MacWindowMockup } from "./ui/mac-window";

// import {
//   Box,
//   Typography,
//   Select,
//   MenuItem,
//   FormControl,
//   InputLabel,
//   CircularProgress,
//   TextField,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   Tooltip,
//   IconButton,
//   Chip,
//   Zoom,
//   Slide,
//   Fab,
//   Skeleton,
//   Paper,
//   Stack,
//   Grid,
//   useMediaQuery,
//   useTheme,
//   Drawer,
//   Divider,
//   Badge,
// } from "@mui/material";
// import { motion, AnimatePresence, MotionValue, useMotionValue, useSpring, useTransform } from "framer-motion";
// import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
// import { 
//   Mic, Heart, Play, Pause, Volume2, VolumeX, Trash2, 
//   Share, Download, Edit, Star, Sparkles, Filter, Search, 
//   X, Maximize2, Minimize2, Music, Clock, Tag, Calendar, 
//   MoreHorizontal, ChevronLeft, ChevronRight, Save, PenTool, 
//   Headphones, MessageCircle, Gift, Bookmark, Shuffle, Plus,
//   MicOff, RefreshCw, Wand2, List, LayoutGrid
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { cn } from "@/lib/utils";
// import { Slider } from "@/components/ui/slider";
// import { useInView } from "react-intersection-observer";
// import { useAudioPlayer } from "@/hooks/useAudioPlayer";
// import { Howl } from "howler";
// import { useReactMediaRecorder } from "react-media-recorder";
// import { useGesture } from "@use-gesture/react";
// import dayjs from "dayjs";
// import relativeTime from "dayjs/plugin/relativeTime";
// import localizedFormat from "dayjs/plugin/localizedFormat";

// dayjs.extend(relativeTime);
// dayjs.extend(localizedFormat);

// // GROQ query to fetch audio messages
// const getMessagesQuery = groq`
//   *[_type == "audioMessage"] | order(_createdAt desc) {
//     _id, title, audioFile { asset-> { url, _ref } }, caption, description, mood,
//     duration, isPrivate, backgroundMusic { asset-> { url, _ref } }, visualizer,
//     scheduledFor, transcript, reactions, background, _createdAt, tags
//   }
// `;

// // Type definitions
// interface AudioMessageType {
//   _id: string;
//   title: string;
//   audioFile: { asset: { url: string; _ref: string } };
//   caption?: string;
//   description?: string;
//   mood?: string;
//   duration?: number;
//   isPrivate: boolean;
//   backgroundMusic?: { asset: { url: string; _ref: string } };
//   visualizer: string;
//   scheduledFor?: string;
//   transcript?: string;
//   reactions: Array<{ emoji: string; count: number }>;
//   background?: { color: string; imageUrl: string; style: string };
//   _createdAt: string;
//   audioUrl?: string;
//   tags?: string[];
// }

// interface AudioWaveformData {
//   points: number[];
//   peak: number;
// }

// // Generate waveform data function
// const generateWaveformData = (count: number): AudioWaveformData => {
//   const points = Array.from({ length: count }, () => Math.random() * 100);
//   const peak = Math.max(...points);
//   return { points, peak };
// };

// // Background patterns
// const audioPatterns = [
//   {
//     name: "wave",
//     colors: ["#FF6B6B", "#800000"],
//     pattern: "radial-gradient(circle at center, var(--c1) 0%, transparent 70%)"
//   },
//   {
//     name: "rhythm",
//     colors: ["#7B68EE", "#4B0082"],
//     pattern: "linear-gradient(135deg, var(--c1) 0%, var(--c2) 100%)"
//   },
//   {
//     name: "pulse",
//     colors: ["#00CED1", "#008B8B"],
//     pattern: "repeating-linear-gradient(45deg, var(--c1), var(--c1) 5px, var(--c2) 5px, var(--c2) 10px)"
//   },
//   {
//     name: "echo",
//     colors: ["#FF8C00", "#FF4500"],
//     pattern: "conic-gradient(from 0deg at 50% 50%, var(--c1) 0%, var(--c2) 100%)"
//   },
//   {
//     name: "melody",
//     colors: ["#9370DB", "#4B0082"],
//     pattern: "repeating-radial-gradient(circle at center, var(--c1) 0%, var(--c2) 20%)"
//   }
// ];

// // Enhanced Audio Visualizer Component
// const EnhancedAudioVisualizer = ({
//   isPlaying,
//   progress,
//   isDark,
//   type = "bars",
//   audioData,
//   message
// }: {
//   isPlaying: boolean;
//   progress: number;
//   isDark: boolean;
//   type?: "bars" | "wave" | "circle" | "particles";
//   audioData: AudioWaveformData;
//   message: AudioMessageType;
// }) => {
//   const moodColorMap: Record<string, [string, string]> = {
//     "romantic": ["#FF6B6B", "#800000"],
//     "happy": ["#FFD700", "#FFA500"],
//     "reflective": ["#7B68EE", "#4B0082"],
//     "playful": ["#00CED1", "#008B8B"],
//     "missingYou": ["#9370DB", "#6A5ACD"]
//   };
  
//   const [colors, setColors] = useState<[string, string]>(
//     message.mood && moodColorMap[message.mood] 
//       ? moodColorMap[message.mood] 
//       : ["#FF6B6B", "#800000"]
//   );
  
//   const visualizerRef = useRef<HTMLDivElement>(null);
  
//   useEffect(() => {
//     if (message.mood && moodColorMap[message.mood]) {
//       setColors(moodColorMap[message.mood]);
//     }
//   }, [message.mood]);
  
//   // Classic bar visualizer
//   if (type === "bars") {
//     return (
//       <div 
//         className="flex items-end h-20 gap-[2px] px-2 relative"
//         style={{
//           perspective: "1000px",
//           transformStyle: "preserve-3d"
//         }}
//       >
//         {audioData.points.map((height, i) => {
//           const isActive = (i / audioData.points.length) * 100 <= progress;
//           const delay = i * 0.015;
          
//           return (
//             <motion.div
//               key={i}
//               className={cn(
//                 "rounded-full backdrop-blur-sm",
//                 isActive
//                   ? "bg-gradient-to-t"
//                   : isDark
//                   ? "bg-[#4A4A4A]"
//                   : "bg-[#E6D9F2]"
//               )}
//               animate={{
//                 height: isPlaying ? `${Math.max(height * 0.7, 5)}%` : "10%",
//                 opacity: isPlaying ? 1 : 0.5,
//                 rotateX: isPlaying ? [0, -10, 0] : 0,
//                 rotateY: isPlaying ? [0, i % 2 === 0 ? 15 : -15, 0] : 0,
//               }}
//               transition={{
//                 duration: 0.4,
//                 repeat: isPlaying ? Infinity : 0,
//                 repeatType: "reverse",
//                 delay,
//                 ease: "easeInOut"
//               }}
//               style={{ 
//                 minHeight: 4, 
//                 width: i % 3 === 0 ? 3 : 2,
//                 background: isActive 
//                   ? `linear-gradient(to top, ${colors[0]}, ${colors[1]})` 
//                   : undefined,
//                 boxShadow: isActive 
//                   ? `0 0 10px rgba(${parseInt(colors[0].substring(1, 3), 16)}, ${parseInt(colors[0].substring(3, 5), 16)}, ${parseInt(colors[0].substring(5, 7), 16)}, 0.5)` 
//                   : undefined,
//               }}
//             />
//           );
//         })}
        
//         {/* Glowing dots that follow the beat */}
//         {isPlaying && (
//           <motion.div
//             className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 0.5 }}
//           >
//             {Array.from({ length: 10 }).map((_, i) => (
//               <motion.div
//                 key={`particle-${i}`}
//                 className="absolute rounded-full"
//                 initial={{
//                   x: Math.random() * 100 + "%",
//                   y: "100%",
//                   opacity: 0,
//                   scale: 0
//                 }}
//                 animate={{
//                   y: "0%",
//                   opacity: [0, 0.7, 0],
//                   scale: [0, 1, 0],
//                 }}
//                 transition={{
//                   duration: 2 + Math.random() * 3,
//                   repeat: Infinity,
//                   delay: i * 0.7,
//                   ease: "easeOut"
//                 }}
//                 style={{
//                   width: 4 + Math.random() * 8,
//                   height: 4 + Math.random() * 8,
//                   background: colors[0],
//                   boxShadow: `0 0 10px ${colors[0]}, 0 0 20px ${colors[0]}`
//                 }}
//               />
//             ))}
//           </motion.div>
//         )}
//       </div>
//     );
//   }
  
//   // Wave visualizer
//   if (type === "wave") {
//     return (
//       <div className="h-20 relative overflow-hidden">
//         <svg 
//           width="100%" 
//           height="100%" 
//           viewBox="0 0 800 100" 
//           preserveAspectRatio="none"
//           className="w-full h-full"
//         >
//           <defs>
//             <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
//               <stop offset="0%" stopColor={colors[0]} />
//               <stop offset="100%" stopColor={colors[1]} />
//             </linearGradient>
//             <filter id="glow">
//               <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
//               <feMerge>
//                 <feMergeNode in="coloredBlur"/>
//                 <feMergeNode in="SourceGraphic"/>
//               </feMerge>
//             </filter>
//           </defs>
          
//           <motion.path
//             d={`M 0,50 ${audioData.points.map((p, i) => {
//               const x = (i / (audioData.points.length - 1)) * 800;
//               const y = 50 - (p / audioData.peak) * 40;
//               return `L ${x},${y}`;
//             }).join(" ")} L 800,50 L 800,100 L 0,100 Z`}
//             fill="url(#waveGradient)"
//             filter="url(#glow)"
//             strokeWidth="2"
//             stroke={colors[0]}
//             initial={{ opacity: 0.7 }}
//             animate={{ 
//               opacity: isPlaying ? [0.7, 1, 0.7] : 0.7,
//               y: isPlaying ? [0, -5, 0] : 0
//             }}
//             transition={{
//               duration: 1.5,
//               repeat: isPlaying ? Infinity : 0,
//               repeatType: "reverse"
//             }}
//           />
          
//           <motion.path
//             d={`M 0,50 ${audioData.points.map((p, i) => {
//               const x = (i / (audioData.points.length - 1)) * 800;
//               const y = 50 + (p / audioData.peak) * 40;
//               return `L ${x},${y}`;
//             }).join(" ")} L 800,50 L 800,100 L 0,100 Z`}
//             fill="url(#waveGradient)"
//             fillOpacity="0.5"
//             filter="url(#glow)"
//             initial={{ opacity: 0.3 }}
//             animate={{ 
//               opacity: isPlaying ? [0.3, 0.7, 0.3] : 0.3,
//               y: isPlaying ? [0, 5, 0] : 0
//             }}
//             transition={{
//               duration: 2,
//               repeat: isPlaying ? Infinity : 0,
//               repeatType: "reverse",
//               delay: 0.2
//             }}
//           />
          
//           {/* Progress overlay */}
//           <rect
//             x="0"
//             y="0"
//             width={`${progress}%`}
//             height="100"
//             fill="url(#waveGradient)"
//             fillOpacity="0.15"
//           />
//         </svg>
        
//         {/* Highlight dots that follow progress */}
//         {isPlaying && progress > 0 && (
//           <motion.div 
//             className="absolute top-1/2 transform -translate-y-1/2 pointer-events-none"
//             style={{ 
//               left: `${progress}%`, 
//               width: 12, 
//               height: 12, 
//               borderRadius: '50%',
//               background: colors[0],
//               boxShadow: `0 0 15px ${colors[0]}`,
//             }}
//             animate={{ 
//               scale: [1, 1.3, 1],
//               opacity: [0.7, 1, 0.7]
//             }}
//             transition={{
//               duration: 2,
//               repeat: Infinity,
//               repeatType: "reverse"
//             }}
//           />
//         )}
//       </div>
//     );
//   }
  
//   // Circle visualizer
//   if (type === "circle") {
//     return (
//       <div className="h-24 flex items-center justify-center relative overflow-hidden">
//         <motion.div 
//           className="relative"
//           initial={{ rotate: 0 }}
//           animate={{ 
//             rotate: isPlaying ? 360 : 0,
//           }}
//           transition={{
//             duration: 20,
//             repeat: Infinity,
//             ease: "linear"
//           }}
//         >
//           {audioData.points.map((point, i) => {
//             const angle = (i / audioData.points.length) * 360;
//             const size = ((point / audioData.peak) * 30) + 10;
//             const distance = 50 + ((point / audioData.peak) * 10);
//             const x = Math.cos(angle * (Math.PI / 180)) * distance;
//             const y = Math.sin(angle * (Math.PI / 180)) * distance;
//             const isActive = (i / audioData.points.length) * 100 <= progress;
            
//             return (
//               <motion.div
//                 key={i}
//                 className="absolute rounded-full"
//                 initial={{ x, y, scale: 0.5 }}
//                 animate={{ 
//                   scale: isPlaying ? [0.5, 0.8, 0.5] : 0.5,
//                   width: size,
//                   height: size,
//                   x: isPlaying ? [x, x + (Math.random() * 5 - 2.5), x] : x,
//                   y: isPlaying ? [y, y + (Math.random() * 5 - 2.5), y] : y,
//                 }}
//                 transition={{
//                   duration: 1 + Math.random(),
//                   repeat: isPlaying ? Infinity : 0,
//                   repeatType: "reverse",
//                   delay: i * 0.02
//                 }}
//                 style={{
//                   background: isActive ? colors[0] : isDark ? "#4A4A4A" : "#E6D9F2",
//                   boxShadow: isActive ? `0 0 10px ${colors[0]}` : "none",
//                   opacity: isActive ? 0.9 : 0.4,
//                 }}
//               />
//             );
//           })}
          
//           {/* Center circle */}
//           <motion.div
//             className="absolute rounded-full left-0 top-0 -ml-5 -mt-5"
//             style={{ 
//               width: 40, 
//               height: 40, 
//               background: `radial-gradient(circle, ${colors[0]} 0%, ${colors[1]} 100%)`,
//               boxShadow: `0 0 20px ${colors[0]}`
//             }}
//             initial={{ scale: 0.9, opacity: 0.8 }}
//             animate={{ 
//               scale: isPlaying ? [0.9, 1.1, 0.9] : 0.9,
//               opacity: isPlaying ? [0.8, 1, 0.8] : 0.8
//             }}
//             transition={{
//               duration: 2,
//               repeat: isPlaying ? Infinity : 0,
//               repeatType: "reverse"
//             }}
//           />
//         </motion.div>
//       </div>
//     );
//   }
  
//   // Particles visualizer
//   return (
//     <div className="h-20 relative overflow-hidden bg-black/10 backdrop-blur-sm rounded-xl">
//       <motion.div
//         className="absolute inset-0"
//         initial={{ opacity: 0.3 }}
//         animate={{ opacity: isPlaying ? 0.6 : 0.3 }}
//       >
//         <SparklesCore
//           id="tsparticlesfullpage"
//           background="transparent"
//           minSize={0.6}
//           maxSize={1.4}
//           particleDensity={40}
//           className="w-full h-full"
//           particleColor={colors[0]}
//           speed={isPlaying ? 1 : 0.1}
//         />
//       </motion.div>
      
//       {/* Center wave line */}
//       <div className="absolute inset-0 flex items-center justify-center">
//         <div className="w-[80%] h-[2px] bg-gray-500/20 relative overflow-hidden">
//           <motion.div 
//             className="absolute top-0 left-0 h-full"
//             style={{ 
//               background: `linear-gradient(90deg, ${colors[0]}, ${colors[1]})`,
//               width: `${progress}%`,
//             }}
//           />
          
//           {audioData.points.slice(0, 20).map((point, i) => {
//             const position = (i / 20) * 100;
//             const isInActiveZone = position <= progress;
            
//             return (
//               <motion.div
//                 key={i}
//                 className="absolute top-0 w-1 h-1 rounded-full"
//                 style={{ 
//                   left: `${position}%`,
//                   background: isInActiveZone ? colors[0] : "#888",
//                   boxShadow: isInActiveZone ? `0 0 5px ${colors[0]}` : "none",
//                 }}
//                 animate={{ 
//                   y: isPlaying && isInActiveZone
//                     ? [
//                         0,
//                         -10 - (point / audioData.peak) * 15,
//                         0,
//                         10 + (point / audioData.peak) * 15,
//                         0
//                       ] 
//                     : 0,
//                   opacity: isPlaying && isInActiveZone ? 1 : 0.5,
//                 }}
//                 transition={{
//                   duration: 1 + (point / audioData.peak),
//                   repeat: isPlaying ? Infinity : 0,
//                   repeatType: "loop",
//                   delay: i * 0.05,
//                   ease: "easeInOut"
//                 }}
//               />
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// };

// // Image Collage component 
// const ImageCollage = ({ message, isDark }: { message: AudioMessageType, isDark: boolean }) => {
//   // Generate random positions for the collage items
//   const positions = useMemo(() => {
//     return Array.from({ length: 3 }, () => ({
//       x: Math.random() * 60 - 30,
//       y: Math.random() * 30 - 15,
//       rotate: (Math.random() * 20 - 10),
//       scale: 0.8 + Math.random() * 0.4
//     }));
//   }, [message._id]);
  
//   return (
//     <div className="relative h-20 overflow-hidden mt-3 mb-6">
//       {/* Main image */}
//       <motion.div
//         className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-lg overflow-hidden shadow-lg z-10"
//         initial={{ scale: 0.9, opacity: 0.8 }}
//         whileHover={{ scale: 1.05, opacity: 1, rotateY: 5, rotateX: -5 }}
//         transition={{ type: "spring", stiffness: 300, damping: 20 }}
//         style={{
//           width: "100px",
//           height: "60px",
//           backgroundImage: `url(https://source.unsplash.com/random/200x200/?${message.mood || 'music'})`,
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//           border: isDark ? "2px solid rgba(255,107,107,0.5)" : "2px solid rgba(128,0,0,0.5)",
//         }}
//       />
      
//       {/* Decorative images */}
//       {positions.map((pos, idx) => (
//         <motion.div
//           key={`collage-${message._id}-${idx}`}
//           className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-lg overflow-hidden shadow-lg"
//           initial={{ 
//             x: pos.x, 
//             y: pos.y, 
//             rotate: pos.rotate, 
//             scale: pos.scale,
//             opacity: 0.6
//           }}
//           whileHover={{ 
//             scale: pos.scale * 1.1, 
//             opacity: 0.9,
//             zIndex: 20
//           }}
//           transition={{ type: "spring", stiffness: 200, damping: 25 }}
//           style={{
//             width: "70px",
//             height: "40px",
//             backgroundImage: `url(https://source.unsplash.com/random/100x100/?${message.tags?.[idx] || 'audio'})`,
//             backgroundSize: "cover",
//             backgroundPosition: "center",
//             border: isDark ? "1px solid rgba(255,107,107,0.3)" : "1px solid rgba(128,0,0,0.3)",
//           }}
//         />
//       ))}
//     </div>
//   );
// };

// // Enhanced AudioCard Component with Material UI shadows and effects
// interface AudioCardProps {
//   message: AudioMessageType;
//   index: number;
//   isDark: boolean;
//   provided: any;
//   inView: boolean;
//   onDelete: (id: string) => void;
//   onEdit?: (message: AudioMessageType) => void;
//   onShare?: (message: AudioMessageType) => void;
//   selectedVisualizer: string;
// }

// const EnhancedAudioCard = ({
//   message,
//   index,
//   isDark,
//   provided,
//   inView,
//   onDelete,
//   onEdit,
//   onShare,
//   selectedVisualizer
// }: AudioCardProps) => {
//   const { state, controls } = useAudioPlayer(message.audioFile.asset.url);
//   const [reaction, setReaction] = useState<string | null>(null);
//   const [isExpanded, setIsExpanded] = useState(false);
//   const [reactionCounts, setReactionCounts] = useState<Record<string, number>>(
//     message.reactions?.reduce((acc, r) => ({ ...acc, [r.emoji]: r.count }), {}) || {}
//   );
//   const [audioData] = useState(() => generateWaveformData(60));
//   const cardRef = useRef<HTMLDivElement>(null);
//   const mouseX = useMotionValue(0);
//   const mouseY = useMotionValue(0);
//   const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
//   const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);
  
//   const formatTime = (seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = Math.floor(seconds % 60);
//     return `${mins}:${secs.toString().padStart(2, "0")}`;
//   };

//   const progressPercent = (state.currentTime / (state.duration || 1)) * 100 || 0;

//   const handleReaction = (emoji: string) => {
//     setReaction(emoji);
//     setReactionCounts(prev => ({
//       ...prev,
//       [emoji]: (prev[emoji] || 0) + 1
//     }));
//     toast.success(`Reacted with ${emoji}`, {
//       icon: emoji,
//       style: {
//         background: isDark ? "#1A0F2A" : "#FFF5F5",
//         color: isDark ? "#E6D9F2" : "#4A4A4A",
//         border: `1px solid ${isDark ? "#FF6B6B" : "#800000"}`,
//       }
//     });
//   };
  
//   const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
//     if (!cardRef.current) return;
//     const rect = cardRef.current.getBoundingClientRect();
//     mouseX.set(e.clientX - rect.left - rect.width / 2);
//     mouseY.set(e.clientY - rect.top - rect.height / 2);
//   };
  
//   const handleMouseLeave = () => {
//     mouseX.set(0);
//     mouseY.set(0);
//   };
  
//   const createdDate = dayjs(message._createdAt);
//   const formattedDate = createdDate.format('ll');
//   const timeAgo = createdDate.fromNow();
  
//   const moodColorMap: Record<string, string> = {
//     "romantic": "rgb(255, 107, 107)",
//     "happy": "rgb(255, 193, 7)",
//     "reflective": "rgb(123, 104, 238)",
//     "playful": "rgb(0, 206, 209)",
//     "missingYou": "rgb(147, 112, 219)"
//   };
  
//   const moodColor = message.mood && moodColorMap[message.mood] 
//     ? moodColorMap[message.mood] 
//     : "#FF6B6B";
  
//   // Determine which visualizer to show
//   const visualizerType = selectedVisualizer === "random" 
//     ? ["bars", "wave", "circle", "particles"][Math.floor(Math.random() * 4)] as "bars" | "wave" | "circle" | "particles"
//     : selectedVisualizer as "bars" | "wave" | "circle" | "particles";

//   const elementRef = useCallback(
//     (element: HTMLDivElement | null) => {
//       provided.innerRef(element);
//       if (cardRef) cardRef.current = element;
//     },
//     [provided.innerRef]
//   );

//   return (
//     <HoverBorderGradient
//       containerClassName="p-[1px] rounded-xl group/card relative z-10"
//       className={cn(
//         "flex flex-col h-full rounded-xl overflow-hidden",
//         "backdrop-blur-md transition-all duration-500",
//         isDark ? "bg-[#1A0F2A]/95" : "bg-[#FFF5F5]/95",
//         isExpanded ? "scale-[1.02]" : ""
//       )}
//       as={motion.div}
//       ref={(el) => {
//         // Call both refs
//         provided.innerRef(el);
//         if (cardRef) {
//           cardRef.current = el;
//         }
//       }}
//       {...provided.draggableProps}
//       {...provided.dragHandleProps}
//       initial={{ opacity: 0, y: 20 }}
//         rotateX: isExpanded ? 0 : rotateX,
//         rotateY: isExpanded ? 0 : rotateY,
//         transformStyle: "preserve-3d",
//         boxShadow: isDark 
//           ? "0 20px 25px -5px rgba(255, 107, 107, 0.15), 0 10px 10px -5px rgba(255, 107, 107, 0.1)"
//           : "0 20px 25px -5px rgba(128, 0, 0, 0.15), 0 10px 10px -5px rgba(128, 0, 0, 0.1)",
//       }}
//       gradientClassName={message.mood 
//         ? `from-${moodColor.replace('#', '')} to-black/50` 
//         : "from-[#FF6B6B] to-[#800000]"
//       }
//     >
//       {/* Mood indicator */}
//       {message.mood && (
//         <div 
//           className="absolute top-0 left-0 w-full h-1 opacity-60"
//           style={{ background: `linear-gradient(to right, ${moodColor}, transparent)` }}
//         />
//       )}
      
//       <div className="p-4 relative z-10 flex-1 flex flex-col">
//         {/* Header section */}
//         <div className="flex items-center justify-between mb-3">
//           <div className="flex items-center">
//             <motion.h3
//               className={cn(
//                 "text-lg font-semibold truncate max-w-[180px]",
//                 isDark ? "text-[#FF6B6B]" : "text-[#800000]"
//               )}
//               initial={{ scale: 1 }}
//               whileHover={{ scale: 1.03 }}
//             >
//               {message.title}
//             </motion.h3>
            
//             {message.isPrivate && (
//               <Tooltip title="Private Message" arrow>
//                 <span className="ml-2 opacity-70">
//                   <IconButton size="small" disabled className="pointer-events-none">
//                     <MessageCircle size={12} />
//                   </IconButton>
//                 </span>
//               </Tooltip>
//             )}
//           </div>
          
//           <div className="flex items-center gap-1">
//             {message.mood && (
//               <Chip
//                 label={message.mood}
//                 size="small"
//                 sx={{
//                   background: `${moodColor}20`,
//                   color: moodColor,
//                   borderRadius: '4px',
//                   fontSize: '0.65rem',
//                   height: '20px',
//                   '& .MuiChip-label': {
//                     px: 1
//                   }
//                 }}
//               />
//             )}
            
//             <Tooltip title={isExpanded ? "Minimize" : "Expand"}>
//               <IconButton 
//                 size="small" 
//                 className={cn(
//                   "text-sm",
//                   isDark ? "text-[#E6D9F2]" : "text-[#4A4A4A]"
//                 )}
//                 onClick={() => setIsExpanded(!isExpanded)}
//               >
//                 {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
//               </IconButton>
//             </Tooltip>
//           </div>
//         </div>
        
//         {/* Date and time */}
//         <div className="flex items-center mb-2 text-xs opacity-70">
//           <Calendar size={12} className="mr-1" />
//           <Tooltip title={formattedDate}>
//             <span>{timeAgo}</span>
//           </Tooltip>
//         </div>
        
//         {/* Visualizer */}
//         <EnhancedAudioVisualizer
//           isPlaying={state.isPlaying}
//           progress={progressPercent}
//           isDark={isDark}
//           type={visualizerType}
//           audioData={audioData}
//           message={message}
//         />
        
//         {/* Image collage only shown when expanded or if certain moods */}
//         {(isExpanded || message.mood === "romantic" || message.mood === "missingYou") && (
//           <ImageCollage message={message} isDark={isDark} />
//         )}
        
//         {/* Controls */}
//         <div className="flex items-center gap-3 mt-3">
//           <motion.button
//             whileTap={{ scale: 0.9 }}
//             whileHover={{ 
//               scale: 1.1,
//               boxShadow: `0 0 15px ${isDark ? "#FF6B6B" : "#800000"}` 
//             }}
//             onClick={() => (state.isPlaying ? controls.pause() : controls.play())}
//             className={cn(
//               "p-3 rounded-full",
//               "transition-all duration-300 transform",
//               "bg-gradient-to-r text-white",
//               isDark 
//                 ? "from-[#FF6B6B] to-[#800000] hover:from-[#FF8787] hover:to-[#A52A2A]" 
//                 : "from-[#800000] to-[#FF6B6B] hover:from-[#A52A2A] hover:to-[#FF8787]"
//             )}
//             style={{ boxShadow: `0 5px 15px ${isDark ? "rgba(255, 107, 107, 0.3)" : "rgba(128, 0, 0, 0.3)"}` }}
//           >
//             {state.isPlaying ? <Pause size={18} /> : <Play size={18} />}
//           </motion.button>

//           {/* Progress Bar */}
//           <div className="flex-1">
//             <div
//               className={cn(
//                 "relative h-2 rounded-full overflow-hidden",
//                 isDark ? "bg-[#4A4A4A]" : "bg-[#E6D9F2]"
//               )}
//             >
//               <motion.div
//                 className="absolute inset-y-0 left-0"
//                 style={{ 
//                   width: `${progressPercent}%`,
//                   background: `linear-gradient(90deg, ${moodColor || "#FF6B6B"}, ${message.mood ? moodColorMap[message.mood] || "#800000" : "#800000"})`
//                 }}
//                 transition={{ type: "spring", stiffness: 100, damping: 20 }}
//               />
              
//               {/* Bubble that follows progress */}
//               {state.isPlaying && (
//                 <motion.div
//                   className="absolute top-1/2 transform -translate-y-1/2 rounded-full z-10"
//                   style={{ 
//                     left: `${progressPercent}%`,
//                     width: 10,
//                     height: 10,
//                     background: isDark ? "#FFF" : "#800000",
//                     boxShadow: `0 0 5px ${isDark ? "rgba(255, 255, 255, 0.8)" : "rgba(128, 0, 0, 0.8)"}`
//                   }}
//                   animate={{ 
//                     scale: [1, 1.3, 1]
//                   }}
//                   transition={{
//                     duration: 1.5,
//                     repeat: Infinity,
//                     repeatType: "reverse"
//                   }}
//                 />
//               )}
              
//               <input
//                 type="range"
//                 min={0}
//                 max={state.duration || 100}
//                 value={state.currentTime}
//                 onChange={(e) => controls.seek(parseFloat(e.target.value))}
//                 className="absolute inset-0 opacity-0 cursor-pointer"
//               />
//             </div>
//             <div
//               className={cn(
//                 "flex justify-between mt-1 text-xs",
//                 isDark ? "text-[#E6D9F2]/70" : "text-[#4A4A4A]/70"
//               )}
//             >
//               <span>{formatTime(state.currentTime)}</span>
//               <span>{formatTime(state.duration)}</span>
//             </div>
//           </div>

//           {/* Volume */}
//           <motion.div 
//             className="flex items-center"
//             whileHover={{ width: 100 }}
//             initial={{ width: 36 }}
//             transition={{ type: "spring", stiffness: 300, damping: 25 }}
//           >
//             <motion.button
//               whileTap={{ scale: 0.9 }}
//               onClick={() => controls.setVolume(state.volume === 0 ? 0.7 : 0)}
//               className={cn(
//                 "p-1.5 rounded-full", 
//                 isDark ? "text-[#E6D9F2]" : "text-[#4A4A4A]",
//                 "hover:bg-gray-200/20"
//               )}
//             >
//               {state.volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
//             </motion.button>
            
//             <motion.div className="overflow-hidden ml-1" initial={{ width: 0 }} animate={{ width: "auto" }}>
//               <Slider
//                 value={[state.volume * 100]}
//                 max={100}
//                 className="w-16"
//                 onValueChange={(value) => controls.setVolume(value[0] / 100)}
//               />
//             </motion.div>
//           </motion.div>
//         </div>
        
//         {/* Expanded content */}
//         <AnimatePresence>
//           {isExpanded && (
//             <motion.div
//               className="mt-4"
//               initial={{ opacity: 0, height: 0 }}
//               animate={{ opacity: 1, height: "auto" }}
//               exit={{ opacity: 0, height: 0 }}
//               transition={{ duration: 0.3 }}
//             >
//               {/* Caption */}
//               {message.caption && (
//                 <div className="mb-3">
//                   <h4 className={cn(
//                     "text-xs font-semibold mb-1",
//                     isDark ? "text-[#FF6B6B]" : "text-[#800000]"
//                   )}>
//                     Caption
//                   </h4>
//                   <p className={cn(
//                     "text-sm italic",
//                     isDark ? "text-[#E6D9F2]" : "text-[#4A4A4A]"
//                   )}>
//                     "{message.caption}"
//                   </p>
//                 </div>
//               )}
              
//               {/* Description */}
//               {message.description && (
//                 <div className="mb-3">
//                   <h4 className={cn(
//                     "text-xs font-semibold mb-1",
//                     isDark ? "text-[#FF6B6B]" : "text-[#800000]"
//                   )}>
//                     Description
//                   </h4>
//                   <p className={cn(
//                     "text-sm",
//                     isDark ? "text-[#E6D9F2]" : "text-[#4A4A4A]"
//                   )}>
//                     {message.description}
//                   </p>
//                 </div>
//               )}
              
//               {/* Tags */}
//               {message.tags && message.tags.length > 0 && (
//                 <div className="mb-3">
//                   <h4 className={cn(
//                     "text-xs font-semibold mb-1",
//                     isDark ? "text-[#FF6B6B]" : "text-[#800000]"
//                   )}>
//                     Tags
//                   </h4>
//                   <div className="flex flex-wrap gap-1.5">
//                     {message.tags.map((tag, idx) => (
//                       <Chip
//                         key={`tag-${idx}`}
//                         label={tag}
//                         size="small"
//                         variant="outlined"
//                         sx={{
//                           borderColor: isDark ? 'rgba(230, 217, 242, 0.3)' : 'rgba(74, 74, 74, 0.3)',
//                           color: isDark ? '#E6D9F2' : '#4A4A4A',
//                           '& .MuiChip-label': {
//                             px: 1,
//                             fontSize: '0.65rem'
//                           }
//                         }}
//                       />
//                     ))}
//                   </div>
//                 </div>
//               )}
              
//               {/* Transcript */}
//               {message.transcript && (
//                 <div className="mb-3">
//                   <h4 className={cn(
//                     "text-xs font-semibold mb-1 flex items-center gap-1",
//                     isDark ? "text-[#FF6B6B]" : "text-[#800000]"
//                   )}>
//                     <Headphones size={12} />
//                     Transcript
//                   </h4>
//                   <p className={cn(
//                     "text-sm bg-black/5 p-2 rounded",
//                     isDark ? "text-[#E6D9F2]" : "text-[#4A4A4A]"
//                   )}>
//                     {message.transcript}
//                   </p>
//                 </div>
//               )}
//             </motion.div>
//           )}
//         </AnimatePresence>
        
//         {/* Actions Bar */}
//         <div className="flex justify-between items-center mt-auto pt-3 border-t border-dashed border-gray-300/20">
//           {/* Reactions */}
//           <div className="flex gap-2">
//             {["❤️", "👏", "😊", "🎵", "😢"].map((emoji) => (
//               <Tooltip key={emoji} title={`React with ${emoji}`}>
//                 <Badge 
//                   badgeContent={reactionCounts[emoji] || 0} 
//                   color="primary"
//                   sx={{ 
//                     '.MuiBadge-badge': { 
//                       background: moodColor || (isDark ? '#FF6B6B' : '#800000'),
//                       fontSize: '0.65rem',
//                       minWidth: '16px',
//                       height: '16px',
//                     } 
//                   }}
//                 >
//                   <motion.button
//                     whileHover={{ scale: 1.2 }}
//                     whileTap={{ scale: 0.9 }}
//                     onClick={() => handleReaction(emoji)}
//                     className={cn(
//                       "text-sm p-1 rounded-full",
//                       reaction === emoji && "bg-gray-200/20"
//                     )}
//                   >
//                     {emoji}
//                   </motion.button>
//                 </Badge>
//               </Tooltip>
//             ))}
//           </div>
          
//           {/* Action buttons */}
//           <div className="flex gap-1">
//             <Tooltip title="Share">
//               <IconButton 
//                 size="small" 
//                 className={cn(
//                   isDark ? "text-[#E6D9F2]" : "text-[#4A4A4A]",
//                   "hover:text-[#FF6B6B]"
//                 )}
//                 onClick={() => onShare?.(message)}
//               >
//                 <Share size={16} />
//               </IconButton>
//             </Tooltip>
            
//             <Tooltip title="Save">
//               <IconButton 
//                 size="small" 
//                 className={cn(
//                   isDark ? "text-[#E6D9F2]" : "text-[#4A4A4A]",
//                   "hover:text-[#FF6B6B]"
//                 )}
//               >
//                 <Bookmark size={16} />
//               </IconButton>
//             </Tooltip>
            
//             <Tooltip title="Edit">
//               <IconButton 
//                 size="small" 
//                 className={cn(
//                   isDark ? "text-[#E6D9F2]" : "text-[#4A4A4A]",
//                   "hover:text-[#FF6B6B]"
//                 )}
//                 onClick={() => onEdit?.(message)}
//               >
//                 <Edit size={16} />
//               </IconButton>
//             </Tooltip>
            
//             <Tooltip title="Delete">
//               <IconButton 
//                 size="small" 
//                 className={cn(
//                   isDark ? "text-[#E6D9F2]" : "text-[#4A4A4A]",
//                   "hover:text-red-500"
//                 )}
//                 onClick={() => onDelete(message._id)}
//               >
//                 <Trash2 size={16} />
//               </IconButton>
//             </Tooltip>
//           </div>
//         </div>
//       </div>
//     </HoverBorderGradient>
//   );
// };

// // Enhanced MessagesSection Component
// const EnhancedMessagesSection = ({ isDarkMode }: { isDarkMode: boolean }) => {
//   const queryClient = useQueryClient();
//   const [moodFilter, setMoodFilter] = useState<string | null>(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [isDark, setIsDark] = useState(isDarkMode);
//   const [messagesOrder, setMessagesOrder] = useState<AudioMessageType[]>([]);
//   const [deleteId, setDeleteId] = useState<string | null>(null);
//   const [isRecording, setIsRecording] = useState(false);
//   const [visualizerType, setVisualizerType] = useState<string>("bars");
//   const [showFilters, setShowFilters] = useState(false);
//   const [editMessage, setEditMessage] = useState<AudioMessageType | null>(null);
//   const [isRecordingDrawerOpen, setIsRecordingDrawerOpen] = useState(false);
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
//   const containerRef = useRef<HTMLDivElement>(null);
//   const [containerInView, containerInViewRef] = useInView({ threshold: 0.1 });
//   const [selectedView, setSelectedView] = useState<"grid" | "list" | "masonry">("masonry");
  
//   // Main query for audio messages
//   const { data: messages = [], isLoading } = useQuery<AudioMessageType[]>({
//     queryKey: ["audioMessages", moodFilter],
//     queryFn: async () => {
//       try {
//         return await client.fetch(
//           moodFilter
//             ? `${getMessagesQuery} [mood == "${moodFilter}"]`
//             : getMessagesQuery
//         );
//       } catch (err) {
//         toast.error("Failed to fetch messages!");
//         throw err;
//       }
//     },
//     retry: 2,
//     staleTime: 5 * 60 * 1000,
//   });

//   // Delete mutation
//   const deleteMessageMutation = useMutation({
//     mutationFn: async (id: string) => await client.delete(id),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["audioMessages"] });
//       toast.success("Message deleted!", { icon: "💔" });
//       setDeleteId(null);
//     },
//     onError: () => toast.error("Deletion failed!"),
//   });

//   // Update and filter messages
//   const filteredMessages = useMemo(() => {
//     const orderedMessages = messagesOrder.length ? messagesOrder : messages;
//     return orderedMessages
//       .filter(
//         (msg) =>
//           msg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           (msg.caption && msg.caption.toLowerCase().includes(searchQuery.toLowerCase())) ||
//           (msg.tags && msg.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
//       )
//       .map((msg) => ({
//         ...msg,
//         audioUrl: msg.audioFile?.asset?.url || undefined,
//       }));
//   }, [messages, messagesOrder, searchQuery]);

//   // React to dark mode changes
//   useEffect(() => {
//     setIsDark(isDarkMode);
//   }, [isDarkMode]);

//   // Update message order when messages change
//   useEffect(() => {
//     setMessagesOrder(messages);
//   }, [messages]);

//   // Drag and drop handler
//   const onDragEnd = useCallback((result: any) => {
//     if (!result.destination) return;
//     const items = Array.from(filteredMessages);
//     const [reorderedItem] = items.splice(result.source.index, 1);
//     items.splice(result.destination.index, 0, reorderedItem);
//     setMessagesOrder(items);
//   }, [filteredMessages]);

//   // Action handlers
//   const handleDelete = (id: string) => setDeleteId(id);
//   const confirmDelete = () => deleteMessageMutation.mutate(deleteId!);
//   const handleEdit = (message: AudioMessageType) => setEditMessage(message);
//   const handleShare = (message: AudioMessageType) => {
//     // Share implementation
//     toast.success(`Sharing "${message.title}"`, {
//       icon: "🔗",
//       style: {
//         background: isDark ? "#1A0F2A" : "#FFF5F5",
//         color: isDark ? "#E6D9F2" : "#4A4A4A",
//         border: `1px solid ${isDark ? "#FF6B6B" : "#800000"}`,
//       }
//     });
//   };
  
//   // Recording handlers
//   const startRecording = () => {
//     setIsRecording(true);
//     setIsRecordingDrawerOpen(true);
//     // Implementation would be here
//   };
  
//   const stopRecording = () => {
//     setIsRecording(false);
//     // Implementation would be here
//   };
  
//   // Theme-dependent styles
//   const backgroundStyle = isDark 
//     ? { background: "linear-gradient(to bottom, #2A1B3D, #1A0F2A)" }
//     : { background: "linear-gradient(to bottom, #FFF5F5, #FFF0F0)" };
  
//   // Get grid layout class based on selected view
//   const getGridLayoutClass = () => {
//     switch (selectedView) {
//       case "grid":
//         return "grid sm:grid-cols-2 lg:grid-cols-3 gap-6";
//       case "list":
//         return "flex flex-col gap-4";
//       case "masonry":
//       default:
//         return "columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6";
//     }
//   };

//   return (
//     <div ref={containerInViewRef} className="relative">
//       {/* Background effect */}
//       <BackgroundGradientAnimation
//         gradientBackgroundStart={isDark ? "rgb(42, 27, 61)" : "rgb(255, 245, 245)"}
//         gradientBackgroundEnd={isDark ? "rgb(26, 15, 42)" : "rgb(255, 240, 240)"}
//         firstColor={isDark ? "155, 107, 107" : "128, 0, 0"}
//         secondColor={isDark ? "123, 104, 238" : "147, 112, 219"}
//         thirdColor={isDark ? "0, 206, 209" : "255, 215, 0"}
//         fourthColor={isDark ? "255, 215, 0" : "0, 206, 209"}
//         fifthColor={isDark ? "255, 105, 180" : "255, 105, 180"}
//         pointerColor={isDark ? "255, 107, 107" : "128, 0, 0"}
//         size="40%"
//         blendingValue={isDark ? "hard-light" : "normal"}
//         className="fixed inset-0 -z-10"
//       />
      
//       {/* Spotlight effect */}
//       <Spotlight
//         className="fixed -top-40 left-0 -z-10 opacity-40"
//         fill={isDark ? "rgb(255, 107, 107)" : "rgb(128, 0, 0)"}
//       />
    
//       <section
//         id="messages"
//         className="py-12 px-4 min-h-screen"
//         ref={containerRef}
//       >
//         <ScrollArea
//           className={cn(
//             "h-[calc(100vh-4rem)]",
//             isDark && "scrollbar-thumb-[#FF6B6B]/20 scrollbar-track-[#1A0F2A]"
//           )}
//         >
//           <div className="container mx-auto max-w-7xl">
//             {/* Floating Navigation */}
//             <FloatingNav 
//               navItems={[
//                 {
//                   name: "Grid View",
//                   icon: <Grid size={16} />,
//                   onClick: () => setSelectedView("grid")
//                 },
//                 {
//                   name: "List View",
//                   icon: <List size={16} />,
//                   onClick: () => setSelectedView("list")
//                 },
//                 {
//                   name: "Masonry View",
//                   icon: <LayoutGrid size={16} />,
//                   onClick: () => setSelectedView("masonry")
//                 },
//                 {
//                   name: "Filters",
//                   icon: <Filter size={16} />,
//                   onClick: () => setShowFilters(!showFilters)
//                 },
//               ]}
//               className="mb-8"
//             />
            
//             {/* Header with Text Reveal Effect */}
//             <motion.div
//               initial={{ opacity: 0, y: -20 }}
//               animate={{ opacity: containerInView ? 1 : 0, y: containerInView ? 0 : -20 }}
//               className="mb-10"
//             >
//               <TextRevealCard
//                 text="Our Audio Messages"
//                 revealText="Memories in Sound ✨"
//                 className="w-full max-w-md mx-auto"
//                 reveal
//               />
//             </motion.div>
            
//             {/* Filters Section - Animated */}
//             <AnimatePresence>
//               {showFilters && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: "auto" }}
//                   exit={{ opacity: 0, height: 0 }}
//                   transition={{ duration: 0.3 }}
//                   className="mb-8"
//                 >
//                   <HoverBorderGradient
//                     className={cn(
//                       "p-4 rounded-xl",
//                       isDark ? "bg-[#1A0F2A]/80" : "bg-white/80",
//                       "backdrop-blur-md"
//                     )}
//                     containerClassName="p-[1px] rounded-xl w-full"
//                   >
//                     <div className="flex flex-wrap gap-4 items-end">
//                       <div className="flex-1 min-w-[200px]">
//                         <TextField
//                           label="Search Messages"
//                           variant="outlined"
//                           fullWidth
//                           size="small"
//                           value={searchQuery}
//                           onChange={(e) => setSearchQuery(e.target.value)}
//                           InputProps={{
//                             startAdornment: <Search size={16} className="mr-2 opacity-70" />,
//                             endAdornment: searchQuery && (
//                               <IconButton size="small" onClick={() => setSearchQuery("")}>
//                                 <X size={16} />
//                               </IconButton>
//                             )
//                           }}
//                           sx={{
//                             "& .MuiOutlinedInput-root": {
//                               color: isDark ? "#E6D9F2" : "#4A4A4A",
//                               "& fieldset": {
//                                 borderColor: isDark ? "#FF6B6B" : "#800000",
//                                 borderRadius: "8px",
//                               },
//                               "&:hover fieldset": {
//                                 borderColor: isDark ? "#FF8787" : "#A52A2A",
//                               },
//                               "&.Mui-focused fieldset": {
//                                 borderColor: isDark ? "#FF6B6B" : "#800000",
//                                 borderWidth: "2px",
//                               }
//                             },
//                             "& .MuiInputLabel-root": { 
//                               color: isDark ? "#E6D9F2" : "#4A4A4A",
//                               "&.Mui-focused": {
//                                 color: isDark ? "#FF6B6B" : "#800000",
//                               }
//                             },
//                           }}
//                         />
//                       </div>
                      
//                       <FormControl size="small" sx={{ minWidth: 150 }}>
//                         <InputLabel sx={{ color: isDark ? "#E6D9F2" : "#4A4A4A" }}>
//                           Mood
//                         </InputLabel>
//                         <Select
//                           value={moodFilter || ""}
//                           label="Mood"
//                           onChange={(e) => setMoodFilter(e.target.value || null)}
//                           sx={{
//                             color: isDark ? "#E6D9F2" : "#4A4A4A",
//                             borderColor: isDark ? "#FF6B6B" : "#800000",
//                             borderRadius: "8px",
//                             "& .MuiOutlinedInput-notchedOutline": {
//                               borderColor: isDark ? "#FF6B6B" : "#800000",
//                             },
//                             "&:hover .MuiOutlinedInput-notchedOutline": {
//                               borderColor: isDark ? "#FF8787" : "#A52A2A",
//                             },
//                             "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
//                               borderColor: isDark ? "#FF6B6B" : "#800000",
//                               borderWidth: "2px",
//                             }
//                           }}
//                         >
//                           <MenuItem value="">All Moods</MenuItem>
//                           <MenuItem value="romantic">Romantic</MenuItem>
//                           <MenuItem value="happy">Happy</MenuItem>
//                           <MenuItem value="reflective">Reflective</MenuItem>
//                           <MenuItem value="playful">Playful</MenuItem>
//                           <MenuItem value="missingYou">Missing You</MenuItem>
//                         </Select>
//                       </FormControl>
                      
//                       <FormControl size="small" sx={{ minWidth: 150 }}>
//                         <InputLabel sx={{ color: isDark ? "#E6D9F2" : "#4A4A4A" }}>
//                           Visualizer
//                         </InputLabel>
//                         <Select
//                           value={visualizerType}
//                           label="Visualizer"
//                           onChange={(e) => setVisualizerType(e.target.value)}
//                           sx={{
//                             color: isDark ? "#E6D9F2" : "#4A4A4A",
//                             borderColor: isDark ? "#FF6B6B" : "#800000",
//                             borderRadius: "8px",
//                             "& .MuiOutlinedInput-notchedOutline": {
//                               borderColor: isDark ? "#FF6B6B" : "#800000",
//                             },
//                             "&:hover .MuiOutlinedInput-notchedOutline": {
//                               borderColor: isDark ? "#FF8787" : "#A52A2A",
//                             },
//                             "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
//                               borderColor: isDark ? "#FF6B6B" : "#800000",
//                               borderWidth: "2px",
//                             }
//                           }}
//                         >
//                           <MenuItem value="bars">Bars</MenuItem>
//                           <MenuItem value="wave">Wave</MenuItem>
//                           <MenuItem value="circle">Circle</MenuItem>
//                           <MenuItem value="particles">Particles</MenuItem>
//                           <MenuItem value="random">Random</MenuItem>
//                         </Select>
//                       </FormControl>
                      
//                       <Button
//                         variant="outline"
//                         onClick={() => {
//                           setSearchQuery("");
//                           setMoodFilter(null);
//                           setVisualizerType("bars");
//                           setShowFilters(false);
//                         }}
//                         size="sm"
//                         className={cn(
//                           isDark ? "text-[#E6D9F2] border-[#E6D9F2]/30" : "text-[#4A4A4A] border-[#4A4A4A]/30"
//                         )}
//                       >
//                         <RefreshCw size={16} className="mr-1" /> Reset
//                       </Button>
//                     </div>
//                   </HoverBorderGradient>
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             {/* Messages Grid with Meteor Effect */}
//             <MeteorEffect
//               number={isDark ? 20 : 10}
//               color={isDark ? "rgb(255, 107, 107)" : "rgb(128, 0, 0)"}
//               speed={isDark ? 4 : 2}
//             >
//               {isLoading ? (
//                 <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
//                   {[...Array(6)].map((_, index) => (
//                     <Skeleton
//                       key={`skeleton-${index}`}
//                       variant="rounded"
//                       height={280}
//                       sx={{ 
//                         bgcolor: isDark ? 'rgba(74, 74, 74, 0.2)' : 'rgba(230, 217, 242, 0.3)',
//                         transform: 'scale(1, 1)',
//                       }}
//                     />
//                   ))}
//                 </div>
//               ) : filteredMessages.length === 0 ? (
//                 <div className="flex flex-col items-center justify-center p-8 rounded-xl backdrop-blur-sm bg-white/10">
//                   <Music size={40} className={isDark ? "text-[#FF6B6B]/50" : "text-[#800000]/50"} />
//                   <Typography 
//                     variant="h6"
//                     className={cn("mt-4", isDark ? "text-[#E6D9F2]" : "text-[#4A4A4A]")}
//                   >
//                     No audio messages found
//                   </Typography>
//                   <Typography 
//                     variant="body2"
//                     className={cn(isDark ? "text-[#E6D9F2]/70" : "text-[#4A4A4A]/70")}
//                   >
//                     Try adjusting your filters or record a new message
//                   </Typography>
//                   <Button
//                     size="lg"
//                     className={cn(
//                       "mt-4 rounded-full",
//                       isDark
//                         ? "bg-gradient-to-r from-[#FF6B6B] to-[#800000] text-white hover:from-[#FF8787] hover:to-[#A52A2A]"
//                         : "bg-gradient-to-r from-[#800000] to-[#FF6B6B] text-white hover:from-[#A52A2A] hover:to-[#FF8787]"
//                     )}
//                     onClick={startRecording}
//                   >
//                     <Mic className="mr-2" />
//                     Record New Message
//                   </Button>
//                 </div>
//               ) : (
//                 <DragDropContext onDragEnd={onDragEnd}>
//                   <Droppable droppableId="messages">
//                     {(provided) => (
//                       <div
//                         ref={provided.innerRef}
//                         {...provided.droppableProps}
//                         className={getGridLayoutClass()}
//                       >
//                         <AnimatePresence>
//                           {filteredMessages.map((message, index) => (
//                             <div 
//                               key={message._id}
//                               className={cn(
//                                 selectedView === "masonry" ? "break-inside-avoid mb-6" : ""
//                               )}
//                             >
//                               <Draggable
//                                 draggableId={message._id}
//                                 index={index}
//                               >
//                                 {(provided) => (
//                                   <EnhancedAudioCard
//                                     message={message}
//                                     index={index}
//                                     isDark={isDark}
//                                     provided={provided}
//                                     inView={containerInView}
//                                     onDelete={handleDelete}
//                                     onEdit={handleEdit}
//                                     onShare={handleShare}
//                                     selectedVisualizer={visualizerType}
//                                   />
//                                 )}
//                               </Draggable>
//                             </div>
//                           ))}
//                         </AnimatePresence>
//                         {provided.placeholder}
//                       </div>
//                     )}
//                   </Droppable>
//                 </DragDropContext>
//               )}
//             </MeteorEffect>
//           </div>
//         </ScrollArea>
        
//         {/* Lamp Spotlight on Record Button */}
//         <LampContainer
//           className="fixed bottom-0 right-0 w-40 h-40 pointer-events-none"
//           size="small"
//           color={isDark ? "rgba(255, 107, 107, 0.3)" : "rgba(128, 0, 0, 0.2)"}
//         >
//           <div className="absolute bottom-8 right-8 z-50 pointer-events-auto">
//             <Tooltip title={isRecording ? "Stop Recording" : "Record a Message"}>
//               <Fab
//                 color="primary"
//                 aria-label="record"
//                 onClick={isRecording ? stopRecording : startRecording}
//                 sx={{
//                   background: isRecording 
//                     ? 'linear-gradient(to right, #FF0000, #990000)'
//                     : isDark 
//                       ? 'linear-gradient(to right, #FF6B6B, #800000)'
//                       : 'linear-gradient(to right, #800000, #FF6B6B)',
//                   boxShadow: `0 4px 20px ${isRecording ? 'rgba(255, 0, 0, 0.5)' : isDark ? 'rgba(255, 107, 107, 0.5)' : 'rgba(128, 0, 0, 0.5)'}`,
//                   '&:hover': {
//                     background: isRecording 
//                       ? 'linear-gradient(to right, #FF3333, #CC0000)'
//                       : isDark 
//                         ? 'linear-gradient(to right, #FF8787, #A52A2A)'
//                         : 'linear-gradient(to right, #A52A2A, #FF8787)',
//                   }
//                 }}
//               >
//                 {isRecording ? <MicOff /> : <Mic />}
//               </Fab>
//             </Tooltip>
            
//             {isRecording && (
//               <motion.div
//                 className="absolute -inset-1.5 rounded-full"
//                 initial={{ opacity: 0.3, scale: 1 }}
//                 animate={{ opacity: 0, scale: 1.8 }}
//                 transition={{ duration: 2, repeat: Infinity }}
//                 style={{ background: `radial-gradient(circle, rgba(255,0,0,0.3) 0%, transparent 70%)` }}
//               />
//             )}
//           </div>
//         </LampContainer>

//         {/* Delete Confirmation Dialog */}
//         <Dialog
//           open={!!deleteId}
//           onClose={() => setDeleteId(null)}
//           PaperProps={{
//             style: { 
//               background: isDark ? "#1A0F2A" : "#FFF5F5", 
//               color: isDark ? "#E6D9F2" : "#4A4A4A",
//               borderRadius: "12px",
//               boxShadow: isDark 
//                 ? "0 10px 25px rgba(0, 0, 0, 0.5)" 
//                 : "0 10px 25px rgba(0, 0, 0, 0.1)"
//             },
//           }}
//           TransitionComponent={Zoom}
//           transitionDuration={300}
//         >
//           <DialogTitle sx={{ borderBottom: `1px solid ${isDark ? 'rgba(255,107,107,0.2)' : 'rgba(128,0,0,0.1)'}` }}>
//             Confirm Deletion
//           </DialogTitle>
//           <DialogContent sx={{ my: 2 }}>
//             <Typography variant="body1">
//               Are you sure you want to delete this audio message? This action cannot be undone.
//             </Typography>
//           </DialogContent>
//           <DialogActions sx={{ p: 2, pt: 0 }}>
//             <Button onClick={() => setDeleteId(null)} variant="outline" className="rounded-lg">
//               Cancel
//             </Button>
//             <Button 
//               onClick={confirmDelete} 
//               className={cn(
//                 "bg-red-500 hover:bg-red-600 text-white rounded-lg",
//                 deleteMessageMutation.isPending && "opacity-50 cursor-not-allowed"
//               )}
//               disabled={deleteMessageMutation.isPending}
//             >
//               {deleteMessageMutation.isPending ? "Deleting..." : "Delete"}
//             </Button>
//           </DialogActions>
//         </Dialog>
        
//         {/* Recording Drawer */}
//         <Drawer
//           anchor={isMobile ? "bottom" : "right"}
//           open={isRecordingDrawerOpen}
//           onClose={() => setIsRecordingDrawerOpen(false)}
//           PaperProps={{
//             sx: {
//               width: isMobile ? "100%" : 400,
//               height: isMobile ? "70%" : "100%",
//               background: isDark ? "#1A0F2A" : "#FFF5F5",
//               color: isDark ? "#E6D9F2" : "#4A4A4A",
//               borderRadius: isMobile ? "16px 16px 0 0" : "16px 0 0 16px",
//               overflow: "hidden"
//             }
//           }}
//         >
//           <div className="p-4 h-full flex flex-col">
//             <div className="flex items-center justify-between mb-4">
//               <Typography variant="h6" className={isDark ? "text-[#FF6B6B]" : "text-[#800000]"}>
//                 {isRecording ? "Recording..." : "New Audio Message"}
//               </Typography>
//               <IconButton 
//                 onClick={() => setIsRecordingDrawerOpen(false)}
//                 className={isDark ? "text-[#E6D9F2]" : "text-[#4A4A4A]"}
//               >
//                 <X size={20} />
//               </IconButton>
//             </div>
            
//             <Divider className={isDark ? "bg-[#E6D9F2]/10" : "bg-[#4A4A4A]/10"} />
            
//             <div className="flex-1 flex items-center justify-center">
//               <MacWindowMockup className="w-full max-w-sm">
//                 <div className="h-[300px] flex flex-col items-center justify-center bg-gradient-to-br from-[#1A0F2A]/80 to-[#2A1B3D]/80 text-white p-6 rounded-b-lg">
//                   <div className="relative mb-8">
//                     <motion.div
//                       className="w-20 h-20 rounded-full bg-[#FF6B6B]/80 flex items-center justify-center cursor-pointer"
//                       whileHover={{ scale: 1.05 }}
//                       whileTap={{ scale: 0.95 }}
//                       animate={isRecording ? {
//                         scale: [1, 1.1, 1],
//                         boxShadow: [
//                           "0 0 0 0 rgba(255, 107, 107, 0.7)",
//                           "0 0 0 10px rgba(255, 107, 107, 0)",
//                           "0 0 0 0 rgba(255, 107, 107, 0.7)"
//                         ]
//                       } : {}}
//                       transition={{ duration: 2, repeat: isRecording ? Infinity : 0 }}
//                       onClick={isRecording ? stopRecording : startRecording}
//                     >
//                       {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
//                     </motion.div>
                    
//                     {isRecording && (
//                       <div className="absolute -inset-4">
//                         <div className="w-full h-full">
//                           <SparklesCore
//                             id="recording-sparkles"
//                             background="transparent"
//                             minSize={0.4}
//                             maxSize={1}
//                             particleDensity={30}
//                             particleColor="#FF6B6B"
//                             className="w-full h-full"
//                           />
//                         </div>
//                       </div>
//                     )}
//                   </div>
                  
//                   <Typography variant="body1" className="text-center mb-2">
//                     {isRecording ? "Recording in progress..." : "Tap to record your audio message"}
//                   </Typography>
                  
//                   {isRecording && (
//                     <Typography variant="caption" className="text-gray-300">
//                       00:00:15
//                     </Typography>
//                   )}
//                 </div>
//               </MacWindowMockup>
//             </div>
            
//             <Divider className={isDark ? "bg-[#E6D9F2]/10" : "bg-[#4A4A4A]/10"} />
            
//             <div className="mt-4 flex justify-end">
//               <Button
//                 variant="outline"
//                 className="mr-2 rounded-lg"
//                 onClick={() => setIsRecordingDrawerOpen(false)}
//               >
//                 Cancel
//               </Button>
              
//               <Button
//                 className={cn(
//                   "rounded-lg",
//                   isDark
//                     ? "bg-gradient-to-r from-[#FF6B6B] to-[#800000] text-white hover:from-[#FF8787] hover:to-[#A52A2A]"
//                     : "bg-gradient-to-r from-[#800000] to-[#FF6B6B] text-white hover:from-[#A52A2A] hover:to-[#FF8787]"
//                 )}
//                 disabled={!isRecording}
//               >
//                 <Wand2 className="mr-1" size={16} />
//                 Process Recording
//               </Button>
//             </div>
//           </div>
//         </Drawer>
        
//         {/* Edit Message Dialog */}
//         {editMessage && (
//           <Dialog
//             open={!!editMessage}
//             onClose={() => setEditMessage(null)}
//             fullWidth
//             maxWidth="sm"
//             PaperProps={{
//               style: { 
//                 background: isDark ? "#1A0F2A" : "#FFF5F5", 
//                 color: isDark ? "#E6D9F2" : "#4A4A4A",
//                 borderRadius: "12px"
//               },
//             }}
//           >
//             <DialogTitle>Edit Audio Message</DialogTitle>
//             <DialogContent>
//               <TextField
//                 margin="dense"
//                 label="Title"
//                 fullWidth
//                 variant="outlined"
//                 defaultValue={editMessage.title}
//                 sx={{
//                   "& .MuiOutlinedInput-root": {
//                     color: isDark ? "#E6D9F2" : "#4A4A4A",
//                     "& fieldset": {
//                       borderColor: isDark ? "#FF6B6B" : "#800000",
//                     },
//                   },
//                   "& .MuiInputLabel-root": { color: isDark ? "#E6D9F2" : "#4A4A4A" },
//                 }}
//               />
//               <TextField
//                 margin="dense"
//                 label="Caption"
//                 fullWidth
//                 variant="outlined"
//                 multiline
//                 rows={2}
//                 defaultValue={editMessage.caption || ""}
//                 sx={{
//                   mt: 2,
//                   "& .MuiOutlinedInput-root": {
//                     color: isDark ? "#E6D9F2" : "#4A4A4A",
//                     "& fieldset": {
//                       borderColor: isDark ? "#FF6B6B" : "#800000",
//                     },
//                   },
//                   "& .MuiInputLabel-root": { color: isDark ? "#E6D9F2" : "#4A4A4A" },
//                 }}
//               />
              
//               <FormControl fullWidth margin="dense" sx={{ mt: 2 }}>
//                 <InputLabel sx={{ color: isDark ? "#E6D9F2" : "#4A4A4A" }}>Mood</InputLabel>
//                 <Select
//                   defaultValue={editMessage.mood || ""}
//                   label="Mood"
//                   sx={{
//                     color: isDark ? "#E6D9F2" : "#4A4A4A",
//                     "& .MuiOutlinedInput-notchedOutline": {
//                       borderColor: isDark ? "#FF6B6B" : "#800000",
//                     },
//                   }}
//                 >
//                   <MenuItem value="">None</MenuItem>
//                   <MenuItem value="romantic">Romantic</MenuItem>
//                   <MenuItem value="happy">Happy</MenuItem>
//                   <MenuItem value="reflective">Reflective</MenuItem>
//                   <MenuItem value="playful">Playful</MenuItem>
//                   <MenuItem value="missingYou">Missing You</MenuItem>
//                 </Select>
//               </FormControl>
//             </DialogContent>
//             <DialogActions>
//               <Button 
//                 onClick={() => setEditMessage(null)}
//                 variant="outline"
//               >
//                 Cancel
//               </Button>
//               <Button 
//                 className={cn(
//                   isDark
//                     ? "bg-gradient-to-r from-[#FF6B6B] to-[#800000] text-white"
//                     : "bg-gradient-to-r from-[#800000] to-[#FF6B6B] text-white"
//                 )}
//               >
//                 Save Changes
//               </Button>
//             </DialogActions>
//           </Dialog>
//         )}
//       </section>
//     </div>
//   );
// };

// export default EnhancedMessagesSection;