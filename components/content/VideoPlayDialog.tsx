"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import BaseVideoPlayer from "@/common/BaseVideoPlayer";
import { ContentItem } from "@/types/content";
import { X } from "lucide-react";

interface VideoPlayDialogProps {
  item: ContentItem;
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

const VideoPlayDialog = ({ item, open, setOpen }: VideoPlayDialogProps) => {
  // Extract video filename from URL
  const getVideoFileName = (url: string) => {
    try {
      if (!url) return "Video";
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const fileName = pathname.split('/').pop() || url;
      return decodeURIComponent(fileName);
    } catch {
      return url || "Video";
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
            className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden max-w-4xl w-full relative shadow-2xl border border-gray-200 dark:border-gray-800 transition-colors"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with video name and close button */}
            <div className="bg-gray-900 dark:bg-black px-6 py-4 flex items-center justify-between border-b border-gray-800">
              <h3 className="text-white text-sm md:text-base font-semibold truncate pr-12">
                {item.video ? getVideoFileName(item.video) : 'Video'}
              </h3>
              <button
                className="absolute top-3 right-4 text-gray-400 hover:text-white rounded-full w-9 h-9 flex items-center justify-center transition-all cursor-pointer hover:bg-red-500/20 group"
                onClick={() => setOpen(false)}
              >
                <X className="w-5 h-5 transition-transform group-hover:rotate-90" />
              </button>
            </div>

            {/* Modal content */}
            <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50">
              <BaseVideoPlayer
                src={item.video ?? ""}
                poster={item.thumbnail}
                autoPlay={open}
                rounded="rounded-xl"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VideoPlayDialog;