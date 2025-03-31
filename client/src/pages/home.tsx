import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import NavigationBar from "@/components/NavigationBar";
import HeroSection from "@/components/HeroSection";
import LoveLettersSection from "@/components/LoveLettersSection";
import MemoriesSection from "@/components/MemoriesSection";
import WobbleFeatureSection from "@/components/WobbleFeatureSection";
import TimelineSection from "@/components/TimelineSection";
import LoveNoteModal from "@/components/LoveNoteModal";
import Footer from "@/components/Footer";
import MessagesSection from "@/components/MessagesSection";

interface LandingPage {
  title: string;
  message: string;
  backgroundEffect?: "hearts" | "petals" | "stars" | "none";
}

const Home = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: landingData } = useQuery({
    queryKey: ["/api/landing"],
    queryFn: async () => {
      const response = await fetch("/api/landing");
      if (!response.ok) throw new Error("Failed to fetch landing data");
      return (await response.json()) as LandingPage;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
    initialData: {
      title: "Every Moment With You",
      message: "A digital space where our love story unfolds...",
      backgroundEffect: "hearts",
    } as LandingPage,
  });

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        isDarkMode
          ? "bg-gradient-to-br from-[#2A1B3D] to-[#1A0F2A] text-[#E6D9F2]"
          : "bg-gradient-to-br from-[#FFF5F5] to-[#FFE6E6] text-[#4A4A4A]"
      } font-lora antialiased relative overflow-hidden`}
    >
      {/* Parallax Background */}
      <div className="absolute inset-0 pointer-events-none hearts-bg" />

      {/* Navigation */}
      <NavigationBar
        extraControls={
          <div className="flex gap-4">
            <button
              onClick={toggleDarkMode}
              className="px-4 py-2 rounded-full bg-opacity-30 bg-[#FF6B6B] hover:bg-opacity-50 transition-all"
            >
              {isDarkMode ? "☀️ Light" : "🌙 Dark"}
            </button>
            <button
              onClick={openModal}
              className="px-4 py-2 rounded-full bg-opacity-30 bg-[#FFB6C1] hover:bg-opacity-50 transition-all"
            >
              ✍️ Love Note
            </button>
          </div>
        }
        isDarkMode={isDarkMode}
      />

      {/* Sections */}
      <HeroSection
        title={landingData?.title}
        message={landingData?.message}
        isDarkMode={isDarkMode}
      />
      <LoveLettersSection isDarkMode={isDarkMode} />
      <MemoriesSection isDarkMode={isDarkMode} />
      <WobbleFeatureSection isDarkMode={isDarkMode} />
      <div className="py-12">
        <MessagesSection isDarkMode={isDarkMode} />
      </div>
      <TimelineSection isDarkMode={isDarkMode} />
      <Footer isDarkMode={isDarkMode} />

      {/* Love Note Modal */}
      <LoveNoteModal isOpen={isModalOpen} onClose={closeModal} />

      {/* Global Styles */}
      <style>{`
        .hearts-bg {
          background: url("/images/hearts-bg.png") repeat;
          opacity: 0.1;
          animation: parallax 30s infinite linear;
        }
        @keyframes parallax {
          0% { background-position: 0 0; }
          100% { background-position: 100px 100px; }
        }
        .heart-pulse {
          width: 30px;
          height: 30px;
          background: radial-gradient(circle, #FF6B6B 40%, transparent 70%);
          border-radius: 50%;
          animation: pulse 1.5s infinite ease-in-out;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.2); opacity: 1; }
        }
        .animate-fade-up {
          animation: fadeUp 1.2s ease-out forwards;
        }
        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Home;