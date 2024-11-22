export interface QAChecklistItem {
  id: number;
  name: string;
  description: string | null;
  category: string;
  required: boolean;
  order: number;
  organization_id: number;
  template_id?: number | null;
  createdAt: Date;
  updatedAt: Date;
} 