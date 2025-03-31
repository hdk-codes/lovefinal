import { motion } from "framer-motion";
import { Eye, CalendarDays, ImageIcon, Tag, MapPin } from "lucide-react";
import { Link } from "wouter";

export interface AlbumCardProps {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  itemsCount: number;
  date?: string;
  isPrivate?: boolean;
  location?: string;
  categories?: string[];
  tags?: string[];
  dateRange?: {
    from: string;
    to: string;
  };
}

const AlbumCard = ({
  id,
  title,
  description,
  coverImage,
  itemsCount,
  date,
  isPrivate,
  location,
  categories,
  tags,
  dateRange
}: AlbumCardProps) => {
  // Default placeholder image if no cover image is provided
  const defaultCover = "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";
  
  // Get first category if available, with null coalescing
  const primaryCategory = categories && categories.length > 0 ? categories[0] : null;
  
  // Format tags for display with null coalescing
  const tagsToShow = tags?.slice(0, 3) ?? [];

  // Fix type for tag parameter
  const renderTags = (tag: string, index: number) => (
    <span key={index} className="text-xs bg-gray-800 text-pink-300 px-2 py-0.5 rounded-full">
      {tag}
    </span>
  );

  return (
    <motion.div 
      className="group love-card relative overflow-hidden rounded-lg transition-all duration-300"
      whileHover={{ y: -5, boxShadow: "0 15px 30px -5px rgba(255, 20, 147, 0.3), 0 5px 15px -5px rgba(0, 0, 0, 0.2)" }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative h-64 overflow-hidden rounded-t-lg">
        {coverImage ? (
          <img 
            src={coverImage} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = defaultCover;
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800 text-pink-500/20">
            <ImageIcon size={80} />
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent"></div>
        
        {/* Album info */}
        <div className="absolute bottom-0 left-0 w-full p-4 text-white z-10">
          <h3 className="text-xl handwritten text-pink-200">{title}</h3>
          <div className="flex items-center gap-1 text-sm opacity-90 text-pink-100">
            <ImageIcon size={14} />
            <span>{itemsCount} {itemsCount === 1 ? 'memory' : 'memories'}</span>
          </div>
        </div>
        
        {/* Category badge - if available */}
        {primaryCategory && (
          <div className="absolute top-3 right-3 bg-pink-500/80 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
            {primaryCategory}
          </div>
        )}
      </div>
      
      <div className="p-5 bg-gray-900/80 backdrop-blur-sm">
        {description && (
          <p className="text-gray-300 line-clamp-3 text-sm">{description}</p>
        )}
        
        {/* Tags section */}
        {tagsToShow.length > 0 && (
          <div className="mt-2 flex gap-1 flex-wrap">
            {tagsToShow.map((tag: string, index: number) => renderTags(tag, index))}
          </div>
        )}
        
        <div className="mt-4 flex justify-between items-center">
          {dateRange && (
            <div className="flex items-center gap-1 text-xs text-pink-300/70">
              <CalendarDays size={12} />
              <span>{dateRange.from} - {dateRange.to}</span>
            </div>
          )}
          
          {location && (
            <div className="flex items-center gap-1 text-xs text-pink-300/70">
              <MapPin size={12} />
              <span>{location}</span>
            </div>
          )}
          
          <Link
            href={`/album/${id}`}
            className="text-pink-400 hover:text-pink-300 transition-colors duration-300 p-2 rounded-full hover:bg-pink-500/10"
          >
            <Eye size={18} />
          </Link>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-2 left-2 opacity-30 rotate-15 text-pink-500">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>
      
      {/* Private indicator */}
      {isPrivate && (
        <div className="absolute top-3 left-3 bg-gray-900/80 text-xs text-white px-2 py-0.5 rounded-full flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <span>Private</span>
        </div>
      )}
    </motion.div>
  );
};

export default AlbumCard;
