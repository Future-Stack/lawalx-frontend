import { ReactNode } from "react";

export default function AdminWrapper({ children, fullWidth = false }: { children: ReactNode; fullWidth?: boolean }) {
  return (
    <div className={`${fullWidth ? 'w-full' : 'max-w-[1800px] 2xl:max-w-[2100px]'} mx-auto px-4 py-4 md:px-8 md:py-8`}>
      {children}
    </div>
  );
}
