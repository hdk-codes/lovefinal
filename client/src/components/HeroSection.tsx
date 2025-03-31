import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ChevronDown, Heart } from "lucide-react";

interface HeroSectionProps {
  title?: string;
  message?: string;
  isDarkMode: boolean;
}

const HeroSection = ({ title, message, isDarkMode }: HeroSectionProps) => {
  const [scrollY, setScrollY] = useState(0);

  const handleScroll = () => {
    setScrollY(window.scrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      window.scrollTo({
        top: section.offsetTop - 80,
        behavior: "smooth",
      });
    }
  };

  return (
    <section id="home" className="relative min-h-[90vh] md:h-screen overflow-hidden">
      {/* Parallax background */}
      <div 
        className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gray-900 to-black"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
          transition: 'transform 0.1s linear',
        }}
      >
        {/* Background gradients */}
        <div className="absolute inset-0 opacity-25" 
          style={{ 
            backgroundImage: `radial-gradient(circle at 30% 30%, rgba(255, 20, 147, 0.3), transparent 60%),
                             radial-gradient(circle at 70% 70%, rgba(255, 107, 107, 0.2), transparent 60%)`,
          }}
        />
        
        {/* Floating hearts background with proper opacity */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div 
              key={i}
              className="absolute text-pink-500"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.2 + 0.05,
                scale: Math.random() * 1 + 0.5,
              }}
              animate={{
                y: [0, -20, 0],
                x: [0, Math.random() * 10 - 5, 0],
                opacity: [
                  Math.random() * 0.1 + 0.05, 
                  Math.random() * 0.15 + 0.05, 
                  Math.random() * 0.1 + 0.05
                ],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Heart fill="currentColor" size={Math.floor(Math.random() * 30) + 20} />
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center py-16 md:py-0">
        <motion.div
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 glass-effect rounded-xl p-8 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            transform: `translateY(${-scrollY * 0.15}px)`,
          }}
        >
          <motion.h1 
            className="text-5xl md:text-6xl lg:text-7xl handwritten font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-600 mb-6 drop-shadow-sm"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            {title || "Every Moment With You"}
          </motion.h1>
          
          <motion.div 
            className="text-lg md:text-xl lg:text-2xl text-gray-200 max-w-3xl mx-auto mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
          >
            {message ? message.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4">{paragraph}</p>
            )) : (
              <p className="mb-4">Our digital love story...</p>
            )}
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button 
              onClick={() => scrollToSection("love-letters")} 
              className="love-button group"
            >
              <span className="relative z-10">Begin Our Journey</span>
              <span className="absolute inset-0 w-full h-full bg-white/10 transform scale-x-0 origin-left transition-transform group-hover:scale-x-100"></span>
            </button>
            <button 
              onClick={() => {
                const button = document.querySelector('.createContentButton');
                if (button instanceof HTMLElement) {
                  button.click();
                }
              }}
              className="bg-transparent text-pink-400 border-2 border-pink-500/50 font-medium py-3 px-8 rounded-full backdrop-blur-sm transition-all duration-300 transform hover:scale-105 hover:bg-pink-500/10 hover:border-pink-400"
            >
              Create a Memory
            </button>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-pink-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ 
          opacity: { delay: 2, duration: 1 },
          y: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
        }}
      >
        <ChevronDown size={30} strokeWidth={2} />
      </motion.div>
    </section>
  );
};

export default HeroSection;
