/**
 * Activity Logs Page (Read-Only)
 * View system activity logs and audit trail
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { useDebounce } from '../../hooks/useDebounce';
import { activityLogApi } from '../../services/core.service';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const ACTION_BADGE_VARIANTS: Record<string, string> = {
  create: 'success',
  read: 'outline',
  update: 'warning',
  delete: 'destructive',
  login: 'default',
  logout: 'secondary',
  download: 'secondary',
  upload: 'secondary',
  import: 'secondary',
  export: 'secondary',
};

const ActivityLogsPage = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<any>({ page: 1, page_size: 20, ordering: '-timestamp' });
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const { search, ...restFilters } = filters;
  const debouncedSearch = useDebounce(search, 500);
  const queryFilters = { ...restFilters, ...(debouncedSearch ? { search: debouncedSearch } : {}) };

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['activity-logs', queryFilters],
    queryFn: () => activityLogApi.list(queryFilters),
  });

  const clearLogsMutation = useMutation({
    mutationFn: () => activityLogApi.clearLogs(),
    onSuccess: () => {
      toast.success('Activity logs cleared successfully');
      setClearDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
    },
    onError: (error: any) => {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to clear logs');
    },
  });

  const handleClearLogs = () => {
    clearLogsMutation.mutate();
  };

  const { data: selected } = useQuery({
    queryKey: ['activity-log', selectedId],
    queryFn: () => (selectedId ? activityLogApi.get(selectedId) : null),
    enabled: !!selectedId,
  });

  const columns: Column<any>[] = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      sortable: true,
      render: (item) => <span className="text-sm">{new Date(item.timestamp).toLocaleString()}</span>,
    },
    {
      key: 'action',
      label: 'Action',
      render: (item) => {
        const variant = ACTION_BADGE_VARIANTS[item.action] || 'secondary';
        return <Badge variant={variant as any}>{item.action_display}</Badge>;
      },
    },
    {
      key: 'model_name',
      label: 'Model',
      render: (item) => <span className="font-medium">{item.model_name}</span>,
    },
    {
      key: 'user_name',
      label: 'User',
      render: (item) => <span className="text-sm text-muted-foreground">{item.user_name || 'System'}</span>,
    },
    {
      key: 'description',
      label: 'Description',
      render: (item) => <span className="text-sm truncate max-w-xs block">{item.description}</span>,
    },
  ];

  const filterConfig: FilterConfig[] = [
    {
      name: 'action',
      label: 'Action',
      type: 'select',
      options: [
        { value: '', label: 'All Actions' },
        { value: 'create', label: 'Create' },
        { value: 'read', label: 'Read' },
        { value: 'update', label: 'Update' },
        { value: 'delete', label: 'Delete' },
        { value: 'login', label: 'Login' },
        { value: 'logout', label: 'Logout' },
      ],
    },
    { name: 'model_name', label: 'Model', type: 'text' },
    { name: 'user_name', label: 'User', type: 'text' },
    { name: 'timestamp', label: 'Date', type: 'date' },
  ];

  return (
    <div className="p-6">
      <DataTable
        title="Activity Logs"
        description="View system activity logs and audit trail (read-only)"
        data={data || null}
        columns={columns}
        isLoading={isLoading}
        error={error ? (error as Error).message : null}
        onRefresh={refetch}
        onRowClick={(item) => {
          setSelectedId(item.id);
          setIsSidebarOpen(true);
        }}
        filters={filters}
        onFiltersChange={setFilters}
        filterConfig={filterConfig}
        searchPlaceholder="Search logs..."
        customActions={
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setClearDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Logs
          </Button>
        }
      />

      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all activity logs from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearLogs}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {clearLogsMutation.isPending ? 'Clearing...' : 'Clear All Logs'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={() => {
          setIsSidebarOpen(false);
          setSelectedId(null);
        }}
        title="Activity Log Details"
        mode="view"
        width="2xl"
      >
        {selected && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="bg-muted/50 p-6 rounded-lg space-y-4 border border-border/50">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Action</p>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={(ACTION_BADGE_VARIANTS[selected.action] || 'secondary') as any}
                        className="text-sm px-3 py-1"
                      >
                        {selected.action_display}
                      </Badge>
                      <span className="text-base text-muted-foreground">{selected.model_name}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">When</p>
                    <p className="font-semibold text-lg">{new Date(selected.timestamp).toLocaleString()}</p>
                  </div>
                </div>

                <div className="divide-y divide-border/60 rounded-lg border border-border/50 bg-background/60">
                  {[
                    { label: 'User', value: selected.user_name || 'System', hint: selected.user || '—' },
                    { label: 'College', value: selected.college_name || 'N/A', hint: selected.college || undefined },
                    selected.object_id ? { label: 'Object ID', value: selected.object_id, hint: undefined } : null,
                    { label: 'IP Address', value: selected.ip_address || '—', hint: undefined },
                    { label: 'Description', value: selected.description || 'No description', hint: undefined },
                  ]
                    .filter(Boolean)
                    .map((row: any) => (
                      <div key={row.label} className="flex items-start justify-between gap-4 px-4 py-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">{row.label}</p>
                        <div className="text-right max-w-xl">
                          <p className="font-semibold break-words text-sm md:text-base">{row.value}</p>
                          {row.hint && <p className="text-xs text-muted-foreground mt-0.5">ID: {row.hint}</p>}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-muted/40 p-5 rounded-lg border border-border/50 space-y-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Session</p>
                <p className="text-sm text-muted-foreground leading-relaxed break-words">
                  {selected.user_agent || '—'}
                </p>
              </div>

              {selected.metadata && Object.keys(selected.metadata).length > 0 && (
                <div className="bg-muted/50 p-5 rounded-lg border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Metadata</h3>
                    <Badge variant="outline" className="text-xs px-2 py-1">
                      Additional Context
                    </Badge>
                  </div>
                  <pre className="text-xs bg-background p-4 rounded overflow-auto max-h-80 border">
                    {JSON.stringify(selected.metadata, null, 2)}
                  </pre>
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  Note: Activity logs are read-only and maintained for audit purposes. They cannot be modified or deleted.
                </p>
              </div>
            </div>
          </div>
        )}
      </DetailSidebar>
    </div>
  );
};

export default ActivityLogsPage;
