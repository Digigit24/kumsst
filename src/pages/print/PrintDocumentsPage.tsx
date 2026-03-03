/**
 * Print Documents Page
 * Generate and manage print documents from templates
 */

import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileText,
  Loader2,
  Printer,
  XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
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
import { DROPDOWN_PAGE_SIZE } from '../../config/app.config';
import { useAuth } from '../../hooks/useAuth';
import {
  useCreatePrintDocument,
  useDocumentPreview,
  useMarkDocumentPrinted,
  useMyPrintDocuments,
  usePrintDocuments,
  usePrintTemplates,
  useRegeneratePdf,
} from '../../hooks/usePrint';
import { printDocumentsApi } from '../../services/print.service';
import type {
  DocumentPriority,
  DocumentStatus,
  PrintDocument,
  PrintDocumentCreateInput,
  PrintTemplate,
} from '../../types/print.types';
import { CreateDocumentForm } from './components/CreateDocumentForm';

const STATUS_CONFIG: Record<DocumentStatus, { color: string; icon: any; label: string }> = {
  draft: { color: 'secondary', icon: FileText, label: 'Draft' },
  pending_approval: { color: 'warning', icon: Clock, label: 'Pending Approval' },
  approved: { color: 'success', icon: CheckCircle, label: 'Approved' },
  rejected: { color: 'destructive', icon: XCircle, label: 'Rejected' },
  printed: { color: 'default', icon: Printer, label: 'Printed' },
  cancelled: { color: 'secondary', icon: XCircle, label: 'Cancelled' },
};

const PRIORITY_CONFIG: Record<DocumentPriority, { color: string; label: string }> = {
  low: { color: 'secondary', label: 'Low' },
  normal: { color: 'default', label: 'Normal' },
  high: { color: 'warning', label: 'High' },
  urgent: { color: 'destructive', label: 'Urgent' },
};

