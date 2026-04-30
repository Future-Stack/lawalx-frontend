import { ReactNode } from "react";

export default function Wrapper({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-[1800px] 2xl:max-w-[2100px] mx-auto px-4 md:px-8 py-3 md:py-6 xl:py-10">
      {children}
    </div>
  );
}
