import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { MainSidebar } from "@/components/Layout/MainSidebar"
import { MainContent } from "@/components/Layout/MainContent"
import { SidebarProvider } from "@/components/Layout/sidebar-context"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Case Management Tool",
  description: "Digital forensics case management system",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={GeistSans.className}>
      <body className="antialiased min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SidebarProvider>
              <div className="flex h-screen">
                <MainSidebar />
                <MainContent>
                  {children}
                </MainContent>
              </div>
              <Toaster />
              <div id="portal-root" />
            </SidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
