/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Loader2 } from "lucide-react";

interface ProgramHeaderProps {
  program: any;
  handleSave: () => void;
  isUpdating: boolean;
}

const ProgramHeader = ({ program, handleSave, isUpdating }: ProgramHeaderProps) => {
  return (
    <div className="border-b border-border pb-6 md:pb-8 mb-6 sm:mb-8 rounded-t-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-lg sm:text-2xl md:text-[30px] font-semibold text-headings leading-tight">
          {program.name}
        </h1>

        <button
          onClick={handleSave}
          disabled={isUpdating}
          className="bg-bgBlue hover:bg-blue-500 text-white px-6 py-2.5 md:px-8 md:py-3.5 rounded-lg text-sm md:text-base font-semibold cursor-pointer transition-all duration-300 ease-in-out shadow-customShadow whitespace-nowrap shrink-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Changes
        </button>
      </div>
      <p className="text-sm sm:text-base text-muted mt-3 sm:mt-4 leading-relaxed">
        {program.description}
      </p>
    </div>
  );
};

export default ProgramHeader;
