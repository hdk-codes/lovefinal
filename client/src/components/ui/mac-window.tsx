import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface MacWindowMockupProps {
  /**
   * Optional className for styling the container
   */
  className?: string;
  
  /**
   * Optional title to show in the window title bar
   */
  title?: string;
  
  /**
   * Optional width for the window
   */
  width?: string | number;
  
  /**
   * Optional height for the window
   */
  height?: string | number;
  
  /**
   * Color scheme - light or dark
   */
  variant?: "light" | "dark";
  
  /**
   * Whether to show a window shadow
   */
  shadow?: boolean;
  
  /**
   * Whether the window is actively focused
   */
  active?: boolean;
  
  /**
   * Whether to animate the window on mount
   */
  animate?: boolean;
  
  /**
   * Content to render inside the window
   */
  children: React.ReactNode;
  
  /**
   * Optional action when the close button is clicked
   */
  onClose?: () => void;
  
  /**
   * Optional action when the minimize button is clicked
   */
  onMinimize?: () => void;
  
  /**
   * Optional action when the maximize button is clicked
   */
  onMaximize?: () => void;
}

export const MacWindowMockup: React.FC<MacWindowMockupProps> = ({
  className,
  title,
  width = "100%",
  height = "auto",
  variant = "dark",
  shadow = true,
  active = true,
  animate = false,
  children,
  onClose,
  onMinimize,
  onMaximize,
}) => {
  const isDark = variant === "dark";
  
  // Animation variants for the window
  const containerVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.98 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.3, 
        ease: "easeOut" 
      }
    }
  };
  
  return (
    <motion.div
      className={cn(
        "rounded-lg overflow-hidden",
        shadow && (isDark 
          ? "shadow-[0_20px_30px_-10px_rgba(0,0,0,0.4)]" 
          : "shadow-[0_10px_30px_-5px_rgba(0,0,0,0.2)]"
        ),
        "flex flex-col",
        "border",
        isDark ? "border-gray-800" : "border-gray-300",
        className
      )}
      style={{ 
        width, 
        height,
        background: isDark ? "#1A1A1A" : "#FFFFFF",
      }}
      initial={animate ? "hidden" : undefined}
      animate={animate ? "visible" : undefined}
      variants={containerVariants}
    >
      {/* Title bar */}
      <div 
        className={cn(
          "h-7 px-2 flex items-center",
          isDark ? "bg-gray-800" : "bg-gray-100",
          !active && "opacity-70"
        )}
      >
        {/* Traffic light buttons */}
        <div className="flex space-x-1.5 mr-2">
          <button 
            className={cn(
              "w-3 h-3 rounded-full flex items-center justify-center",
              "bg-red-500 hover:bg-red-600 group",
              !active && "bg-red-500/60"
            )}
            onClick={onClose}
          >
            <svg 
              className="w-2 h-2 text-red-800 opacity-0 group-hover:opacity-100" 
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
              />
            </svg>
          </button>
          <button 
            className={cn(
              "w-3 h-3 rounded-full flex items-center justify-center",
              "bg-yellow-500 hover:bg-yellow-600 group",
              !active && "bg-yellow-500/60"
            )}
            onClick={onMinimize}
          >
            <svg 
              className="w-2 h-2 text-yellow-800 opacity-0 group-hover:opacity-100" 
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M20 14H4v-4h16v4z"
              />
            </svg>
          </button>
          <button 
            className={cn(
              "w-3 h-3 rounded-full flex items-center justify-center",
              "bg-green-500 hover:bg-green-600 group",
              !active && "bg-green-500/60"
            )}
            onClick={onMaximize}
          >
            <svg 
              className="w-2 h-2 text-green-800 opacity-0 group-hover:opacity-100" 
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"
              />
            </svg>
          </button>
        </div>
        
        {/* Window title */}
        <div className="flex-1 text-center">
          <p className={cn(
            "text-xs font-medium truncate",
            isDark ? "text-gray-400" : "text-gray-500"
          )}>
            {title}
          </p>
        </div>
        
        {/* Spacing to balance the traffic lights */}
        <div className="w-16" />
      </div>
      
      {/* Window content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </motion.div>
  );
};

/**
 * MacWindowHeader - Optional component for creating headers inside the MacWindow
 */
export const MacWindowHeader: React.FC<{
  className?: string;
  children?: React.ReactNode;
  variant?: "light" | "dark";
}> = ({ className, children, variant = "dark" }) => {
  const isDark = variant === "dark";
  
  return (
    <div className={cn(
      "px-4 py-2 border-b",
      isDark ? "bg-gray-900 border-gray-800" : "bg-gray-50 border-gray-200",
      className
    )}>
      {children}
    </div>
  );
};

/**
 * MacWindowToolbar - Optional component for creating toolbars inside the MacWindow
 */
export const MacWindowToolbar: React.FC<{
  className?: string;
  children?: React.ReactNode;
  variant?: "light" | "dark";
}> = ({ className, children, variant = "dark" }) => {
  const isDark = variant === "dark";
  
  return (
    <div className={cn(
      "px-2 py-1 flex items-center gap-1 border-b",
      isDark ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-200",
      className
    )}>
      {children}
    </div>
  );
};

/**
 * MacWindowTerminal - Styled terminal/console output display for MacWindow
 */
export const MacWindowTerminal: React.FC<{
  className?: string;
  content?: string;
  prompt?: string;
}> = ({ className, content = "", prompt = "$ " }) => {
  const lines = content.split('\n');
  
  return (
    <div className={cn(
      "font-mono text-xs p-3 bg-gray-950 text-gray-300 overflow-auto",
      className
    )}>
      {lines.map((line, i) => (
        <div key={i} className="whitespace-pre">
          {i === lines.length - 1 && line !== "" ? (
            <span>
              <span className="text-green-400">{prompt}</span>
              <span className="text-gray-300">{line}</span>
              <span className="animate-pulse">▋</span>
            </span>
          ) : (
            line
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * MacWindowFooter - Optional component for creating footers inside the MacWindow
 */
export const MacWindowFooter: React.FC<{
  className?: string;
  children?: React.ReactNode;
  variant?: "light" | "dark";
}> = ({ className, children, variant = "dark" }) => {
  const isDark = variant === "dark";
  
  return (
    <div className={cn(
      "px-4 py-2 border-t",
      isDark ? "bg-gray-900 border-gray-800" : "bg-gray-50 border-gray-200",
      className
    )}>
      {children}
    </div>
  );
};

/**
 * MacWindowScrollArea - Styled scrollable area for MacWindow
 */
export const MacWindowScrollArea: React.FC<{
  className?: string;
  children?: React.ReactNode;
  maxHeight?: string;
}> = ({ className, children, maxHeight = "400px" }) => {
  return (
    <div 
      className={cn(
        "overflow-auto custom-scrollbar",
        className
      )}
      style={{ maxHeight }}
    >
      {children}
    </div>
  );
};

/**
 * MacWindowTab - Tab component for creating tabbed interfaces in MacWindow
 */
export const MacWindowTab: React.FC<{
  active?: boolean;
  label: string;
  onClick?: () => void;
  variant?: "light" | "dark";
}> = ({ active = false, label, onClick, variant = "dark" }) => {
  const isDark = variant === "dark";
  
  return (
    <button
      className={cn(
        "px-3 py-1 text-xs rounded-t-md transition-colors",
        active 
          ? isDark 
            ? "bg-gray-700 text-white" 
            : "bg-white text-gray-800 border-t border-l border-r border-gray-300"
          : isDark
            ? "bg-gray-800 text-gray-400 hover:bg-gray-750 hover:text-gray-300"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
      )}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

/**
 * MacWindowTabsContainer - Container for the MacWindowTab components
 */
export const MacWindowTabsContainer: React.FC<{
  className?: string;
  children?: React.ReactNode;
  variant?: "light" | "dark";
}> = ({ className, children, variant = "dark" }) => {
  const isDark = variant === "dark";
  
  return (
    <div className={cn(
      "flex items-end gap-1 px-2 pt-2",
      isDark ? "bg-gray-800 border-b border-gray-700" : "bg-gray-100 border-b border-gray-300",
      className
    )}>
      {children}
    </div>
  );
};