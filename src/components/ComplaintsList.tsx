import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getComplaints, updateComplaintStatus } from '@/utils/storage';
import { Complaint, UserRole } from '@/types/complaint';
import { toast } from 'sonner';
import { CheckCircle, Clock } from 'lucide-react';

interface ComplaintsListProps {
  userRole: UserRole;
  refreshTrigger: number;
}

export const ComplaintsList = ({ userRole, refreshTrigger }: ComplaintsListProps) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');

  useEffect(() => {
    loadComplaints();
  }, [refreshTrigger]);

  const loadComplaints = () => {
    const allComplaints = getComplaints();
    setComplaints(allComplaints);
  };

  const handleStatusChange = (id: string, newStatus: 'pending' | 'resolved') => {
    updateComplaintStatus(id, newStatus);
    loadComplaints();
    toast.success(`Complaint marked as ${newStatus}`);
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
      </CardHeader>
      <CardContent>
        {filteredComplaints.length === 0 ? (
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
                            onClick={() => handleStatusChange(complaint.id, 'resolved')}
                          >
                            Mark Resolved
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(complaint.id, 'pending')}
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
