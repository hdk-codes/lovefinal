import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const LoveNoteModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="bg-[#2A1B3D] p-6 rounded-lg max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl text-[#FF6B6B] mb-4">Write a Love Note</h2>
        <textarea
          className="w-full h-32 p-2 rounded bg-[#1A0F2A] text-[#E6D9F2] border border-[#FF6B6B]"
          placeholder="My dearest..."
        />
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#FF6B6B] text-white rounded hover:bg-[#FF8787] transition-all"
          >
            Send ❤️
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LoveNoteModal;