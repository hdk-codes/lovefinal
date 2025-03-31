// import { useState, useMemo, useRef, useEffect } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { client } from "@/lib/sanity";
// import groq from "groq";
// import toast from "react-hot-toast";
// import {
//   Box,
//   Grid,
//   Card,
//   CardContent,
//   Typography,
//   Button,
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
//   Slider,
//   useMediaQuery,
// } from "@mui/material";
// import { motion } from "framer-motion";
// import { Mic, Heart, Delete, ChevronDown, Volume } from "lucide-react";
// import { styled, useTheme } from "@mui/system";

// // Styled Components
// const HoloCard = styled(Card)(({ theme }) => ({
//   background: "linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(255, 20, 147, 0.1))",
//   backdropFilter: "blur(10px)",
//   border: "1px solid rgba(255, 255, 255, 0.2)",
//   borderRadius: "16px",
//   boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
//   transition: "transform 0.3s, box-shadow 0.3s",
//   "&:hover": {
//     transform: "translateY(-5px) scale(1.05)",
//     boxShadow: "0 12px 40px rgba(255, 107, 107, 0.3)",
//   },
// }));

// const VinylRecord = styled(Box)(({ theme }) => ({
//   width: 200,
//   height: 200,
//   borderRadius: "50%",
//   background: "radial-gradient(circle, #333, #000)",
//   position: "relative",
//   animation: "spin 4s linear infinite",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   [theme.breakpoints.down("sm")]: {
//     width: 100,
//     height: 100,
//   },
//   "@keyframes spin": {
//     "0%": { transform: "rotate(0deg)" },
//     "100%": { transform: "rotate(360deg)" },
//   },
// }));

// const Needle = styled(Box)(({ theme, progress }: { theme?: any; progress: number }) => ({
//   position: "absolute",
//   top: -20,
//   left: "50%",
//   width: 2,
//   height: 50,
//   background: "#FF6B6B",
//   transformOrigin: "bottom",
//   transform: `rotate(${progress * 90 - 45}deg)`,
//   transition: "transform 0.1s linear",
//   [theme?.breakpoints?.down("sm") ? theme.breakpoints.down("sm") : "@media (max-width: 600px)"]: {
//     display: "none",
//   },
// }));

// const ConcentricRing = styled(Box)(({ theme, ringIndex }: { theme?: any; ringIndex: number }) => ({
//   position: "absolute",
//   borderRadius: "50%",
//   border: "1px solid rgba(255, 107, 107, 0.2)",
//   width: theme?.breakpoints?.down("sm") ? `${50 + ringIndex * 10}px` : `${100 + ringIndex * 20}px`,
//   height: theme?.breakpoints?.down("sm") ? `${50 + ringIndex * 10}px` : `${100 + ringIndex * 20}px`,
//   animation: `pulse${ringIndex} 2s infinite`,
//   [`@keyframes pulse${ringIndex}`]: {
//     "0%": { transform: "scale(1)", opacity: 0.2 },
//     "50%": { transform: "scale(1.1)", opacity: 0.5 },
//     "100%": { transform: "scale(1)", opacity: 0.2 },
//   },
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
// }

// const getMessagesQuery = groq`
//   *[_type == "audioMessage"] | order(_createdAt desc) {
//     _id, title, audioFile { asset-> { url, _ref } }, caption, description, mood,
//     duration, isPrivate, backgroundMusic { asset-> { url, _ref } }, visualizer,
//     scheduledFor, transcript, reactions, background, _createdAt
//   }
// `;

// // Enhanced AudioMessage Component with Vinyl Design
// const AudioMessage = ({
//   _id,
//   title,
//   // audioUrl,      
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
// }: AudioMessageType & { onDelete: () => void }) => {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
//   const [expanded, setExpanded] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const audioRef = useRef<HTMLAudioElement>(null);

//   useEffect(() => {
//     const audio = audioRef.current;
//     if (!audio) return;

