// import { useState, useMemo, useRef, useEffect } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { client } from "@/lib/sanity";
// import groq from "groq";
// import toast from "react-hot-toast";
// import {
//   Box,
//   Grid,
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
//   Slider,
//   Switch,
//   useMediaQuery,
// } from "@mui/material";
// import { motion } from "framer-motion";
// import { Mic, Heart, Delete, ChevronDown, Volume } from "lucide-react";
// import { styled, useTheme } from "@mui/system";
// import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// // Styled Components
// const OrbContainer = styled(Box)(({ theme, isDark }: { theme: any; isDark: boolean }) => ({
//   position: "relative",
//   width: "100%",
//   height: 300,
//   display: "flex",
//   justifyContent: "center",
//   alignItems: "center",
//   background: isDark ? "radial-gradient(circle, #333, #000)" : "radial-gradient(circle, #fff, #f0f0f0)",
//   [theme.breakpoints.down("sm")]: {
//     height: 200,
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

// // AudioMessage Component with 3D Orb
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
//   const [volume, setVolume] = useState(50);
//   const [speed, setSpeed] = useState(1);
//   const [playing, setPlaying] = useState(false);
//   const audioRef = useRef<HTMLAudioElement>(null);
//   const orbRef = useRef<HTMLDivElement>(null);
//   const controlsRef = useRef<OrbitControls | null>(null);

//   useEffect(() => {
//     if (!audioUrl || !orbRef.current) return;

//     const audio = audioRef.current!;
//     audio.volume = volume / 100;
//     audio.playbackRate = speed;

//     // Three.js Setup
//     const scene = new THREE.Scene();
//     const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
//     const renderer = new THREE.WebGLRenderer({ alpha: true });
//     renderer.setSize(isMobile ? 150 : 250, isMobile ? 150 : 250);
//     orbRef.current.appendChild(renderer.domElement);

//     // Orb Geometry
//     const geometry = new THREE.SphereGeometry(1, 32, 32);
//     const material = new THREE.MeshPhongMaterial({
//       color: isDark ? 0xFF6B6B : 0xFF1493,
//       emissive: 0xFF6B6B,
//       emissiveIntensity: 0.5,
//       shininess: 100,
//       transparent: true,
//       opacity: 0.8,
//     });
//     const orb = new THREE.Mesh(geometry, material);
//     scene.add(orb);

//     // Particles (Soundwaves)
//     const particleGeometry = new THREE.BufferGeometry();
//     const particleCount = 100;
//     const positions = new Float32Array(particleCount * 3);
//     for (let i = 0; i < particleCount; i++) {
//       const theta = Math.random() * 2 * Math.PI;
//       const phi = Math.acos(2 * Math.random() - 1);
//       const radius = 1.2 + Math.random() * 0.5;
//       positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
//       positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
//       positions[i * 3 + 2] = radius * Math.cos(phi);
//     }
//     particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
//     const particleMaterial = new THREE.PointsMaterial({
//       color: 0xFFFFFF,
//       size: 0.05,
//       transparent: true,
//     });
//     const particles = new THREE.Points(particleGeometry, particleMaterial);
//     scene.add(particles);

//     // Lighting
//     const light = new THREE.PointLight(0xFF6B6B, 1, 100);
//     light.position.set(5, 5, 5);
//     scene.add(light);

//     camera.position.z = 3;

//     // Orbit Controls
//     controlsRef.current = new OrbitControls(camera, renderer.domElement);
//     controlsRef.current.enableZoom = false;

//     const animate = () => {
//       requestAnimationFrame(animate);
//       orb.rotation.y += 0.01;
//       if (playing) {
//         const amplitude = Math.random() * 0.1; // Simulated frequency
//         particles.scale.set(1 + amplitude, 1 + amplitude, 1 + amplitude);
//       }
//       renderer.render(scene, camera);
//     };
//     animate();

//     return () => {
//       orbRef.current?.removeChild(renderer.domElement);
//       controlsRef.current?.dispose();
//     };
//   }, [audioUrl, playing, isMobile, isDark]);

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

//   const handleVolumeChange = (event: any, newValue: number | number[]) => {
//     const audio = audioRef.current;
//     if (audio) {
//       audio.volume = (newValue as number) / 100;
//       setVolume(newValue as number);
//     }
//   };

//   const handleSpeedChange = (event: any, newValue: number | number[]) => {
//     const audio = audioRef.current;
//     if (audio) {
//       audio.playbackRate = newValue as number;
//       setSpeed(newValue as number);
//     }
//   };

