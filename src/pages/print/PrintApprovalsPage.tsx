/**
 * Print Approvals Page
 * Approve/Reject print documents (CEO/Super Admin only)
 */

import {
  AlertCircle,
  Check,
  Clock,
  Eye,
  FileText,
  Loader2,
  ThumbsDown,
  ThumbsUp,
  Undo2,
  XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Column, DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';

import { Label } from '../../components/ui/label';
import { useAuth } from '../../hooks/useAuth';
import {
  useApprovalDashboard,
  useApprovalPreview,
  useApproveDocument,
  usePendingApprovals,
} from '../../hooks/usePrint';
import type { ApprovalActionRequest, PendingApproval } from '../../types/print.types';

export const PrintApprovalsPage = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 20 });
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<PendingApproval | null>(null);
  const [actionComments, setActionComments] = useState('');

  // Permission check
  const isSuperAdmin =
    user?.userType === 'super_admin' || user?.user_type === 'super_admin';

  // Fetch pending approvals and dashboard
  const { data, isLoading, error, refetch } = usePendingApprovals(filters);
  const { data: dashboard } = useApprovalDashboard();
  const { data: previewData, isLoading: previewLoading } = useApprovalPreview(
    isPreviewOpen ? selectedApproval?.id || null : null
  );

  // Mutations
  const approveDocument = useApproveDocument();

  // Extract data
  const approvals: PendingApproval[] = useMemo(() => {
    if (Array.isArray(data)) return data;
    if (data?.results) return data.results;
    return [];
  }, [data]);

  const totalCount = useMemo(() => {
    if (Array.isArray(data)) return data.length;
    if (data?.count) return data.count;
    return 0;
  }, [data]);

  // Table columns
  const columns: Column<PendingApproval>[] = [
    {
      key: 'document_reference',
      label: 'Reference',
      sortable: true,
      render: (approval) => (
        <div>
          <p className="font-mono text-sm">{approval.document_reference}</p>
          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
            {approval.document_title}
          </p>
        </div>
      ),
    },
    { key: 'template_name', label: 'Template' },
    { key: 'requested_by_name', label: 'Requested By' },
    {
      key: 'approver_level',
      label: 'Approval Level',
      render: (approval) => (
        <Badge variant="outline">{approval.approver_level}</Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Submitted',
      render: (approval) => (
        <span className="text-sm">
          {new Date(approval.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'is_pending',
      label: 'Status',
      render: (approval) => (
        <Badge variant={approval.is_pending ? 'warning' : 'success'}>
          {approval.is_pending ? 'Pending' : 'Processed'}
        </Badge>
      ),
    },
  ];

  const handlePreview = (approval: PendingApproval) => {
    setSelectedApproval(approval);
    setActionComments('');
    setIsPreviewOpen(true);
  };

  const handleAction = async (action: 'approve' | 'reject' | 'return') => {
    if (!selectedApproval) return;

    if ((action === 'reject' || action === 'return') && !actionComments.trim()) {
      toast.error('Please provide comments for rejection or return');
      return;
    }

    try {
      const requestData: ApprovalActionRequest = {
        action,
        comments: actionComments || undefined,
      };
      await approveDocument.mutateAsync({ id: selectedApproval.id, data: requestData });

      const actionLabels = { approve: 'approved', reject: 'rejected', return: 'returned' };
      toast.success(`Document ${actionLabels[action]} successfully`);
      setIsPreviewOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to process approval');
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <AlertCircle className="h-12 w-12 mb-4" />
        <p>You do not have permission to access this page</p>
        <p className="text-sm">Only Super Admin can approve print documents</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <AlertCircle className="h-12 w-12 mb-4" />
        <p>Failed to load pending approvals</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">


      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-amber-500/20">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">
                {dashboard?.pending || 0}
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-400">Pending Approval</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500/20">
              <ThumbsUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                {dashboard?.approved_today || 0}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">Approved Today</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-red-500/20">
              <ThumbsDown className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-red-700 dark:text-red-300">
                {dashboard?.rejected_today || 0}
              </p>
              <p className="text-sm text-red-600 dark:text-red-400">Rejected Today</p>
            </div>
          </CardContent>
        </Card>
      </div>



      {/* Data Table */}
      <DataTable<PendingApproval>
        title="Print Approvals"
        description="Review and approve print document requests"
        onRefresh={() => refetch()}
        data={{ results: approvals, count: totalCount, next: null, previous: null }}
        columns={columns}
        isLoading={isLoading}
        onRowClick={handlePreview}
        actions={(approval: PendingApproval) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handlePreview(approval);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        )}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Preview & Action Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-7xl h-[95vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Review Document
            </DialogTitle>
            <DialogDescription>
              {selectedApproval?.document_reference} - {selectedApproval?.document_title}
            </DialogDescription>
          </DialogHeader>

          {previewLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : previewData ? (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Document Info */}
              <div className="px-6 py-3 border-b bg-muted/20 shrink-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground text-xs">Template</Label>
                    <p className="font-medium truncate" title={previewData.template_name}>{previewData.template_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Requested By</Label>
                    <p className="font-medium truncate">{previewData.requested_by_name || previewData.requested_by}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Priority</Label>
                    <div>
                      <Badge
                        variant={
                          previewData.priority === 'urgent'
                            ? 'destructive'
                            : previewData.priority === 'high'
                              ? 'warning'
                              : 'default'
                        }
                        className="text-xs px-2 py-0"
                      >
                        {previewData.priority}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Requested At</Label>
                    <p className="font-medium truncate">
                      {new Date(previewData.requested_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Document Preview - Scrollable */}
              <div className="flex-1 overflow-y-auto bg-gray-100/50 p-6 flex justify-center">
                <div
                  className="bg-white shadow-lg relative flex flex-col shrink-0 transition-all duration-200 ease-in-out"
                  style={{
                    width: '210mm',
                    minHeight: '297mm', // Force A4 min height
                    height: 'max-content',
                    fontFamily: previewData.effective_settings?.default_font_family || 'Roboto, sans-serif',
                    fontSize: `${previewData.effective_settings?.default_font_size || 12}pt`,
                    padding: `${previewData.effective_settings?.margins?.top || 10}mm ${previewData.effective_settings?.margins?.right || 10}mm ${previewData.effective_settings?.margins?.bottom || 10}mm ${previewData.effective_settings?.margins?.left || 10}mm`,
                  }}
                >
                  {/* Watermark */}
                  {(previewData.effective_settings?.watermark_text || previewData.effective_settings?.watermark_image) && (
                    <div
                      className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
                      style={{ zIndex: 0, opacity: previewData.effective_settings.watermark_opacity || 0.1 }}
                    >
                      <div style={{ transform: 'rotate(-45deg)' }}>
                        {previewData.effective_settings.watermark_image ? (
                          <img
                            src={previewData.effective_settings.watermark_image}
                            alt="watermark"
                            style={{ maxWidth: '80%', objectFit: 'contain' }}
                          />
                        ) : (
                          <span
                            style={{
                              fontSize: '56px',
                              fontWeight: 'bold',
                              color: '#9ca3af',
                              letterSpacing: '0.15em',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {previewData.effective_settings.watermark_text}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Header */}
                  {previewData.effective_settings?.header_image ? (
                    <div
                      style={{
                        backgroundColor: previewData.effective_settings?.header_background_color || '#ffffff',
                        color: previewData.effective_settings?.header_text_color || '#000',
                        minHeight: `${previewData.effective_settings?.header_height || 80}px`,
                        position: 'relative',
                        zIndex: 1,
                      }}
                    >
                      <img
                        src={previewData.effective_settings.header_image}
                        alt="header"
                        style={{ width: '100%', display: 'block' }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '15px',
                          padding: '10px 15px',
                        }}
                      >
                        {previewData.effective_settings?.logo_image && (
                          <img
                            src={previewData.effective_settings.logo_image}
                            alt="logo"
                            style={{ width: '80px', height: '50px', objectFit: 'contain' }}
                          />
                        )}
                        <div
                          className="print-content-wrapper"
                          style={{ textAlign: (previewData.effective_settings?.header_text_align as any) || 'left', flex: 1 }}
                          dangerouslySetInnerHTML={{ __html: previewData.effective_settings?.header_text || '' }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        backgroundColor: previewData.effective_settings?.header_background_color || '#ffffff',
                        color: previewData.effective_settings?.header_text_color || '#000',
                        padding: '10px 15px',
                        minHeight: `${previewData.effective_settings?.header_height || 80}px`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        position: 'relative',
                        zIndex: 1,
                      }}
                    >
                      {previewData.effective_settings?.logo_image && (
                        <img
                          src={previewData.effective_settings.logo_image}
                          alt="logo"
                          style={{ width: '80px', height: '50px', objectFit: 'contain' }}
                        />
                      )}
                      <div
                        style={{ textAlign: (previewData.effective_settings?.header_text_align as any) || 'left', flex: 1 }}
                        dangerouslySetInnerHTML={{ __html: previewData.effective_settings?.header_text || '' }}
                      />
                    </div>
                  )}

                  {/* Header line */}
                  {previewData.effective_settings?.show_header_line && (
                    <hr style={{ border: 'none', borderTop: `1px solid ${previewData.effective_settings.header_line_color || '#000'}`, margin: '0' }} />
                  )}

                  {/* Content */}
                  <div
                    className="print-content-wrapper"
                    style={{ padding: '15px 0', flex: 1, position: 'relative', zIndex: 1 }}
                    dangerouslySetInnerHTML={{ __html: previewData.effective_settings?.content || previewData.custom_content || previewData.rendered_content }}
                  />

                  {/* Footer line */}
                  {previewData.effective_settings?.show_footer_line && (
                    <hr style={{ border: 'none', borderTop: `1px solid ${previewData.effective_settings.footer_line_color || '#000'}`, margin: '0' }} />
                  )}

                  {/* Footer */}
                  {previewData.effective_settings?.footer_image ? (
                    <div
                      style={{
                        backgroundColor: previewData.effective_settings?.footer_background_color || '#ffffff',
                        color: previewData.effective_settings?.footer_text_color || '#000',
                        minHeight: `${previewData.effective_settings?.footer_height || 40}px`,
                        position: 'relative',
                        zIndex: 1,
                      }}
                    >
                      <img
                        src={previewData.effective_settings.footer_image}
                        alt="footer"
                        style={{ width: '100%', display: 'block' }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 15px',
                        }}
                      >
                        <div className="print-content-wrapper" dangerouslySetInnerHTML={{ __html: previewData.effective_settings?.footer_text || '' }} />
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        backgroundColor: previewData.effective_settings?.footer_background_color || '#ffffff',
                        color: previewData.effective_settings?.footer_text_color || '#000',
                        padding: '10px 15px',
                        minHeight: `${previewData.effective_settings?.footer_height || 40}px`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        position: 'relative',
                        zIndex: 1,
                      }}
                    >
                      <div dangerouslySetInnerHTML={{ __html: previewData.effective_settings?.footer_text || '' }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions Area */}
              <div className="p-4 border-t bg-background shrink-0 space-y-4 max-h-[35vh] overflow-y-auto">
                {/* Context Data */}
                {previewData.context_data && Object.keys(previewData.context_data).length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Document Data</Label>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {Object.entries(previewData.context_data).map(([key, value]) => (
                        <Badge key={key} variant="outline" className="text-muted-foreground font-normal">
                          <span className="font-semibold text-foreground mr-1">{key}:</span> {String(value)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comments */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Comments <span className="text-muted-foreground font-normal">(Required for reject/return)</span></Label>
                  <textarea
                    className="w-full min-h-[60px] p-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                    value={actionComments}
                    onChange={(e) => setActionComments(e.target.value)}
                    placeholder="Add comments..."
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleAction('return')}
                    disabled={approveDocument.isPending}
                    size="sm"
                  >
                    <Undo2 className="h-4 w-4 mr-1" />
                    Return
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleAction('reject')}
                    disabled={approveDocument.isPending}
                    size="sm"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleAction('approve')}
                    disabled={approveDocument.isPending}
                    size="sm"
                  >
                    {approveDocument.isPending ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-1" />
                    )}
                    Approve
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Failed to load document preview
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrintApprovalsPage;
