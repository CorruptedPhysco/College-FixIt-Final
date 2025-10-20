export interface Complaint {
  id: string;
  name: string;
  department: string;
  title: string;
  description: string;
  status: 'pending' | 'resolved';
  createdAt: string;
}

export type UserRole = 'student' | 'admin';