export const PrintDocumentsPage = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 20 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<PrintDocument | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PrintTemplate | null>(null);

  // Form state
  const [formData, setFormData] = useState<PrintDocumentCreateInput>({
    template: 0,
    title: '',
    context_data: {},
    priority: 'normal',
    internal_notes: '',
  });
  const [contextFields, setContextFields] = useState<Record<string, string>>({});

  // Permission check
  const canCreate =
    user?.userType === 'super_admin' ||
    user?.user_type === 'super_admin' ||
    user?.userType === 'principal' ||
    user?.user_type === 'principal' ||
    user?.userType === 'college_admin' ||
    user?.user_type === 'college_admin' ||
    user?.userType === 'hod' ||
    user?.user_type === 'hod';

  const isSuperAdmin =
    user?.userType === 'super_admin' || user?.user_type === 'super_admin';

  // Fetch documents - for super admin show all, for others show own
  const { data, isLoading, error, refetch } = isSuperAdmin
    ? usePrintDocuments(filters)
    : useMyPrintDocuments(filters);

  const { data: templatesData } = usePrintTemplates({ status: 'active', page_size: DROPDOWN_PAGE_SIZE });

  // Document preview
  const { data: previewData, isLoading: previewLoading } = useDocumentPreview(
    isPreviewOpen ? selectedDocument?.id || null : null
  );

  // Mutations
  const createDocument = useCreatePrintDocument();
  const regeneratePdf = useRegeneratePdf();
  const markPrinted = useMarkDocumentPrinted();

  // Extract data
  const documents: PrintDocument[] = useMemo(() => {
    if (Array.isArray(data)) return data;
    if (data?.results) return data.results;
    return [];
  }, [data]);

  const totalCount = useMemo(() => {
    if (Array.isArray(data)) return data.length;
    if (data?.count) return data.count;
    return 0;
  }, [data]);

  const templates: PrintTemplate[] = useMemo(() => {
    if (Array.isArray(templatesData)) return templatesData;
    if (templatesData?.results) return templatesData.results;
    return [];
  }, [templatesData]);

  // Table columns
  const columns: Column<PrintDocument>[] = [
    {
      key: 'reference_number',
      label: 'Reference',
      sortable: true,
      render: (doc) => (
        <div>
          <p className="font-mono text-sm">{doc.reference_number}</p>
          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{doc.title}</p>
        </div>
      ),
    },
    { key: 'template_name', label: 'Template' },
    {
      key: 'status',
      label: 'Status',
      render: (doc) => {
        const config = STATUS_CONFIG[doc.status];
        const Icon = config.icon;
        return (
          <Badge variant={config.color as any} className="flex items-center gap-1 w-fit">
            <Icon className="h-3 w-3" />
            {config.label}
          </Badge>
        );
      },
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (doc) => {
        const config = PRIORITY_CONFIG[doc.priority];
        return <Badge variant={config.color as any}>{config.label}</Badge>;
      },
    },
    { key: 'requested_by_name', label: 'Requested By' },
    {
      key: 'requested_at',
      label: 'Date',
      render: (doc) => (
        <span className="text-sm">
          {new Date(doc.requested_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'print_count',
      label: 'Prints',
      render: (doc) => <span className="text-sm">{doc.print_count}</span>,
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
    {
      name: 'priority',
      label: 'Priority',
      type: 'select',
      options: [
        { value: '', label: 'All Priorities' },
        ...Object.entries(PRIORITY_CONFIG).map(([key, value]) => ({
          value: key,
          label: value.label,
        })),
      ],
    },
  ];

  const handleAddNew = () => {
    setSelectedDocument(null);
    setSelectedTemplate(null);
    setFormData({
      template: 0,
      title: '',
      context_data: {},
      priority: 'normal',
      internal_notes: '',
    });
    setContextFields({});
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleRowClick = (doc: PrintDocument) => {
    setSelectedDocument(doc);
    setSidebarMode('view');
    setIsSidebarOpen(true);
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === parseInt(templateId));
    setSelectedTemplate(template || null);
    setFormData((prev) => ({
      ...prev,
      template: parseInt(templateId),
      title: template ? `${template.name} - ${new Date().toLocaleDateString()}` : '',
    }));

    // Initialize context fields from template variables
    if (template?.available_variables) {
      const fields: Record<string, string> = {};
      template.available_variables.forEach((v) => {
        fields[v.key] = v.sample_value || '';
      });
      setContextFields(fields);
    }
  };

  const handleContextFieldChange = (key: string, value: string) => {
    setContextFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.template || !formData.title) {
      toast.error('Please select a template and enter a title');
      return;
    }

    try {
      await createDocument.mutateAsync({
        ...formData,
        context_data: contextFields,
      });
      toast.success('Document created and sent for approval');
      setIsSidebarOpen(false);
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to create document');
    }
  };

  const handlePreview = (doc: PrintDocument) => {
    setSelectedDocument(doc);
    setIsPreviewOpen(true);
  };

  const handleBrowserPrint = async (doc: PrintDocument) => {
    if (doc.status !== 'approved' && doc.status !== 'printed') {
      toast.error('Document must be approved before printing');
      return;
    }

    // Open window immediately to avoid popup blocker
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print');
      return;
    }

    // Show loading state in the new window
    printWindow.document.write('<html><body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;"><div>Loading print view...</div></body></html>');

    try {
      const data = await printDocumentsApi.fetchPrintHtml(doc.id);
      const s = data.effective_settings;
      const m = s?.margins || { top: 10, left: 10, right: 10, bottom: 10 };

      const getPos = (x: any, y: any) => {
        if (x != null || y != null) {
          return `position: absolute; left: ${x ?? 0}%; top: ${y ?? 0}%;`;
        }
        return '';
      };

      const printHTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${data.title || doc.title || doc.reference_number || 'Document'}</title>
<style>
  @page {
    size: ${s?.paper_size || 'A4'} ${s?.orientation || 'portrait'};
    margin: 0;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: ${s?.default_font_family || 'Roboto'}, Helvetica, Arial, sans-serif;
    font-size: ${s?.default_font_size || 12}pt;
    color: #333;
    line-height: 1.6;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .page {
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    padding: ${m.top}mm ${m.right}mm ${m.bottom}mm ${m.left}mm;
    position: relative;
  }
  .watermark {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-30deg);
    pointer-events: none;
    z-index: 0;
  }
  .header { position: relative; z-index: 1; padding: 10px 0; }
  .header-with-image { position: relative; z-index: 1; }
  .header-with-image img.header-bg { width: 100%; display: block; }
  .header-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; gap: 15px; padding: 10px 15px; }
  .header-no-image { position: relative; display: flex; align-items: center; gap: 15px; padding: 10px 0; }
  .header-no-image img.logo { width: 80px; height: 50px; object-fit: contain; }
  .header-overlay img.logo { width: 80px; height: 50px; object-fit: contain; }
  .header-text { flex: 1; }
  hr.sep { border: none; margin: 0; }
  .content { flex: 1; padding: 15px 0; position: relative; z-index: 1; }
  .footer { position: relative; z-index: 1; }
  .footer-with-image { position: relative; z-index: 1; }
  .footer-with-image img.footer-bg { width: 100%; display: block; }
  .footer-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: space-between; padding: 10px 15px; }
  .footer-no-image { position: relative; display: flex; align-items: center; justify-content: space-between; padding: 10px 0; }
  ${s?.css_styles || ''}
</style>
</head>
<body>
<div class="page">
  ${s?.watermark_image ? `<div class="watermark"><img src="${s.watermark_image}" style="opacity:${s.watermark_opacity || 0.1};max-width:300px;" /></div>` : s?.watermark_text ? `<div class="watermark" style="opacity:${s.watermark_opacity || 0.1};font-size:72px;font-weight:bold;color:#9ca3af;">${s.watermark_text}</div>` : ''}
  ${s?.header_image ? `
  <div class="header-with-image" style="background-color:${s?.header_background_color || '#fff'};color:${s?.header_text_color || '#000'};min-height:${s?.header_height || 80}px;">
    <img class="header-bg" src="${s.header_image}" />
    <div class="header-overlay">
      ${s?.logo_image ? `<img class="logo" src="${s.logo_image}" style="${getPos(s.logo_x_position, s.logo_y_position)}" />` : ''}
      <div class="header-text" style="text-align:${s?.header_text_align || 'left'};${getPos(s.header_text_x_position, s.header_text_y_position)}">${s?.header_text || ''}</div>
    </div>
  </div>` : `
  <div class="header-no-image" style="background-color:${s?.header_background_color || '#fff'};color:${s?.header_text_color || '#000'};min-height:${s?.header_height || 80}px;">
    ${s?.logo_image ? `<img class="logo" src="${s.logo_image}" style="${getPos(s.logo_x_position, s.logo_y_position)}" />` : ''}
    <div class="header-text" style="text-align:${s?.header_text_align || 'left'};${getPos(s.header_text_x_position, s.header_text_y_position)}">${s?.header_text || ''}</div>
  </div>`}
  ${s?.show_header_line ? `<hr class="sep" style="border-top:1px solid ${s.header_line_color || '#000'};" />` : ''}
  <div class="content">${s?.content || data.custom_content || data.rendered_content || ''}</div>
  ${s?.show_footer_line ? `<hr class="sep" style="border-top:1px solid ${s.footer_line_color || '#000'};" />` : ''}
  ${s?.footer_image ? `
  <div class="footer-with-image" style="background-color:${s?.footer_background_color || '#fff'};color:${s?.footer_text_color || '#000'};min-height:${s?.footer_height || 40}px;">
    <img class="footer-bg" src="${s.footer_image}" />
    <div class="footer-overlay">
      <div style="${getPos(s.footer_text_x_position, s.footer_text_y_position)}">${s?.footer_text || ''}</div>
    </div>
  </div>` : `
  <div class="footer-no-image" style="background-color:${s?.footer_background_color || '#fff'};color:${s?.footer_text_color || '#000'};min-height:${s?.footer_height || 40}px;">
    <div style="${getPos(s.footer_text_x_position, s.footer_text_y_position)}">${s?.footer_text || ''}</div>
  </div>`}
</div>
<script>window.onload=function(){setTimeout(function(){window.print()},500)};<\/script>
</body>
</html>`;

      printWindow.document.open();
      printWindow.document.write(printHTML);
      printWindow.document.close();
    } catch (error) {
      printWindow.close();
      toast.error('Failed to load print view');
    }
  };

  const handleRegeneratePdf = async (doc: PrintDocument) => {
    try {
      await regeneratePdf.mutateAsync(doc.id);
      toast.success('PDF regenerated successfully');
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to regenerate PDF');
    }
  };

  const handleMarkPrinted = async (doc: PrintDocument) => {
    try {
      await markPrinted.mutateAsync(doc.id);
      toast.success('Document marked as printed');
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to mark as printed');
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <AlertCircle className="h-12 w-12 mb-4" />
        <p>Failed to load documents</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(STATUS_CONFIG).slice(0, 4).map(([status, config]) => {
          const Icon = config.icon;
          const count = documents.filter((d) => d.status === status).length;
          return (
            <Card key={status} className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setFilters((prev) => ({ ...prev, status }))}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-${config.color}/10`}>
                  <Icon className={`h-5 w-5 text-${config.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground">{config.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Data Table */}
      <DataTable<PrintDocument>
        title="Print Documents"
        description="Generate and manage printed documents"
        onRefresh={() => refetch()}
        onAdd={canCreate ? handleAddNew : undefined}
        addButtonLabel="Create Document"
        data={data}
        columns={columns}
        isLoading={isLoading}
        onRowClick={handleRowClick}
        actions={(doc: PrintDocument) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handlePreview(doc);
              }}
              title="Preview"
            >
              <Eye className="h-4 w-4" />
            </Button>
            {(doc.status === 'approved' || doc.status === 'printed') && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBrowserPrint(doc);
                  }}
                  title="Print"
                >
                  <Printer className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBrowserPrint(doc);
                  }}
                  title="Save as PDF"
                >
                  <Download className="h-4 w-4" />
                </Button>
                {doc.status === 'approved' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkPrinted(doc);
                    }}
                    title="Mark as Printed"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                )}
              </>
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
            ? 'Create Document'
            : selectedDocument?.title || 'Document Details'
        }
        subtitle={
          sidebarMode === 'create'
            ? 'Generate a new document from a template'
            : selectedDocument?.reference_number
        }
      >
        {sidebarMode === 'view' && selectedDocument ? (
          <div className="space-y-6">
            {/* Status & Priority */}
            <div className="flex items-center gap-2">
              <Badge variant={STATUS_CONFIG[selectedDocument.status].color as any} className="flex items-center gap-1">
                {(() => { const Icon = STATUS_CONFIG[selectedDocument.status].icon; return <Icon className="h-3 w-3" />; })()}
                {STATUS_CONFIG[selectedDocument.status].label}
              </Badge>
              <Badge variant={PRIORITY_CONFIG[selectedDocument.priority].color as any}>
                {PRIORITY_CONFIG[selectedDocument.priority].label}
              </Badge>
            </div>

            {/* Document Info */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Template</Label>
                  <p className="font-medium">{selectedDocument.template_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Print Count</Label>
                  <p className="font-medium">{selectedDocument.print_count}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Requested By</Label>
                  <p className="font-medium">{selectedDocument.requested_by_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Requested At</Label>
                  <p className="font-medium">{new Date(selectedDocument.requested_at).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Context Data */}
            {selectedDocument.context_data && Object.keys(selectedDocument.context_data).length > 0 && (
              <div>
                <Label className="text-muted-foreground">Document Data</Label>
                <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                  {Object.entries(selectedDocument.context_data).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-muted-foreground">{key}: </span>
                      <span className="font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => handlePreview(selectedDocument)}>
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
              {(selectedDocument.status === 'approved' || selectedDocument.status === 'printed') && (
                <>
                  <Button variant="outline" onClick={() => handleBrowserPrint(selectedDocument)}>
                    <Printer className="h-4 w-4 mr-1" />
                    Print
                  </Button>
                  <Button variant="outline" onClick={() => handleBrowserPrint(selectedDocument)}>
                    <Download className="h-4 w-4 mr-1" />
                    Save as PDF
                  </Button>
                </>
              )}
              {selectedDocument.status === 'approved' && (
                <Button onClick={() => handleMarkPrinted(selectedDocument)}>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark as Printed
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <CreateDocumentForm
              formData={formData}
              setFormData={setFormData}
              templates={templates}
              selectedTemplate={selectedTemplate}
              contextFields={contextFields}
              onTemplateSelect={handleTemplateSelect}
              onContextFieldChange={handleContextFieldChange}
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
                disabled={createDocument.isPending}
              >
                {createDocument.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                Create & Submit
              </Button>
            </div>
          </div>
        )}
      </DetailSidebar>

      {/* Preview Dialog - Full-screen like approvals page */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-7xl h-[95vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Preview
              {selectedDocument && (
                <Badge variant={STATUS_CONFIG[selectedDocument.status].color as any} className="ml-2">
                  {STATUS_CONFIG[selectedDocument.status].label}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedDocument?.reference_number} - {selectedDocument?.title}
            </DialogDescription>
          </DialogHeader>

          {previewLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : previewData ? (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Document Info Bar */}
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

              {/* Document Preview - Scrollable A4 */}
              <div className="flex-1 overflow-y-auto bg-gray-100/50 p-6 flex justify-center">
                <div
                  className="bg-white shadow-lg relative flex flex-col shrink-0 transition-all duration-200 ease-in-out"
                  style={{
                    width: '210mm',
                    minHeight: '297mm',
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

                  {/* Header Line */}
                  {previewData.effective_settings?.show_header_line && (
                    <hr style={{ border: 'none', borderTop: `1px solid ${previewData.effective_settings.header_line_color || '#000'}`, margin: '0' }} />
                  )}

                  {/* Content */}
                  <div
                    className="print-content-wrapper"
                    style={{ padding: '15px 0', flex: 1, position: 'relative', zIndex: 1 }}
                    dangerouslySetInnerHTML={{ __html: previewData.effective_settings?.content || previewData.custom_content || previewData.rendered_content }}
                  />

                  {/* Footer Line */}
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

              {/* Bottom Actions */}
              <div className="p-4 border-t bg-background shrink-0">
                <div className="flex justify-end gap-2">
                  {selectedDocument && (selectedDocument.status === 'approved' || selectedDocument.status === 'printed') && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBrowserPrint(selectedDocument)}
                      >
                        <Printer className="h-4 w-4 mr-1" />
                        Print
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBrowserPrint(selectedDocument)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Save as PDF
                      </Button>
                      {selectedDocument.status === 'approved' && (
                        <Button
                          size="sm"
                          onClick={() => handleMarkPrinted(selectedDocument)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark as Printed
                        </Button>
                      )}
                    </>
                  )}
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

export default PrintDocumentsPage;
