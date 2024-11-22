import * as React from "react"
import { cn } from "@/lib/utils"

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-full flex-col gap-2",
      className
    )}
    {...props}
  />
))
Sidebar.displayName = "Sidebar"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-[60px] items-center border-b px-6",
      className
    )}
    {...props}
  />
))
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex-1 overflow-auto",
      className
    )}
    {...props}
  />
))
SidebarContent.displayName = "SidebarContent"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "mt-auto flex items-center border-t p-6",
      className
    )}
    {...props}
  />
))
SidebarFooter.displayName = "SidebarFooter"

const SidebarToggle = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "absolute right-[-12px] top-4 z-10 rounded-full border bg-background p-1.5 hover:bg-accent",
      className
    )}
    {...props}
  />
))
SidebarToggle.displayName = "SidebarToggle"

const SidebarCollapsed = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    collapsed?: boolean
  }
>(({ collapsed, className, ...props }, ref) => (
  <div
    ref={ref}
    data-collapsed={collapsed}
    className={cn(
      "group relative flex flex-col gap-4 px-2 py-4 data-[collapsed=true]:py-2",
      className
    )}
    {...props}
  />
))
SidebarCollapsed.displayName = "SidebarCollapsed"

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarToggle,
  SidebarCollapsed,
}
