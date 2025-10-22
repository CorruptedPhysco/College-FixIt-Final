import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getComplaints, updateComplaintStatus } from '@/utils/storage';
import { Complaint, UserRole } from '@/types/complaint';
import { toast } from 'sonner';
import { CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { sendUserNotification } from '@/services/emailService';

interface ComplaintsListProps {
  userRole: UserRole;
  refreshTrigger: number;
}

export const ComplaintsList = ({ userRole, refreshTrigger }: ComplaintsListProps) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadComplaints();
  }, [refreshTrigger]);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const allComplaints = await getComplaints();
      console.log('Loaded complaints:', allComplaints.map(c => ({ id: c.id, title: c.title, status: c.status })));
      console.log('Full complaint objects:', allComplaints.map(c => JSON.stringify(c, null, 2)));
      setComplaints(allComplaints);
    } catch (error) {
      toast.error('Failed to load complaints');
      console.error('Error loading complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadComplaints();
    toast.success('Complaints refreshed');
  };

  const handleStatusChange = async (id: string, newStatus: 'pending' | 'resolved') => {
    try {
      console.log('Attempting to update complaint with ID:', id, 'to status:', newStatus);
      await updateComplaintStatus(id, newStatus);
      
      await loadComplaints();
      toast.success(`Complaint marked as ${newStatus}`);
      
      // If complaint is resolved, send notification to user in background (non-blocking)
      if (newStatus === 'resolved') {
        const complaint = complaints.find(c => c.id === id);
        if (complaint) {
          // Get user email from the complaint or use a default
          const userEmail = complaint.userId ? `${complaint.userId}@college.edu` : 'student@college.edu';
          
          sendUserNotification(complaint, userEmail)
            .then(() => {
              console.log('User notification sent successfully');
            })
            .catch((emailError) => {
              console.warn('Failed to send user notification:', emailError);
              // Don't show error to user, just log it
            });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update complaint status';
      
      console.error('Error updating complaint:', error);
      console.error('Complaint ID that failed:', id);
      
      if (errorMessage.includes('not found')) {
        toast.error('Complaint not found. Please refresh the page and try again.');
      } else if (errorMessage.includes('Permission denied')) {
        toast.error('Permission denied. Please check Firestore security rules.');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const filteredComplaints = complaints.filter((complaint) => {
    if (filter === 'all') return true;
    return complaint.status === filter;
  });

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">All Complaints</CardTitle>
            <CardDescription>
              {userRole === 'admin' ? 'Manage and update complaint statuses' : 'View registered complaints'}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Complaints</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading complaints...</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No complaints found</p>
        ) : (
          <div className="space-y-4">
            {filteredComplaints.map((complaint) => (
              <Card key={complaint.id} className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg">{complaint.title}</h3>
                        <Badge variant={complaint.status === 'resolved' ? 'success' : 'warning'}>
                          {complaint.status === 'resolved' ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <Clock className="w-3 h-3 mr-1" />
                          )}
                          {complaint.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p><strong>Submitted by:</strong> {complaint.name}</p>
                        <p><strong>Department:</strong> {complaint.department}</p>
                        <p><strong>Date:</strong> {new Date(complaint.createdAt).toLocaleDateString('en-IN')}</p>
                      </div>
                      <p className="text-sm mt-2">{complaint.description}</p>
                    </div>
                    
                    {userRole === 'admin' && (
                      <div className="flex gap-2">
                        {complaint.status === 'pending' ? (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => {
                              console.log('Button clicked for complaint:', complaint);
                              console.log('Complaint ID being passed:', complaint.id);
                              console.log('Full complaint object:', JSON.stringify(complaint, null, 2));
                              handleStatusChange(complaint.id, 'resolved');
                            }}
                          >
                            Mark Resolved
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              console.log('Button clicked for complaint:', complaint);
                              console.log('Complaint ID being passed:', complaint.id);
                              console.log('Full complaint object:', JSON.stringify(complaint, null, 2));
                              handleStatusChange(complaint.id, 'pending');
                            }}
                          >
                            Mark Pending
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
