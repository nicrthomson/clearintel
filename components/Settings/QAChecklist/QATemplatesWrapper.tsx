"use client"

import { QATemplate } from "@/lib/types/qa"
import { QATemplatesTable } from "./QATemplatesTable"
import { useRouter } from "next/navigation"

interface QATemplatesWrapperProps {
  templates: QATemplate[]
}

export function QATemplatesWrapper({ templates }: QATemplatesWrapperProps) {
  const router = useRouter()

  console.log('QATemplatesWrapper received templates:', templates)

  const handleTemplateDeleted = () => {
    router.refresh()
  }

  return (
    <div className="relative">
      <QATemplatesTable 
        templates={templates}
        onTemplateDeleted={handleTemplateDeleted}
      />
    </div>
  )
}
