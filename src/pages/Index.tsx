import { useState, useEffect } from 'react';
import { ComplaintForm } from '@/components/ComplaintForm';
import { ComplaintsList } from '@/components/ComplaintsList';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { getUserRole, setUserRole } from '@/utils/storage';
import { UserRole } from '@/types/complaint';
import { GraduationCap } from 'lucide-react';

const Index = () => {
  const [userRole, setUserRoleState] = useState<UserRole>('student');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const savedRole = getUserRole();
    setUserRoleState(savedRole);
  }, []);

  const handleRoleChange = (role: UserRole) => {
    setUserRole(role);
    setUserRoleState(role);
  };

  const handleComplaintSubmit = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Need to fix the UI overlap idk what is making it happen*/}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <GraduationCap className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            College Complaint Registration System
          </h1>
        </header>

        {/* Role Switching kinda janky for now need to fix it */}
        <div className="mb-8 max-w-2xl mx-auto">
          <RoleSwitcher currentRole={userRole} onRoleChange={handleRoleChange} />
        </div>


        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Complain Form in student role- working in perfect condition for now*/}
          {userRole === 'student' && (
            <div>
              <ComplaintForm onSubmitSuccess={handleComplaintSubmit} />
            </div>
          )}

          {/* Complaints List working good updation time is a bit slow but still good */}
          <div className={userRole === 'admin' ? 'lg:col-span-2' : ''}>
            <ComplaintsList userRole={userRole} refreshTrigger={refreshTrigger} />
          </div>
        </div>

        {/* Footer Info */}
        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>Made by deepu for FOSSHACK V1.0 hackathon</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
