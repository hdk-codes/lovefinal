import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Heart } from "lucide-react";

interface LoveLetterCardProps {
  title: string;
  date: string;
  content: string;
  coverTitle: string;
}

const LoveLetterCard = ({ title, date, content, coverTitle }: LoveLetterCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [heartContainer, setHeartContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create a container for the heart animations if it doesn't exist
    if (!document.getElementById("heart-container")) {
      const container = document.createElement("div");
      container.id = "heart-container";
      container.style.position = "fixed";
      container.style.inset = "0";
      container.style.pointerEvents = "none";
      container.style.zIndex = "50";
      container.style.overflow = "hidden";
      document.body.appendChild(container);
      setHeartContainer(container);
    } else {
      setHeartContainer(document.getElementById("heart-container") as HTMLDivElement);
    }

    return () => {
      // This is intentionally not removing the container on component unmount
      // as other components might need it
    };
  }, []);

  const openLetter = () => {
    setIsOpen(true);
    createHeartBurst();
  };

  const createHeartBurst = () => {
    if (!heartContainer) return;

    const hearts = 15;
    const letterRect = document.getElementById(`letter-${title.replace(/\s+/g, '-')}`)?.getBoundingClientRect();
    if (!letterRect) return;

    const centerX = letterRect.left + letterRect.width / 2;
    const centerY = letterRect.top + letterRect.height / 2;

    for (let i = 0; i < hearts; i++) {
      setTimeout(() => {
        const heart = document.createElement("div");
        heart.classList.add("heart-particle");
        
        // Random direction
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 150 + 50;
        const endX = centerX + Math.cos(angle) * distance;
        const endY = centerY + Math.sin(angle) * distance;
        
        // Random size and color
        const size = Math.random() * 20 + 15;
        const opacity = Math.random() * 0.5 + 0.5;
        const hue = Math.random() * 20 + 340; // Pink-red range
        
        heart.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="hsl(${hue}, 90%, 65%)" stroke="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
        heart.style.position = "absolute";
        heart.style.left = `${centerX}px`;
        heart.style.top = `${centerY}px`;
        heart.style.opacity = opacity.toString();
        heart.style.transform = "scale(0.1)";
        heart.style.transition = "all 1.5s cubic-bezier(0.165, 0.84, 0.44, 1)";
        heart.style.zIndex = "9999";
        
        heartContainer.appendChild(heart);
        
        // Trigger animation on next frame
        requestAnimationFrame(() => {
          heart.style.transform = `translate(${endX - centerX}px, ${endY - centerY}px) scale(1) rotate(${Math.random() * 90 - 45}deg)`;
          heart.style.opacity = "0";
        });
        
        setTimeout(() => {
          if (heartContainer.contains(heart)) {
            heart.remove();
          }
        }, 1500);
      }, i * 100);
    }
  };

  let formattedDate = "";
  try {
    formattedDate = date ? format(new Date(date), "MMM d, yyyy") : "";
  } catch (error) {
    console.error("Date formatting error:", error);
    formattedDate = ""; 
  }

  // Create a safer ID by replacing spaces and special chars
  const safeId = title.replace(/\s+/g, '-').replace(/[^\w-]/g, '');

  return (
    <div id={`letter-${safeId}`} className="relative h-[450px] w-full">
      <motion.div 
        className="love-card absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-lg transform-gpu overflow-auto"
        initial={{ rotateY: 90, originX: 0 }}
        animate={{ rotateY: isOpen ? 0 : 90, originX: 0 }}
        transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
        style={{ 
          perspective: 1200, 
          transformStyle: "preserve-3d", 
          boxShadow: "0 10px 25px -5px rgba(255, 20, 147, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
          backgroundImage: "radial-gradient(circle at top right, rgba(255, 20, 147, 0.15), transparent 70%)",
        }}
      >
        <div className="absolute top-3 right-3">
          <span className="text-pink-300 text-sm">{formattedDate}</span>
        </div>
        
        <h3 className="handwritten text-3xl text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-600 mb-6">{title}</h3>
        
        <div className="prose prose-invert max-w-none">
          <div className="text-gray-300 mb-4 leading-relaxed">
            {typeof content === 'string' && content.split('\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4">{paragraph}</p>
            ))}
          </div>
          
          <p className="handwritten text-xl text-right mt-8 text-pink-400 opacity-80">
            Forever Yours
          </p>
        </div>
      </motion.div>
      
      {!isOpen && (
        <motion.div 
          className="letter-cover love-card absolute inset-0 bg-gradient-to-br from-gray-900/80 to-black/90 rounded-lg p-8 flex flex-col items-center justify-center transform-gpu cursor-pointer"
          onClick={openLetter}
          whileHover={{ scale: 1.03, boxShadow: "0 20px 25px -5px rgba(255, 20, 147, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)" }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          <motion.div 
            className="text-center"
            initial={{ scale: 0.9 }}
            animate={{ scale: [0.9, 1.05, 0.95, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
          >
            <Heart className="text-pink-500 mx-auto mb-4" size={40} fill="currentColor" />
            <h3 className="handwritten text-3xl text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-600 mb-2">
              {coverTitle}
            </h3>
            <div className="bg-gradient-to-r from-pink-500/20 to-pink-500/5 h-[1px] w-3/4 mx-auto my-3" />
            <p className="text-sm mt-4 text-gray-400">Click to unfold our story</p>
          </motion.div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-24 h-24 opacity-20">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 0 L100 50 L50 100 L0 50 Z" fill="none" stroke="currentColor" strokeWidth="1" className="text-pink-400" />
            </svg>
          </div>
          <div className="absolute bottom-0 left-0 w-32 h-32 opacity-10">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" className="text-pink-400" />
            </svg>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LoveLetterCard;
