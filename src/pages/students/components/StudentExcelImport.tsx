/**
 * Student Excel Import - 3-step wizard
 * Step 1: Upload Excel file & preview
 * Step 2: Map columns to app fields
 * Step 3: Process & show results
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { cn } from '@/lib/utils';
import { studentImportApi } from '@/services/students.service';
import type {
  ImportPreviewResponse,
  ImportStatusResponse
} from '@/types/students.types';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileCheck,
  FileSpreadsheet,
  LayoutList,
  Loader2,
  RefreshCw,
  Trash2,
  Upload,
  Users,
  XCircle
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface StudentExcelImportProps {
  onComplete: () => void;
  onCancel: () => void;
}

type Step = 'upload' | 'mapping' | 'processing';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
];
const POLL_INTERVAL = 3000;

export const StudentExcelImport = ({ onComplete, onCancel }: StudentExcelImportProps) => {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<ImportPreviewResponse | null>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [importResult, setImportResult] = useState<ImportStatusResponse | null>(null);
  const [errorsExpanded, setErrorsExpanded] = useState(false);
  const [studentsExpanded, setStudentsExpanded] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // --- Step 1: File Upload & Preview ---

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!ACCEPTED_TYPES.includes(selected.type) && !selected.name.match(/\.xlsx?$/i)) {
      toast.error('Invalid file type. Please upload an .xlsx or .xls file.');
      return;
    }

    if (selected.size > MAX_FILE_SIZE) {
      toast.error('File too large. Maximum size is 10MB.');
      return;
    }

    setFile(selected);
  };

  const handleUploadPreview = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      const data = await studentImportApi.preview(file);
      setPreviewData(data);

      // Initialize mapping with empty values
      const initialMapping: Record<string, string> = {};
      data.excel_headers.forEach((header) => {
        initialMapping[header] = '';
      });
      setColumnMapping(initialMapping);

      setStep('mapping');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to preview file. Please check the file format.');
    } finally {
      setIsUploading(false);
    }
  };

  // --- Step 2: Column Mapping ---

  const getUsedAppFieldKeys = useCallback((): Set<string> => {
    const used = new Set<string>();
    Object.values(columnMapping).forEach((key) => {
      if (key && key !== 'skip') used.add(key);
    });
    return used;
  }, [columnMapping]);

  const handleMappingChange = (excelHeader: string, appFieldKey: string) => {
    setColumnMapping((prev) => ({
      ...prev,
      [excelHeader]: appFieldKey === 'skip' ? '' : appFieldKey,
    }));
  };

  const getSampleValues = (header: string): string[] => {
    if (!previewData?.sample_data) return [];
    return previewData.sample_data
      .map((row) => row[header])
      .filter(Boolean)
      .slice(0, 3);
  };

  const hasMappedColumns = Object.values(columnMapping).some((v) => v && v !== 'skip');

  const handleStartImport = async () => {
    if (!file || !previewData) return;

    // Build clean mapping (only mapped columns)
    const cleanMapping: Record<string, string> = {};
    Object.entries(columnMapping).forEach(([header, key]) => {
      if (key && key !== 'skip') {
        cleanMapping[header] = key;
      }
    });

    if (Object.keys(cleanMapping).length === 0) {
      toast.error('Please map at least one column before importing.');
      return;
    }

    setIsProcessing(true);
    setStep('processing');
    setImportProgress(0);

    try {
      const { data, isAsync } = await studentImportApi.process(file, cleanMapping, skipDuplicates);

      if (!isAsync) {
        // Sync mode — fetch final status immediately
        const statusData = await studentImportApi.status(data.job_id);
        setImportResult(statusData);
        setImportProgress(100);
        setTimeout(() => setIsProcessing(false), 500);
      } else {
        // Start a fake progress interval that rapidly approaches ~90%
        let currentProgress = 0;
        const progressInterval = setInterval(() => {
          currentProgress += (95 - currentProgress) * 0.1; // Ease towards 95%
          setImportProgress(Math.floor(currentProgress));
        }, 500);

        // Async mode — poll for status
        pollRef.current = setInterval(async () => {
          try {
            const statusData = await studentImportApi.status(data.job_id);

            const processed = statusData.successful + statusData.failed + statusData.skipped;
            const apiProgress = statusData.total_rows > 0 ? Math.floor((processed / statusData.total_rows) * 100) : 0;

            // Prefer API progress if it's meaningful, otherwise use fake easing
            if (apiProgress > currentProgress && apiProgress < 100) {
              currentProgress = apiProgress;
              setImportProgress(currentProgress);
            }

            if (statusData.status === 'completed' || statusData.status === 'failed') {
              clearInterval(progressInterval);
              if (pollRef.current) clearInterval(pollRef.current);
              pollRef.current = null;
              setImportProgress(100);

              setImportResult(statusData);
              setTimeout(() => setIsProcessing(false), 800); // Allow seeing 100% before transitioning
            }
          } catch {
            // Keep polling on transient errors
          }
        }, POLL_INTERVAL);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to start import.');
      setIsProcessing(false);
      setStep('mapping');
    }
  };

  // --- Reset ---

  const handleReset = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
    setStep('upload');
    setFile(null);
    setPreviewData(null);
    setColumnMapping({});
    setSkipDuplicates(true);
    setImportResult(null);
    setIsProcessing(false);
    setIsUploading(false);
    setErrorsExpanded(false);
    setStudentsExpanded(false);
    setImportProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- Renders ---

  const renderStepIndicator = () => {
    const stepsData = [
      { key: 'upload', label: 'Upload File', icon: FileSpreadsheet, description: 'Select & Preview' },
      { key: 'mapping', label: 'Map Columns', icon: LayoutList, description: 'Connect Data Fields' },
      { key: 'processing', label: 'Import Results', icon: CheckCircle2, description: 'Review & Finish' },
    ];

    // Find current step index
    const currentStepIndex = stepsData.findIndex(s => s.key === step as string);

    return (
      <div className="w-full mb-10 px-4">
        <div className="relative flex justify-between max-w-2xl mx-auto">
          {/* Background Line */}
          <div className="absolute top-6 left-0 w-full h-1 bg-muted rounded-full -z-10"></div>

          {/* Active Progress Line */}
          <motion.div
            className="absolute top-6 left-0 h-1 bg-primary rounded-full -z-10"
            initial={{ width: '0%' }}
            animate={{ width: `${(currentStepIndex / (stepsData.length - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          ></motion.div>

          {stepsData.map((s, i) => {
            const isActive = i === currentStepIndex;
            const isCompleted = i < currentStepIndex;
            const Icon = s.icon;

            return (
              <div key={s.key} className="flex flex-col items-center group relative">
                <motion.div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 z-10",
                    isActive
                      ? "bg-background border-primary text-primary shadow-[0_0_20px_rgba(var(--primary),0.3)] scale-110"
                      : isCompleted
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-background border-muted text-muted-foreground"
                  )}
                  initial={false}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    borderColor: isActive || isCompleted ? 'var(--primary)' : 'var(--muted)',
                  }}
                >
                  {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                </motion.div>
                <div className="mt-4 text-center">
                  <p className={cn(
                    "text-sm font-semibold transition-colors",
                    isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {s.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground hidden sm:block mt-0.5">
                    {s.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderUploadStep = () => (
    <motion.div
      className="flex flex-col items-center justify-center py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={cn(
          "w-full max-w-xl relative group cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300 p-12 flex flex-col items-center justify-center gap-6",
          file
            ? "border-green-500/50 bg-green-50/30 dark:bg-green-950/10"
            : "border-muted-foreground/20 hover:border-primary/50 hover:bg-accent/30 bg-card"
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleFileSelect}
        />

        <AnimatePresence mode="wait">
          {file ? (
            <motion.div
              key="file-selected"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 shadow-sm">
                <FileCheck className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-center space-y-2 z-10">
                <p className="text-xl font-bold text-foreground">{file.name}</p>
                <Badge variant="outline" className="bg-background/50 backdrop-blur text-xs px-3 py-1 mt-2">
                  {(file.size / 1024).toFixed(1)} KB
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="file-empty"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="h-20 w-20 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors flex items-center justify-center mb-6 ring-8 ring-primary/5">
                <Upload className="h-9 w-9 text-primary/80" />
              </div>
              <div className="text-center space-y-2 z-10">
                <p className="text-xl font-semibold text-foreground">Click to upload or drag file</p>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Supports Excel files (.xlsx, .xls) up to 10MB
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-10 flex gap-4 w-full max-w-xl justify-end">
        <Button variant="ghost" onClick={onCancel} className=" text-muted-foreground hover:text-foreground">
          Cancel
        </Button>
        <Button
          onClick={handleUploadPreview}
          disabled={!file || isUploading}
          size="lg"
          className="min-w-[140px] shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all rounded-full px-8"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Analyzing...
            </>
          ) : (
            <>
              Next Step <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </motion.div >
  );

  const renderMappingStep = () => {
    if (!previewData) return null;

    const usedKeys = getUsedAppFieldKeys();

    return (
      <motion.div
        className="flex flex-col gap-6 h-full"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-card p-5 rounded-2xl border shadow-sm">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <div className="p-1.5 bg-green-100 text-green-700 rounded-md">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              {file?.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 ml-1">
              Found <span className="font-medium text-foreground">{previewData.total_rows}</span> rows and <span className="font-medium text-foreground">{previewData.excel_headers.length}</span> columns
            </p>
          </div>
          <div className="flex items-center gap-2 bg-muted/40 p-1.5 rounded-lg border">
            <Badge variant="outline" className="bg-background shadow-sm border-0">
              {Object.values(columnMapping).filter(v => v && v !== 'skip').length} / {previewData.excel_headers.length} Mapped
            </Badge>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 p-4 rounded-xl text-sm flex gap-3 items-start">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-blue-600" />
          <div className="leading-relaxed">
            <p className="font-medium">Map Columns to Student Data</p>
            <p className="text-blue-600/80 dark:text-blue-400/80 text-xs mt-0.5">
              Select which column from your Excel file corresponds to each Student field. Fields marked with * are strongly recommended.
            </p>
          </div>
        </div>

        {/* Mapping List */}
        <div className="flex-1 overflow-y-auto px-1 pb-4 min-h-[300px] max-h-[500px]">
          <div className="grid gap-3">
            {previewData.excel_headers.map((header, index) => {
              const samples = getSampleValues(header);
              const currentValue = columnMapping[header] || '';
              const currentField = previewData.app_fields.find((f) => f.key === currentValue);
              const isMapped = !!currentValue && currentValue !== 'skip';

              return (
                <motion.div
                  key={header}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "group grid grid-cols-[1fr_auto_1fr] items-center gap-6 rounded-xl border p-4 transition-all duration-200",
                    isMapped
                      ? "bg-card border-primary/20 shadow-sm ring-1 ring-primary/5"
                      : "bg-muted/10 border-transparent hover:bg-muted/30"
                  )}
                >
                  {/* Excel Column Info */}
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-xs font-bold font-mono border border-green-100 dark:border-green-800/50">
                        XLS
                      </div>
                      <p className="font-semibold text-sm truncate" title={header}>{header}</p>
                    </div>
                    {samples.length > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground truncate pl-11 flex gap-1">
                        <span className="opacity-50">e.g.</span>
                        <span className="font-medium opacity-80">{samples.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Mapping Connector */}
                  <div className="flex items-center justify-center relative">
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 z-10",
                      isMapped
                        ? "bg-primary text-primary-foreground shadow-md scale-110"
                        : "bg-muted text-muted-foreground/40 group-hover:bg-muted/80 group-hover:text-muted-foreground"
                    )}>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                    {/* Line connector effect */}
                    <div className={cn(
                      "absolute h-[2px] w-full top-1/2 -translate-y-1/2 -z-0 transition-colors duration-300",
                      isMapped ? "bg-primary/30" : "bg-muted/30"
                    )} />
                  </div>

                  {/* App Field Selection */}
                  <div className="flex flex-col">
                    <SearchableSelect
                      value={currentValue || 'skip'}
                      onChange={(val) => handleMappingChange(header, val as string)}
                      options={[
                        { value: 'skip', label: 'Skip Column', subtitle: 'Ignore this column' },
                        ...previewData.app_fields.map((field) => ({
                          value: field.key,
                          label: field.label + (field.required ? ' *' : ''),
                          subtitle: field.description,
                          disabled: usedKeys.has(field.key) && field.key !== currentValue
                        }))
                      ]}
                      placeholder="Skip Column"
                      searchPlaceholder="Search fields..."
                      className={cn(
                        "h-11 justify-between transition-all rounded-lg border",
                        isMapped
                          ? "border-primary/40 bg-primary/5 hover:bg-primary/10 hover:border-primary/60 text-foreground"
                          : "bg-background hover:bg-muted/50 text-muted-foreground border-transparent shadow-none"
                      )}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col gap-4 mt-2 pt-4 border-t sticky bottom-0 bg-background/95 backdrop-blur z-20">
          <label className="flex items-center gap-3 cursor-pointer select-none group p-3 rounded-xl border border-transparent hover:bg-accent/30 hover:border-accent transition-all">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={skipDuplicates}
                onChange={(e) => setSkipDuplicates(e.target.checked)}
                className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-muted-foreground/50 transition-all checked:border-primary checked:bg-primary"
              />
              <CheckCircle2 className="pointer-events-none absolute left-0 top-0 h-5 w-5 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Skip duplicate records</span>
              <span className="text-xs text-muted-foreground mt-0.5">
                Automatically skips rows if email or phone matches existing students
              </span>
            </div>
          </label>

          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => {
                setStep('upload');
                setPreviewData(null);
              }}
              className="px-6 rounded-full border-muted-foreground/20 hover:bg-muted/50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <Button
              onClick={handleStartImport}
              disabled={!hasMappedColumns}
              size="lg"
              className="rounded-full px-8 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
            >
              Start Import
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderProcessingStep = () => {
    // Still processing
    if (isProcessing) {
      return (
        <motion.div
          className="flex flex-col items-center justify-center py-20 min-h-[400px]"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative h-24 w-24 mb-8">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary/10 border-t-primary animate-spin"></div>
            <div className="absolute inset-4 rounded-full bg-background flex items-center justify-center shadow-inner">
              <RefreshCw className="h-8 w-8 text-primary animate-spin" style={{ animationDuration: '3s' }} />
            </div>
          </div>

          <div className="text-center space-y-3 max-w-md">
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 animate-pulse">
              Importing Students...
            </h3>
            <p className="text-muted-foreground">
              We are carefully processing <span className="font-semibold text-foreground">{previewData?.total_rows}</span> records.
              Please do not close this window.
            </p>
          </div>
          <div className="w-full max-w-sm mt-10 space-y-2 relative">
            <div className="h-4 w-full bg-primary/10 rounded-full overflow-hidden relative shadow-inner">
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
                animate={{ width: `${importProgress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between text-xs font-semibold px-1">
              <span className="text-muted-foreground">{importProgress === 100 ? "Complete!" : "Processing data..."}</span>
              <span className={cn(importProgress === 100 ? "text-primary" : "text-muted-foreground animate-pulse")}>
                {importProgress}%
              </span>
            </div>
          </div>
        </motion.div>
      );
    }

    // Results
    if (!importResult) return null;

    const isFailed = importResult.status === 'failed';
    const successRate = importResult.total_rows > 0
      ? Math.round((importResult.successful / importResult.total_rows) * 100)
      : 0;

    return (
      <motion.div
        className="flex flex-col gap-6 h-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header Banner */}
        <div className={cn(
          "rounded-3xl p-8 flex flex-col items-center text-center gap-4 border relative overflow-hidden",
          isFailed
            ? "bg-gradient-to-br from-red-50 to-background dark:from-red-950/20"
            : "bg-gradient-to-br from-green-50 to-background dark:from-green-950/20"
        )}>
          {/* Decorative shapes */}
          <div className={cn("absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-50 blur-3xl", isFailed ? "bg-red-200" : "bg-green-200")}></div>
          <div className={cn("absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-50 blur-3xl", isFailed ? "bg-red-200" : "bg-green-200")}></div>

          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 15 }}
            className={cn(
              "h-20 w-20 rounded-full flex items-center justify-center border-4 shadow-xl z-10 bg-background",
              isFailed
                ? "border-red-100 text-red-500 shadow-red-200/50"
                : "border-green-100 text-green-500 shadow-green-200/50"
            )}
          >
            {isFailed ? <XCircle className="h-10 w-10" /> : <CheckCircle2 className="h-10 w-10" />}
          </motion.div>

          <div className="z-10">
            <h3 className={cn("text-3xl font-bold tracking-tight", isFailed ? "text-red-700" : "text-green-700")}>
              {isFailed ? 'Import Failed' : 'Import Complete'}
            </h3>
            <p className="text-muted-foreground mt-2 text-lg">
              Processed file: <span className="font-semibold text-foreground">{importResult.file_name}</span>
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {[
            { label: 'Successful', value: importResult.successful, color: 'text-green-600', bg: 'bg-green-500', icon: CheckCircle2 },
            { label: 'Skipped', value: importResult.skipped, color: 'text-yellow-600', bg: 'bg-yellow-500', icon: AlertTriangle },
            { label: 'Failed', value: importResult.failed, color: 'text-red-600', bg: 'bg-red-500', icon: XCircle }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (i * 0.1) }}
              className="bg-card rounded-2xl p-6 border shadow-sm relative overflow-hidden group hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start z-10 relative">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                  <p className={cn("text-4xl font-bold tracking-tight", stat.color)}>{stat.value}</p>
                </div>
                <div className={cn("p-2 rounded-full bg-background/50 backdrop-blur shadow-sm", stat.color)}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>

              {/* Progress bar for visualization */}
              {stat.label === 'Successful' && (
                <div className="w-full bg-muted/50 h-1.5 rounded-full mt-4 overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full", stat.bg)}
                    initial={{ width: 0 }}
                    animate={{ width: `${successRate}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              )}

              {/* Background accent */}
              <div className={cn("absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-5 group-hover:opacity-10 transition-opacity blur-xl", stat.bg)} />
            </motion.div>
          ))}
        </div>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Errors Section */}
          {importResult.errors.length > 0 && (
            <div className="rounded-2xl border border-red-200 bg-red-50/20 overflow-hidden shadow-sm">
              <button
                className="flex w-full items-center justify-between p-4 text-left hover:bg-red-50/50 transition-colors"
                onClick={() => setErrorsExpanded(!errorsExpanded)}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600 shadow-sm">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-900">Review Issues</h4>
                    <p className="text-xs text-red-700">{importResult.errors.length} errors found that need attention</p>
                  </div>
                </div>
                {errorsExpanded ? (
                  <ChevronDown className="h-5 w-5 text-red-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-red-400" />
                )}
              </button>

              <AnimatePresence>
                {errorsExpanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="border-t border-red-200/50"
                  >
                    <div className="max-h-60 overflow-y-auto bg-white/50 dark:bg-black/10 divide-y divide-red-100/50">
                      {importResult.errors.map((err, i) => (
                        <div key={i} className="p-3 pl-16 text-sm flex gap-3 items-start hover:bg-red-50/30">
                          <span className="font-mono font-bold text-red-600 bg-red-100/50 px-2 py-0.5 rounded text-xs whitespace-nowrap">
                            Row {err.row}
                          </span>
                          <span className="text-foreground/80">{err.errors.join('; ')}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Success List Section */}
          {importResult.created_students.length > 0 && (
            <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
              <button
                className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
                onClick={() => setStudentsExpanded(!studentsExpanded)}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center shrink-0 text-green-600 shadow-sm">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Successfully Imported</h4>
                    <p className="text-xs text-muted-foreground">{importResult.created_students.length} students added to the system</p>
                  </div>
                </div>
                {studentsExpanded ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </button>

              <AnimatePresence>
                {studentsExpanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="border-t"
                  >
                    <div className="max-h-60 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
                          <tr>
                            <th className="px-5 py-2.5 text-left font-semibold text-xs text-muted-foreground uppercase tracking-wider">Adm No.</th>
                            <th className="px-5 py-2.5 text-left font-semibold text-xs text-muted-foreground uppercase tracking-wider">Student Name</th>
                            <th className="px-5 py-2.5 text-left font-semibold text-xs text-muted-foreground uppercase tracking-wider">Email</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {importResult.created_students.map((s) => (
                            <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                              <td className="px-5 py-2.5 font-mono text-xs text-muted-foreground">{s.admission_number}</td>
                              <td className="px-5 py-2.5 font-medium">{s.full_name}</td>
                              <td className="px-5 py-2.5 text-muted-foreground">{s.email || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="flex justify-between pt-6 border-t mt-auto">
          <Button variant="outline" onClick={handleReset} className="rounded-full px-6">
            <RefreshCw className="h-4 w-4 mr-2" />
            Import Another File
          </Button>
          <Button onClick={onComplete} size="lg" className="rounded-full px-8 shadow-lg shadow-primary/20 bg-primary">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Go to Students List
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-background/50">
      {renderStepIndicator()}
      <div className="flex-1 overflow-hidden relative px-2">
        <AnimatePresence mode="wait">
          {step === 'upload' && renderUploadStep()}
          {step === 'mapping' && renderMappingStep()}
          {step === 'processing' && renderProcessingStep()}
        </AnimatePresence>
      </div>
    </div>
  );
};
