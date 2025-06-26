export interface User {
  id: number;
  email: string;
  fullName: string;
  role: 'superadmin' | 'ekp' | 'pkp' | 'eoad' | 'asnaf';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
} 