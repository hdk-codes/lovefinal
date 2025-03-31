import { useRef } from "react";
import { motion } from "framer-motion";
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Tooltip,
} from "@mui/material";
import { ChevronDown, ChevronUp, Delete } from "lucide-react";
import { cn } from "@/lib/utils";
import { AudioPlayer } from "@/components/AudioPlayer"; // Assuming this is already implemented

// Define the AudioMessageType interface (copied from MessagesSection for completeness)
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

interface ExpandableCardProps {
  message: AudioMessageType;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDelete: () => void;
  isDark: boolean;
}

export const ExpandableCard = ({
  message,
  isExpanded,
  onToggleExpand,
  onDelete,
  isDark,
}: ExpandableCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // Animation variants for the card
  const cardVariants = {
    collapsed: { scale: 1, opacity: 1 },
    expanded: { scale: 1.05, opacity: 1 },
  };

  // Animation variants for the collapsible content
  const contentVariants = {
    collapsed: { height: 0, opacity: 0 },
    expanded: { height: "auto", opacity: 1 },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="collapsed"
      animate={isExpanded ? "expanded" : "collapsed"}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative rounded-lg p-4 border overflow-hidden",
        isDark
          ? "bg-gray-800 border-gray-700 text-white"
          : "bg-white border-neutral-200 text-black",
        isExpanded ? "shadow-xl z-10" : "shadow-md z-0"
      )}
      ref={cardRef}
      role="article"
      aria-expanded={isExpanded}
      aria-labelledby={`card-title-${message._id}`}
    >
      {/* Header Section */}
      <Box className="flex justify-between items-center mb-2">
        <Tooltip title="Chapter Title">
          <Typography
            id={`card-title-${message._id}`}
            variant="h6"
            sx={{ color: isDark ? "#FF1493" : "#FF6B6B", fontFamily: "Playfair Display" }}
          >
            {message.title}
          </Typography>
        </Tooltip>
        {message.isPrivate && (
          <Tooltip title="This chapter is private">
            <Chip label="Private" size="small" color="secondary" />
          </Tooltip>
        )}
      </Box>

      {/* Audio Player */}
      <AudioPlayer audioUrl={message.audioUrl} />

      {/* Caption and Description */}
      {message.caption && (
        <Tooltip title="Chapter Caption">
          <Typography variant="subtitle2" sx={{ color: isDark ? "#ccc" : "text.secondary", mb: 1 }}>
            {message.caption}
          </Typography>
        </Tooltip>
      )}
      <Typography variant="body2" sx={{ color: isDark ? "#ccc" : "text.secondary" }}>
        {message.description || "A story unfolds..."}
      </Typography>

      {/* Expandable Content */}
      <motion.div
        variants={contentVariants}
        initial="collapsed"
        animate={isExpanded ? "expanded" : "collapsed"}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        {message.transcript && (
          <Tooltip title="Chapter Transcript">
            <Typography variant="body2" sx={{ color: isDark ? "#ccc" : "text.secondary", mt: 2 }}>
              Transcript: {message.transcript}
            </Typography>
          </Tooltip>
        )}
        {message.background?.imageUrl && (
          <Box
            component="img"
            src={message.background.imageUrl}
            alt="Background"
            sx={{ width: "100%", mt: 2, borderRadius: 2 }}
          />
        )}
        {message.reactions?.length > 0 && (
          <Box sx={{ mt: 2 }}>
            {message.reactions.map((reaction) => (
              <Tooltip key={reaction.emoji} title={`Reactions: ${reaction.count}`}>
                <Chip
                  label={`${reaction.emoji} ${reaction.count}`}
                  size="small"
                  sx={{ mr: 1, bgcolor: "rgba(255, 107, 107, 0.2)" }}
                />
              </Tooltip>
            ))}
          </Box>
        )}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
          <Typography variant="caption" sx={{ color: isDark ? "#ccc" : "text.secondary" }}>
            Mood: {message.mood || "Unknown"}
          </Typography>
          <Typography variant="caption" sx={{ color: isDark ? "#ccc" : "text.secondary" }}>
            Duration: {message.duration ? `${message.duration}s` : "N/A"}
          </Typography>
        </Box>
      </motion.div>

      {/* Controls */}
      <Box className="flex justify-between mt-2">
        <Tooltip title={isExpanded ? "Collapse chapter" : "Expand chapter"}>
          <IconButton
            onClick={onToggleExpand}
            sx={{ color: "#FF6B6B" }}
            aria-label={isExpanded ? "Collapse chapter" : "Expand chapter"}
          >
            {isExpanded ? <ChevronUp /> : <ChevronDown />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete this chapter">
          <IconButton
            onClick={onDelete}
            sx={{ color: "#FF6B6B" }}
            aria-label="Delete chapter"
          >
            <Delete />
          </IconButton>
        </Tooltip>
      </Box>
    </motion.div>
  );
};