//     const updateProgress = () => {
//       setProgress(audio.currentTime / (audio.duration || 1));
//     };
//     audio.addEventListener("timeupdate", updateProgress);
//     return () => audio.removeEventListener("timeupdate", updateProgress);
//   }, []);

//   const handleScrub = (event: any, newValue: number | number[]) => {
//     const audio = audioRef.current;
//     if (audio) {
//       audio.currentTime = ((newValue as number) / 100) * (audio.duration || 0);
//       setProgress((newValue as number) / 100);
//     }
//   };

//   return (
//     <HoloCard
//       sx={{
//         position: "relative",
//         zIndex: Math.floor(Math.random() * 10),
//         ...(background?.color && { backgroundColor: background.color }),
//         ...(background?.imageUrl && {
//           backgroundImage: `url(${background.imageUrl})`,
//           backgroundSize: "cover",
//         }),
//       }}
//     >
//       <CardContent>
//         <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
//           <Tooltip title="Message Title">
//             <Typography variant="h6" sx={{ color: "#FF6B6B", fontFamily: "Playfair Display" }}>
//               {title}
//             </Typography>
//           </Tooltip>
//           {isPrivate && (
//             <Tooltip title="This message is private">
//               <Chip label="Private" size="small" color="secondary" />
//             </Tooltip>
//           )}
//         </Box>
//         {caption && (
//           <Tooltip title="Caption">
//             <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
//               {caption}
//             </Typography>
//           </Tooltip>
//         )}
//         <Box sx={{ position: "relative", display: "flex", justifyContent: "center", mb: 2 }}>
//           <VinylRecord>
//             <Typography
//               variant="body2"
//               sx={{ color: "white", fontFamily: "Courier New", textAlign: "center" }}
//             >
//               {title}
//             </Typography>
//             {Array.from({ length: 3 }).map((_, i) => (
//               <ConcentricRing key={i} ringIndex={i} />
//             ))}
//             {!isMobile && <Needle progress={progress} />}
//           </VinylRecord>
//         </Box>
//         {audioUrl ? (
//           <Box sx={{ mt: 1 }}>
//             <audio ref={audioRef} src={audioUrl} style={{ display: "none" }} />
//             {isMobile ? (
//               <Slider
//                 value={progress * 100}
//                 onChange={handleScrub}
//                 sx={{ color: "#FF6B6B" }}
//               />
//             ) : null}
//             <Box sx={{ display: "flex", justifyContent: "space-between" }}>
//               <Button
//                 onClick={() => audioRef.current?.play()}
//                 startIcon={<Volume />}
//                 sx={{ color: "#FF6B6B" }}
//               >
//                 Play
//               </Button>
//               <Button
//                 onClick={() => audioRef.current?.pause()}
//                 sx={{ color: "#FF6B6B" }}
//               >
//                 Pause
//               </Button>
//             </Box>
//             {backgroundMusic?.asset?.url && (
//               <Box sx={{ mt: 1 }}>
//                 <Tooltip title="Background Music">
//                   <Typography variant="caption" color="text.secondary">
//                     Background Music:
//                   </Typography>
//                 </Tooltip>
//                 <audio controls src={backgroundMusic.asset.url} style={{ width: "100%" }} />
//               </Box>
//             )}
//           </Box>
//         ) : (
//           <Typography variant="caption" color="error" sx={{ mt: 1 }}>
//             No audio source available
//           </Typography>
//         )}
//         <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
//           <Tooltip title="Mood of the message">
//             <Typography variant="caption" color="text.secondary">
//               {mood || "Unknown mood"}
//             </Typography>
//           </Tooltip>
//           <Tooltip title="Duration in seconds">
//             <Typography variant="caption" color="text.secondary">
//               {duration ? `${duration}s` : "N/A"}
//             </Typography>
//           </Tooltip>
//         </Box>
//         {visualizer && (
//           <Tooltip title="Visualizer Style">
//             <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
//               Visualizer: {visualizer}
//             </Typography>
//           </Tooltip>
//         )}
//         {scheduledFor && (
//           <Tooltip title="Scheduled Delivery Time">
//             <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
//               Scheduled: {new Date(scheduledFor).toLocaleString()}
//             </Typography>
//           </Tooltip>
//         )}
//         {reactions?.length > 0 && (
//           <Box sx={{ mt: 1 }}>
//             {reactions.map((reaction) => (
//               <Tooltip key={reaction.emoji} title={`Reactions: ${reaction.count}`}>
//                 <Chip
//                   label={`${reaction.emoji} ${reaction.count}`}
//                   size="small"
//                   sx={{ mr: 1, bgcolor: "rgba(255, 107, 107, 0.2)" }}
//                 />
//               </Tooltip>
//             ))}
//           </Box>
//         )}
//         <Collapse in={expanded}>
//           {transcript && (
//             <Tooltip title="Audio Transcript">
//               <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
//                 Transcript: {transcript}
//               </Typography>
//             </Tooltip>
//           )}
//         </Collapse>
//         <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
//           <Tooltip title="Expand to see transcript">
//             <IconButton onClick={() => setExpanded(!expanded)}>
//               <ChevronDown />
//             </IconButton>
//           </Tooltip>
//           <Tooltip title="Delete this message">
//             <IconButton onClick={onDelete} sx={{ color: "#FF6B6B" }}>
//               <Delete />
//             </IconButton>
//           </Tooltip>
//         </Box>
//       </CardContent>
//     </HoloCard>
//   );
// };

