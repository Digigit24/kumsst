/**
 * Create Bulk Job Form Component
 * Form for creating bulk print jobs
 */

import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../components/ui/select';
import type { BulkPrintJobCreateInput, PrintTemplate } from '../../../types/print.types';

interface TargetModel {
    value: string;
    label: string;
}

interface CreateBulkJobFormProps {
    formData: BulkPrintJobCreateInput;
    setFormData: React.Dispatch<React.SetStateAction<BulkPrintJobCreateInput>>;
    templates: PrintTemplate[];
    targetModels: TargetModel[] | undefined;
    targetIdsInput: string;
    setTargetIdsInput: (value: string) => void;
}

export const CreateBulkJobForm: React.FC<CreateBulkJobFormProps> = ({
    formData,
    setFormData,
    templates,
    targetModels,
    targetIdsInput,
    setTargetIdsInput,
}) => {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Job Name *</Label>
                <Input
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., TC for Class 10 Students"
                />
            </div>

            <div className="space-y-2">
                <Label>Template *</Label>
                <Select
                    value={formData.template_id ? String(formData.template_id) : ''}
                    onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, template_id: parseInt(value) }))
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                        {templates.map((template) => (
                            <SelectItem key={template.id} value={String(template.id)}>
                                {template.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Target Model *</Label>
                <Select
                    value={formData.target_model}
                    onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, target_model: value }))
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select target type" />
                    </SelectTrigger>
                    <SelectContent>
                        {targetModels?.map((model) => (
                            <SelectItem key={model.value} value={model.value}>
                                {model.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Target IDs (comma-separated) *</Label>
                <textarea
                    className="w-full min-h-[80px] p-2 border rounded-md text-sm bg-background text-foreground"
                    value={targetIdsInput}
                    onChange={(e) => setTargetIdsInput(e.target.value)}
                    placeholder="1, 2, 3, 4, 5"
                />
                <p className="text-xs text-muted-foreground">
                    Enter the IDs of records to generate documents for
                </p>
            </div>
        </div>
    );
};
