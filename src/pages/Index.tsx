import { useState, useEffect } from 'react';
import { ComplaintForm } from '@/components/ComplaintForm';
import { ComplaintsList } from '@/components/ComplaintsList';
import { LoginForm } from '@/components/LoginForm';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { GraduationCap, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { user, userRole, logout, loading } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleComplaintSubmit = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!user || !userRole) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header with user info and logout */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-full">
                <GraduationCap className="w-10 h-10 text-primary" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  College FixIt
                </h1>
                <p className="text-sm text-muted-foreground">
                  {userRole === 'student' ? 'Student Portal' : 'Admin Portal'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>{user.email}</span>
                <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                  {userRole}
                </span>
              </div>
              <ThemeToggle />
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>


        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Complaint Form for students */}
          {userRole === 'student' && (
            <div>
              <ComplaintForm onSubmitSuccess={handleComplaintSubmit} />
            </div>
          )}

          {/* Complaints List */}
          <div className={userRole === 'admin' ? 'lg:col-span-2' : ''}>
            <ComplaintsList userRole={userRole} refreshTrigger={refreshTrigger} />
          </div>
        </div>

        {/* Footer Info */}
        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>Made by deepu for FOSSHACK V1.0</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
