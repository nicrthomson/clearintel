export interface AuditLog {
  id: number;
  action: string;
  resourceType: string;
  resourceId: string;
  details: any;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string | null;
    email: string;
  };
} 