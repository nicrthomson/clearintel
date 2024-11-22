import { PrismaClient } from '@prisma/client';

export type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
>;

// Define include objects for relations
export const caseIncludes = {
  include: {
    user: true,
    notes: {
      include: {
        user: true,
      },
    },
    evidence: {
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
    },
    tasks: {
      include: {
        template: true,
        assignedTo: true,
      },
    },
    forensicImages: {
      include: {
        user: true,
      },
    },
  },
} as const;

export const noteIncludes = {
  include: {
    user: true,
    case: true,
  },
} as const;

export const userIncludes = {
  include: {
    organization: true,
    cases: true,
    notes: true,
    assignedTasks: true,
    forensicImages: true,
  },
} as const;

export const organizationIncludes = {
  include: {
    users: true,
    evidenceTypes: true,
    customFields: true,
    taskTemplates: true,
  },
} as const;

// Export types for components
export type Case = NonNullable<Awaited<ReturnType<PrismaClient['case']['findUnique']>>>;
export type Note = NonNullable<Awaited<ReturnType<PrismaClient['note']['findUnique']>>>;
export type User = NonNullable<Awaited<ReturnType<PrismaClient['user']['findUnique']>>>;
export type Organization = NonNullable<Awaited<ReturnType<PrismaClient['organization']['findUnique']>>>;
export type Activity = NonNullable<Awaited<ReturnType<PrismaClient['activity']['findUnique']>>>;
export type Evidence = NonNullable<Awaited<ReturnType<PrismaClient['evidence']['findUnique']>>>;
export type EvidenceType = NonNullable<Awaited<ReturnType<PrismaClient['evidenceType']['findUnique']>>>;
export type CustomField = NonNullable<Awaited<ReturnType<PrismaClient['customField']['findUnique']>>>;
export type ChainOfCustody = NonNullable<Awaited<ReturnType<PrismaClient['chainOfCustody']['findUnique']>>>;
export type Equipment = NonNullable<Awaited<ReturnType<PrismaClient['equipment']['findUnique']>>>;
export type QAChecklistItem = NonNullable<Awaited<ReturnType<PrismaClient['qAChecklistItem']['findUnique']>>>;
export type QAChecklistResponse = NonNullable<Awaited<ReturnType<PrismaClient['qAChecklistResponse']['findUnique']>>>;
export type TaskTemplate = NonNullable<Awaited<ReturnType<PrismaClient['taskTemplate']['findUnique']>>>;
export type Task = NonNullable<Awaited<ReturnType<PrismaClient['task']['findUnique']>>>;
export type ForensicImage = NonNullable<Awaited<ReturnType<PrismaClient['forensicImage']['findUnique']>>>;

// Chain of Custody Record interface for components
export interface ChainOfCustodyRecord {
  id: number
  action: string
  reason?: string | undefined
  location?: string | undefined
  signature?: string | undefined
  user: {
    name?: string | null
    email: string
  }
  createdAt: string
}

// Export types with relations
export type CaseWithRelations = Case & {
  user: User;
  notes: Array<Note & { user: User }>;
  evidence: Array<Evidence & {
    type: EvidenceType;
    customFields: Array<{
      field: CustomField;
      value: string;
    }>;
    chainOfCustody: Array<ChainOfCustody & {
      user: {
        id: number;
        name: string | null;
        email: string;
      };
    }>;
  }>;
  tasks: Array<Task & {
    template: TaskTemplate | null;
    assignedTo: User | null;
  }>;
  forensicImages?: Array<ForensicImage & {
    user: User;
  }>;
  caseCategory?: string | null;
};

export type NoteWithRelations = Note & {
  user: User;
  case: Case;
};

export type UserWithRelations = User & {
  organization: Organization | null;
  cases: Case[];
  notes: Note[];
  assignedTasks: Task[];
  forensicImages: ForensicImage[];
};

export type OrganizationWithRelations = Organization & {
  users: User[];
  evidenceTypes: EvidenceType[];
  customFields: CustomField[];
  taskTemplates: TaskTemplate[];
};

export type TaskTemplateWithRelations = TaskTemplate & {
  organization: Organization;
  tasks: Task[];
};

export type TaskWithRelations = Task & {
  assignedTo: User | null;
  case: Case;
  template: TaskTemplate | null;
};

export type EquipmentWithRelations = Equipment & {
  organization: Organization;
};

export type ForensicImageWithRelations = ForensicImage & {
  user: User;
  case: Case;
};
