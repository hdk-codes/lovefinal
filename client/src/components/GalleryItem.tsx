import { motion } from "framer-motion";
import { Heart, ImageIcon } from "lucide-react";
import { Link } from "wouter";

interface GalleryItemProps {
  id: string;
  title: string;
  imageUrl: string;
  reactionCount: number;
}

const GalleryItem = ({ id, title, imageUrl, reactionCount }: GalleryItemProps) => {
  // Default placeholder image
  const defaultImage = "https://images.unsplash.com/photo-1530653333484-8e3c89cd2f45?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80";

  return (
    <Link href={`/gallery/${id}`}>
      <motion.div 
        className="relative group overflow-hidden rounded-lg cursor-pointer shadow-md hover:shadow-lg mobile-tilt"
        whileHover={{ 
          scale: 1.02,
          boxShadow: "0 10px 25px -5px rgba(255, 20, 147, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)"
        }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {/* Image with error handling */}
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = defaultImage;
            }}
          />
        ) : (
          <div className="w-full aspect-square flex items-center justify-center bg-gray-800 text-pink-500/20">
            <ImageIcon size={60} />
          </div>
        )}
          
        {/* Gradient overlay that appears on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Title and reactions count */}
        <div className="absolute inset-x-0 bottom-0 px-4 py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <p className="text-sm font-medium text-white handwritten">{title}</p>
          <div className="flex items-center mt-1 space-x-2">
            <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
            <span className="text-xs text-pink-200">{reactionCount}</span>
          </div>
        </div>
        
        {/* Always visible reaction count */}
        <div className="absolute top-2 right-2 bg-black/50 rounded-full px-2 py-1 backdrop-blur-sm flex items-center space-x-1 z-10 opacity-80 group-hover:opacity-0 transition-opacity duration-300">
          <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
          <span className="text-xs text-white">{reactionCount}</span>
        </div>
      </motion.div>
    </Link>
  );
};

export default GalleryItem;
