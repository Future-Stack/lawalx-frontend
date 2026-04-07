"use client";

import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MenuOption {
  label: string;
  value: string;
  icon?: ReactNode;
  danger?: boolean;
  onClick?: () => void;
}

interface MenuDropdownProps {
  options: MenuOption[];
  triggerIcon?: ReactNode;
  align?: "start" | "center" | "end";
  className?: string;
}

const MenuDropdown = ({
  options,
  triggerIcon,
  align = "end",
  className,
}: MenuDropdownProps) => {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "text-headings hover:bg-gray-100 transition-colors p-1 cursor-pointer",
            className
          )}
        >
          {triggerIcon}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={align}
        className="w-full bg-white border border-border bg-navbarBg shadow-md rounded-lg py-1"
      >
        {options.map((opt, idx) => (
          <DropdownMenuItem
            key={idx}
            onClick={() => {
              opt.onClick?.();
              setOpen(false);
            }}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors",
              opt.danger
                ? "text-red-600 focus:bg-red-600 focus:text-white focus:[&_svg]:text-white"
                : "text-headings focus:bg-bgBlue focus:text-white focus:[&_svg]:text-white"
            )}
          >
            {opt.icon && <span className="flex items-center justify-center">{opt.icon}</span>}
            <span className="font-medium">{opt.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MenuDropdown;