// const MessagesSection = () => {
//   const queryClient = useQueryClient();
//   const [layout, setLayout] = useState<"waveform" | "grid">("waveform");
//   const [position, setPosition] = useState<"top" | "bottom" | "full">("bottom");
//   const [moodFilter, setMoodFilter] = useState<string | null>(null);

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
//         toast.error("Failed to fetch love notes!");
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
//       toast.success("Love note vanished!", { icon: "💔" });
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
//         <Grid container spacing={2}>
//           {Array(6)
//             .fill(0)
//             .map((_, idx) => (
//               <Grid item xs={12} sm={6} md={4} key={idx}>
//                 <HoloCard>
//                   <CardContent>
//                     <CircularProgress sx={{ color: "#FF6B6B" }} />
//                   </CardContent>
//                 </HoloCard>
//               </Grid>
//             ))}
//         </Grid>
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
//             bgcolor: "rgba(255, 255, 255, 0.5)",
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
//           <Typography variant="h5" sx={{ color: "#FF1493", mt: 2 }}>
//             No Love Notes Yet
//           </Typography>
//           <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
//             "Spin a sweet tune—record your first note!"
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
//       <Grid
//         container
//         spacing={layout === "waveform" ? 1 : 2}
//         sx={{
//           ...(layout === "waveform" && {
//             position: "relative",
//             "& > .MuiGrid-item": {
//               position: "relative",
//               zIndex: (theme) => Math.floor(Math.random() * 10),
//               transform: (theme) =>
//                 `translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px)`,
//             },
//           }),
//         }}
//       >
//         {filteredMessages.map((message, index) => (
//           <Grid
//             item
//             xs={12}
//             sm={layout === "waveform" ? 6 : 4}
//             md={layout === "waveform" ? 4 : 3}
//             key={message._id}
//             sx={{
//               ...(layout === "waveform" && {
//                 maxWidth: `${200 + Math.random() * 100}px`,
//               }),
//             }}
//           >
//             <AudioMessage
//               {...message}
//               onDelete={() =>
//                 window.confirm("Delete this vinyl note?") &&
//                 deleteMessageMutation.mutate(message._id)
//               }
//             />
//           </Grid>
//         ))}
//       </Grid>
//     );
//   };

