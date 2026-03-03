import {
  ArrowLeft,
  Eye,
  FileText,
  Image as ImageIcon,
  Info,
  LayoutTemplate,
  Loader2,
  PanelBottom,
  PanelTop,
  Save,
  Stamp,
  Trash2
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import HybridEditor from '../../components/common/HybridEditor';
import { DocumentPreview } from '../../components/print/DocumentPreview'; // Named export
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Separator } from '../../components/ui/separator';
import { Slider } from '../../components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

import { DROPDOWN_PAGE_SIZE } from '../../config/app.config';
import {
  useCreatePrintDocument,
  useCreatePrintTemplate,
  usePrintTemplateDetail,
  usePrintTemplates,
  useTemplateCategories,
  useUpdatePrintTemplate,
} from '../../hooks/usePrint';
import {
  PaperSize,
  PrintDocumentCreateInput,
  PrintTemplateCreateInput
} from '../../types/print.types';

// Default configuration for new templates
const DEFAULT_CONFIG: Partial<PrintTemplateCreateInput> = {
  paper_size: 'A4',
  orientation: 'portrait',
  margins: { top: 10, bottom: 10, left: 10, right: 10 },
  header_height: 100,
  footer_height: 60,
  header_background_color: '#ffffff',
  header_text_color: '#000000',
  header_line_color: '#000000',
  header_line_style: 'partial',
  header_layout: 'side-by-side',
  header_text_align: 'left',
  footer_background_color: '#ffffff',
  footer_text_color: '#000000',
  footer_line_color: '#000000',
  footer_line_style: 'partial',
  show_header_line: true,
  show_footer_line: true,
  show_page_numbers: true,
  default_font_family: 'Roboto',
  default_font_size: 12,
  watermark_opacity: 0.1,
  content: '<h1 style="text-align: center;">Certificate of Achievement</h1><p style="text-align: center;">This is to certify that...</p>',
  status: 'active',
  is_default: false,
};

const FONTS = [
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Raleway',
  'Merriweather',
  'Playfair Display',
  'Arial',
  'Times New Roman',
  'Courier New',
];