//   return (
//     <Box
//       sx={{
//         bgcolor: isDark ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.9)",
//         borderRadius: 4,
//         p: 2,
//         position: "relative",
//         boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
//       }}
//     >
//       <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
//         <Tooltip title="Message Title">
//           <Typography variant="h6" sx={{ color: isDark ? "#FF1493" : "#FF6B6B", fontFamily: "Playfair Display" }}>
//             {title}
//           </Typography>
//         </Tooltip>
//         {isPrivate && (
//           <Tooltip title="This message is private">
//             <Chip label="Private" size="small" color="secondary" />
//           </Tooltip>
//         )}
//       </Box>
//       {caption && (
//         <Tooltip title="Caption">
//           <Typography variant="subtitle2" sx={{ color: isDark ? "#ccc" : "text.secondary", mb: 1 }}>
//             {caption}
//           </Typography>
//         </Tooltip>
//       )}
//       <OrbContainer ref={orbRef} isDark={isDark}>
//         {isMobile && audioUrl && (
//           <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", justifyContent: "center", alignItems: "center" }}>
//             <Box sx={{ bgcolor: isDark ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.8)", borderRadius: 2, p: 1 }}>
//               <Tooltip title="Volume">
//                 <Slider
//                   value={volume}
//                   onChange={handleVolumeChange}
//                   sx={{ width: 100, color: "#FF6B6B" }}
//                 />
//               </Tooltip>
//               <Tooltip title="Playback Speed">
//                 <Slider
//                   value={speed}
//                   min={0.5}
//                   max={2}
//                   step={0.1}
//                   onChange={handleSpeedChange}
//                   sx={{ width: 100, color: "#FF6B6B" }}
//                 />
//               </Tooltip>
//               <Tooltip title={playing ? "Pause" : "Play"}>
//                 <IconButton onClick={handlePlayPause} sx={{ color: "#FF6B6B" }}>
//                   {playing ? <Volume /> : <Mic />}
//                 </IconButton>
//               </Tooltip>
//             </Box>
//           </Box>
//         )}
//       </OrbContainer>
//       {audioUrl ? (
//         <Box sx={{ mt: 1 }}>
//           <audio ref={audioRef} src={audioUrl} style={{ display: "none" }} />
//           {!isMobile && (
//             <Box sx={{ mt: 1 }}>
//               <Tooltip title="Volume">
//                 <Slider
//                   value={volume}
//                   onChange={handleVolumeChange}
//                   sx={{ width: "100%", color: "#FF6B6B" }}
//                 />
//               </Tooltip>
//               <Tooltip title="Playback Speed">
//                 <Slider
//                   value={speed}
//                   min={0.5}
//                   max={2}
//                   step={0.1}
//                   onChange={handleSpeedChange}
//                   sx={{ width: "100%", color: "#FF6B6B" }}
//                 />
//               </Tooltip>
//               <Tooltip title={playing ? "Pause" : "Play"}>
//                 <IconButton onClick={handlePlayPause} sx={{ color: "#FF6B6B" }}>
//                   {playing ? <Volume /> : <Mic />}
//                 </IconButton>
//               </Tooltip>
//             </Box>
//           )}
//           {backgroundMusic?.asset?.url && (
//             <Box sx={{ mt: 1 }}>
//               <Tooltip title="Background Music">
//                 <Typography variant="caption" sx={{ color: isDark ? "#ccc" : "text.secondary" }}>
//                   Background Music:
//                 </Typography>
//               </Tooltip>
//               <audio controls src={backgroundMusic.asset.url} style={{ width: "100%" }} />
//             </Box>
//           )}
//         </Box>
//       ) : (
//         <Typography variant="caption" color="error" sx={{ mt: 1 }}>
//           No audio source available
//         </Typography>
//       )}
//       <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
//         <Tooltip title="Mood of the message">
//           <Typography variant="caption" sx={{ color: isDark ? "#ccc" : "text.secondary" }}>
//             {mood || "Unknown mood"}
//           </Typography>
//         </Tooltip>
//         <Tooltip title="Duration in seconds">
//           <Typography variant="caption" sx={{ color: isDark ? "#ccc" : "text.secondary" }}>
//             {duration ? `${duration}s` : "N/A"}
//           </Typography>
//         </Tooltip>
//       </Box>
//       {visualizer && (
//         <Tooltip title="Visualizer Style">
//           <Typography variant="caption" sx={{ color: isDark ? "#ccc" : "text.secondary", mt: 1 }}>
//             Visualizer: {visualizer}
//           </Typography>
//         </Tooltip>
//       )}
//       {scheduledFor && (
//         <Tooltip title="Scheduled Delivery Time">
//           <Typography variant="caption" sx={{ color: isDark ? "#ccc" : "text.secondary", mt: 1 }}>
//             Scheduled: {new Date(scheduledFor).toLocaleString()}
//           </Typography>
//         </Tooltip>
//       )}
//       {reactions?.length > 0 && (
//         <Box sx={{ mt: 1 }}>
//           {reactions.map((reaction) => (
//             <Tooltip key={reaction.emoji} title={`Reactions: ${reaction.count}`}>
//               <Chip
//                 label={`${reaction.emoji} ${reaction.count}`}
//                 size="small"
//                 sx={{ mr: 1, bgcolor: "rgba(255, 107, 107, 0.2)" }}
//               />
//             </Tooltip>
//           ))}
//         </Box>
//       )}
//       <Collapse in={expanded}>
//         {transcript && (
//           <Tooltip title="Audio Transcript">
//             <Typography variant="body2" sx={{ color: isDark ? "#ccc" : "text.secondary", mt: 2 }}>
//               Transcript: {transcript}
//             </Typography>
//           </Tooltip>
//         )}
//       </Collapse>
//       <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
//         <Tooltip title="Expand to see transcript">
//           <IconButton onClick={() => setExpanded(!expanded)} sx={{ color: "#FF6B6B" }}>
//             <ChevronDown />
//           </IconButton>
//         </Tooltip>
//         <Tooltip title="Delete this message">
//           <IconButton onClick={onDelete} sx={{ color: "#FF6B6B" }}>
//             <Delete />
//           </IconButton>
//         </Tooltip>
//       </Box>
//     </Box>
//   );
// };

