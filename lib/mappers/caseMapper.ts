import { Case, User, Organization, Evidence, EvidenceType } from '@prisma/client'
import { CaseData } from '../types/case'

export function mapCaseToReportData(
  prismaCase: Case & { 
    user: User,
    organization: Organization | null,
    evidence: (Evidence & { type: EvidenceType })[]
  }
): CaseData {
  return {
    id: prismaCase.id,
    name: prismaCase.name,
    description: prismaCase.description || '',
    clientName: prismaCase.clientName || '',
    clientOrganization: prismaCase.clientOrganization || '',
    clientEmail: prismaCase.clientEmail || '',
    clientAddress: prismaCase.clientAddress || '',
    clientCity: prismaCase.clientCity || '',
    clientState: prismaCase.clientState || '',
    clientZipcode: prismaCase.clientZipcode || '',
    summary: prismaCase.summary || '',
    analysis: prismaCase.analysis || '',
    status: prismaCase.status,
    caseDate: prismaCase.caseDate || new Date(),
    caseType: prismaCase.caseType || '',
    casePriority: prismaCase.casePriority || '',
    caseNotes: prismaCase.caseNotes || '',
    chainOfCustody: prismaCase.chainOfCustody || '',
    caseAssignee: prismaCase.caseAssignee || '',
    caseExaminer: prismaCase.caseExaminer || '',
    caseInvestigator: prismaCase.caseInvestigator || '',
    caseLead: prismaCase.caseLead || '',
    stage: prismaCase.stage,
    evidenceCount: prismaCase.evidenceCount,
    storageTotal: Number(prismaCase.storageTotal),
    activeTasks: prismaCase.activeTasks,
    user_id: prismaCase.user_id,
    createdAt: prismaCase.createdAt,
    updatedAt: prismaCase.updatedAt,
    user: {
      id: prismaCase.user.id,
      name: prismaCase.user.name || '',
      email: prismaCase.user.email || '',
      // Add other user fields if necessary
    },
    organization: prismaCase.organization ? {
      id: prismaCase.organization.id,
      name: prismaCase.organization.name,
      email: prismaCase.organization.email || '',
      phone: prismaCase.organization.phone || '',
      website: prismaCase.organization.website || '',
      address: prismaCase.organization.address || '',
      city: prismaCase.organization.city || '',
      state: prismaCase.organization.state || '',
      zipcode: prismaCase.organization.zipcode || '',
      // Add other organization fields if necessary
    } : null,
    evidence: prismaCase.evidence || []
  }
}
