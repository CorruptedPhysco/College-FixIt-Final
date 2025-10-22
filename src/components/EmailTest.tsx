import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { testEmailConfiguration, sendAdminNotification } from '@/services/emailService';
import { Complaint } from '@/types/complaint';
import { Mail, TestTube } from 'lucide-react';

export const EmailTest = () => {
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  const handleTestConfiguration = async () => {
    setLoading(true);
    try {
      const success = await testEmailConfiguration();
      if (success) {
        toast.success('Email configuration test successful!');
      } else {
        toast.error('Email configuration test failed. Check your EmailJS setup.');
      }
    } catch (error) {
      toast.error('Email test failed. Check console for details.');
      console.error('Email test error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      toast.error('Please enter an email address');
      return;
    }

    setLoading(true);
    try {
      const testComplaint: Complaint = {
        id: 'test-123',
        name: 'Test Student',
        department: 'Computer Science Engineering',
        title: 'Test Complaint - Email Notification',
        description: 'This is a test complaint to verify email notifications are working correctly.',
        status: 'pending',
        createdAt: new Date().toISOString(),
        userId: 'test-user',
      };

      const success = await sendAdminNotification(testComplaint);
      if (success) {
        toast.success('Test email sent successfully!');
      } else {
        toast.error('Failed to send test email. Check your EmailJS configuration.');
      }
    } catch (error) {
      toast.error('Test email failed. Check console for details.');
      console.error('Test email error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Email Configuration Test
        </CardTitle>
        <CardDescription>
          Test your EmailJS configuration and send sample notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="test-email">Test Email Address</Label>
          <Input
            id="test-email"
            type="email"
            placeholder="Enter email address for testing"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleTestConfiguration}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <TestTube className="w-4 h-4" />
            Test Configuration
          </Button>

          <Button
            onClick={handleSendTestEmail}
            disabled={loading || !testEmail}
            className="flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Send Test Email
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <p><strong>Configuration Test:</strong> Verifies EmailJS is properly configured</p>
          <p><strong>Test Email:</strong> Sends a sample complaint notification</p>
        </div>
      </CardContent>
    </Card>
  );
};

