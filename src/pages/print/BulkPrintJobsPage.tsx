/**
 * Bulk Print Jobs Page
 * Create and manage bulk document generation jobs
 */

import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Loader2,
  Pause,
  XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Progress } from '../../components/ui/progress';
import { DROPDOWN_PAGE_SIZE } from '../../config/app.config';
import { useAuth } from '../../hooks/useAuth';
import {
  useBulkJobProgress,
  useBulkPrintJobs,
  useCancelBulkJob,
  useCreateBulkPrintJob,
  usePrintTemplates,
  useTargetModels,
} from '../../hooks/usePrint';
import { bulkPrintJobsApi } from '../../services/print.service';
import type {
  BulkJobStatus,
  BulkPrintJob,
  BulkPrintJobCreateInput,
} from '../../types/print.types';
import { CreateBulkJobForm } from './components/CreateBulkJobForm';

const STATUS_CONFIG: Record<BulkJobStatus, { color: string; icon: any; label: string }> = {
  pending: { color: 'secondary', icon: Clock, label: 'Pending' },
  processing: { color: 'warning', icon: Loader2, label: 'Processing' },
  completed: { color: 'success', icon: CheckCircle, label: 'Completed' },
  failed: { color: 'destructive', icon: XCircle, label: 'Failed' },
  cancelled: { color: 'secondary', icon: Pause, label: 'Cancelled' },
};

