import { Metadata } from "next"

export const metadata: Metadata = {
  title: "QA Templates",
  description: "Manage your quality assurance templates and checklist items.",
}

interface QAChecklistLayoutProps {
  children: React.ReactNode
}

export default function QAChecklistLayout({ children }: QAChecklistLayoutProps) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {children}
    </div>
  )
}
