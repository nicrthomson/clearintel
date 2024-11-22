export interface ChecklistItem {
  id: number;
  text: string;
  completed: boolean;
}

export interface Task {
  id: number;
  name: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate?: string | null;
  estimatedHours?: number | null;
  actualHours?: number | null;
  assignedTo?: {
    id?: number | null;
    name?: string | null;
    email?: string | null;
  } | null;
  checklist?: ChecklistItem[];
}

export interface TaskTemplate {
  id: number;
  name: string;
  description?: string | null;
  category: string;
  estimatedHours?: number | null;
  checklist?: ChecklistItem[] | string | null;
  organization_id: number;
  createdAt: Date;
  updatedAt: Date;
}
