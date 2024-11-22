export type ReportSection = {
  id: string;
  title: string;
  content: string;
  order: number;
  variables: ReportVariable[];
  isOptional: boolean;
  conditions?: {
    field: string;
    operator: 'equals' | 'contains' | 'exists' | 'notExists';
    value?: any;
  }[];
}

export interface ReportTemplate {
  id: number;
  name: string;
  description: string | null;
  sections: ReportSection[];
  type: 'word' | 'pdf';
  category: 'evidence' | 'case' | 'analysis' | 'summary';
  organizationId: number;
  metadata: {
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
  };
  createdAt: Date;
  updatedAt: Date;
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

export interface GeneratedReport {
  id: number;
  name: string;
  caseId: number;
  templateId: number;
  filePath: string;
  fileType: 'docx' | 'pdf';
  generatedBy: number;
  createdAt: Date;
} 