// import { useState, useMemo, useRef, useEffect } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { client } from "@/lib/sanity";
// import groq from "groq";
// import toast from "react-hot-toast";
// import {
//   Box,
//   Card,
//   CardContent,
//   Typography,
//   Select,
//   MenuItem,
//   FormControl,
//   InputLabel,
//   Fab,
//   CircularProgress,
//   IconButton,
//   Chip,
//   Tooltip,
//   Collapse,
//   Switch,
//   useMediaQuery,
// } from "@mui/material";
// import { motion, AnimatePresence } from "framer-motion";
// import { Mic, Heart, Delete, ChevronDown, ChevronUp, Volume2 } from "lucide-react";
// import { styled, useTheme } from "@mui/system";
// import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { cn } from "@/lib/utils";

// // Styled Components
// const StoryCard = styled(Box)<{ isDark: boolean; expanded: boolean }>(({ theme, isDark, expanded }) => ({
//   position: "relative",
//   borderRadius: 16,
//   boxShadow: isDark ? "0 8px 32px rgba(255, 107, 107, 0.2)" : "0 8px 32px rgba(0, 0, 0, 0.1)",
//   background: isDark ? "rgba(33, 33, 33, 0.9)" : "rgba(255, 255, 255, 0.9)",
//   backdropFilter: "blur(10px)",
//   border: "1px solid rgba(255, 107, 107, 0.2)",
//   transition: "all 0.3s",
//   width: expanded ? "100%" : `${200 + Math.random() * 100}px`,
//   maxWidth: "400px",
//   zIndex: expanded ? 10 : Math.floor(Math.random() * 5),
//   transform: expanded ? "translate(0, 0) scale(1.05)" : `translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px)`,
//   "&:hover": {
//     boxShadow: isDark ? "0 12px 40px rgba(255, 107, 107, 0.3)" : "0 12px 40px rgba(0, 0, 0, 0.2)",
//   },
//   [theme.breakpoints.down("sm")]: {
//     width: "100%",
//     transform: expanded ? "translate(0, 0) scale(1)" : "translate(0, 0)",
//   },
// }));

// const ProgressArc = styled(Box)(({ progress }: { progress: number }) => ({
//   position: "absolute",
//   top: -2,
//   left: -2,
//   right: -2,
//   bottom: -2,
//   borderRadius: 18,
//   border: `4px solid transparent`,
//   borderTopColor: progress > 0 ? "#FF6B6B" : "transparent",
//   borderRightColor: progress > 0.25 ? "#FF6B6B" : "transparent",
//   borderBottomColor: progress > 0.5 ? "#FF6B6B" : "transparent",
//   borderLeftColor: progress > 0.75 ? "#FF6B6B" : "transparent",
//   transition: "border-color 0.1s linear",
// }));

// const FloatingFab = styled(Fab)(({ theme }) => ({
//   background: "linear-gradient(45deg, #FF6B6B, #FF1493)",
//   color: "white",
//   "&:hover": {
//     background: "linear-gradient(45deg, #FF1493, #FF6B6B)",
//     transform: "scale(1.1)",
//   },
//   transition: "transform 0.3s",
// }));

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
// }

// const getMessagesQuery = groq`
//   *[_type == "audioMessage"] | order(_createdAt desc) {
//     _id, title, audioFile { asset-> { url, _ref } }, caption, description, mood,
//     duration, isPrivate, backgroundMusic { asset-> { url, _ref } }, visualizer,
//     scheduledFor, transcript, reactions, background, _createdAt
//   }
// `;

// // AudioMessage Component with Storyboard Style
// const AudioMessage = ({
//   _id,
//   title,
//   audioUrl,
//   caption,
//   description,
//   mood,
//   duration,
//   isPrivate,
//   backgroundMusic,
//   visualizer,
//   scheduledFor,
//   transcript,
//   reactions,
//   background,
//   onDelete,
//   isDark,
// }: AudioMessageType & { onDelete: () => void; isDark: boolean }) => {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
//   const [expanded, setExpanded] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [playing, setPlaying] = useState(false);
//   const audioRef = useRef<HTMLAudioElement>(null);

//   useEffect(() => {
//     const audio = audioRef.current;
//     if (!audio) return;

//     const updateProgress = () => {
//       setProgress(audio.currentTime / (audio.duration || 1));
//     };
//     audio.addEventListener("timeupdate", updateProgress);
//     audio.addEventListener("ended", () => setPlaying(false));
//     return () => {
//       audio.removeEventListener("timeupdate", updateProgress);
//       audio.removeEventListener("ended", () => setPlaying(false));
//     };
//   }, []);

