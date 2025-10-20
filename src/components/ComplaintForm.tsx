import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { saveComplaint } from '@/utils/storage';
import { Complaint } from '@/types/complaint';

interface ComplaintFormProps {
  onSubmitSuccess: () => void;
}

export const ComplaintForm = ({ onSubmitSuccess }: ComplaintFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    title: '',
    description: '',
  });

  const departments = [
    'Computer Science Engineering',
    'Electrical & Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electronics & Communication Engineering',
    'Artificial Intelligence & Data Science',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.department || !formData.title || !formData.description) {
      toast.error('Please fill in all fields');
      return;
    }

    const newComplaint: Complaint = {
      id: Date.now().toString(),
      ...formData,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    saveComplaint(newComplaint);
    toast.success('Complaint submitted successfully!');
    
    setFormData({
      name: '',
      department: '',
      title: '',
      description: '',
    });

    onSubmitSuccess();
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

          <Button type="submit" className="w-full">
            Submit Complaint
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
