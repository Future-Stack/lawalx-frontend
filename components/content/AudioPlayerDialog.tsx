"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { ContentItem } from "@/types/content";
import { X } from "lucide-react";

interface AudioPlayerDialogProps {
  item: ContentItem; // item.audio should hold the audio URL
  open: boolean;
  setOpen: (open: boolean) => void;
}

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.97, filter: "blur(4px)" },
  visible: { 
    opacity: 1, 
    scale: 1, 
    filter: "blur(0px)",
    transition: { duration: 0.3, ease: "easeOut" }
  },
};

const AudioPlayerDialog = ({ item, open, setOpen }: AudioPlayerDialogProps) => {
  // Extract audio filename from URL
  const getAudioFileName = (url: string) => {
    try {
      if (!url) return "Audio";
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const fileName = pathname.split("/").pop() || url;
      return decodeURIComponent(fileName);
    } catch {
      return url || "Audio";
    }
  };

  return (
    <AnimatePresence>
      {open && (
        // Backdrop
        <motion.div
          className="fixed inset-0 bg-black/60 z-[2147483647] flex items-center justify-center max-[767px]:px-4 backdrop-blur-sm"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={() => setOpen(false)}
        >
          {/* Stop click from closing modal when clicking inside */}
          <motion.div
            className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden max-w-md w-full relative shadow-2xl border border-gray-200 dark:border-gray-800 transition-colors"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with audio name and close button */}
            <div className="bg-gray-900 dark:bg-black px-6 py-4 flex items-center justify-between border-b border-gray-800">
              <h3 className="text-white text-sm md:text-base font-semibold truncate pr-12">
                {item.audio ? getAudioFileName(item.audio) : "Audio"}
              </h3>
              <button
                className="absolute top-3 right-4 text-gray-400 hover:text-white rounded-full w-9 h-9 flex items-center justify-center transition-all cursor-pointer hover:bg-red-500/20 group"
                onClick={() => setOpen(false)}
              >
                <X className="w-5 h-5 transition-transform group-hover:rotate-90" />
              </button>
            </div>

            {/* Modal content */}
            <div className="p-5 sm:p-7 bg-white dark:bg-gray-900 transition-colors">
              {item.audio && (
                <div className="audio-player-container rounded-xl overflow-hidden shadow-inner bg-gray-50 dark:bg-gray-800/50 p-1 border border-gray-100 dark:border-gray-800">
                  <AudioPlayer
                    src={item.audio}
                    autoPlay={false}
                    showJumpControls={false}
                    customAdditionalControls={[]}
                    layout="stacked"
                    className="dark-audio-player shadow-none border-none ring-0 outline-none"
                  />
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AudioPlayerDialog;
