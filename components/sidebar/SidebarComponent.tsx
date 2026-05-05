
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

interface SidebarComponentProps {
  items?: SidebarItem[];
  className?: string;
}

const SidebarComponent: React.FC<SidebarComponentProps & { isCollapsed?: boolean }> = ({
  items = [],
  isCollapsed = false,
  className
}) => {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <aside
        className={cn(
          "fixed left-0 top-16 bottom-0 bg-navbarBg border-r border-border shadow-lg transition-all duration-300 ease-in-out z-20 overflow-y-auto scrollbar-hide",
          isCollapsed ? "w-16" : "w-64",
          className
        )}
      >
        <div className={`py-8 space-y-1 ${isCollapsed ? "px-2" : "px-4"}`}>
          {items.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`
                flex items-center rounded-lg text-sm font-medium
                transition-all duration-200 group relative
                ${isCollapsed ? "justify-center p-3" : "gap-3 px-4 py-3"}
                ${isActive(item.href)
                  ? "bg-blue-50 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }
              `}
              title={isCollapsed ? item.label : ""}
            >
              <span
                className={`
                  flex-shrink-0
                  ${isActive(item.href)
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500"
                  }
                `}
              >
                {item.icon}
              </span>

              {!isCollapsed && (
                <span className="truncate">{item.label}</span>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                  {item.label}
                </div>
              )}
            </Link>
          ))}
        </div>
      </aside>
    </>
  );
};

export default SidebarComponent;
