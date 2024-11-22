export type ReportFormat = 'pdf' | 'html';

export interface ReportGenerationOptions {
  templateId: number;
  format: ReportFormat;
  includeOptionalSections?: boolean;
} 