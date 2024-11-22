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
import { ErrorBoundary } from "@/components/ErrorBoundary"

export const metadata: Metadata = {
  title: "Clear Intel | Digital Forensics Case Management",
  description: "Professional digital forensics case management platform for streamlined investigations, evidence handling, and quality assurance.",
  keywords: "digital forensics, case management, evidence handling, chain of custody, quality assurance, forensic investigation",
  authors: [{ name: "Clear Intel" }],
  creator: "Clear Intel",
  publisher: "Clear Intel",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
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
              <ErrorBoundary>
                <div className="flex h-screen">
                  <MainSidebar />
                  <MainContent>
                    {children}
                  </MainContent>
                </div>
              </ErrorBoundary>
              <Toaster />
              <div id="portal-root" />
            </SidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
