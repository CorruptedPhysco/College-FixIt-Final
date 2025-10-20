import { Complaint } from '@/types/complaint';

const STORAGE_KEY = 'college_complaints';
const ROLE_KEY = 'user_role';

{/* getting the complaints from Dummy Data that i have given and the data from local storage */}
export const getComplaints = (): Complaint[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : getDummyData();
};

export const saveComplaint = (complaint: Complaint): void => {
  const complaints = getComplaints();
  complaints.push(complaint);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
};

{/* Update the status This Shii was hard af */}
export const updateComplaintStatus = (id: string, status: 'pending' | 'resolved'): void => {
  const complaints = getComplaints();
  const updated = complaints.map(c => c.id === id ? { ...c, status } : c);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const getUserRole = (): 'student' | 'admin' => {
  const role = localStorage.getItem(ROLE_KEY);
  return (role as 'student' | 'admin') || 'student';
};

export const setUserRole = (role: 'student' | 'admin'): void => {
  localStorage.setItem(ROLE_KEY, role);
};

{/* Dummy Data FOR now data from ChatGPT HEHEHEHEHEEH */}
const getDummyData = (): Complaint[] => {
  const dummyComplaints: Complaint[] = [
    {
      id: '1',
      name: 'Rahul Sharma',
      department: 'Computer Science',
      title: 'Library AC not working',
      description: 'The air conditioning in the library has not been working for the past week. It is very difficult to study in such hot conditions.',
      status: 'pending',
      createdAt: new Date(2024, 9, 15).toISOString(),
    },
    {
      id: '2',
      name: 'Priya Patel',
      department: 'Electrical Engineering',
      title: 'Lab equipment damaged',
      description: 'Several oscilloscopes in Lab 204 are not functioning properly. This is affecting our practical sessions.',
      status: 'resolved',
      createdAt: new Date(2024, 9, 12).toISOString(),
    },
    {
      id: '3',
      name: 'Amit Kumar',
      department: 'Mechanical Engineering',
      title: 'Hostel water supply issue',
      description: 'There is no hot water supply in Block B hostel since last Monday. Please address this urgently.',
      status: 'pending',
      createdAt: new Date(2024, 9, 18).toISOString(),
    },
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dummyComplaints));
  return dummyComplaints;
};