export const PrintConfigurationPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  // Hooks
  const { data: templateData, isLoading: isLoadingTemplate } = usePrintTemplateDetail(id ? Number(id) : null);
  const { data: categories } = useTemplateCategories();
  const { data: approvedTemplates } = usePrintTemplates({ status: 'active', page_size: DROPDOWN_PAGE_SIZE });

  const createTemplate = useCreatePrintTemplate();
  const updateTemplate = useUpdatePrintTemplate();
  const createDocument = useCreatePrintDocument();

  // Form State
  const [activeTab, setActiveTab] = useState('meta');
  const [formData, setFormData] = useState<Partial<PrintTemplateCreateInput>>(DEFAULT_CONFIG);

  // Ref for file inputs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const headerImageInputRef = useRef<HTMLInputElement>(null);
  const footerImageInputRef = useRef<HTMLInputElement>(null);
  const watermarkImageInputRef = useRef<HTMLInputElement>(null);

  // Initialize form when template data loads
  useEffect(() => {
    if (templateData && isEditMode) {
      const mappedData: Partial<PrintTemplateCreateInput> = {
        ...templateData,
        margins: typeof templateData.margins === 'string' ? JSON.parse(templateData.margins) : templateData.margins,
      };
      setFormData(mappedData);
    }
  }, [templateData, isEditMode]);

  // Handlers
  const handleInputChange = (field: keyof PrintTemplateCreateInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDragUpdate = (updates: Partial<PrintTemplateCreateInput>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleImageUpload = (field: keyof PrintTemplateCreateInput, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleInputChange(field, file);
    }
  };

  const removeImage = (field: keyof PrintTemplateCreateInput) => {
    handleInputChange(field, null);
    if (field === 'logo_image' && logoInputRef.current) logoInputRef.current.value = '';
    if (field === 'header_image' && headerImageInputRef.current) headerImageInputRef.current.value = '';
    if (field === 'footer_image' && footerImageInputRef.current) footerImageInputRef.current.value = '';
    if (field === 'watermark_image' && watermarkImageInputRef.current) watermarkImageInputRef.current.value = '';
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('Template Name is required');
      return;
    }
    if (!formData.category) {
      toast.error('Category is required');
      return;
    }

    try {
      if (isEditMode) {
        const payload: PrintDocumentCreateInput = {
          template: Number(id),
          title: formData.name || 'Untitled Document',
          context_data: {},
          custom_content: formData.content,
          priority: 'normal',
          generate_pdf: true,
          // Logo overrides
          custom_logo_image: formData.logo_image,
          custom_logo_position: formData.logo_position,
          custom_logo_x_position: formData.logo_x_position,
          custom_logo_y_position: formData.logo_y_position,
          // Header overrides
          custom_header: formData.header_text,
          custom_header_text: formData.header_text,
          custom_header_image: formData.header_image,
          custom_header_background_color: formData.header_background_color,
          custom_header_text_color: formData.header_text_color,
          custom_header_line_color: formData.header_line_color,
          custom_header_height: formData.header_height,
          custom_header_text_align: formData.header_text_align,
          custom_header_text_x_position: formData.header_text_x_position,
          custom_header_text_y_position: formData.header_text_y_position,
          custom_show_header_line: formData.show_header_line,
          // Footer overrides
          custom_footer: formData.footer_text,
          custom_footer_text: formData.footer_text,
          custom_footer_image: formData.footer_image,
          custom_footer_background_color: formData.footer_background_color,
          custom_footer_text_color: formData.footer_text_color,
          custom_footer_line_color: formData.footer_line_color,
          custom_footer_height: formData.footer_height,
          custom_footer_text_x_position: formData.footer_text_x_position,
          custom_footer_text_y_position: formData.footer_text_y_position,
          custom_show_footer_line: formData.show_footer_line,
          // Watermark overrides
          custom_watermark_text: formData.watermark_text,
          custom_watermark_image: formData.watermark_image,
          custom_watermark_opacity: formData.watermark_opacity,
          // Font overrides
          custom_default_font_family: formData.default_font_family,
          custom_default_font_size: formData.default_font_size,
        };

        await createDocument.mutateAsync(payload);
        toast.success('Document saved successfully');
      } else {
        await createTemplate.mutateAsync(formData as PrintTemplateCreateInput);
        toast.success('Template created successfully');
        navigate('/print/templates');
      }
    } catch (error) {
      toast.error('Failed to save');
    }
  };

  // Helper to get image URL for preview
  const getImageUrl = (field: keyof PrintTemplateCreateInput) => {
    const val = formData[field];
    if (!val) return null;
    if (typeof val === 'string') return val;
    if (val instanceof File) return URL.createObjectURL(val);
    return null;
  };

  if (isLoadingTemplate) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  const handleFullPreview = () => {
    const previewWindow = window.open('', '_blank');
    if (!previewWindow) return;

    // Resolve image URLs for the preview
    const logoUrl = getImageUrl('logo_image');
    const headerImageUrl = getImageUrl('header_image');
    const footerImageUrl = getImageUrl('footer_image');
    const watermarkImageUrl = getImageUrl('watermark_image');

    // Paper dimensions
    const paperDimensions: Record<string, { width: string; height: string }> = {
      A4: { width: '210mm', height: '297mm' },
      A5: { width: '148mm', height: '210mm' },
      Letter: { width: '216mm', height: '279mm' },
      Legal: { width: '216mm', height: '356mm' },
    };
    const paper = paperDimensions[formData.paper_size || 'A4'] || paperDimensions.A4;
    const isLandscape = formData.orientation === 'landscape';
    const pageWidth = isLandscape ? paper.height : paper.width;
    const pageHeight = isLandscape ? paper.width : paper.height;

    // Margins
    const margins = (formData.margins as any) || { top: 10, bottom: 10, left: 10, right: 10 };

    // Font
    const fontFamily = formData.default_font_family || 'Arial, sans-serif';
    const fontSize = formData.default_font_size || 12;

    // Header settings
    const headerHeight = formData.header_height || 100;
    const headerBgColor = formData.header_background_color || '#ffffff';
    const headerTextColor = formData.header_text_color || '#000000';
    const headerLineColor = formData.header_line_color || '#000000';
    const headerLayout = formData.header_layout || 'side-by-side';

    // Logo positioning
    const useCustomLogoPosition = (formData.logo_x_position != null) || (formData.logo_y_position != null);
    const logoXPos = formData.logo_x_position ?? 50;
    const logoYPos = formData.logo_y_position ?? 50;
    const logoPosition = formData.logo_position || 'left';
    const logoAlignMap: Record<string, string> = { left: 'flex-start', center: 'center', right: 'flex-end' };
    const logoAlign = logoAlignMap[logoPosition] || 'flex-start';

    // Header text positioning
    const useCustomHeaderTextPosition = (formData.header_text_x_position != null) || (formData.header_text_y_position != null);
    const headerTextXPos = formData.header_text_x_position ?? 50;
    const headerTextYPos = formData.header_text_y_position ?? 50;
    const headerTextAlign = formData.header_text_align || 'left';

    // Footer settings
    const footerHeight = formData.footer_height || 60;
    const footerBgColor = formData.footer_background_color || '#ffffff';
    const footerTextColor = formData.footer_text_color || '#4b5563';
    const footerLineColor = formData.footer_line_color || '#9ca3af';

    // Footer text positioning
    const useCustomFooterTextPosition = (formData.footer_text_x_position != null) || (formData.footer_text_y_position != null);
    const footerTextXPos = formData.footer_text_x_position ?? 50;
    const footerTextYPos = formData.footer_text_y_position ?? 50;

    // Watermark
    const watermarkOpacity = formData.watermark_opacity ?? 0.1;

    // Logo size
    const logoW = formData.logo_width;
    const logoH = formData.logo_height;
    const logoSizeStyle = [
      logoW ? `width: ${logoW}px;` : 'max-width: 120px;',
      logoH ? `height: ${logoH}px;` : `max-height: ${headerHeight - 20}px;`,
      'object-fit: contain;',
    ].join(' ');

    // Build logo HTML
    let logoHTML = '';
    if (logoUrl) {
      if (useCustomLogoPosition) {
        logoHTML = `<div style="position: absolute; left: ${logoXPos}%; top: ${logoYPos}%; transform: translate(-50%, -50%);">
          <img src="${logoUrl}" alt="Logo" style="${logoSizeStyle}" />
        </div>`;
      } else {
        const logoContainerStyle = headerLayout === 'stacked'
          ? `display: flex; justify-content: ${logoAlign}; margin-bottom: 4px;`
          : 'flex-shrink: 0;';
        logoHTML = `<div style="${logoContainerStyle}">
          <img src="${logoUrl}" alt="Logo" style="${logoSizeStyle}" />
        </div>`;
      }
    }

    // Build header text HTML
    let headerTextHTML = '';
    if (formData.header_text) {
      if (useCustomHeaderTextPosition) {
        headerTextHTML = `<div style="position: absolute; left: ${headerTextXPos}%; top: ${headerTextYPos}%; transform: translate(-50%, -50%); color: ${headerTextColor}; font-size: ${fontSize * 1.1}px; line-height: 1.3;">
          ${formData.header_text}
        </div>`;
      } else {
        const headerTextStyle = headerLayout === 'side-by-side'
          ? `flex: 1; text-align: ${headerTextAlign};`
          : `text-align: center;`;
        headerTextHTML = `<div style="${headerTextStyle} color: ${headerTextColor}; font-size: ${fontSize * 1.1}px; line-height: 1.3;">
          ${formData.header_text}
        </div>`;
      }
    }

    // Build header background image HTML
    const headerBgImageHTML = headerImageUrl
      ? `<img src="${headerImageUrl}" alt="" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; object-position: center;" />`
      : '';

    // Build footer background image HTML
    const footerBgImageHTML = footerImageUrl
      ? `<img src="${footerImageUrl}" alt="" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; object-position: center;" />`
      : '';

    // Build footer text HTML
    let footerTextHTML = '';
    if (formData.footer_text) {
      if (useCustomFooterTextPosition) {
        footerTextHTML = `<div style="position: absolute; left: ${footerTextXPos}%; top: ${footerTextYPos}%; transform: translate(-50%, -50%); color: ${footerTextColor}; font-size: ${fontSize * 0.85}px; line-height: 1.3;">
          ${formData.footer_text}
        </div>`;
      } else {
        footerTextHTML = `<div style="flex: 1; color: ${footerTextColor}; font-size: ${fontSize * 0.85}px; line-height: 1.3;">
          ${formData.footer_text}
        </div>`;
      }
    }

    // Page numbers
    const pageNumbersHTML = formData.show_page_numbers && !useCustomFooterTextPosition
      ? `<div style="flex-shrink: 0; margin-left: 8px; color: ${footerTextColor}; font-size: ${fontSize * 0.8}px;">Page 1 of 1</div>`
      : '';

    // Watermark HTML
    let watermarkHTML = '';
    if (formData.watermark_text || watermarkImageUrl) {
      const watermarkContent = watermarkImageUrl
        ? `<img src="${watermarkImageUrl}" alt="Watermark" style="max-width: 80%; max-height: 80%; object-fit: contain;" />`
        : `<span style="font-size: 72px; font-weight: bold; color: #9ca3af; letter-spacing: 0.15em; white-space: nowrap;">${formData.watermark_text}</span>`;
      watermarkHTML = `<div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; z-index: 10; opacity: ${watermarkOpacity}; overflow: hidden;">
        <div style="transform: rotate(-45deg);">${watermarkContent}</div>
      </div>`;
    }

    // Header layout container style
    const headerContentStyle = headerLayout === 'side-by-side'
      ? 'position: relative; z-index: 1; height: 100%; display: flex; align-items: center; gap: 12px;'
      : 'position: relative; z-index: 1; height: 100%; display: flex; flex-direction: column; justify-content: center;';

    const previewHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print Preview - ${formData.name || 'Document'}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: '${fontFamily}', Arial, sans-serif;
            font-size: ${fontSize}px;
            background: #f3f4f6;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            min-height: 100vh;
          }
          .page {
            position: relative;
            background: white;
            width: ${pageWidth};
            min-height: ${pageHeight};
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
          .header {
            position: relative;
            background-color: ${headerBgColor};
            padding: 10px ${margins.left}mm;
            height: ${headerHeight}px;
            flex-shrink: 0;
            overflow: hidden;
          }
          .header-line {
            height: 2px;
            background-color: ${headerLineColor};
            margin: 0 ${formData.header_line_style === 'full' ? '0' : `${margins.left}mm`};
            flex-shrink: 0;
          }
          .content {
            flex: 1;
            padding: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm;
          }
          .content img {
            max-width: 100%;
          }
          .content table {
            border-collapse: collapse;
            width: 100%;
          }
          .content table td, .content table th {
            border: 1px solid #d1d5db;
            padding: 6px 8px;
          }
          .footer-line {
            height: 2px;
            background-color: ${footerLineColor};
            margin: 0 ${formData.footer_line_style === 'full' ? '0' : `${margins.left}mm`};
            flex-shrink: 0;
          }
          .footer {
            position: relative;
            background-color: ${footerBgColor};
            padding: 8px ${margins.left}mm;
            height: ${footerHeight}px;
            flex-shrink: 0;
            overflow: hidden;
          }
          .footer-content {
            position: relative;
            z-index: 1;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          @media print {
            body { background: white; padding: 0; }
            .page { box-shadow: none; margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="page">
          ${watermarkHTML}
          <div class="header">
            ${headerBgImageHTML}
            <div style="${headerContentStyle}">
              ${logoHTML}
              ${headerTextHTML}
            </div>
          </div>
          ${formData.show_header_line ? '<div class="header-line"></div>' : ''}
          <div class="content">
            ${formData.content || '<p>No content</p>'}
          </div>
          ${formData.show_footer_line ? '<div class="footer-line"></div>' : ''}
          <div class="footer">
            ${footerBgImageHTML}
            <div class="footer-content">
              ${footerTextHTML}
              ${pageNumbersHTML}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    previewWindow.document.write(previewHTML);
    previewWindow.document.close();
  };

  return (
    <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-[1600px]">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/print/templates')} className="hover:bg-primary/10 shrink-0">
            <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" /> Back
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 truncate">
              {isEditMode ? 'Edit Document' : 'Create Document'}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 hidden sm:block">Configure your print template settings</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Template Selector Dropdown */}
          <div className="w-full sm:w-auto sm:min-w-[200px] lg:min-w-[260px]">
            <Select
              value={approvedTemplates?.results?.some(t => String(t.id) === id) ? id : ""}
              onValueChange={(val) => navigate(`/print/templates/${val}/edit`)}
            >
              <SelectTrigger className="bg-white dark:bg-slate-950 dark:border-slate-800 w-full">
                <SelectValue placeholder="Select a template to edit..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new_template_placeholder" disabled className="hidden">Select a template...</SelectItem>
                {approvedTemplates?.results?.length === 0 ? (
                  <SelectItem value="no_templates" disabled>
                    No template found create template first
                  </SelectItem>
                ) : (
                  approvedTemplates?.results?.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" size="sm" onClick={handleFullPreview} className="bg-white hover:bg-blue-50 border-blue-200 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700">
            <Eye className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Full Preview</span>
          </Button>
          <Button size="sm" onClick={handleSave} disabled={createTemplate.isPending || updateTemplate.isPending || createDocument.isPending} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
            <Save className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">{isEditMode ? 'Save Document' : 'Save Template'}</span><span className="sm:hidden">Save</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 xl:gap-6 xl:h-[calc(100vh-200px)]">

        {/* LEFT COLUMN: Controls & Editor */}
        <div className="col-span-1 xl:col-span-5 h-auto xl:h-full bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-950 dark:to-slate-900/30 rounded-xl border-2 border-blue-100 dark:border-slate-800 p-3 sm:p-6 shadow-lg flex flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col space-y-4">
            <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 p-1 border border-blue-100 dark:border-slate-700 shrink-0">
              <TabsTrigger value="meta" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-xs sm:text-sm"><span className="sm:hidden">Meta</span><span className="hidden sm:inline">Meta & Layout</span></TabsTrigger>
              <TabsTrigger value="design" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-xs sm:text-sm">Branding</TabsTrigger>
              <TabsTrigger value="content" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-xs sm:text-sm">Content</TabsTrigger>
            </TabsList>

            {/* TAB: META & LAYOUT */}
            <TabsContent value="meta" className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
              <Card className="border-t-4 border-t-blue-600 shadow-md hover:shadow-lg transition-shadow dark:bg-slate-950 dark:border-slate-800">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900/20 pb-4">
                  <CardTitle className="text-lg flex items-center gap-2 dark:text-gray-100">
                    <LayoutTemplate className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {/* Template Details Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      <FileText className="h-4 w-4" /> Template Details
                    </div>

                    <div className="grid gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Template Name <span className="text-red-500">*</span></Label>
                        <Input
                          value={formData.name || ''}
                          onChange={e => handleInputChange('name', e.target.value)}
                          placeholder="e.g., Merit Certificate"
                          className="font-medium focus-visible:ring-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-muted-foreground">Code</Label>
                          <Input
                            value={formData.code || ''}
                            onChange={e => handleInputChange('code', e.target.value)}
                            placeholder="CERT-001"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-muted-foreground">Category <span className="text-red-500">*</span></Label>
                          <Select value={String(formData.category || '')} onValueChange={v => handleInputChange('category', Number(v))}>
                            <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                            <SelectContent>
                              {categories?.results?.map(cat => (
                                <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Description</Label>
                        <Input
                          value={formData.description || ''}
                          onChange={e => handleInputChange('description', e.target.value)}
                          placeholder="Brief description of this template..."
                        />
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-slate-100 dark:bg-slate-800" />

                  {/* Paper Settings Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      <LayoutTemplate className="h-4 w-4" /> Paper Settings
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Paper Size</Label>
                        <Select value={formData.paper_size} onValueChange={(v: PaperSize) => handleInputChange('paper_size', v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A4">A4 (210 x 297 mm)</SelectItem>
                            <SelectItem value="Letter">Letter (8.5 x 11 in)</SelectItem>
                            <SelectItem value="Legal">Legal (8.5 x 14 in)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Orientation</Label>
                        <Select value={formData.orientation || 'portrait'} onValueChange={v => handleInputChange('orientation', v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="portrait">Portrait</SelectItem>
                            <SelectItem value="landscape">Landscape</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Default Font Family</Label>
                      <Select value={formData.default_font_family} onValueChange={v => handleInputChange('default_font_family', v)}>
                        <SelectTrigger className="font-sans"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {FONTS.map(f => <SelectItem key={f} value={f} style={{ fontFamily: f }}>{f}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: BRANDING */}
            <TabsContent value="design" className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-6 pt-1">

              {/* LOGO CARD */}
              <Card className="shadow-sm border-l-4 border-l-indigo-500 hover:shadow-md transition-all dark:bg-slate-950 dark:border-slate-800 dark:border-l-indigo-500">
                <CardHeader className="pb-3 border-b bg-slate-50/50 dark:bg-slate-900/20">
                  <CardTitle className="text-base font-bold flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                    <div className="p-1.5 rounded-md bg-indigo-100 dark:bg-indigo-900/30">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                    Logo & Identity
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="flex flex-col gap-3">
                    <Label className="text-sm font-medium">Upload Logo</Label>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <Input
                          ref={logoInputRef}
                          type="file"
                          accept="image/*"
                          className="pl-10 text-xs cursor-pointer file:text-indigo-600 file:font-semibold hover:file:bg-indigo-50"
                          onChange={(e) => handleImageUpload('logo_image', e)}
                        />
                        <ImageIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      </div>
                      {formData.logo_image && (
                        <Button variant="ghost" size="icon" onClick={() => removeImage('logo_image')} className="text-red-500 hover:text-red-700 hover:bg-red-50 h-9 w-9 shrink-0">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 bg-blue-50/50 dark:bg-blue-900/10 p-2 rounded text-blue-600 dark:text-blue-400">
                      <Info className="h-3 w-3" />
                      Click the logo in preview to select it, then drag corners to resize. Drag to reposition.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* HEADER CARD */}
              <Card className="shadow-sm border-l-4 border-l-orange-500 hover:shadow-md transition-all dark:bg-slate-950 dark:border-slate-800 dark:border-l-orange-500">
                <CardHeader className="pb-3 border-b bg-slate-50/50 dark:bg-slate-900/20">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold flex items-center gap-2 text-orange-700 dark:text-orange-400">
                      <div className="p-1.5 rounded-md bg-orange-100 dark:bg-orange-900/30">
                        <PanelTop className="h-4 w-4" />
                      </div>
                      Header Configuration
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs font-medium text-muted-foreground">Height (px)</Label>
                      <Input type="number" className="h-8 w-20 text-xs text-right" value={formData.header_height} onChange={e => handleInputChange('header_height', Number(e.target.value))} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-5">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">Background Color</Label>
                      <div className="flex items-center gap-2 p-1 border rounded-md bg-white dark:bg-slate-900">
                        <div className="h-6 w-8 rounded border shadow-sm flex-shrink-0 transition-colors" style={{ backgroundColor: formData.header_background_color }} />
                        <Input type="color" className="p-0 border-0 h-6 flex-1 cursor-pointer bg-transparent" value={formData.header_background_color} onChange={e => handleInputChange('header_background_color', e.target.value)} />
                        <span className="text-xs font-mono text-muted-foreground px-1">{formData.header_background_color}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">Text Color</Label>
                      <div className="flex items-center gap-2 p-1 border rounded-md bg-white dark:bg-slate-900">
                        <div className="h-6 w-8 rounded border shadow-sm flex-shrink-0 transition-colors" style={{ backgroundColor: formData.header_text_color }} />
                        <Input type="color" className="p-0 border-0 h-6 flex-1 cursor-pointer bg-transparent" value={formData.header_text_color} onChange={e => handleInputChange('header_text_color', e.target.value)} />
                        <span className="text-xs font-mono text-muted-foreground px-1">{formData.header_text_color}</span>
                      </div>
                    </div>
                  </div>

                  {/* Header Line Settings */}
                  <div className="space-y-3 p-3 bg-orange-50/50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-900/20">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium text-muted-foreground">Header Line</Label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <span className="text-xs text-muted-foreground">{formData.show_header_line ? 'Visible' : 'Hidden'}</span>
                        <input
                          type="checkbox"
                          checked={formData.show_header_line ?? true}
                          onChange={e => handleInputChange('show_header_line', e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                      </label>
                    </div>
                    {formData.show_header_line && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-[11px] text-muted-foreground">Line Color</Label>
                          <div className="flex items-center gap-2 p-1 border rounded-md bg-white dark:bg-slate-900">
                            <div className="h-5 w-6 rounded border shadow-sm flex-shrink-0" style={{ backgroundColor: formData.header_line_color }} />
                            <Input type="color" className="p-0 border-0 h-5 flex-1 cursor-pointer bg-transparent" value={formData.header_line_color} onChange={e => handleInputChange('header_line_color', e.target.value)} />
                            <span className="text-[10px] font-mono text-muted-foreground">{formData.header_line_color}</span>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[11px] text-muted-foreground">Line Style</Label>
                          <div className="flex gap-1">
                            <button
                              className={`flex-1 text-[10px] py-1.5 px-2 rounded border transition-all ${formData.header_line_style === 'partial' || !formData.header_line_style ? 'bg-orange-500 text-white border-orange-500' : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 hover:bg-orange-50'}`}
                              onClick={() => handleInputChange('header_line_style', 'partial')}
                            >
                              Partial
                            </button>
                            <button
                              className={`flex-1 text-[10px] py-1.5 px-2 rounded border transition-all ${formData.header_line_style === 'full' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 hover:bg-orange-50'}`}
                              onClick={() => handleInputChange('header_line_style', 'full')}
                            >
                              Full Width
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">Header Content</Label>
                    <HybridEditor value={formData.header_text || ''} onChange={v => handleInputChange('header_text', v)} minHeight="120px" placeholder="Enter company name, address, etc..." variant="compact" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">Header Image / Banner (Optional)</Label>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <Input ref={headerImageInputRef} type="file" accept="image/*" className="pl-10 text-xs" onChange={(e) => handleImageUpload('header_image', e)} />
                        <ImageIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      </div>
                      {formData.header_image && (
                        <Button variant="ghost" size="icon" onClick={() => removeImage('header_image')} className="text-red-500 bg-red-50 hover:bg-red-100 h-9 w-9 shrink-0">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FOOTER CARD */}
              <Card className="shadow-sm border-l-4 border-l-emerald-500 hover:shadow-md transition-all dark:bg-slate-950 dark:border-slate-800 dark:border-l-emerald-500">
                <CardHeader className="pb-3 border-b bg-slate-50/50 dark:bg-slate-900/20">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                      <div className="p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30">
                        <PanelBottom className="h-4 w-4" />
                      </div>
                      Footer Configuration
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs font-medium text-muted-foreground">Height (px)</Label>
                      <Input type="number" className="h-8 w-20 text-xs text-right" value={formData.footer_height} onChange={e => handleInputChange('footer_height', Number(e.target.value))} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-5">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">Background Color</Label>
                      <div className="flex items-center gap-2 p-1 border rounded-md bg-white dark:bg-slate-900">
                        <div className="h-6 w-8 rounded border shadow-sm flex-shrink-0 transition-colors" style={{ backgroundColor: formData.footer_background_color }} />
                        <Input type="color" className="p-0 border-0 h-6 flex-1 cursor-pointer bg-transparent" value={formData.footer_background_color} onChange={e => handleInputChange('footer_background_color', e.target.value)} />
                        <span className="text-xs font-mono text-muted-foreground px-1">{formData.footer_background_color}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">Text Color</Label>
                      <div className="flex items-center gap-2 p-1 border rounded-md bg-white dark:bg-slate-900">
                        <div className="h-6 w-8 rounded border shadow-sm flex-shrink-0 transition-colors" style={{ backgroundColor: formData.footer_text_color }} />
                        <Input type="color" className="p-0 border-0 h-6 flex-1 cursor-pointer bg-transparent" value={formData.footer_text_color} onChange={e => handleInputChange('footer_text_color', e.target.value)} />
                        <span className="text-xs font-mono text-muted-foreground px-1">{formData.footer_text_color}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Line Settings */}
                  <div className="space-y-3 p-3 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-lg border border-emerald-100 dark:border-emerald-900/20">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium text-muted-foreground">Footer Line</Label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <span className="text-xs text-muted-foreground">{formData.show_footer_line ? 'Visible' : 'Hidden'}</span>
                        <input
                          type="checkbox"
                          checked={formData.show_footer_line ?? true}
                          onChange={e => handleInputChange('show_footer_line', e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </label>
                    </div>
                    {formData.show_footer_line && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-[11px] text-muted-foreground">Line Color</Label>
                          <div className="flex items-center gap-2 p-1 border rounded-md bg-white dark:bg-slate-900">
                            <div className="h-5 w-6 rounded border shadow-sm flex-shrink-0" style={{ backgroundColor: formData.footer_line_color }} />
                            <Input type="color" className="p-0 border-0 h-5 flex-1 cursor-pointer bg-transparent" value={formData.footer_line_color} onChange={e => handleInputChange('footer_line_color', e.target.value)} />
                            <span className="text-[10px] font-mono text-muted-foreground">{formData.footer_line_color}</span>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[11px] text-muted-foreground">Line Style</Label>
                          <div className="flex gap-1">
                            <button
                              className={`flex-1 text-[10px] py-1.5 px-2 rounded border transition-all ${formData.footer_line_style === 'partial' || !formData.footer_line_style ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 hover:bg-emerald-50'}`}
                              onClick={() => handleInputChange('footer_line_style', 'partial')}
                            >
                              Partial
                            </button>
                            <button
                              className={`flex-1 text-[10px] py-1.5 px-2 rounded border transition-all ${formData.footer_line_style === 'full' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 hover:bg-emerald-50'}`}
                              onClick={() => handleInputChange('footer_line_style', 'full')}
                            >
                              Full Width
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">Footer Content</Label>
                    <HybridEditor value={formData.footer_text || ''} onChange={v => handleInputChange('footer_text', v)} minHeight="100px" placeholder="Enter page numbers, contact info, etc..." variant="compact" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">Footer Image (Optional)</Label>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <Input ref={footerImageInputRef} type="file" accept="image/*" className="pl-10 text-xs" onChange={(e) => handleImageUpload('footer_image', e)} />
                        <ImageIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      </div>
                      {formData.footer_image && (
                        <Button variant="ghost" size="icon" onClick={() => removeImage('footer_image')} className="text-red-500 bg-red-50 hover:bg-red-100 h-9 w-9 shrink-0">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* WATERMARK CARD */}
              <Card className="shadow-sm border-l-4 border-l-slate-500 hover:shadow-md transition-all dark:bg-slate-950 dark:border-slate-800 dark:border-l-slate-500">
                <CardHeader className="pb-3 border-b bg-slate-50/50 dark:bg-slate-900/20">
                  <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-700 dark:text-slate-400">
                    <div className="p-1.5 rounded-md bg-slate-200 dark:bg-slate-800">
                      <Stamp className="h-4 w-4" />
                    </div>
                    Watermark Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">Watermark Text (Optional)</Label>
                    <Input
                      value={formData.watermark_text || ''}
                      onChange={e => handleInputChange('watermark_text', e.target.value)}
                      placeholder="e.g. DUPLICATE"
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">Watermark Image</Label>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <Input ref={watermarkImageInputRef} type="file" accept="image/*" className="pl-10 text-xs" onChange={e => handleImageUpload('watermark_image', e)} />
                        <ImageIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      </div>
                      {formData.watermark_image && (
                        <Button variant="ghost" size="icon" onClick={() => removeImage('watermark_image')} className="text-red-500 bg-red-50 hover:bg-red-100 h-9 w-9 shrink-0">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex justify-between items-end">
                      <Label className="text-xs font-medium text-muted-foreground">Opacity Level</Label>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{Math.round((formData.watermark_opacity || 0.1) * 100)}%</span>
                    </div>
                    <Slider
                      value={[formData.watermark_opacity || 0.1]}
                      max={1}
                      step={0.05}
                      onValueChange={([v]) => handleInputChange('watermark_opacity', v)}
                      className="py-1"
                    />
                    <p className="text-[10px] text-muted-foreground">Adjust transparency of the watermark image.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: CONTENT */}
            <TabsContent value="content" className="flex-1 overflow-hidden flex flex-col p-1">
              <Card className="flex-1 flex flex-col border-l-4 border-l-indigo-500 shadow-md hover:shadow-lg transition-shadow dark:bg-slate-950 dark:border-t-slate-800 dark:border-r-slate-800 dark:border-b-slate-800">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30">
                  <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    Body Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 min-h-[500px]">
                  <HybridEditor value={formData.content || ''} onChange={v => handleInputChange('content', v)} minHeight="500px" />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* RIGHT COLUMN: PREVIEW */}
        <div className="col-span-1 xl:col-span-7 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-950 dark:to-slate-900/30 rounded-xl border-2 border-blue-100 dark:border-slate-800 p-3 sm:p-6 h-[60vh] xl:h-full overflow-hidden flex flex-col shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" /> Live Preview
            </h2>
            <div className="flex items-center gap-3">
              <div className="text-xs text-muted-foreground bg-white px-3 py-1.5 rounded-full border">
                Paper: {formData.paper_size}
              </div>

            </div>
          </div>

          <div className="flex-1 overflow-auto flex justify-center bg-gray-100 dark:bg-slate-950/50 p-6 rounded-lg shadow-inner custom-scrollbar">
            {/* Correct Mapped Usage of DocumentPreview */}
            <DocumentPreview
              // Branding & Layout (CamelCase Props mapped from SnakeCase State)
              logo={getImageUrl('logo_image')}
              logoPosition={formData.logo_position}
              logoXPosition={formData.logo_x_position}
              logoYPosition={formData.logo_y_position}
              logoWidth={formData.logo_width}
              logoHeight={formData.logo_height}

              headerContent={formData.header_text || ''}
              headerImage={getImageUrl('header_image')}
              headerBackgroundColor={formData.header_background_color}
              headerTextColor={formData.header_text_color}
              headerLineColor={formData.header_line_color}
              headerLineStyle={formData.header_line_style}
              headerHeight={formData.header_height}
              headerLayout={formData.header_layout}
              headerTextAlign={formData.header_text_align}
              headerTextXPosition={formData.header_text_x_position}
              headerTextYPosition={formData.header_text_y_position}
              showHeaderLine={formData.show_header_line}

              footerContent={formData.footer_text || ''}
              footerImage={getImageUrl('footer_image')}
              footerBackgroundColor={formData.footer_background_color}
              footerTextColor={formData.footer_text_color}
              footerLineColor={formData.footer_line_color}
              footerLineStyle={formData.footer_line_style}
              footerHeight={formData.footer_height}
              footerTextXPosition={formData.footer_text_x_position}
              footerTextYPosition={formData.footer_text_y_position}
              showFooterLine={formData.show_footer_line}
              showPageNumbers={formData.show_page_numbers}

              watermarkText={formData.watermark_text || undefined} // Convert null string to undefined for type safety
              watermarkImage={getImageUrl('watermark_image')}
              watermarkOpacity={formData.watermark_opacity}

              paperSize={formData.paper_size}
              fontFamily={formData.default_font_family}
              fontSize={formData.default_font_size}

              // Content
              bodyContent={formData.content || ''}

              // Interactivity
              interactive={true}
              onLogoXPositionChange={x => handleDragUpdate({ logo_x_position: x })}
              onLogoYPositionChange={y => handleDragUpdate({ logo_y_position: y })}
              onHeaderTextXPositionChange={x => handleDragUpdate({ header_text_x_position: x })}
              onHeaderTextYPositionChange={y => handleDragUpdate({ header_text_y_position: y })}
              onFooterTextXPositionChange={x => handleDragUpdate({ footer_text_x_position: x })}
              onFooterTextYPositionChange={y => handleDragUpdate({ footer_text_y_position: y })}
              onLogoWidthChange={w => handleDragUpdate({ logo_width: w })}
              onLogoHeightChange={h => handleDragUpdate({ logo_height: h })}
            />
          </div>
        </div>

      </div>
    </div>
  );
};
