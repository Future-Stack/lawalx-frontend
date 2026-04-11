"use client";

import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[999] bg-white dark:bg-[#0A0A0A] flex flex-col items-center justify-center">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-bgBlue/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-bgBlue/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative flex flex-col items-center max-w-sm w-full px-8 animate-in fade-in zoom-in duration-700">
        {/* Logo Container */}
        <div className="mb-12 relative group">
          <div className="absolute inset-0 bg-bgBlue/20 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500 scale-150 opacity-50" />
          <div className="relative bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800">
            <Image
              src="/tape.png"
              alt="Logo"
              width={160}
              height={50}
              className="h-12 w-auto animate-pulse"
              priority
            />
          </div>
        </div>

        {/* Loading Logic */}
        <div className="w-full space-y-6 text-center">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-headings dark:text-white tracking-tight">
              Initializing Dashboard
            </h2>
            <p className="text-muted text-sm font-medium">
              Synchronizing your workspace and devices...
            </p>
          </div>

          {/* Progress Bar Container */}
          <div className="relative h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
            <div 
              className="absolute inset-y-0 left-0 bg-bgBlue shadow-[0_0_15px_rgba(21,93,252,0.5)] rounded-full transition-all duration-500 ease-out"
              style={{
                width: '100%',
                animation: 'loading-progress 2s cubic-bezier(0.65, 0, 0.35, 1) infinite'
              }}
            />
          </div>

          <div className="flex items-center justify-center gap-2 pt-2">
             <div className="w-1.5 h-1.5 rounded-full bg-bgBlue animate-bounce [animation-delay:-0.3s]" />
             <div className="w-1.5 h-1.5 rounded-full bg-bgBlue animate-bounce [animation-delay:-0.15s]" />
             <div className="w-1.5 h-1.5 rounded-full bg-bgBlue animate-bounce" />
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes loading-progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
