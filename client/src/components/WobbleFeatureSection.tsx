import { WobbleCard } from "@/components/ui/wobble-card";

interface WobbleFeatureSectionProps {
  isDarkMode: boolean;
}

const WobbleFeatureSection = ({ isDarkMode }: WobbleFeatureSectionProps) => {
  return (
    <section className="py-12 px-4">
      <WobbleCard containerClassName="max-w-3xl mx-auto">
        <h2 className="text-3xl text-[#FF6B6B]">Our Adventure Begins</h2>
        <p className={`mt-4 ${isDarkMode ? "text-[#E6D9F2]" : "text-[#4A4A4A]"}`}>
          A journey of love and laughter.
        </p>
      </WobbleCard>
    </section>
  );
};

export default WobbleFeatureSection;