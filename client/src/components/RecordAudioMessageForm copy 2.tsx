import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mic, Square, Play, Pause, Trash, Heart, Volume2, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Slider } from "@/components/ui/slider";
import { client } from "@/lib/sanity"; // Your Sanity client
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface RecordAudioMessageFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function RecordAudioMessageForm({ isOpen, onClose, onSuccess }: RecordAudioMessageFormProps) {
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [description, setDescription] = useState('');
  const [mood, setMood] = useState('romantic');
  const [isPrivate, setIsPrivate] = useState(false);
  const [visualizer, setVisualizer] = useState('wave');
  const [scheduledFor, setScheduledFor] = useState<Date>();
  const [transcript, setTranscript] = useState('');
  const [backgroundMusic, setBackgroundMusic] = useState<File | null>(null);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [background, setBackground] = useState({
    color: '#1f1f1f',
    imageUrl: '',
    style: 'gradient'
  });
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVisualizerPreview, setShowVisualizerPreview] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const moods = [
    { label: 'Romantic', value: 'romantic' },
    { label: 'Happy', value: 'happy' },
    { label: 'Reflective', value: 'reflective' },
    { label: 'Playful', value: 'playful' },
    { label: 'Missing You', value: 'missingYou' }
  ];

  const visualizers = [
    { label: 'Wave', value: 'wave' },
    { label: 'Bars', value: 'bars' },
    { label: 'Circle', value: 'circle' },
    { label: 'Heart', value: 'heart' },
    { label: 'None', value: 'none' }
  ];

  const backgroundStyles = [
    { label: 'Gradient', value: 'gradient' },
    { label: 'Solid', value: 'solid' },
    { label: 'Pattern', value: 'pattern' }
  ];

  // Recording Functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      audioChunksRef.current = [];

      mediaRecorderRef.current.addEventListener('dataavailable', (event) => {
        audioChunksRef.current.push(event.data);
      });

      mediaRecorderRef.current.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      });

      mediaRecorderRef.current.start();
      setIsRecording(true);

      let seconds = 0;
      timerRef.current = window.setInterval(() => {
        seconds++;
        setRecordingTime(seconds);
      }, 1000);

      toast({ title: "Recording started", description: "Speak now..." });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not access microphone. Check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      toast({ title: "Recording stopped", description: "Message recorded." });
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Audio setup
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.addEventListener('ended', () => setIsPlaying(false));
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      if (audioRef.current) audioRef.current.src = url;
      return () => URL.revokeObjectURL(url);
    }
  }, [audioBlob]);

  // Sanity Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!audioBlob) throw new Error('No audio recorded');

      const audioFile = new File([audioBlob], `recording-${Date.now()}.webm`, {
        type: 'audio/webm'
      });

      const asset = await client.assets.upload('file', audioFile);
      if (!asset?._id) throw new Error('Failed to upload audio');

      const doc = {
        _type: 'audioMessage',
        title,
        audioFile: {
          _type: 'file',
          asset: { _type: 'reference', _ref: asset._id }
        },
        caption,
        description,
        mood,
        duration: recordingTime,
        isPrivate,
        backgroundMusic: backgroundMusic ? {
          _type: 'file',
          asset: { _type: 'reference', _ref: (await client.assets.upload('file', backgroundMusic))._id }
        } : undefined,
        visualizer,
        scheduledFor: scheduledFor?.toISOString(),
        transcript,
        reactions: [],
        background,
        _createdAt: new Date().toISOString()
      };

      return await client.create(doc);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audioMessages'] });
      toast({ title: "Success", description: "Audio message saved!" });
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save audio message.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !audioBlob) {
      toast({
        title: "Error",
        description: "Title and recording are required.",
        variant: "destructive"
      });
      return;
    }
    uploadMutation.mutate();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100"
          >
            <form onSubmit={handleSubmit} className="p-6">
              <motion.div className="mb-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Heart className="w-6 h-6 text-pink-500" />
                  Record Audio Message
                </h2>
                <p className="text-sm text-gray-600">Capture your voice</p>
              </motion.div>

              <div className="space-y-6">
                {/* Title and Caption */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                    <Label className="text-gray-700 mb-1 block">Title</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Message title"
                      className="w-full border-gray-200 focus:border-pink-500 transition-all"
                    />
                  </motion.div>
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                    <Label className="text-gray-700 mb-1 block">Caption</Label>
                    <Input
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Short caption"
                      className="w-full border-gray-200 focus:border-pink-500 transition-all"
                    />
                  </motion.div>
                </div>

                {/* Recording Section */}
                <motion.div
                  className="bg-gray-50 p-4 rounded-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Label className="text-gray-700 mb-2 block">Record Your Message</Label>
                  <div className="flex items-center justify-center gap-4">
                    {!audioBlob ? (
                      <motion.div
                        animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ repeat: isRecording ? Infinity : 0, duration: 0.8 }}
                      >
                        <Button
                          onClick={isRecording ? stopRecording : startRecording}
                          className={`${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-pink-500 hover:bg-pink-600'} text-white`}
                        >
                          {isRecording ? (
                            <>
                              <Square className="w-4 h-4 mr-2" />
                              Stop ({formatTime(recordingTime)})
                            </>
                          ) : (
                            <>
                              <Mic className="w-4 h-4 mr-2" />
                              Record
                            </>
                          )}
                        </Button>
                      </motion.div>
                    ) : (
                      <div className="flex gap-2">
                        <Button onClick={togglePlayback} variant="outline" className="border-pink-200 text-pink-600">
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button
                          onClick={() => {
                            setAudioBlob(null);
                            setAudioUrl(null);
                            setRecordingTime(0);
                          }}
                          variant="outline"
                          className="border-red-200 text-red-600"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {audioBlob && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-center text-sm text-gray-600">
                      Duration: {formatTime(recordingTime)}
                    </motion.div>
                  )}
                </motion.div>

                {/* Mood and Visualizer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                    <Label className="text-gray-700 mb-1 block">Mood</Label>
                    <Select value={mood} onValueChange={setMood}>
                      <SelectTrigger className="border-gray-200"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {moods.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                    <Label className="text-gray-700 mb-1 block">Visualizer</Label>
                    <div className="flex items-center gap-2">
                      <Select value={visualizer} onValueChange={setVisualizer}>
                        <SelectTrigger className="border-gray-200 flex-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {visualizers.map(v => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {audioBlob && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowVisualizerPreview(!showVisualizerPreview)}
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <AnimatePresence>
                      {showVisualizerPreview && audioBlob && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2 p-2 bg-gray-100 rounded-lg"
                        >
                          <div className="h-20 flex items-center justify-center text-gray-600">
                            {visualizer === 'wave' && "Wave Animation"}
                            {visualizer === 'heart' && "❤️ Pulsing"}
                            {/* Add more visualizer previews */}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>

                {/* Background Music */}
                <motion.div
                  className="bg-gray-50 p-4 rounded-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Label className="text-gray-700 mb-2 block">Background Music (Optional)</Label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => setBackgroundMusic(e.target.files?.[0] || null)}
                        className="border-gray-200"
                      />
                      {backgroundMusic && (
                        <Button variant="outline" size="icon" onClick={() => {/* Add playback */}}>
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    {backgroundMusic && (
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-gray-600" />
                        <Slider
                          value={[musicVolume]}
                          onValueChange={(value) => setMusicVolume(value[0])}
                          max={1}
                          step={0.1}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Background Settings */}
                <motion.div
                  className="bg-gray-50 p-4 rounded-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Label className="text-gray-700 mb-2 block">Background Settings</Label>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={background.color}
                          onChange={(e) => setBackground(prev => ({ ...prev, color: e.target.value }))}
                          className="w-12 h-12 p-1"
                        />
                        <Input
                          value={background.color}
                          onChange={(e) => setBackground(prev => ({ ...prev, color: e.target.value }))}
                          className="flex-1"
                        />
                      </div>
                      <Input
                        value={background.imageUrl}
                        onChange={(e) => setBackground(prev => ({ ...prev, imageUrl: e.target.value }))}
                        placeholder="Background image URL"
                        className="border-gray-200"
                      />
                    </div>
                    <Select value={background.style} onValueChange={(value) => setBackground(prev => ({ ...prev, style: value }))}>
                      <SelectTrigger className="border-gray-200"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {backgroundStyles.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <div
                      className="h-20 rounded-lg"
                      style={{
                        background: background.imageUrl
                          ? `url(${background.imageUrl}) center/cover`
                          : background.style === 'gradient'
                            ? `linear-gradient(to right, ${background.color}, ${background.color}80)`
                            : background.color
                      }}
                    />
                  </div>
                </motion.div>

                {/* Schedule */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
                  <Label className="text-gray-700 mb-1 block">Schedule Delivery</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        {scheduledFor ? format(scheduledFor, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Calendar mode="single" selected={scheduledFor} onSelect={setScheduledFor} initialFocus />
                    </PopoverContent>
                  </Popover>
                </motion.div>

                {/* Description and Transcript */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                  <Label className="text-gray-700 mb-1 block">Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your message..."
                    className="border-gray-200 min-h-[100px]"
                  />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
                  <Label className="text-gray-700 mb-1 block">Transcript</Label>
                  <Textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Optional transcript..."
                    className="border-gray-200 min-h-[100px]"
                  />
                </motion.div>

                {/* Privacy */}
                <motion.div
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-xl"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                >
                  <Label className="text-gray-700">Private Message</Label>
                  <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
                </motion.div>
              </div>

              {/* Footer */}
              <motion.div
                className="mt-6 flex gap-4 justify-end"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
              >
                <Button variant="outline" onClick={onClose} className="border-gray-200 text-gray-700">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-pink-500 hover:bg-pink-600 text-white"
                  disabled={!audioBlob || uploadMutation.isPending}
                >
                  {uploadMutation.isPending ? "Sending..." : "Send Message"}
                </Button>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}