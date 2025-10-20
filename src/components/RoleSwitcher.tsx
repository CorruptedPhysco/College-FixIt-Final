import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserRole } from '@/types/complaint';
import { Shield, User } from 'lucide-react';
import { toast } from 'sonner';

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const ADMIN_PASSWORD = 'admin123'; // simple password for demo purposes

export const RoleSwitcher = ({ currentRole, onRoleChange }: RoleSwitcherProps) => {
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [password, setPassword] = useState('');

  const handleRoleSwitch = (role: UserRole) => {
    if (role === 'admin') {
      setShowPasswordPrompt(true);
    } else {
      onRoleChange('student');
      toast.success('Switched to Student mode');
      setShowPasswordPrompt(false);
      setPassword('');
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      onRoleChange('admin');
      toast.success('Switched to Admin mode');
      setShowPasswordPrompt(false);
      setPassword('');
    } else {
      toast.error('Incorrect password');
    }
  };

  if (showPasswordPrompt) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Admin Authentication</CardTitle>
          <CardDescription>Enter admin password to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">Demo password: admin123</p>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Login
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPasswordPrompt(false);
                  setPassword('');
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>User Mode</CardTitle>
        <CardDescription>Switch between Student and Admin views</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Button
            variant={currentRole === 'student' ? 'default' : 'outline'}
            onClick={() => handleRoleSwitch('student')}
            className="flex-1"
          >
            <User className="w-4 h-4 mr-2" />
            Student
          </Button>
          <Button
            variant={currentRole === 'admin' ? 'default' : 'outline'}
            onClick={() => handleRoleSwitch('admin')}
            className="flex-1"
          >
            <Shield className="w-4 h-4 mr-2" />
            Admin
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