//   const handlePlayPause = () => {
//     const audio = audioRef.current;
//     if (audio) {
//       if (playing) {
//         audio.pause();
//       } else {
//         audio.play();
//       }
//       setPlaying(!playing);
//     }
//   };

//   return (
//     <AnimatePresence>
//       <motion.div
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         exit={{ opacity: 0, scale: 0.9 }}
//         transition={{ duration: 0.3 }}
//       >
//         <StoryCard isDark={isDark} expanded={expanded}>
//           <ProgressArc progress={progress} />
//           <CardContent
//             sx={{
//               position: "relative",
//               backgroundImage: background?.imageUrl ? `url(${background.imageUrl})` : "none",
//               backgroundSize: "cover",
//               filter: playing ? "blur(0px)" : "blur(5px)",
//               transition: "filter 0.5s",
//             }}
//           >
//             <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
//               <Tooltip title="Chapter Title">
//                 <Typography variant="h6" sx={{ color: isDark ? "#FF1493" : "#FF6B6B", fontFamily: "Playfair Display" }}>
//                   {title}
//                 </Typography>
//               </Tooltip>
//               {isPrivate && (
//                 <Tooltip title="This chapter is private">
//                   <Chip label="Private" size="small" color="secondary" />
//                 </Tooltip>
//               )}
//             </Box>
//             {caption && (
//               <Tooltip title="Chapter Caption">
//                 <Typography variant="subtitle2" sx={{ color: isDark ? "#ccc" : "text.secondary", mb: 1 }}>
//                   {caption}
//                 </Typography>
//               </Tooltip>
//             )}
//             <Tooltip title="Chapter Description">
//               <Typography variant="body2" sx={{ color: isDark ? "#ccc" : "text.secondary" }}>
//                 {description || "A story unfolds..."}
//               </Typography>
//             </Tooltip>
//             {audioUrl ? (
//               <Box sx={{ mt: 2 }}>
//                 <audio ref={audioRef} src={audioUrl} style={{ display: "none" }} />
//                 <Box sx={{ display: "flex", justifyContent: "space-between" }}>
//                   <Tooltip title={playing ? "Pause" : "Play"}>
//                     <IconButton onClick={handlePlayPause} sx={{ color: "#FF6B6B" }}>
//                       {playing ? <Volume2 /> : <Mic />}
//                     </IconButton>
//                   </Tooltip>
//                 </Box>
//                 {backgroundMusic?.asset?.url && (
//                   <Box sx={{ mt: 1 }}>
//                     <Tooltip title="Background Music">
//                       <Typography variant="caption" sx={{ color: isDark ? "#ccc" : "text.secondary" }}>
//                         Background Music:
//                       </Typography>
//                     </Tooltip>
//                     <audio controls src={backgroundMusic.asset.url} style={{ width: "100%" }} />
//                   </Box>
//                 )}
//               </Box>
//             ) : (
//               <Typography variant="caption" color="error" sx={{ mt: 1 }}>
//                 No audio source available
//               </Typography>
//             )}
//             <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
//               <Tooltip title="Mood of the chapter">
//                 <Typography variant="caption" sx={{ color: isDark ? "#ccc" : "text.secondary" }}>
//                   {mood || "Unknown mood"}
//                 </Typography>
//               </Tooltip>
//               <Tooltip title="Duration in seconds">
//                 <Typography variant="caption" sx={{ color: isDark ? "#ccc" : "text.secondary" }}>
//                   {duration ? `${duration}s` : "N/A"}
//                 </Typography>
//               </Tooltip>
//             </Box>
//             {visualizer && (
//               <Tooltip title="Visualizer Style">
//                 <Typography variant="caption" sx={{ color: isDark ? "#ccc" : "text.secondary", mt: 1 }}>
//                   Visualizer: {visualizer}
//                 </Typography>
//               </Tooltip>
//             )}
//             {scheduledFor && (
//               <Tooltip title="Scheduled Delivery Time">
//                 <Typography variant="caption" sx={{ color: isDark ? "#ccc" : "text.secondary", mt: 1 }}>
//                   Scheduled: {new Date(scheduledFor).toLocaleString()}
//                 </Typography>
//               </Tooltip>
//             )}
//             {reactions?.length > 0 && (
//               <Box sx={{ mt: 1 }}>
//                 {reactions.map((reaction) => (
//                   <Tooltip key={reaction.emoji} title={`Reactions: ${reaction.count}`}>
//                     <Chip
//                       label={`${reaction.emoji} ${reaction.count}`}
//                       size="small"
//                       sx={{ mr: 1, bgcolor: "rgba(255, 107, 107, 0.2)" }}
//                     />
//                   </Tooltip>
//                 ))}
//               </Box>
//             )}
//             <Collapse in={expanded}>
//               {transcript && (
//                 <Tooltip title="Chapter Transcript">
//                   <Typography variant="body2" sx={{ color: isDark ? "#ccc" : "text.secondary", mt: 2 }}>
//                     Transcript: {transcript}
//                   </Typography>
//                 </Tooltip>
//               )}
//               {background?.imageUrl && (
//                 <Box
//                   component="img"
//                   src={background.imageUrl}
//                   sx={{ width: "100%", mt: 2, borderRadius: 2 }}
//                 />
//               )}
//             </Collapse>
//             <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
//               <Tooltip title={expanded ? "Collapse" : "Expand to see transcript and visuals"}>
//                 <IconButton onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }} sx={{ color: "#FF6B6B" }}>
//                   {expanded ? <ChevronUp /> : <ChevronDown />}
//                 </IconButton>
//               </Tooltip>
//               <Tooltip title="Delete this chapter">
//                 <IconButton onClick={(e) => { e.stopPropagation(); onDelete(); }} sx={{ color: "#FF6B6B" }}>
//                   <Delete />
//                 </IconButton>
//               </Tooltip>
//             </Box>
//           </CardContent>
//         </StoryCard>
//       </motion.div>
//     </AnimatePresence>
//   );
// };

