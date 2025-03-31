import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Eye } from "lucide-react";
import { Snap } from "@/types/snap"; // Update import path

interface SnapMessageProps {
  snap: Snap;
  onView: (snapId: string) => void;
}

const SnapMessage = ({ snap, onView }: SnapMessageProps) => {
  const [isViewing, setIsViewing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(snap.duration || 5);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Use either direct imageUrl or construct from media asset
  const imageUrl = snap.imageUrl || (snap.media?.asset?._ref
    ? `https://cdn.sanity.io/images/${process.env.VITE_SANITY_PROJECT_ID || 'project-id'}/${process.env.VITE_SANITY_DATASET || 'production'}/${snap.media.asset._ref.replace('image-', '').replace('-jpg', '.jpg')}`
    : null);
  
  // Handle viewing the snap
  const handleView = () => {
    if (isViewing) return;
    
    setIsViewing(true);
    
    // Mark as viewed on the server after the duration
    setTimeout(() => {
      onView(snap._id);
    }, (snap.duration || 5) * 1000);
  };
  
  // Countdown timer when viewing
  useEffect(() => {
    if (!isViewing) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev: number) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isViewing]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative rounded-lg overflow-hidden bg-gray-900 border border-pink-500/30"
    >
      {!isViewing ? (
        <div className="p-4 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-pink-500/20 flex items-center justify-center mb-2">
            <Eye size={24} className="text-pink-400" />
          </div>
          <p className="text-sm text-center text-white mb-1">You received a Snap</p>
          <p className="text-xs text-center text-gray-400 mb-3">This message will disappear after viewing</p>
          <button
            onClick={handleView}
            className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-full text-sm transition-colors"
          >
            View Snap
          </button>
        </div>
      ) : (
        <div className="relative">
          {/* Loading state */}
          {!imageLoaded && imageUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {/* Image */}
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Snap"
              className="w-full h-64 object-cover"
              onLoad={() => setImageLoaded(true)}
            />
          )}
          
          {/* Countdown timer */}
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center">
            <Clock size={12} className="mr-1" />
            <span>{timeLeft}s</span>
          </div>
          
          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
            <motion.div
              className="h-full bg-pink-500"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: snap.duration || 5, ease: "linear" }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SnapMessage;
