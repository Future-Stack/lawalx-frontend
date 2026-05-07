"use client";

import Image from "next/image";
import React from "react";

interface AddButtonProps {
  onClick?: () => void;
  backgroundImage?: string;
  icon?: React.ReactNode;
  text?: string;
}

const AddButton: React.FC<AddButtonProps> = ({
  onClick,
  backgroundImage = "/common/btnBg.png",
  text = "Add New Device",
  icon,
}) => {
  return (
    <button
      onClick={onClick}
      className="relative px-4 py-2 md:py-3 rounded-lg overflow-hidden flex items-center justify-center gap-3 shadow-customShadow bg-gray-800 cursor-pointer 
      transition-all duration-500 ease-out hover:scale-[1.03] hover:shadow-lg hover:brightness-110 border border-border"
    >
      {/* Background image */}
      <Image
        src={backgroundImage}
        alt="Button Background"
        fill
        className="object-cover absolute inset-0 z-10 transition-transform duration-700 ease-out group-hover:scale-105"
        sizes="100vw"
        priority
      />

      {/* Content */}
      {icon && <div className="text-white relative z-20">{icon}</div>}
      <span className="text-sm md:text-[16px] font-semibold text-white relative z-20">
        {text}
      </span>
    </button>
  );
};

export default AddButton;




// Demo usage:
// <Button
//   icon={<Box className="w-6 h-6 text-current" />}
//   text="Add new Device"
//   />
