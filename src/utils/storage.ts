import { Complaint } from '@/types/complaint';
import { 
  getComplaintsFromFirestore, 
  saveComplaintToFirestore, 
  updateComplaintStatusInFirestore 
} from '@/services/firebaseService';

// Firebase-based storage functions
export const getComplaints = async (): Promise<Complaint[]> => {
  try {
    console.log('Attempting to fetch complaints from Firebase...');
    const complaints = await getComplaintsFromFirestore();
    console.log('Successfully fetched complaints from Firebase:', complaints.length);
    return complaints;
  } catch (error) {
    console.error('Error fetching complaints from Firebase:', error);
    
    // Fallback to localStorage if Firebase fails
    try {
      console.log('Falling back to localStorage...');
      const STORAGE_KEY = 'college_complaints';
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const localComplaints = JSON.parse(data);
        console.log('Fetched complaints from localStorage:', localComplaints.length);
        return localComplaints;
      }
    } catch (fallbackError) {
      console.error('Fallback fetch also failed:', fallbackError);
    }
    
    // Final fallback to dummy data
    console.log('Using dummy data as final fallback');
    return getDummyData();
  }
};

export const saveComplaint = async (complaint: Complaint): Promise<void> => {
  try {
    console.log('Saving complaint with client ID:', complaint.id);
    const firestoreId = await saveComplaintToFirestore(complaint);
    console.log('Complaint saved to Firebase with ID:', firestoreId);
    console.log('Original complaint ID:', complaint.id, 'Firestore ID:', firestoreId);
  } catch (error) {
    console.error('Error saving complaint to Firebase:', error);
    
    // Fallback to localStorage if Firebase fails
    try {
      const STORAGE_KEY = 'college_complaints';
      const complaints = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      complaints.push(complaint);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
      console.log('Complaint saved to localStorage as fallback');
    } catch (fallbackError) {
      console.error('Fallback save also failed:', fallbackError);
      throw new Error('Failed to save complaint. Please check your Firebase configuration or try again.');
    }
  }
};

export const updateComplaintStatus = async (id: string, status: 'pending' | 'resolved'): Promise<void> => {
  try {
    console.log('Attempting to update complaint status in Firebase for ID:', id);
    await updateComplaintStatusInFirestore(id, status);
    console.log('Complaint status updated in Firebase');
  } catch (error) {
    console.error('Error updating complaint status in Firebase:', error);
    
    // Fallback to localStorage update
    try {
      console.log('Falling back to localStorage update for ID:', id);
      const STORAGE_KEY = 'college_complaints';
      const complaints = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      
      console.log('LocalStorage complaints:', complaints.map((c: Complaint) => ({ id: c.id, title: c.title })));
      
      // Find the complaint by ID
      const complaintIndex = complaints.findIndex((c: Complaint) => c.id === id);
      
      if (complaintIndex === -1) {
        console.error('Complaint not found in localStorage with ID:', id);
        throw new Error('Complaint not found');
      }
      
      // Update the complaint
      complaints[complaintIndex] = {
        ...complaints[complaintIndex],
        status,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
      console.log('Complaint status updated in localStorage as fallback');
    } catch (fallbackError) {
      console.error('Fallback update also failed:', fallbackError);
      throw new Error('Failed to update complaint status. Please try again.');
    }
  }
};

// Legacy functions for backward compatibility (now handled by Firebase Auth)
export const getUserRole = (): 'student' | 'admin' => {
  const role = localStorage.getItem('user_role');
  return (role as 'student' | 'admin') || 'student';
};

export const setUserRole = (role: 'student' | 'admin'): void => {
  localStorage.setItem('user_role', role);
};

// Dummy Data for fallback when Firebase is not available
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
  localStorage.setItem('college_complaints', JSON.stringify(dummyComplaints));
  return dummyComplaints;
};
