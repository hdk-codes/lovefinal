import { useQuery } from "@tanstack/react-query";
import LoveLetterCard from "./LoveLetterCard";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Heart, PenTool } from "lucide-react";

interface Letter {
  _id: string;
  title: string;
  content: any;
  _createdAt?: string;
  createdAt?: string;
}

interface LoveLettersSectionProps {
  isDarkMode: boolean;
}

const LoveLettersSection = ({ isDarkMode }: LoveLettersSectionProps) => {
  const { data, isLoading, isError } = useQuery<Letter[]>({
    queryKey: ['/api/love-letters']
  });

  // Safe accessing the letters data
  const letters = data || [];

  return (
    <section className={`py-12 ${isDarkMode ? 'text-[#E6D9F2]' : 'text-[#4A4A4A]'}`}>
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 opacity-5">
        <div className="absolute top-0 right-0 w-1/3 h-1/3">
          <Heart className="w-full h-full text-pink-500" />
        </div>
        <div className="absolute bottom-0 left-0 w-1/4 h-1/4">
          <Heart className="w-full h-full text-pink-500" />
        </div>
      </div>
      
      <div className="container mx-auto px-4">
        <motion.div 
          className="flex items-center justify-center mb-16 gap-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <PenTool className="text-pink-500 w-8 h-8" />
          <h2 className="text-4xl handwritten text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-600 text-center">
            Love Letters
          </h2>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-8 md:gap-16">
          {isLoading ? (
            // Loading skeletons
            Array(2).fill(0).map((_, idx) => (
              <div key={idx} className="relative h-96 bg-gray-800/50 animate-pulse rounded-lg"></div>
            ))
          ) : isError ? (
            // Error state
            <div className="col-span-2 text-center py-8 glass-effect rounded-xl p-8">
              <p className="text-pink-300">Unable to fetch love letters. Don't worry, our connection is still strong.</p>
            </div>
          ) : letters.length > 0 ? (
            // Display letters if available
            letters.map((letter: Letter) => (
              <motion.div
                key={letter._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mobile-tilt"
              >
                <LoveLetterCard 
                  title={letter.title || "My Love"}
                  date={letter._createdAt || letter.createdAt || new Date().toISOString()}
                  content={Array.isArray(letter.content) 
                    ? letter.content.map((block: any) => 
                        block.children?.map((child: any) => child.text).join("")).join("\n")
                    : (typeof letter.content === 'string' ? letter.content : "No content available")}
                  coverTitle={letter.title || "From My Heart to Yours"}
                />
              </motion.div>
            ))
          ) : (
            // Empty state with call-to-action
            <div className="col-span-2 love-card text-center py-8">
              <p className="text-gray-300">Our love story is just beginning. Create the first love letter to express your feelings.</p>
              <button 
                onClick={() => {
                  const button = document.querySelector('.createContentButton');
                  if (button instanceof HTMLElement) {
                    button.click();
                  }
                }}
                className="mt-4 love-button"
              >
                Write a Love Letter
              </button>
            </div>
          )}
        </div>
        
        {letters.length > 0 && (
          <motion.div 
            className="text-center mt-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Link href="/letters" className="inline-block text-pink-400 border border-pink-500/50 hover:bg-pink-500/10 rounded-full px-6 py-2 transition-colors duration-300">
              View All Letters
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default LoveLettersSection;
