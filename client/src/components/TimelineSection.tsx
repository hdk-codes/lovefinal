import { motion } from "framer-motion";

interface TimelineSectionProps {
  isDarkMode: boolean;
}

const TimelineSection = ({ isDarkMode }: TimelineSectionProps) => {
  const events = [
    { date: "2020-01-15", title: "We Met", description: "The day our paths crossed." },
    { date: "2021-06-10", title: "First Date", description: "A magical evening." },
  ];

  return (
    <section className="py-12 px-4">
      <h2 className="text-3xl text-center text-[#FF6B6B] mb-8">Our Love Story</h2>
      <div className="max-w-2xl mx-auto">
        {events.map((event, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.3 }}
            className="flex items-center mb-8"
          >
            <div className="w-4 h-4 bg-[#FF6B6B] rounded-full mr-4" />
            <div>
              <p className="text-sm text-[#FFB6C1]">{event.date}</p>
              <h3 className="text-xl text-[#FF6B6B]">{event.title}</h3>
              <p className={isDarkMode ? "text-[#E6D9F2]" : "text-[#4A4A4A]"}>{event.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default TimelineSection;