// const MessagesSection = () => {
//   const queryClient = useQueryClient();
//   const [layout, setLayout] = useState<"waveform" | "grid">("waveform");
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
//                 <Box sx={{ bgcolor: isDark ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.9)", borderRadius: 4, p: 2 }}>
//                   <CircularProgress sx={{ color: "#FF6B6B" }} />
//                 </Box>
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
//             No Love Notes Yet
//           </Typography>
//           <Typography variant="body1" sx={{ color: isDark ? "#ccc" : "text.secondary", mb: 2 }}>
//             "Spin a sweet orb of love—record your first note!"
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
//                 window.confirm("Delete this orb note?") &&
//                 deleteMessageMutation.mutate(message._id)
//               }
//               isDark={isDark}
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
//         bgcolor: isDark ? "#121212" : "rgba(255, 255, 255, 0.9)",
//       }}
//     >
//       <Box
//         sx={{
//           position: "absolute",
//           inset: 0,
//           background: isDark
//             ? "linear-gradient(45deg, #333, #555, #777)"
//             : "linear-gradient(45deg, #FF6B6B, #FF1493, #8B5CF6)",
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
//               sx={{ color: isDark ? "#FF1493" : "#FF6B6B", fontFamily: "Playfair Display" }}
//             >
//               Audio Love Notes
//             </Typography>
//           </motion.div>
//           <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: { xs: 2, sm: 0 } }}>
//             <FormControl size="small">
//               <InputLabel sx={{ color: isDark ? "#FF1493" : "#FF6B6B" }}>Layout</InputLabel>
//               <Select
//                 value={layout}
//                 label="Layout"
//                 onChange={(e) => setLayout(e.target.value as "waveform" | "grid")}
//                 sx={{ bgcolor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.2)", borderRadius: 2, color: isDark ? "#FF1493" : "#FF6B6B" }}
//               >
//                 <MenuItem value="waveform">Waveform</MenuItem>
//                 <MenuItem value="grid">Grid</MenuItem>
//               </Select>
//             </FormControl>
//             <FormControl size="small">
//               <InputLabel sx={{ color: isDark ? "#FF1493" : "#FF6B6B" }}>Position</InputLabel>
//               <Select
//                 value={position}
//                 label="Position"
//                 onChange={(e) =>
//                   setPosition(e.target.value as "top" | "bottom" | "full")
//                 }
//                 sx={{ bgcolor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.2)", borderRadius: 2, color: isDark ? "#FF1493" : "#FF6B6B" }}
//               >
//                 <MenuItem value="top">Top</MenuItem>
//                 <MenuItem value="bottom">Bottom</MenuItem>
//                 <MenuItem value="full">Full</MenuItem>
//               </Select>
//             </FormControl>
//             <FormControl size="small">
//               <InputLabel sx={{ color: isDark ? "#FF1493" : "#FF6B6B" }}>Mood</InputLabel>
//               <Select
//                 value={moodFilter || ""}
//                 label="Mood"
//                 onChange={(e) => setMoodFilter(e.target.value || null)}
//                 sx={{ bgcolor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.2)", borderRadius: 2, color: isDark ? "#FF1493" : "#FF6B6B" }}
//               >
//                 <MenuItem value="">All Moods</MenuItem>
//                 <MenuItem value="romantic">Romantic</MenuItem>
//                 <MenuItem value="happy">Happy</MenuItem>
//                 <MenuItem value="reflective">Reflective</MenuItem>
//                 <MenuItem value="playful">Playful</MenuItem>
//                 <MenuItem value="missingYou">Missing You</MenuItem>
//               </Select>
//             </FormControl>
//             <Tooltip title="Toggle Dark Mode">
//               <Switch
//                 checked={isDark}
//                 onChange={() => setIsDark(!isDark)}
//                 sx={{ color: "#FF6B6B" }}
//               />
//             </Tooltip>
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