
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { DynamicHeart } from './DynamicHeart';

export const LandingHero = () => {
  const [isTypingComplete, setTypingComplete] = useState(false);

  return (
    <motion.section 
      className="min-h-screen relative flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 z-0">
        <DynamicHeart />
      </div>
      
      <motion.h1 
        className="text-4xl md:text-6xl font-bold text-center z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Hi love ❣️
        </motion.span>
      </motion.h1>

      <motion.div
        className="mt-8 text-center text-lg md:text-xl text-gray-200 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: isTypingComplete ? 1 : 0 }}
        onAnimationComplete={() => setTypingComplete(true)}
      >
        Scroll down to unwrap your special moments
      </motion.div>
    </motion.section>
  );
};
