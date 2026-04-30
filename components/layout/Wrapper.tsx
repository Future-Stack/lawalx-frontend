import { ReactNode } from "react";

export default function Wrapper({ children, fullWidth = false }: { children: ReactNode; fullWidth?: boolean }) {
  return (
    <div className={`${fullWidth ? 'w-full' : 'max-w-[1800px] 2xl:max-w-[2100px]'} mx-auto px-6 md:px-12 lg:px-20 py-3 md:py-6 xl:py-10`}>
      {children}
    </div>
  );
}
