"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X } from "lucide-react";
import { ContentItem } from "@/types/content";

interface ImageViewDialogProps {
    item: ContentItem;
    open: boolean;
    setOpen: (open: boolean) => void;
}

const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
};

const ImageViewDialog = ({ item, open, setOpen }: ImageViewDialogProps) => {
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4"
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    onClick={() => setOpen(false)}
                >
                    <motion.div
                        className="bg-white rounded-xl overflow-hidden max-w-3xl w-full relative"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-gray-900 px-4 py-3 flex items-center justify-between">
                            <h3 className="text-white text-sm md:text-base font-medium truncate pr-8">{item.title || "Image"}</h3>
                            <button
                                className="absolute top-3 right-3 text-gray-400 hover:text-white rounded-full w-8 h-8 flex items-center justify-center transition-all cursor-pointer hover:bg-red-500/20 group"
                                onClick={() => setOpen(false)}
                            >
                                <X className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
                            </button>
                        </div>

                        <div className="p-4 sm:p-6 bg-white flex items-center justify-center">
                            {item.thumbnail ? (
                                <div className="relative w-full h-[60vh] sm:h-[70vh]">
                                    <Image src={item.thumbnail} alt={item.title} fill unoptimized className="object-contain" />
                                </div>
                            ) : (
                                <div className="p-12 text-center text-gray-500">No preview available</div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ImageViewDialog;
