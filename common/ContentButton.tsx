"use client";

import { ButtonHTMLAttributes } from "react";
import { LucideIcon } from "lucide-react";

interface ContentButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  title?: string;
  icon?: LucideIcon;
  bgColor?: string;
  hoverColor?: string;
}

const ContentButton = ({
  title,
  icon: Icon,
  className = "",
  style = {},
  bgColor = "#0FA6FF",
  hoverColor = "#00A4FF",
  ...rest
}: ContentButtonProps) => {
  return (
    <>
      <style>{`
        .content-btn {
          background: ${bgColor};
          // box-shadow: 
          //   0 1px 2px rgba(0,0,0,0.15),
          //   inset 0 1px 0 rgba(255,255,255,0.2),
          //   inset 0 -2px 4px rgba(0,0,0,0.2);
          border-radius: 12px;
          // border: 2px solid rgba(255, 255, 255, 0.12);
          transition: all 0.15s ease;
          cursor: pointer;
        }

        .content-btn:hover {
          background: ${hoverColor};
          transform: scale(1.03);
          opacity: 0.95;
        }

        .content-btn:active {
          background: ${hoverColor};
          // box-shadow:
          //   0 1px 2px rgba(0,0,0,0.2),
          //   inset 0 2px 4px rgba(0,0,0,0.25);
          transform: scale(0.98);
        }
      `}</style>

      <button
        {...rest}
        className={`content-btn flex shadow-customShadow items-center gap-2 text-white font-medium text-sm md:text-base px-4 md:px-6 py-2 md:py-3 whitespace-nowrap select-none ${className}`}
        style={style}
      >
        {Icon && <Icon className="w-5 h-5" />}
        {title && <span>{title}</span>}
      </button>
    </>
  );
};

export default ContentButton;
