'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface StickyScrollContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function StickyScrollContainer({ children, className }: StickyScrollContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const dummyRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [contentWidth, setContentWidth] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const scrollbar = scrollbarRef.current;
    const dummy = dummyRef.current;
    if (!container || !scrollbar || !dummy) return;

    const updateDimensions = () => {
      const { scrollWidth, clientWidth } = container;
      const isOverflowing = scrollWidth > clientWidth;
      setContentWidth(scrollWidth);
      
      if (isOverflowing) {
        dummy.style.width = `${scrollWidth}px`;
      }
    };

    const handleScroll = () => {
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Show floating scrollbar if the container is in view but its bottom is off-screen
      const show = rect.top < windowHeight && rect.bottom > windowHeight;
      setIsVisible(show);

      if (show && scrollbar) {
        scrollbar.style.left = `${rect.left}px`;
        scrollbar.style.width = `${rect.width}px`;
      }

      // Sync floating scrollbar position with real container
      if (scrollbar) {
        scrollbar.scrollLeft = container.scrollLeft;
      }
    };

    const handleFloatingScroll = () => {
      if (container && scrollbar) {
        container.scrollLeft = scrollbar.scrollLeft;
      }
    };

    // Observers and Listeners
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(container);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', updateDimensions);
    scrollbar.addEventListener('scroll', handleFloatingScroll);

    updateDimensions();
    handleScroll();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateDimensions);
      scrollbar.removeEventListener('scroll', handleFloatingScroll);
    };
  }, []);

  return (
    <div className="relative w-full">
      {/* The actual content container */}
      <div 
        ref={containerRef} 
        className={cn("overflow-x-auto custom-scrollbar", className)}
      >
        {children}
      </div>

      {/* Floating Sticky Scrollbar */}
      <div
        ref={scrollbarRef}
        className={cn(
          "fixed bottom-0 z-50 h-[10px] overflow-x-auto transition-opacity duration-300 custom-scrollbar",
          "bg-white/80 dark:bg-black/80 backdrop-blur-sm border-t border-border",
          isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div ref={dummyRef} className="h-px" />
      </div>
    </div>
  );
}
