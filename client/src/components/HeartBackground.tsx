import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface HeartParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  opacity: number;
}

const HeartBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heartsRef = useRef<HeartParticle[]>([]);
  const heartIdCounter = useRef(0);

  useEffect(() => {
    const createHeart = () => {
      if (!containerRef.current) return;
      
      const id = heartIdCounter.current++;
      const startPositionX = Math.random() * window.innerWidth;
      const startPositionY = window.innerHeight + 100;
      const size = Math.random() * 20 + 10;
      const duration = Math.random() * 8 + 8;
      const opacity = Math.random() * 0.5 + 0.3;
      
      const newHeart: HeartParticle = {
        id,
        x: startPositionX,
        y: startPositionY,
        size,
        duration,
        opacity
      };
      
      heartsRef.current = [...heartsRef.current, newHeart];
      
      // Remove heart after animation completes
      setTimeout(() => {
        heartsRef.current = heartsRef.current.filter(heart => heart.id !== id);
      }, duration * 1000);
    };
    
    const interval = setInterval(createHeart, 2000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0" 
      aria-hidden="true"
    >
      {heartsRef.current.map(heart => (
        <motion.div
          key={heart.id}
          className="heart-particle"
          initial={{ y: heart.y, x: heart.x, opacity: heart.opacity }}
          animate={{ 
            y: -100,
            x: heart.x + (Math.random() * 100 - 50), 
          }}
          transition={{ 
            duration: heart.duration,
            ease: "linear"
          }}
          style={{
            position: "absolute",
            width: heart.size,
            height: heart.size,
          }}
        >
          <div className="heart-icon" style={{ width: '100%', height: '100%' }}></div>
        </motion.div>
      ))}

      <style dangerouslySetInnerHTML={{
        __html: `
        .heart-icon {
          display: inline-block;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23FF6B6B' viewBox='0 0 24 24'%3E%3Cpath d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'/%3E%3C/svg%3E");
          background-size: contain;
        }
        `
      }}></style>
    </div>
  );
};

export default HeartBackground;
