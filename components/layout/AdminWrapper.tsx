import { ReactNode } from "react";

export default function AdminWrapper({ children, fullWidth = false }: { children: ReactNode; fullWidth?: boolean }) {
  return (
    <div className={`${fullWidth ? 'w-full' : 'max-w-[1800px] 2xl:max-w-[2100px]'} mx-auto px-4 md:px-6 py-3 md:py-6 xl:py-8`}>
      {children}
    </div>
  );
}
