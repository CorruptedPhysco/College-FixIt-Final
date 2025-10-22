import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserRole } from '@/types/complaint';
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  getCurrentUser,
  User 
} from '@/services/firebaseService';
import { auth } from '@/config/firebase';

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: UserRole, studentId?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check Firebase auth state
    const checkAuthState = async () => {
      try {
        // Check if Firebase is available
        if (!auth) {
          console.warn('Firebase Auth not available, using localStorage fallback');
          const savedUser = localStorage.getItem('current_user');
          if (savedUser) {
            const userData = JSON.parse(savedUser);
            setUser(userData);
            setUserRole(userData.role);
          }
          setLoading(false);
          return;
        }

        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setUserRole(currentUser.role);
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
        // Fallback to localStorage
        const savedUser = localStorage.getItem('current_user');
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            setUser(userData);
            setUserRole(userData.role);
          } catch (parseError) {
            console.error('Error parsing saved user:', parseError);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuthState();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userData = await loginUser(email, password);
      setUser(userData);
      setUserRole(userData.role);
      // Save to localStorage for persistence
      localStorage.setItem('current_user', JSON.stringify(userData));
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, role: UserRole, studentId?: string) => {
    try {
      const userData = await registerUser(email, password, role, studentId);
      setUser(userData);
      setUserRole(userData.role);
      // Save to localStorage for persistence
      localStorage.setItem('current_user', JSON.stringify(userData));
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setUserRole(null);
      // Clear localStorage
      localStorage.removeItem('current_user');
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    userRole,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
