import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Heart, Mail, Camera } from "lucide-react";

interface FooterProps {
  isDarkMode: boolean;
}

const Footer = ({ isDarkMode }: FooterProps) => {
  const [, setLocation] = useLocation();
  
  return (
    <footer className="bg-white py-10 border-t border-[#FFC0CB]/20">
      <div className="container mx-auto px-4 text-center">
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <button 
            onClick={() => setLocation("/")}
            className="font-dancing text-2xl text-[#FF6B6B] hover:text-[#FF1493] transition-colors duration-300 cursor-pointer"
          >
            Our Love Story
          </button>
        </motion.div>
        
        <motion.p 
          className="text-[#4A4A4A] text-sm max-w-md mx-auto mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          A digital space for our moments, memories, and messages. Distance may separate us, but love connects us always.
        </motion.p>
        
        <motion.div 
          className="flex justify-center space-x-6 mb-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <button 
            onClick={() => {
              const section = document.getElementById("love-letters");
              if (section) {
                section.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="text-[#4A4A4A] hover:text-[#FF1493] transition-colors duration-300 flex items-center justify-center w-10 h-10 rounded-full hover:bg-pink-50"
          >
            <Heart size={20} />
          </button>
          
          <button 
            onClick={() => {
              const section = document.getElementById("messages");
              if (section) {
                section.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="text-[#4A4A4A] hover:text-[#FF1493] transition-colors duration-300 flex items-center justify-center w-10 h-10 rounded-full hover:bg-pink-50"
          >
            <Mail size={20} />
          </button>
          
          <button 
            onClick={() => {
              const section = document.getElementById("memories");
              if (section) {
                section.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="text-[#4A4A4A] hover:text-[#FF1493] transition-colors duration-300 flex items-center justify-center w-10 h-10 rounded-full hover:bg-pink-50"
          >
            <Camera size={20} />
          </button>
        </motion.div>
        
        <motion.div 
          className="text-xs text-[#4A4A4A] flex flex-col sm:flex-row items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p>Made with ❤️, for the love of my life</p>
          <span className="hidden sm:inline">•</span>
          <p>© {new Date().getFullYear()}</p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
