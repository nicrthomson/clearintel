import { Prisma } from "@prisma/client"

export type ReportTemplateType = "pdf" | "html"

export interface ReportSection {
  id: string
  title: string
  content: string
  order: number
  isOptional: boolean
  variables: string[]
}

export interface ReportMetadata {
  styling: {
    css?: string
    fontFamily?: string
    fontSize?: number
    headerSize?: number
    subheaderSize?: number
    lineHeight?: number
    colors?: {
      primary: string
      secondary: string
      accent: string
    }
  }
}

export interface ReportTemplate {
  id: number
  name: string
  description: string | null
  type: ReportTemplateType
  category: string
  organizationId: number
  version: string
  metadata: ReportMetadata
  sections: ReportSection[]
  createdAt: Date
  updatedAt: Date
}

// Define Prisma include types using the schema relationships
export const caseInclude = Prisma.validator<Prisma.CaseInclude>()({
  user: true,
  evidence: {
    include: {
      type: true,
      chainOfCustody: {
        include: {
          user: true
        }
      }
    }
  },
  activities: {
    include: {
      user: true
    }
  },
  notes: {
    include: {
      user: true
    }
  },
  tasks: {
    include: {
      assignedTo: true
    }
  }
})

export type CaseWithRelations = Prisma.CaseGetPayload<{
  include: typeof caseInclude
}>

export interface ReportData {
  case: CaseWithRelations
  user: Prisma.UserGetPayload<{}>
  organization: Prisma.OrganizationGetPayload<{}>
  currentDate: string
} 