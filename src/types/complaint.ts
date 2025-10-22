export interface Complaint {
  id: string;
  name: string;
  department: string;
  title: string;
  description: string;
  status: 'pending' | 'resolved';
  createdAt: string;
  userId?: string;
  updatedAt?: string;
}

export type UserRole = 'student' | 'admin';
