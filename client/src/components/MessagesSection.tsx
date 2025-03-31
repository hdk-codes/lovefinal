import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/sanity";
import groq from "groq";
import toast from "react-hot-toast";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Mic, Heart, Play, Pause, Volume2, VolumeX, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { useInView } from "react-intersection-observer";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";

const getMessagesQuery = groq`
  *[_type == "audioMessage"] | order(_createdAt desc) {
    _id, title, audioFile { asset-> { url, _ref } }, caption, description, mood,
    duration, isPrivate, backgroundMusic { asset-> { url, _ref } }, visualizer,
    scheduledFor, transcript, reactions, background, _createdAt
  }
`;

interface AudioMessageType {
  _id: string;
  title: string;
  audioFile: { asset: { url: string; _ref: string } };
  caption?: string;
  description?: string;
  mood?: string;
  duration?: number;
  isPrivate: boolean;
  backgroundMusic?: { asset: { url: string; _ref: string } };
  visualizer: string;
  scheduledFor?: string;
  transcript?: string;
  reactions: Array<{ emoji: string; count: number }>;
  background?: { color: string; imageUrl: string; style: string };
  _createdAt: string;
  audioUrl?: string;
}

const generateRandomBars = (count: number) =>
  Array.from({ length: count }, () => Math.random() * 100);

// AudioVisualizer Component
const AudioVisualizer = ({
  isPlaying,
  progress,
  isDark,
}: {
  isPlaying: boolean;
  progress: number;
  isDark: boolean;
}) => {
  const [bars] = useState(() => generateRandomBars(30));

  return (
    <div className="flex items-end h-full gap-[2px] px-2">
      {bars.map((height, i) => {
        const isActive = (i / bars.length) * 100 <= progress;
        return (
          <motion.div
            key={i}
            className={cn(
              "w-1 rounded-full",
              isActive
                ? "bg-gradient-to-t from-[#FF6B6B] to-[#800000]"
                : isDark
                ? "bg-[#4A4A4A]"
                : "bg-[#E6D9F2]"
            )}
            animate={{
              height: isPlaying ? `${Math.max(height, 10)}%` : "10%",
              opacity: isPlaying ? 1 : 0.5,
            }}
            transition={{
              duration: 0.3,
              repeat: isPlaying ? Infinity : 0,
              repeatType: "mirror",
              delay: i * 0.015,
            }}
            style={{ minHeight: 4 }}
          />
        );
      })}
    </div>
  );
};

// AudioCard Component
interface AudioCardProps {
  message: AudioMessageType;
  index: number;
  isDark: boolean;
  provided: any;
  inView: boolean;
  onDelete: (id: string) => void;
}

