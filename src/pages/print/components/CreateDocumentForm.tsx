/**
 * Create Document Form Component
 * Form for creating new print documents
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../components/ui/select';
import type {
    DocumentPriority,
    PrintDocumentCreateInput,
    PrintTemplate,
    TemplateVariable,
} from '../../../types/print.types';

const PRIORITY_CONFIG: Record<DocumentPriority, { color: string; label: string }> = {
    low: { color: 'secondary', label: 'Low' },
    normal: { color: 'default', label: 'Normal' },
    high: { color: 'warning', label: 'High' },
    urgent: { color: 'destructive', label: 'Urgent' },
};

interface CreateDocumentFormProps {
    formData: PrintDocumentCreateInput;
    setFormData: React.Dispatch<React.SetStateAction<PrintDocumentCreateInput>>;
    templates: PrintTemplate[];
    selectedTemplate: PrintTemplate | null;
    contextFields: Record<string, string>;
    onTemplateSelect: (value: string) => void;
    onContextFieldChange: (key: string, value: string) => void;
}

export const CreateDocumentForm: React.FC<CreateDocumentFormProps> = ({
    formData,
    setFormData,
    templates,
    selectedTemplate,
    contextFields,
    onTemplateSelect,
    onContextFieldChange,
}) => {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Template *</Label>
                <Select
                    value={formData.template ? String(formData.template) : ''}
                    onValueChange={onTemplateSelect}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                        {templates.map((template) => (
                            <SelectItem key={template.id} value={String(template.id)}>
                                {template.name} ({template.category_name})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Document Title *</Label>
                <Input
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter document title"
                />
            </div>

            <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                    value={formData.priority}
                    onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, priority: value as DocumentPriority }))
                    }
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(PRIORITY_CONFIG).map(([key, value]) => (
                            <SelectItem key={key} value={key}>
                                {value.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Template Variables */}
            {selectedTemplate?.available_variables && selectedTemplate.available_variables.length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Fill in Document Details</CardTitle>
                        <CardDescription className="text-xs">
                            These values will replace placeholders in the template
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {selectedTemplate.available_variables.map((variable: TemplateVariable) => (
                            <div key={variable.key} className="space-y-1">
                                <Label className="text-sm">
                                    {variable.label}
                                    {variable.required && <span className="text-red-500">*</span>}
                                </Label>
                                {variable.type === 'text' && (
                                    <Input
                                        value={contextFields[variable.key] || ''}
                                        onChange={(e) => onContextFieldChange(variable.key, e.target.value)}
                                        placeholder={variable.sample_value || `Enter ${variable.label}`}
                                    />
                                )}
                                {variable.type === 'number' && (
                                    <Input
                                        type="number"
                                        value={contextFields[variable.key] || ''}
                                        onChange={(e) => onContextFieldChange(variable.key, e.target.value)}
                                        placeholder={variable.sample_value || `Enter ${variable.label}`}
                                    />
                                )}
                                {variable.type === 'date' && (
                                    <Input
                                        type="date"
                                        value={contextFields[variable.key] || ''}
                                        onChange={(e) => onContextFieldChange(variable.key, e.target.value)}
                                    />
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            <div className="space-y-2">
                <Label>Internal Notes (Optional)</Label>
                <textarea
                    className="w-full min-h-[60px] p-2 border rounded-md text-sm bg-background text-foreground"
                    value={formData.internal_notes || ''}
                    onChange={(e) =>
                        setFormData((prev) => ({ ...prev, internal_notes: e.target.value }))
                    }
                    placeholder="Add any internal notes..."
                />
            </div>
        </div>
    );
};
