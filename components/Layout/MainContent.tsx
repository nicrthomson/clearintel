"use client";

import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";

export function MainContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  
  return (
    <main className={cn(
      "flex-1 transition-all duration-300",
      collapsed ? "ml-20" : "ml-56"
    )}>
      <div className="flex justify-end p-4">
        <ThemeToggle />
      </div>
      <div className="px-6 w-full">
        {children}
      </div>
    </main>
  );
}
