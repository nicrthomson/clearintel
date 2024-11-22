export * from './auth';
export * from './organizations';
export * from './types';

import { prisma } from '@/lib/prisma';
import { caseIncludes } from './types';

export async function getCasesByUserId(userId: number) {
  return prisma.case.findMany({
    where: { user_id: userId },
    ...caseIncludes,
    orderBy: { createdAt: 'desc' },
  });
}

export async function addCase(data: {
  name: string;
  description?: string | null;
  status?: string;
  caseDate?: Date | null;
  caseType?: string | null;
  casePriority?: string | null;
  caseNotes?: string | null;
  chainOfCustody?: string | null;
  caseAssignee?: string | null;
  caseExaminer?: string | null;
  caseInvestigator?: string | null;
  organizationId?: number | null;
  userId: number;
  stage?: string;
  evidenceCount?: number;
  storageTotal?: number;
  activeTasks?: number;
}) {
  const { userId, ...rest } = data;
  
  return prisma.case.create({
    data: {
      ...rest,
      user_id: userId
    },
    ...caseIncludes,
  });
}

export async function updateCase(id: number, data: Partial<Parameters<typeof addCase>[0]>) {
  const { userId, ...rest } = data;
  
  return prisma.case.update({
    where: { id },
    data: {
      ...rest,
      ...(userId && { user_id: userId })
    },
    ...caseIncludes,
  });
}

export async function deleteCase(id: number) {
  return prisma.case.delete({
    where: { id }
  });
}

export async function addNote(data: any) {
  return prisma.note.create({
    data: {
      title: data.title,
      content: data.content,
      user_id: data.user_id,
      case_id: data.case_id
    },
    include: {
      user: true,
      case: true
    }
  })
}

export async function getNotesByCaseId(caseId: number) {
  return prisma.note.findMany({
    where: { case_id: caseId },
    include: {
      user: true,
      case: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateNote(id: number, data: Partial<Parameters<typeof addNote>[0]>) {
  const { caseId, userId, ...rest } = data;
  
  return prisma.note.update({
    where: { id },
    data: {
      ...rest,
      ...(caseId && { case_id: caseId }),
      ...(userId && { user_id: userId })
    },
    include: {
      user: true,
      case: true,
    },
  });
}

export async function deleteNote(id: number) {
  return prisma.note.delete({
    where: { id }
  });
}

// Evidence related functions
export async function getEvidenceTypes(organizationId: number) {
  return prisma.evidenceType.findMany({
    where: { organization_id: organizationId },
    orderBy: { name: 'asc' },
  });
}

export async function getCustomFields(organizationId: number) {
  return prisma.customField.findMany({
    where: { organization_id: organizationId },
    orderBy: { name: 'asc' },
  });
}

export async function getEvidenceByCaseId(caseId: number) {
  return prisma.evidence.findMany({
    where: { case_id: caseId },
    include: {
      type: true,
      customFields: {
        include: {
          field: true,
        },
      },
      chainOfCustody: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getEvidenceById(id: number) {
  return prisma.evidence.findUnique({
    where: { id },
    include: {
      type: true,
      customFields: {
        include: {
          field: true,
        },
      },
      chainOfCustody: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });
}
