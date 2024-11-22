"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";
import {
  LayoutDashboard,
  FolderOpen,
  Search,
  Settings,
  ChevronRight,
  Building2,
  Microscope,
  Users2,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Cases", href: "/cases", icon: FolderOpen },
  { name: "Evidence", href: "/evidence", icon: Search },
  { name: "Contacts", href: "/contacts", icon: Users2 },
  { name: "Lab", href: "/lab", icon: Microscope },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function MainSidebar() {
  const { collapsed, setCollapsed } = useSidebar();
  const pathname = usePathname();

  return (
    <div 
      className={cn(
        "group fixed left-0 top-0 h-full border-r bg-background/60 backdrop-blur-xl transition-all duration-300 z-30",
        collapsed ? "w-20" : "w-56"
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center border-b px-4">
        <div className={cn(
          "flex w-full items-center gap-2 overflow-hidden transition-all duration-300",
          collapsed && "opacity-0"
        )}>
          <span className="text-lg font-semibold">Clear Intel</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1.5 p-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={cn(
                "flex h-11 items-center gap-3 rounded-md px-3 text-base font-medium transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary hover:bg-primary/20" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className={cn(
                "overflow-hidden transition-all duration-300",
                collapsed && "w-0 opacity-0"
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 border-t p-3">
        <Link href="/organization">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start rounded-md px-3 text-base font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
              "h-11",
              pathname === "/organization" && "bg-primary/10 text-primary hover:bg-primary/20"
            )}
          >
            <Building2 className="h-5 w-5" />
            <span className={cn(
              "ml-3 overflow-hidden transition-all duration-300",
              collapsed && "w-0 opacity-0"
            )}>
              Organization
            </span>
          </Button>
        </Link>
      </div>

      {/* Collapse Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full border bg-background shadow-md"
        onClick={() => setCollapsed(!collapsed)}
      >
        <ChevronRight className={cn(
          "h-4 w-4 transition-transform duration-200",
          collapsed && "rotate-180"
        )} />
      </Button>
    </div>
  );
}
