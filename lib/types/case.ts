export interface CaseLead {
  full_name: string
  title: string
  email: string
}

export interface Client {
  full_name: string
  organization: string
  email: string
  address: string
  city: string
  state: string
  zipcode: string
}

export interface EvidenceType {
  id: number;
  name: string;
  description: string | null;
  organization_id: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Report {
  summary: string
  analysis: string
}

export interface User {
  id: number;
  name: string | null;
  email: string;
  password: string;
  role: Role;
  organization_id: number | null;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Evidence {
  id: number;
  name: string;
  description: string | null;
  evidenceNumber: string;
  type_id: number;
  case_id: number;
  location: string | null;
  status: string;
  size: bigint | null;
  filePath: string | null;
  mimeType: string | null;
  md5Hash?: string | null;
  sha256Hash?: string | null;
  createdAt: Date;
  updatedAt: Date;
  type: EvidenceType;
}

export interface CaseData {
  id: number;
  name: string;
  description: string | null;
  clientName: string | null;
  clientOrganization: string | null;
  clientEmail: string | null;
  clientAddress: string | null;
  clientCity: string | null;
  clientState: string | null;
  clientZipcode: string | null;
  summary: string | null;
  analysis: string | null;
  status: string;
  caseDate: Date;
  caseType: string | null;
  casePriority: string | null;
  caseNotes: string | null;
  chainOfCustody: string | null;
  caseAssignee: string | null;
  caseExaminer: string | null;
  caseInvestigator: string | null;
  caseLead: string | null;
  stage: string;
  evidenceCount: number;
  storageTotal: number;
  activeTasks: number;
  user_id: number;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    name: string | null;
    email: string;
    // Add other user fields if necessary
  };
  organization: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
    city?: string;
    state?: string;
    zipcode?: string;
    // Add other organization fields if necessary
  } | null;
  evidence: Evidence[];
}

export enum Role {
  ADMIN,
  USER,
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
} 