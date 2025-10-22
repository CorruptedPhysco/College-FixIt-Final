import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { saveComplaint } from '@/utils/storage';
import { useAuth } from '@/contexts/AuthContext';
import { Complaint } from '@/types/complaint';
import { sendAdminNotification } from '@/services/emailService';

interface ComplaintFormProps {
  onSubmitSuccess: () => void;
}

export const ComplaintForm = ({ onSubmitSuccess }: ComplaintFormProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.email?.split('@')[0] || '',
    department: '',
    title: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const departments = [
    'Computer Science Engineering',
    'Electrical & Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electronics & Communication Engineering',
    'Artificial Intelligence & Data Science',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.name || !formData.department || !formData.title || !formData.description) {
      toast.error('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const newComplaint: Complaint = {
        id: Date.now().toString(),
        name: formData.name,
        department: formData.department,
        title: formData.title,
        description: formData.description,
        status: 'pending',
        createdAt: new Date().toISOString(),
        userId: user?.id,
      };

      await saveComplaint(newComplaint);
      
      // Show success message immediately
      toast.success('Complaint submitted successfully!');
      
      setFormData({
        name: user?.email?.split('@')[0] || '',
        department: '',
        title: '',
        description: '',
      });

      onSubmitSuccess();
      
      // Send admin notification email in background (non-blocking)
      sendAdminNotification(newComplaint)
        .then(() => {
          console.log('Admin notification sent successfully');
        })
        .catch((emailError) => {
          console.warn('Failed to send admin notification:', emailError);
          // Don't show error to user, just log it
        });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit complaint. Please try again.';
      
      if (errorMessage.includes('Permission denied')) {
        toast.error('Permission denied. Please check Firestore security rules in Firebase Console.');
      } else if (errorMessage.includes('Firebase not configured')) {
        toast.error('Firebase not configured. Please check QUICK_FIX.md for setup instructions.');
      } else if (errorMessage.includes('not authenticated')) {
        toast.error('Please log in again to submit complaints.');
      } else {
        toast.error(errorMessage);
      }
      
      console.error('Error submitting complaint:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Submit a Complaint</CardTitle>
        <CardDescription>Fill out the form below to register your complaint</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select
              value={formData.department}
              onValueChange={(value) => setFormData({ ...formData, department: value })}
              required
            >
              <SelectTrigger id="department">
                <SelectValue placeholder="Select your department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Complaint Title</Label>
            <Input
              id="title"
              placeholder="Brief title of your complaint"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide detailed description of your complaint"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={5}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
