/**
 * Print Requests Page
 * Manage print requests for question papers, certificates, and documents
 */

import React, { useState, useMemo } from 'react';
import { useDebounce, DEBOUNCE_DELAYS } from '@/hooks/useDebounce';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Printer,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Plus,
  Search,
  Eye,
  Zap,
  Calendar,
  User,
  Package,
  Bell,
  Loader2,
  Edit,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/data/storeMockData';
import { useCreatePrintJob, useUpdatePrintJob, usePartialUpdatePrintJob, useDeletePrintJob } from '@/hooks/useStore';
import { usePrintJobsSWR, invalidatePrintJobs } from '@/hooks/swr';
import { PrintJobForm } from './forms';
import { toast } from 'sonner';

export const PrintRequestsPage: React.FC = () => {
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, DEBOUNCE_DELAYS.SEARCH);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch print jobs
  const { data, isLoading, error, refresh } = usePrintJobsSWR();
  const createMutation = useCreatePrintJob();
  const updateMutation = useUpdatePrintJob();
  const partialUpdateMutation = usePartialUpdatePrintJob();
  const deleteMutation = useDeletePrintJob();

  // Extract results from paginated response
  const requests = data?.results || [];

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter((req: any) => {
      const matchesSearch =
        req.job_name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        req.remarks?.toLowerCase().includes(debouncedSearchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || req.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, debouncedSearchQuery, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    return {
      pending: requests.filter((r: any) => r.status === 'pending').length,
      approved: requests.filter((r: any) => r.status === 'approved').length,
      inProgress: requests.filter((r: any) => r.status === 'in_progress').length,
      completed: requests.filter((r: any) => r.status === 'completed').length,
      urgent: requests.filter((r: any) => r.status === 'pending').length,
    };
  }, [requests]);

  const handleCreateRequest = async (formData: any) => {
    try {
      await createMutation.mutateAsync(formData);
      toast.success('Print job created successfully');
      setIsCreateOpen(false);
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to create print job');
    }
  };

  const handleUpdateRequest = async (formData: any) => {
    if (!selectedRequest) return;
    try {
      await updateMutation.mutateAsync({ id: selectedRequest.id, data: formData });
      toast.success('Print job updated successfully');
      setIsEditOpen(false);
      setSelectedRequest(null);
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to update print job');
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await partialUpdateMutation.mutateAsync({ id, data: { status } });
      toast.success(`Print job status updated to ${status}`);
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to update status');
    }
  };

  const handleDeleteRequest = async (id: number) => {
    if (!confirm('Are you sure you want to delete this print job?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Print job deleted successfully');
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete print job');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <Printer className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'default';
      case 'in_progress': return 'default';
      case 'completed': return 'success';
      case 'rejected': return 'destructive';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg font-semibold">Failed to load print jobs</p>
          <p className="text-sm text-muted-foreground">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Printer className="h-8 w-8 text-primary" />
            Print Jobs
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage printing jobs for question papers and documents
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <Button size="lg" className="gap-2" onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-5 w-5" />
            New Print Job
          </Button>
          <DialogContent className="sm:max-w-2xl max-w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Print Job</DialogTitle>
              <DialogDescription>
                Submit a new printing job for processing
              </DialogDescription>
            </DialogHeader>
            <PrintJobForm
              onSubmit={handleCreateRequest}
              onCancel={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">{stats.pending}</p>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold mt-1">{stats.approved}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold mt-1">{stats.inProgress}</p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Printer className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.completed}</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-2xl font-bold mt-1">{requests.length}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle>Print Jobs</CardTitle>
            <Badge variant="outline">{filteredRequests.length} jobs</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="space-y-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by job name or remarks..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Jobs Grid */}
          <div className="space-y-3">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Printer className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">No print jobs found</p>
                <p className="text-sm">Create a new job to get started</p>
              </div>
            ) : (
              filteredRequests.map((job: any) => (
                <div
                  key={job.id}
                  className={cn(
                    "border rounded-lg p-4 hover:bg-accent/50 transition-all",
                    job.status === 'pending' && "border-orange-500 bg-orange-500/5"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      {/* Title and Badges */}
                      <div className="flex items-start gap-2 flex-wrap">
                        <h4 className="font-semibold">{job.job_name}</h4>
                        <Badge variant={getStatusColor(job.status) as any} className="gap-1">
                          {getStatusIcon(job.status)}
                          {job.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      {/* Meta Information */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          {job.copies} copies × {job.pages} pages
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {job.paper_size} - {job.color_type?.replace('_', ' ')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Submitted: {formatDate(job.submission_date)}
                        </span>
                        {job.completion_date && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Completed: {formatDate(job.completion_date)}
                          </span>
                        )}
                      </div>

                      {job.remarks && (
                        <p className="text-sm text-muted-foreground italic">"{job.remarks}"</p>
                      )}
                    </div>

                    {/* Cost and Actions */}
                    <div className="text-right space-y-2 min-w-[150px]">
                      <div>
                        <p className="text-xs text-muted-foreground">Total Cost</p>
                        <p className="text-lg font-bold text-primary">{formatCurrency(parseFloat(job.total_amount || '0'))}</p>
                      </div>

                      <div className="flex flex-col gap-1">
                        {job.status === 'pending' && (
                          <>
                            <Button size="sm" variant="default" onClick={() => handleStatusUpdate(job.id, 'approved')}>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(job.id, 'rejected')}>
                              <XCircle className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {job.status === 'approved' && (
                          <Button size="sm" onClick={() => handleStatusUpdate(job.id, 'in_progress')}>
                            <Printer className="h-3 w-3 mr-1" />
                            Start Printing
                          </Button>
                        )}
                        {job.status === 'in_progress' && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate(job.id, 'completed')}>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Mark Complete
                          </Button>
                        )}
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedRequest(job);
                              setIsEditOpen(true);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteRequest(job.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-2xl max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Print Job</DialogTitle>
            <DialogDescription>
              Update the print job details
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <PrintJobForm
              printJob={selectedRequest}
              onSubmit={handleUpdateRequest}
              onCancel={() => {
                setIsEditOpen(false);
                setSelectedRequest(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrintRequestsPage;