export const BulkPrintJobsPage = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 20 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<BulkPrintJob | null>(null);
  const [pollingJobId, setPollingJobId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState<BulkPrintJobCreateInput>({
    name: '',
    template_id: 0,
    target_model: '',
    target_ids: [],
    target_filters: {},
  });
  const [targetIdsInput, setTargetIdsInput] = useState('');

  // Permission check
  const canManage =
    user?.userType === 'super_admin' ||
    user?.user_type === 'super_admin' ||
    user?.userType === 'principal' ||
    user?.user_type === 'principal' ||
    user?.userType === 'college_admin' ||
    user?.user_type === 'college_admin';

  // Fetch data
  const { data, isLoading, error, refetch } = useBulkPrintJobs(filters);
  const { data: templatesData } = usePrintTemplates({ status: 'active', page_size: DROPDOWN_PAGE_SIZE });
  const { data: targetModels } = useTargetModels();

  // Poll progress for active job
  const { data: progressData } = useBulkJobProgress(pollingJobId, {
    refetchInterval: pollingJobId ? 2000 : undefined,
  });

  // Mutations
  const createJob = useCreateBulkPrintJob();
  const cancelJob = useCancelBulkJob();

  // Extract data
  const jobs: BulkPrintJob[] = useMemo(() => {
    if (Array.isArray(data)) return data;
    if (data?.results) return data.results;
    return [];
  }, [data]);

  const totalCount = useMemo(() => {
    if (Array.isArray(data)) return data.length;
    if (data?.count) return data.count;
    return 0;
  }, [data]);

  const templates = useMemo(() => {
    if (Array.isArray(templatesData)) return templatesData;
    if (templatesData?.results) return templatesData.results;
    return [];
  }, [templatesData]);

  // Stop polling when job completes
  useEffect(() => {
    if (progressData && (progressData.status === 'completed' || progressData.status === 'failed' || progressData.status === 'cancelled')) {
      setPollingJobId(null);
      refetch();
    }
  }, [progressData, refetch]);

  // Table columns
  const columns: Column<BulkPrintJob>[] = [
    {
      key: 'name',
      label: 'Job Name',
      sortable: true,
      render: (job) => (
        <div>
          <p className="font-medium">{job.name}</p>
          <p className="text-xs text-muted-foreground font-mono">{job.job_id.slice(0, 8)}...</p>
        </div>
      ),
    },
    { key: 'template_name', label: 'Template' },
    {
      key: 'target_model',
      label: 'Target',
      render: (job) => (
        <Badge variant="outline">{job.target_model?.split('.').pop() || 'N/A'}</Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (job) => {
        const config = STATUS_CONFIG[job.status];
        const Icon = config.icon;
        return (
          <Badge variant={config.color as any} className="flex items-center gap-1 w-fit">
            <Icon className={`h-3 w-3 ${job.status === 'processing' ? 'animate-spin' : ''}`} />
            {config.label}
          </Badge>
        );
      },
    },
    {
      key: 'progress_percent',
      label: 'Progress',
      render: (job) => (
        <div className="w-32">
          <Progress value={job.progress_percent} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {job.processed_count}/{job.total_count} ({Math.round(job.progress_percent)}%)
          </p>
        </div>
      ),
    },
    {
      key: 'success_count',
      label: 'Results',
      render: (job) => (
        <div className="text-sm">
          <span className="text-green-600">{job.success_count} success</span>
          {job.error_count > 0 && (
            <span className="text-red-600 ml-2">{job.error_count} errors</span>
          )}
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (job) => (
        <span className="text-sm">
          {new Date(job.created_at).toLocaleDateString()}
        </span>
      ),
    },
  ];

  const filterConfig: FilterConfig[] = [
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: '', label: 'All Status' },
        ...Object.entries(STATUS_CONFIG).map(([key, value]) => ({
          value: key,
          label: value.label,
        })),
      ],
    },
  ];

  const handleAddNew = () => {
    setSelectedJob(null);
    setFormData({
      name: '',
      template_id: 0,
      target_model: '',
      target_ids: [],
      target_filters: {},
    });
    setTargetIdsInput('');
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleRowClick = (job: BulkPrintJob) => {
    setSelectedJob(job);
    setSidebarMode('view');
    setIsSidebarOpen(true);
  };

  const handleViewProgress = (job: BulkPrintJob) => {
    setSelectedJob(job);
    if (job.status === 'processing') {
      setPollingJobId(job.id);
    }
    setIsProgressOpen(true);
  };

  const handleDownload = (job: BulkPrintJob) => {
    if (job.status !== 'completed' || !job.combined_pdf) {
      toast.error('Combined PDF is not available');
      return;
    }
    const url = bulkPrintJobsApi.getDownloadUrl(job.id);
    window.open(url, '_blank');
  };

  const handleCancel = async (job: BulkPrintJob) => {
    if (!confirm('Are you sure you want to cancel this job?')) return;

    try {
      await cancelJob.mutateAsync(job.id);
      toast.success('Job cancelled');
      setPollingJobId(null);
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to cancel job');
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.template_id || !formData.target_model) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Parse target IDs if provided
    let targetIds: number[] = [];
    if (targetIdsInput.trim()) {
      targetIds = targetIdsInput
        .split(',')
        .map((id) => parseInt(id.trim()))
        .filter((id) => !isNaN(id));

      if (targetIds.length === 0) {
        toast.error('Please enter valid target IDs');
        return;
      }
    }

    // API requires either target_ids or non-empty target_filters
    const hasTargetFilters = formData.target_filters && Object.keys(formData.target_filters).length > 0;
    if (targetIds.length === 0 && !hasTargetFilters) {
      toast.error('Please provide target IDs or target filters');
      return;
    }

    try {
      const jobData: BulkPrintJobCreateInput = {
        ...formData,
        target_ids: targetIds.length > 0 ? targetIds : undefined,
        target_filters: hasTargetFilters ? formData.target_filters : undefined,
      };
      const newJob = await createJob.mutateAsync(jobData);
      toast.success('Bulk print job created');
      setIsSidebarOpen(false);
      setPollingJobId(newJob.id);
      setSelectedJob(newJob);
      setIsProgressOpen(true);
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to create job');
    }
  };

  if (!canManage) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <AlertCircle className="h-12 w-12 mb-4" />
        <p>You do not have permission to access this page</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <AlertCircle className="h-12 w-12 mb-4" />
        <p>Failed to load bulk print jobs</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(STATUS_CONFIG).map(([status, config]) => {
          const Icon = config.icon;
          const count = jobs.filter((j) => j.status === status).length;
          return (
            <Card
              key={status}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setFilters((prev) => ({ ...prev, status }))}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <Icon className={`h-5 w-5 text-${config.color}`} />
                <div>
                  <p className="text-xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground">{config.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Data Table */}
      <DataTable<BulkPrintJob>
        title="Bulk Print Jobs"
        description="Generate documents for multiple records at once"
        onRefresh={() => refetch()}
        onAdd={canManage ? handleAddNew : undefined}
        addButtonLabel="Create Job"
        data={data}
        columns={columns}
        isLoading={isLoading}
        onRowClick={handleRowClick}
        actions={(job: BulkPrintJob) => (
          <div className="flex items-center gap-1">
            {job.status === 'processing' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancel(job);
                }}
                title="Cancel"
              >
                <Pause className="h-4 w-4" />
              </Button>
            )}
            {job.status === 'completed' && job.combined_pdf && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(job);
                }}
                title="Download"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
        filterConfig={filterConfig}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Sidebar */}
      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        mode={sidebarMode}
        title={
          sidebarMode === 'create'
            ? 'Create Bulk Print Job'
            : selectedJob?.name || 'Job Details'
        }
        subtitle={
          sidebarMode === 'create'
            ? 'Generate documents for multiple records'
            : selectedJob?.job_id
        }
      >
        {sidebarMode === 'view' && selectedJob ? (
          <div className="space-y-6">
            {/* Status */}
            <div className="flex items-center gap-2">
              <Badge variant={STATUS_CONFIG[selectedJob.status].color as any} className="flex items-center gap-1">
                {(() => { const Icon = STATUS_CONFIG[selectedJob.status].icon; return <Icon className={`h-3 w-3 ${selectedJob.status === 'processing' ? 'animate-spin' : ''}`} />; })()}
                {STATUS_CONFIG[selectedJob.status].label}
              </Badge>
              <Badge variant="outline">{selectedJob.target_model?.split('.').pop() || 'N/A'}</Badge>
            </div>

            {/* Job Info */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Template</Label>
                  <p className="font-medium">{selectedJob.template_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Created</Label>
                  <p className="font-medium">{new Date(selectedJob.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <Label className="text-muted-foreground">Progress</Label>
              <Progress value={selectedJob.progress_percent} className="h-3" />
              <p className="text-sm text-muted-foreground">
                {selectedJob.processed_count}/{selectedJob.total_count} ({Math.round(selectedJob.progress_percent)}%)
              </p>
            </div>

            {/* Results */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Successful</Label>
                <p className="text-lg font-bold text-green-600">{selectedJob.success_count}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Errors</Label>
                <p className="text-lg font-bold text-red-600">{selectedJob.error_count}</p>
              </div>
            </div>

            {/* Error Log */}
            {selectedJob.error_log && selectedJob.error_log.length > 0 && (
              <div>
                <Label className="text-muted-foreground">Error Log</Label>
                <div className="max-h-32 overflow-y-auto mt-2 border rounded-md p-2">
                  {selectedJob.error_log.map((err, index) => (
                    <div key={index} className="text-xs border-b py-1 last:border-0">
                      <span className="text-muted-foreground">#{err.index}: </span>
                      <span className="text-red-600">{err.error}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              {selectedJob.status === 'processing' && (
                <Button variant="outline" onClick={() => handleViewProgress(selectedJob)}>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Live Progress
                </Button>
              )}
              {selectedJob.status === 'processing' && (
                <Button variant="destructive" onClick={() => handleCancel(selectedJob)}>
                  <Pause className="h-4 w-4 mr-1" />
                  Cancel Job
                </Button>
              )}
              {selectedJob.status === 'completed' && selectedJob.combined_pdf && (
                <Button onClick={() => handleDownload(selectedJob)}>
                  <Download className="h-4 w-4 mr-1" />
                  Download PDF
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <CreateBulkJobForm
              formData={formData}
              setFormData={setFormData}
              templates={templates}
              targetModels={targetModels}
              targetIdsInput={targetIdsInput}
              setTargetIdsInput={setTargetIdsInput}
            />

            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsSidebarOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={createJob.isPending}
              >
                {createJob.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                Start Job
              </Button>
            </div>
          </div>
        )}
      </DetailSidebar>

      {/* Progress Dialog */}
      <Dialog
        open={isProgressOpen}
        onOpenChange={(open) => {
          setIsProgressOpen(open);
          if (!open) setPollingJobId(null);
        }}
      >
        <DialogContent className="sm:max-w-lg max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Job Progress</DialogTitle>
            <DialogDescription>{selectedJob?.name}</DialogDescription>
          </DialogHeader>

          {(progressData || selectedJob) && (
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  variant={
                    STATUS_CONFIG[progressData?.status || selectedJob?.status || 'pending'].color as any
                  }
                >
                  {STATUS_CONFIG[progressData?.status || selectedJob?.status || 'pending'].label}
                </Badge>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>
                    {progressData?.processed || selectedJob?.processed_count || 0}/
                    {progressData?.total || selectedJob?.total_count || 0}
                  </span>
                </div>
                <Progress
                  value={progressData?.progress_percent || selectedJob?.progress_percent || 0}
                  className="h-3"
                />
                <p className="text-center text-sm text-muted-foreground">
                  {Math.round(progressData?.progress_percent || selectedJob?.progress_percent || 0)}%
                </p>
              </div>

              {/* Results */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-green-50 dark:bg-green-950 border-green-200">
                  <CardContent className="p-3 text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {progressData?.success || selectedJob?.success_count || 0}
                    </p>
                    <p className="text-xs text-green-600">Successful</p>
                  </CardContent>
                </Card>
                <Card className="bg-red-50 dark:bg-red-950 border-red-200">
                  <CardContent className="p-3 text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {progressData?.errors || selectedJob?.error_count || 0}
                    </p>
                    <p className="text-xs text-red-600">Errors</p>
                  </CardContent>
                </Card>
              </div>

              {/* Error Log */}
              {selectedJob?.error_log && selectedJob.error_log.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-red-600">Error Log</CardTitle>
                  </CardHeader>
                  <CardContent className="max-h-32 overflow-y-auto">
                    {selectedJob.error_log.map((err, index) => (
                      <div key={index} className="text-xs border-b py-1">
                        <span className="text-muted-foreground">#{err.index}: </span>
                        <span className="text-red-600">{err.error}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                {(progressData?.status === 'processing' || selectedJob?.status === 'processing') && (
                  <Button
                    variant="destructive"
                    onClick={() => selectedJob && handleCancel(selectedJob)}
                  >
                    <Pause className="h-4 w-4 mr-1" />
                    Cancel Job
                  </Button>
                )}
                {(progressData?.status === 'completed' || selectedJob?.status === 'completed') &&
                  selectedJob?.combined_pdf && (
                    <Button onClick={() => selectedJob && handleDownload(selectedJob)}>
                      <Download className="h-4 w-4 mr-1" />
                      Download PDF
                    </Button>
                  )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BulkPrintJobsPage;
