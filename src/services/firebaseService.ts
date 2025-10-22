import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  query, 
  orderBy,
  where
} from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { Complaint, UserRole } from '@/types/complaint';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  studentId?: string;
  createdAt: string;
}

// Authentication functions
export const registerUser = async (
  email: string, 
  password: string, 
  role: UserRole, 
  studentId?: string
): Promise<User> => {
  try {
    if (!auth || !db) {
      // Fallback to localStorage registration
      console.log('Firebase not available, using localStorage fallback for registration');
      return registerUserToLocalStorage(email, password, role, studentId);
    }

    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Create user document in Firestore
    const userData: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      role,
      studentId: studentId || null,
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), userData);
    
    return userData;
  } catch (error: any) {
    console.error('Firebase registration failed, trying localStorage fallback:', error);
    // Try localStorage fallback
    try {
      return registerUserToLocalStorage(email, password, role, studentId);
    } catch (fallbackError) {
      throw new Error(error.message || 'Failed to register user');
    }
  }
};

// localStorage fallback for registration
const registerUserToLocalStorage = (email: string, password: string, role: UserRole, studentId?: string): User => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  // Check if user already exists
  if (users.find((u: any) => u.email === email)) {
    throw new Error('User already exists');
  }
  
  const newUser = {
    id: Date.now().toString(),
    email,
    password, // In real app, hash this
    role,
    studentId: studentId || null,
    createdAt: new Date().toISOString(),
  };
  
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  
  return {
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
    studentId: newUser.studentId,
    createdAt: newUser.createdAt,
  };
};

export const loginUser = async (
  email: string, 
  password: string
): Promise<User> => {
  try {
    if (!auth || !db) {
      // Fallback to localStorage authentication
      console.log('Firebase not available, using localStorage fallback for login');
      return loginUserFromLocalStorage(email, password);
    }

    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (!userDoc.exists()) {
      throw new Error('User data not found');
    }

    return userDoc.data() as User;
  } catch (error: any) {
    console.error('Firebase login failed, trying localStorage fallback:', error);
    // Try localStorage fallback
    try {
      return loginUserFromLocalStorage(email, password);
    } catch (fallbackError) {
      throw new Error(error.message || 'Failed to login');
    }
  }
};

// localStorage fallback for login
const loginUserFromLocalStorage = (email: string, password: string): User => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const foundUser = users.find((u: any) => u.email === email);
  
  if (!foundUser) {
    throw new Error('User not found');
  }
  
  // Simple password check (in real app, use proper hashing)
  if (foundUser.password !== password) {
    throw new Error('Invalid password');
  }
  
  return {
    id: foundUser.id,
    email: foundUser.email,
    role: foundUser.role,
    studentId: foundUser.studentId,
    createdAt: foundUser.createdAt,
  };
};

export const logoutUser = async (): Promise<void> => {
  try {
    if (auth) {
      await signOut(auth);
    }
    // Clear localStorage user data
    localStorage.removeItem('current_user');
  } catch (error: any) {
    // Even if Firebase logout fails, clear localStorage
    localStorage.removeItem('current_user');
    throw new Error(error.message || 'Failed to logout');
  }
};

export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      unsubscribe();
      
      if (!firebaseUser) {
        resolve(null);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          resolve(userDoc.data() as User);
        } else {
          resolve(null);
        }
      } catch (error) {
        console.error('Error getting user data:', error);
        resolve(null);
      }
    });
  });
};

// Complaint functions
export const saveComplaintToFirestore = async (complaint: Complaint): Promise<string> => {
  try {
    // Check if Firebase is properly configured
    if (!db) {
      throw new Error('Firebase not configured. Please set up your Firebase project.');
    }
    
    console.log('Saving complaint to Firestore:', complaint);
    const docRef = await addDoc(collection(db, 'complaints'), {
      ...complaint,
      createdAt: new Date().toISOString(),
    });
    
    console.log('Document created with ID:', docRef.id);
    console.log('Document data includes client ID:', complaint.id);
    
    // Return the actual document ID from Firestore
    return docRef.id;
  } catch (error: any) {
    console.error('Firebase save error:', error);
    
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Please check your Firestore security rules.');
    } else if (error.code === 'unauthenticated') {
      throw new Error('User not authenticated. Please log in again.');
    } else {
      throw new Error(error.message || 'Failed to save complaint to Firebase');
    }
  }
};

export const getComplaintsFromFirestore = async (): Promise<Complaint[]> => {
  try {
    const complaintsRef = collection(db, 'complaints');
    const q = query(complaintsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const complaints: Complaint[] = [];
    querySnapshot.forEach((doc) => {
      const docData = doc.data();
      const complaintData = {
        id: doc.id, // Use Firestore document ID
        name: docData.name,
        department: docData.department,
        title: docData.title,
        description: docData.description,
        status: docData.status,
        createdAt: docData.createdAt,
        userId: docData.userId,
        updatedAt: docData.updatedAt
      } as Complaint;
      
      console.log('Fetched complaint with ID:', doc.id, 'Title:', complaintData.title);
      console.log('Document data:', docData);
      complaints.push(complaintData);
    });
    
    console.log('Total complaints fetched:', complaints.length);
    return complaints;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch complaints');
  }
};

export const updateComplaintStatusInFirestore = async (
  id: string, 
  status: 'pending' | 'resolved'
): Promise<void> => {
  try {
    if (!db) {
      throw new Error('Firebase not configured');
    }

    console.log('Attempting to update complaint with ID:', id);
    const complaintRef = doc(db, 'complaints', id);
    
    // First check if the document exists
    const docSnap = await getDoc(complaintRef);
    if (!docSnap.exists()) {
      console.error('Document not found with ID:', id);
      throw new Error(`Complaint with ID ${id} not found in Firebase. Please refresh the page and try again.`);
    }
    
    console.log('Document found, updating status to:', status);
    await updateDoc(complaintRef, {
      status,
      updatedAt: new Date().toISOString(),
    });
    console.log('Complaint status updated successfully');
  } catch (error: any) {
    console.error('Firebase update error:', error);
    
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Please check your Firestore security rules.');
    } else if (error.code === 'not-found') {
      throw new Error('Complaint not found in Firebase. It may be stored locally.');
    } else if (error.message.includes('not found')) {
      throw new Error(`Complaint with ID ${id} not found. Please refresh the page and try again.`);
    } else {
      throw new Error(error.message || 'Failed to update complaint status in Firebase');
    }
  }
};

export const getComplaintsByUser = async (userId: string): Promise<Complaint[]> => {
  try {
    const complaintsRef = collection(db, 'complaints');
    const q = query(
      complaintsRef, 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const complaints: Complaint[] = [];
    querySnapshot.forEach((doc) => {
      complaints.push({
        id: doc.id,
        ...doc.data()
      } as Complaint);
    });
    
    return complaints;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch user complaints');
  }
};