//   return (
//     <Box
//       component="section"
//       role="region"
//       aria-label="Audio Love Notes"
//       sx={{
//         position: "relative",
//         overflow: "hidden",
//         minHeight: position === "full" ? "100vh" : "auto",
//         py: position === "full" ? 8 : position === "top" ? 8 : 0,
//         pb: position === "bottom" ? 8 : 0,
//         bgcolor: "rgba(255, 255, 255, 0.9)",
//       }}
//     >
//       <Box
//         sx={{
//           position: "absolute",
//           inset: 0,
//           background: "linear-gradient(45deg, #FF6B6B, #FF1493, #8B5CF6)",
//           opacity: 0.1,
//           zIndex: 0,
//           animation: "wave 10s infinite",
//           "@keyframes wave": {
//             "0%": { transform: "scale(1) translate(0, 0)" },
//             "50%": { transform: "scale(1.1) translate(10px, -10px)" },
//             "100%": { transform: "scale(1) translate(0, 0)" },
//           },
//         }}
//       />
//       <Box sx={{ position: "relative", zIndex: 1, px: { xs: 2, sm: 4, md: 6 } }}>
//         <Box
//           sx={{
//             display: "flex",
//             flexDirection: { xs: "column", sm: "row" },
//             justifyContent: "space-between",
//             alignItems: "center",
//             mb: 4,
//           }}
//         >
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8 }}
//           >
//             <Typography
//               variant="h4"
//               sx={{ color: "#FF6B6B", fontFamily: "Playfair Display" }}
//             >
//               Audio Love Notes
//             </Typography>
//           </motion.div>
//           <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: { xs: 2, sm: 0 } }}>
//             <FormControl size="small">
//               <InputLabel sx={{ color: "#FF6B6B" }}>Layout</InputLabel>
//               <Select
//                 value={layout}
//                 label="Layout"
//                 onChange={(e) => setLayout(e.target.value as "waveform" | "grid")}
//                 sx={{ bgcolor: "rgba(255, 255, 255, 0.2)", borderRadius: 2, color: "#FF6B6B" }}
//               >
//                 <MenuItem value="waveform">Waveform</MenuItem>
//                 <MenuItem value="grid">Grid</MenuItem>
//               </Select>
//             </FormControl>
//             <FormControl size="small">
//               <InputLabel sx={{ color: "#FF6B6B" }}>Position</InputLabel>
//               <Select
//                 value={position}
//                 label="Position"
//                 onChange={(e) =>
//                   setPosition(e.target.value as "top" | "bottom" | "full")
//                 }
//                 sx={{ bgcolor: "rgba(255, 255, 255, 0.2)", borderRadius: 2, color: "#FF6B6B" }}
//               >
//                 <MenuItem value="top">Top</MenuItem>
//                 <MenuItem value="bottom">Bottom</MenuItem>
//                 <MenuItem value="full">Full</MenuItem>
//               </Select>
//             </FormControl>
//             <FormControl size="small">
//               <InputLabel sx={{ color: "#FF6B6B" }}>Mood</InputLabel>
//               <Select
//                 value={moodFilter || ""}
//                 label="Mood"
//                 onChange={(e) => setMoodFilter(e.target.value || null)}
//                 sx={{ bgcolor: "rgba(255, 255, 255, 0.2)", borderRadius: 2, color: "#FF6B6B" }}
//               >
//                 <MenuItem value="">All Moods</MenuItem>
//                 <MenuItem value="romantic">Romantic</MenuItem>
//                 <MenuItem value="happy">Happy</MenuItem>
//                 <MenuItem value="reflective">Reflective</MenuItem>
//                 <MenuItem value="playful">Playful</MenuItem>
//                 <MenuItem value="missingYou">Missing You</MenuItem>
//               </Select>
//             </FormControl>
//           </Box>
//         </Box>
//         {renderMessages()}
//         <FloatingFab
//           aria-label="Record a new love note"
//           sx={{ position: "fixed", bottom: 16, right: 16, zIndex: 10 }}
//         >
//           <Heart />
//         </FloatingFab>
//       </Box>
//     </Box>
//   );
// };

// export default MessagesSection;