const AudioCard = ({
  message,
  index,
  isDark,
  provided,
  inView,
  onDelete,
}: AudioCardProps) => {
  const { state, controls } = useAudioPlayer(message.audioFile.asset.url);
  const [reaction, setReaction] = useState<string | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercent = (state.currentTime / (state.duration || 1)) * 100 || 0;

  const handleReaction = (emoji: string) => {
    setReaction(emoji);
    toast.success(`Reacted with ${emoji}`);
  };

  return (
    <motion.div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(
        "relative group rounded-xl overflow-hidden",
        isDark ? "bg-[#1A0F2A]/95" : "bg-[#FFF5F5]/95",
        "border",
        isDark ? "border-[#FF6B6B]/60" : "border-[#800000]/60",
        "hover:shadow-xl hover:scale-[1.03] transition-all duration-300"
      )}
      style={{ boxShadow: isDark ? "0 0 15px rgba(255, 107, 107, 0.2)" : "none" }}
    >
      <div className="p-4 relative z-10">
        {/* Title and Mood */}
        <div className="flex items-center justify-between mb-4">
          <h3
            className={cn(
              "text-lg font-semibold font-dancing truncate max-w-[70%]",
              isDark ? "text-[#FF6B6B]" : "text-[#800000]"
            )}
          >
            {message.title}
          </h3>
          <div className="flex items-center gap-2">
            {message.mood && (
              <span
                className={cn(
                  "text-xs px-2 py-1 rounded-full",
                  isDark
                    ? "bg-[#FF6B6B]/20 text-[#FF6B6B]"
                    : "bg-[#800000]/20 text-[#800000]"
                )}
              >
                {message.mood}
              </span>
            )}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onDelete(message._id)}
              className="text-[#FF6B6B] opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={18} />
            </Button>
          </div>
        </div>

        {/* Visualizer */}
        <div className="relative h-16 mb-4">
          <AudioVisualizer
            isPlaying={state.isPlaying}
            progress={progressPercent}
            isDark={isDark}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => (state.isPlaying ? controls.pause() : controls.play())}
            className={cn(
              "p-2 rounded-full bg-[#FF6B6B] text-white",
              "hover:bg-[#FF8787] transition-all"
            )}
          >
            {state.isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </motion.button>

          {/* Progress Bar */}
          <div className="flex-1">
            <div
              className={cn(
                "relative h-1 rounded-full overflow-hidden",
                isDark ? "bg-[#4A4A4A]" : "bg-[#E6D9F2]"
              )}
            >
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#FF6B6B] to-[#800000]"
                style={{ width: `${progressPercent}%` }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
              />
              <input
                type="range"
                min={0}
                max={state.duration || 100}
                value={state.currentTime}
                onChange={(e) => controls.seek(parseFloat(e.target.value))}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <div
              className={cn(
                "flex justify-between mt-1 text-xs opacity-75",
                isDark ? "text-[#E6D9F2]" : "text-[#4A4A4A]"
              )}
            >
              <span>{formatTime(state.currentTime)}</span>
              <span>{formatTime(state.duration)}</span>
            </div>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => controls.setVolume(state.volume === 0 ? 0.7 : 0)}
              className="text-[#FF6B6B]"
            >
              {state.volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </Button>
            <Slider
              value={[state.volume * 100]}
              max={100}
              className="w-20"
              onValueChange={(value) => controls.setVolume(value[0] / 100)}
            />
          </div>
        </div>

        {/* Caption and Reactions */}
        <div className="mt-4 flex justify-between items-center">
          {message.caption && (
            <p
              className={cn(
                "text-sm italic flex-1",
                isDark ? "text-[#E6D9F2]" : "text-[#4A4A4A]"
              )}
            >
              "{message.caption}"
            </p>
          )}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleReaction("❤️")}
              className={cn("text-[#FF6B6B]", reaction === "❤️" && "opacity-50")}
            >
              <Heart size={16} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleReaction("😊")}
              className={cn("text-[#FF6B6B]", reaction === "😊" && "opacity-50")}
            >
              😊
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// MessagesSection Component
const MessagesSection = ({ isDarkMode = true }: { isDarkMode?: boolean }) => {
  const queryClient = useQueryClient();
  const [moodFilter, setMoodFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDark, setIsDark] = useState(isDarkMode);
  const [messagesOrder, setMessagesOrder] = useState<AudioMessageType[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [ref, inView] = useInView({ threshold: 0.1 });

  const { data: messages = [], isLoading } = useQuery<AudioMessageType[]>({
    queryKey: ["audioMessages", moodFilter],
    queryFn: async () => {
      try {
        return await client.fetch(
          moodFilter
            ? `${getMessagesQuery} [mood == "${moodFilter}"]`
            : getMessagesQuery
        );
      } catch (err) {
        toast.error("Failed to fetch messages!");
        throw err;
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (id: string) => await client.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audioMessages"] });
      toast.success("Message deleted!", { icon: "💔" });
      setDeleteId(null);
    },
    onError: () => toast.error("Deletion failed!"),
  });

  const filteredMessages = useMemo(() => {
    const orderedMessages = messagesOrder.length ? messagesOrder : messages;
    return orderedMessages
      .filter(
        (msg) =>
          msg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (msg.caption && msg.caption.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .map((msg) => ({
        ...msg,
        audioUrl: msg.audioFile?.asset?.url || undefined,
      }));
  }, [messages, messagesOrder, searchQuery]);

  useEffect(() => {
    setMessagesOrder(messages);
    setIsDark(isDarkMode);
  }, [messages, isDarkMode]);

  const onDragEnd = useCallback((result: any) => {
    if (!result.destination) return;
    const items = Array.from(filteredMessages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setMessagesOrder(items);
  }, [filteredMessages]);

  const handleDelete = (id: string) => setDeleteId(id);
  const confirmDelete = () => deleteMessageMutation.mutate(deleteId!);

  return (
    <section
      id="messages"
      className={cn("py-12 px-4", isDark ? "bg-[#2A1B3D]" : "bg-[#FFF5F5]")}
      ref={ref}
    >
      <ScrollArea
        className={cn(
          "h-[calc(100vh-4rem)]",
          isDark && "scrollbar-thumb-[#FF6B6B]/20 scrollbar-track-[#1A0F2A]"
        )}
      >
        <div className="container mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4"
          >
            <Typography
              variant="h4"
              className={cn("font-dancing", isDark ? "text-[#FF6B6B]" : "text-[#800000]")}
            >
              Our Audio Messages
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <TextField
                label="Search Messages"
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: isDark ? "#E6D9F2" : "#4A4A4A",
                    "& fieldset": {
                      borderColor: isDark ? "#FF6B6B" : "#800000",
                    },
                    "&:hover fieldset": {
                      borderColor: isDark ? "#FF8787" : "#A52A2A",
                    },
                  },
                  "& .MuiInputLabel-root": { color: isDark ? "#E6D9F2" : "#4A4A4A" },
                }}
              />
              <FormControl size="small">
                <InputLabel sx={{ color: isDark ? "#E6D9F2" : "#4A4A4A" }}>
                  Mood
                </InputLabel>
                <Select
                  value={moodFilter || ""}
                  label="Mood"
                  onChange={(e) => setMoodFilter(e.target.value || null)}
                  sx={{
                    color: isDark ? "#E6D9F2" : "#4A4A4A",
                    borderColor: isDark ? "#FF6B6B" : "#800000",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: isDark ? "#FF6B6B" : "#800000",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: isDark ? "#FF8787" : "#A52A2A",
                    },
                  }}
                >
                  <MenuItem value="">All Moods</MenuItem>
                  <MenuItem value="romantic">Romantic</MenuItem>
                  <MenuItem value="happy">Happy</MenuItem>
                  <MenuItem value="reflective">Reflective</MenuItem>
                  <MenuItem value="playful">Playful</MenuItem>
                  <MenuItem value="missingYou">Missing You</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </motion.div>

          {/* Messages */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <CircularProgress sx={{ color: "#FF6B6B" }} />
            </div>
          ) : filteredMessages.length === 0 ? (
            <Typography
              className={cn("text-center", isDark ? "text-[#E6D9F2]" : "text-[#4A4A4A]")}
            >
              No messages found.
            </Typography>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="messages">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                  >
                    <AnimatePresence>
                      {filteredMessages.map((message, index) => (
                        <Draggable
                          key={message._id}
                          draggableId={message._id}
                          index={index}
                        >
                          {(provided) => (
                            <AudioCard
                              message={message}
                              index={index}
                              isDark={isDark}
                              provided={provided}
                              inView={inView}
                              onDelete={handleDelete}
                            />
                          )}
                        </Draggable>
                      ))}
                    </AnimatePresence>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}

          {/* Record Button */}
          <motion.div
            className="fixed bottom-6 right-6"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="lg"
              className={cn(
                "rounded-full",
                isDark
                  ? "bg-gradient-to-r from-[#FF6B6B] to-[#800000] text-white hover:from-[#FF8787] hover:to-[#A52A2A]"
                  : "bg-gradient-to-r from-[#800000] to-[#FF6B6B] text-white hover:from-[#A52A2A] hover:to-[#FF8787]"
              )}
            >
              <Mic className="mr-2" />
              Record a Message
            </Button>
          </motion.div>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={!!deleteId}
            onClose={() => setDeleteId(null)}
            PaperProps={{
              style: { background: isDark ? "#1A0F2A" : "#FFF5F5", color: isDark ? "#E6D9F2" : "#4A4A4A" },
            }}
          >
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
              Are you sure you want to delete this message? This action cannot be undone.
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteId(null)} variant="outline">
                Cancel
              </Button>
              <Button onClick={confirmDelete} className="bg-[#FF6B6B] text-white">
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </ScrollArea>
    </section>
  );
};

export default MessagesSection;