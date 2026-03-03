/**
 * Procurement Quotation Form - File Upload Only
 */

import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Upload, FileText, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { useState } from 'react';
import { toast } from 'sonner';

interface QuotationFormProps {
  quotation?: any | null;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}

export const QuotationForm = ({ quotation, onSubmit, onCancel }: QuotationFormProps) => {
  const [quotationFile, setQuotationFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setQuotationFile(file);
    }
  };

  const handleRemoveFile = () => {
    setQuotationFile(null);
    const fileInput = document.getElementById('quotation_file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!quotationFile) {
      toast.error('Please select a quotation file to upload');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('quotation_file', quotationFile);
      formData.append('quotation_date', new Date().toISOString().split('T')[0]);
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* File Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Quotation Document</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="quotation_file" required>
              Quotation File
            </Label>
            <div className="mt-2">
              <Input
                id="quotation_file"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                className="cursor-pointer"
                required
              />
              {quotationFile && (
                <div className="mt-3 flex items-center justify-between gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">{quotationFile.name}</span>
                    <span className="text-green-600">
                      ({(quotationFile.size / 1024).toFixed(2)} KB)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max size: 10MB)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex gap-2 pt-4">
        <Button
          type="submit"
          className="flex-1"
          disabled={!quotationFile || isSubmitting}
        >
          <Upload className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Uploading...' : 'Upload Quotation'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};
