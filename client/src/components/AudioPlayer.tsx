import { useState, useRef, useEffect } from "react";
import { IconButton } from "@mui/material";
import { Mic, Volume2 } from "lucide-react";

interface AudioPlayerProps {
  audioUrl?: string;
}

export const AudioPlayer = ({ audioUrl }: AudioPlayerProps) => {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setPlaying(false);
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, []);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (audio) {
      if (playing) {
        audio.pause();
      } else {
        audio.play();
      }
      setPlaying(!playing);
    }
  };

  return (
    <div className="flex items-center">
      {audioUrl ? (
        <>
          <audio ref={audioRef} src={audioUrl} style={{ display: "none" }} />
          <IconButton
            aria-label={playing ? "Pause audio" : "Play audio"}
            onClick={handlePlayPause}
            sx={{ color: "#FF6B6B" }}
          >
            {playing ? <Volume2 /> : <Mic />}
          </IconButton>
        </>
      ) : (
        <span className="text-red-500">No audio available</span>
      )}
    </div>
  );
};