// const MessagesSection = () => {
//   const queryClient = useQueryClient();
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
//   const [layout, setLayout] = useState<"storyboard" | "grid">("storyboard");
//   const [position, setPosition] = useState<"top" | "bottom" | "full">("bottom");
//   const [moodFilter, setMoodFilter] = useState<string | null>(null);
//   const [isDark, setIsDark] = useState(false);

//   const { data: messages = [], isLoading, error } = useQuery<AudioMessageType[]>({
//     queryKey: ["audioMessages", moodFilter],
//     queryFn: async () => {
//       try {
//         return await client.fetch(
//           moodFilter
//             ? `${getMessagesQuery} [mood == "${moodFilter}"]`
//             : getMessagesQuery
//         );
//       } catch (err) {
//         toast.error("Failed to fetch story chapters!");
//         throw err;
//       }
//     },
//     retry: 2,
//     staleTime: 5 * 60 * 1000,
//   });

//   const deleteMessageMutation = useMutation({
//     mutationFn: async (id: string) => await client.delete(id),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["audioMessages"] });
//       toast.success("Chapter removed!", { icon: "💔" });
//     },
//     onError: () => toast.error("Deletion failed!"),
//   });

//   const filteredMessages = useMemo(
//     () =>
//       messages.map((msg) => ({
//         ...msg,
//         audioUrl: msg.audioFile?.asset?.url || undefined,
//       })),
//     [messages]
//   );

//   const renderMessages = () => {
//     if (isLoading) {
//       return (
//         <Box sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 2 }}>
//           {Array(6)
//             .fill(0)
//             .map((_, idx) => (
//               <StoryCard key={idx} isDark={isDark} expanded={false}>
//                 <CardContent>
//                   <CircularProgress sx={{ color: "#FF6B6B" }} />
//                 </CardContent>
//               </StoryCard>
//             ))}
//         </Box>
//       );
//     }

//     if (error) {
//       return (
//         <Typography color="error" align="center" sx={{ py: 4 }}>
//           Oops! Something went wrong: {error.message}
//         </Typography>
//       );
//     }

