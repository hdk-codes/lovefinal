import { useState } from "react";
import { Link } from "wouter"; // Assuming you're using Wouter for routing
import { cn } from "@/lib/utils";
import { ReactNode } from 'react';

interface NavigationBarProps {
  extraControls?: ReactNode;
  isDarkMode?: boolean;
}

const NavigationBar = ({ extraControls, isDarkMode }: NavigationBarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const scrollToSection = (sectionId: string) => {
    closeMobileMenu();
    const section = document.getElementById(sectionId);
    if (section) {
      window.scrollTo({
        top: section.offsetTop - 80,
        behavior: "smooth",
      });
    }
  };

  return (
    <nav
      className={cn(
        "fixed top-0 w-full z-50 backdrop-blur-sm shadow-sm",
        isDarkMode ? "bg-[#2A1B3D]/75" : "bg-[#FFF5F5]/75"
      )}
    >
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-dancing text-[#FF6B6B] font-bold hover:text-[#FF8787] transition-colors duration-300"
        >
          Our Love Story
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8 items-center">
          <button
            onClick={() => scrollToSection("home")}
            className={cn(
              "transition-colors duration-300",
              isDarkMode
                ? "text-[#E6D9F2] hover:text-[#FF1493]"
                : "text-[#4A4A4A] hover:text-[#FF1493]"
            )}
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection("love-letters")}
            className={cn(
              "transition-colors duration-300",
              isDarkMode
                ? "text-[#E6D9F2] hover:text-[#FF1493]"
                : "text-[#4A4A4A] hover:text-[#FF1493]"
            )}
          >
            Love Letters
          </button>
          <button
            onClick={() => scrollToSection("memories")}
            className={cn(
              "transition-colors duration-300",
              isDarkMode
                ? "text-[#E6D9F2] hover:text-[#FF1493]"
                : "text-[#4A4A4A] hover:text-[#FF1493]"
            )}
          >
            Memories
          </button>
          <button
            onClick={() => scrollToSection("timeline")}
            className={cn(
              "transition-colors duration-300",
              isDarkMode
                ? "text-[#E6D9F2] hover:text-[#FF1493]"
                : "text-[#4A4A4A] hover:text-[#FF1493]"
            )}
          >
            Timeline
          </button>
          {extraControls}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className={cn(
            "md:hidden",
            isDarkMode ? "text-[#E6D9F2]" : "text-[#4A4A4A]"
          )}
        >
          <span className="material-icons">
            {mobileMenuOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className={cn(
            "md:hidden shadow-md absolute w-full",
            isDarkMode ? "bg-[#2A1B3D]" : "bg-white"
          )}
        >
          <div className="container mx-auto px-4 py-3 flex flex-col space-y-4">
            <button
              onClick={() => scrollToSection("home")}
              className={cn(
                "transition-colors duration-300",
                isDarkMode
                  ? "text-[#E6D9F2] hover:text-[#FF1493]"
                  : "text-[#4A4A4A] hover:text-[#FF1493]"
              )}
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("love-letters")}
              className={cn(
                "transition-colors duration-300",
                isDarkMode
                  ? "text-[#E6D9F2] hover:text-[#FF1493]"
                  : "text-[#4A4A4A] hover:text-[#FF1493]"
              )}
            >
              Love Letters
            </button>
            <button
              onClick={() => scrollToSection("memories")}
              className={cn(
                "transition-colors duration-300",
                isDarkMode
                  ? "text-[#E6D9F2] hover:text-[#FF1493]"
                  : "text-[#4A4A4A] hover:text-[#FF1493]"
              )}
            >
              Memories
            </button>
            <button
              onClick={() => scrollToSection("timeline")}
              className={cn(
                "transition-colors duration-300",
                isDarkMode
                  ? "text-[#E6D9F2] hover:text-[#FF1493]"
                  : "text-[#4A4A4A] hover:text-[#FF1493]"
              )}
            >
              Timeline
            </button>
            {extraControls && (
              <div className="flex flex-col space-y-4">{extraControls}</div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavigationBar;