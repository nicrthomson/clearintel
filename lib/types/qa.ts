export interface QAChecklistItem {
  id: number
  name: string
  description?: string | null
  category: string
  required: boolean
  order: number
  organization_id: number
  template_id?: number | null
  value?: string | null
  notes?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface QATemplate {
  id: number
  name: string
  type: "ORGANIZATION" | "USER"
  organization_id: number
  user_id?: number | null
  checklistItems: QAChecklistItem[]
  createdAt: Date
  updatedAt: Date
}

export interface QAChecklistResponse {
  id: number
  checklist_item_id: number
  case_id: number
  completed: boolean
  notes?: string | null
  completed_by: number
  completedAt: Date
  value: string
  createdAt: Date
  updatedAt: Date
  checklistItem: QAChecklistItem
  completedBy: {
    name?: string | null
  }
}