//     if (filteredMessages.length === 0) {
//       return (
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           sx={{
//             textAlign: "center",
//             py: 8,
//             bgcolor: isDark ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.5)",
//             borderRadius: 4,
//             border: "1px solid rgba(255, 107, 107, 0.2)",
//           }}
//         >
//           <motion.div
//             animate={{ scale: [1, 1.2, 1] }}
//             transition={{ duration: 1.5, repeat: Infinity }}
//           >
//             <Heart size={48} color="#FF6B6B" />
//           </motion.div>
//           <Typography variant="h5" sx={{ color: isDark ? "#FF1493" : "#FF6B6B", mt: 2 }}>
//             No Story Chapters Yet
//           </Typography>
//           <Typography variant="body1" sx={{ color: isDark ? "#ccc" : "text.secondary", mb: 2 }}>
//             "Begin your tale—record your first chapter!"
//           </Typography>
//           <Button
//             variant="contained"
//             startIcon={<Mic />}
//             sx={{
//               bgcolor: "#FF6B6B",
//               "&:hover": { bgcolor: "#FF1493" },
//               borderRadius: 20,
//             }}
//           >
//             Record Now
//           </Button>
//         </motion.div>
//       );
//     }

//     return (
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "center",
//           flexWrap: "wrap",
//           gap: 2,
//           ...(isMobile && { flexDirection: "column", alignItems: "center" }),
//           ...(layout === "grid" && { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))" }),
//         }}
//       >
//         {filteredMessages.map((message) => (
//           <AudioMessage
//             key={message._id}
//             {...message}
//             onDelete={() =>
//               window.confirm("Remove this story chapter?") &&
//               deleteMessageMutation.mutate(message._id)
//             }
//             isDark={isDark}
//           />
//         ))}
//       </Box>
//     );
//   };

//   return (
//     <ScrollArea className="h-[calc(100vh-4rem)]">
//       <Box className="relative min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
//         <motion.div
//           initial={false}
//           animate={{
//             backgroundColor: isDark ? "rgba(0,0,0,0.9)" : "rgba(255,255,255,0.9)"
//           }}
//           transition={{ duration: 0.3 }}
//           className="relative z-10 px-4 py-8"
//         >
//           {/* Header Section */}
//           <motion.div
//             initial={{ y: -20, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             className="flex flex-col sm:flex-row justify-between items-center mb-8"
//           >
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.8 }}
//             >
//               <Typography
//                 variant="h4"
//                 sx={{ color: isDark ? "#FF1493" : "#FF6B6B", fontFamily: "Playfair Display" }}
//               >
//                 Audio Story Chapters
//               </Typography>
//             </motion.div>
//             <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: { xs: 2, sm: 0 } }}>
//               <FormControl size="small">
//                 <InputLabel sx={{ color: isDark ? "#FF1493" : "#FF6B6B" }}>Layout</InputLabel>
//                 <Select
//                   value={layout}
//                   label="Layout"
//                   onChange={(e) => setLayout(e.target.value as "storyboard" | "grid")}
//                   sx={{ bgcolor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.2)", borderRadius: 2, color: isDark ? "#FF1493" : "#FF6B6B" }}
//                 >
//                   <MenuItem value="storyboard">Storyboard</MenuItem>
//                   <MenuItem value="grid">Grid</MenuItem>
//                 </Select>
//               </FormControl>
//               <FormControl size="small">
//                 <InputLabel sx={{ color: isDark ? "#FF1493" : "#FF6B6B" }}>Position</InputLabel>
//                 <Select
//                   value={position}
//                   label="Position"
//                   onChange={(e) =>
//                     setPosition(e.target.value as "top" | "bottom" | "full")
//                   }
//                   sx={{ bgcolor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.2)", borderRadius: 2, color: isDark ? "#FF1493" : "#FF6B6B" }}
//                 >
//                   <MenuItem value="top">Top</MenuItem>
//                   <MenuItem value="bottom">Bottom</MenuItem>
//                   <MenuItem value="full">Full</MenuItem>
//                 </Select>
//               </FormControl>
//               <FormControl size="small">
//                 <InputLabel sx={{ color: isDark ? "#FF1493" : "#FF6B6B" }}>Mood</InputLabel>
//                 <Select
//                   value={moodFilter || ""}
//                   label="Mood"
//                   onChange={(e) => setMoodFilter(e.target.value || null)}
//                   sx={{ bgcolor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.2)", borderRadius: 2, color: isDark ? "#FF1493" : "#FF6B6B" }}
//                 >
//                   <MenuItem value="">All Moods</MenuItem>
//                   <MenuItem value="romantic">Romantic</MenuItem>
//                   <MenuItem value="happy">Happy</MenuItem>
//                   <MenuItem value="reflective">Reflective</MenuItem>
//                   <MenuItem value="playful">Playful</MenuItem>
//                   <MenuItem value="missingYou">Missing You</MenuItem>
//                 </Select>
//               </FormControl>
//               <Tooltip title="Toggle Dark Mode">
//                 <Switch
//                   checked={isDark}
//                   onChange={() => setIsDark(!isDark)}
//                   sx={{ color: "#FF6B6B" }}
//                 />
//               </Tooltip>
//             </Box>
//           </motion.div>

//           {/* Messages Grid/Layout */}
//           <Box
//             className={cn(
//               "grid gap-4 w-full",
//               layout === "grid" 
//                 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
//                 : "grid-cols-1 md:grid-cols-2"
//             )}
//           >
//             {renderMessages()}
//           </Box>

//           {/* Floating Action Button */}
//           <motion.div
//             whileHover={{ scale: 1.1 }}
//             whileTap={{ scale: 0.95 }}
//             className="fixed bottom-6 right-6"
//           >
//             <Button 
//               size="lg"
//               className="rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
//               onClick={() => {/* Add record action */}}
//             >
//               <Mic className="mr-2" />
//               Record New Story
//             </Button>
//           </motion.div>
//         </motion.div>
//       </Box>
//     </ScrollArea>
//   );
// };

// export default MessagesSection;