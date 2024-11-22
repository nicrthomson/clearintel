import type { CaseWithRelations } from "../db/types";

export interface ReportSection {
  id: string;
  title: string;
  content: string;
  order: number;
  variables: ReportVariable[];
  isOptional: boolean;
  conditions?: ReportCondition[];
}

export interface ReportCondition {
  field: string;
  operator: 'equals' | 'contains' | 'exists' | 'notExists';
  value?: any;
}

export interface ReportTemplate {
  id: number;
  name: string;
  description: string | null;
  sections: ReportSection[];
  type: 'word' | 'pdf';
  category: 'evidence' | 'case' | 'analysis' | 'summary';
  organizationId: number;
  version: string;
  metadata: ReportMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportMetadata {
  headerTemplate?: string;
  footerTemplate?: string;
  styling?: {
    fontFamily?: string;
    fontSize?: number;
    lineSpacing?: number;
    margins?: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
  };
  pageNumbers?: boolean;
  watermark?: string;
}

export interface ReportVariable {
  key: string;
  description: string;
  type: 'text' | 'date' | 'number' | 'evidence' | 'list' | 'table' | 'image';
  required: boolean;
  defaultValue?: any;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    allowedValues?: any[];
  };
}

export interface ReportContext {
  case: CaseWithRelations;
  variables: Record<string, any>;
  template: ReportTemplate;
} 