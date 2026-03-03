import { AlertCircle, Clock, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Switch } from '../../../components/ui/switch';
import { useAuth } from '../../../hooks/useAuth';
import { classTimeApi } from '../../../services/academic.service';
import type { ClassTime, ClassTimeCreateInput } from '../../../types/academic.types';
import { convertTo24Hour } from '../../../utils/time.utils';

interface ClassTimeFormProps {
    mode: 'view' | 'create' | 'edit';
    classTimeId?: number;
    prefill?: Partial<ClassTimeCreateInput>;
    existingClassTimes?: ClassTime[];
    onSuccess: () => void;
    onCancel: () => void;
}

export function ClassTimeForm({ mode, classTimeId, prefill, existingClassTimes = [], onSuccess, onCancel }: ClassTimeFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { user } = useAuth();

    const [formData, setFormData] = useState({
        period_number: 1,
        start_time: '',
        end_time: '',
        is_break: false,
        break_name: null as string | null,
        is_active: true,
    });

    useEffect(() => {
        if ((mode === 'edit' || mode === 'view') && classTimeId) {
            fetchClassTime();
        } else if (mode === 'create' && prefill) {
            setFormData((prev) => ({
                ...prev,
                ...prefill,
            }));
        }
    }, [mode, classTimeId, prefill]);

    const fetchClassTime = async () => {
        if (!classTimeId) return;
        try {
            setIsFetching(true);
            const data = await classTimeApi.get(classTimeId);
            setFormData({
                period_number: data.period_number,
                start_time: convertTo24Hour(data.start_time),
                end_time: convertTo24Hour(data.end_time),
                is_break: data.is_break,
                break_name: data.break_name,
                is_active: data.is_active,
            });
        } catch (err: any) {
            const errorMsg = err.message || 'Failed to fetch class time';
            setError(errorMsg);
            toast.error('Failed to load', { description: errorMsg });
        } finally {
            setIsFetching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.is_break && (!formData.period_number || formData.period_number < 1)) {
            setError('Period number must be at least 1 for regular classes');
            return;
        }
        if (!formData.start_time || !formData.end_time) {
            setError('Please enter both start and end times');
            return;
        }
        if (formData.start_time >= formData.end_time) {
            setError('End time must be after start time');
            return;
        }
        if (formData.is_break && !formData.break_name?.trim()) {
            setError('Please enter a break name');
            return;
        }

        // Check for duplicate period numbers (only if period number is provided)
        if (formData.period_number) {
            const duplicatePeriod = existingClassTimes.find(
                (ct) => ct.period_number === formData.period_number && ct.id !== classTimeId
            );
            if (duplicatePeriod) {
                // If it's a break and defaults to 0, we might allow it (depending on backend), 
                // but usually period numbers should be unique. 
                // However, if the user explicitly typed a number that exists, warn them.
                const msg = `Period number ${formData.period_number} is already used.`;
                setError(msg);
                toast.error('Duplicate Period', { description: msg });
                return;
            }
        }

        // Check for overlaps
        const toMinutes = (t: string) => {
            const [h, m] = t.split(':').map(Number);
            return (h || 0) * 60 + (m || 0);
        };
        const start = toMinutes(formData.start_time);
        const end = toMinutes(formData.end_time);

        const overlap = existingClassTimes.find((ct) => {
            if (ct.id === classTimeId) return false;
            const ctStart = toMinutes(ct.start_time);
            const ctEnd = toMinutes(ct.end_time);
            return (start < ctEnd && end > ctStart);
        });

        if (overlap) {
            const msg = `Time range overlaps with Period ${overlap.period_number} (${overlap.start_time} - ${overlap.end_time})`;
            setError(msg);
            toast.error('Time Overlap', { description: msg });
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            // Don't send college - it's already in the header (x-college-id)
            const submitData = {
                period_number: formData.period_number || 0, // Default to 0 for breaks if not provided
                start_time: formData.start_time,
                end_time: formData.end_time,
                is_break: formData.is_break,
                break_name: formData.is_break ? formData.break_name : null,
                is_active: formData.is_active,
            };

            if (mode === 'create') {
                await classTimeApi.create(submitData);
                toast.success('Class Time Created', {
                    description: `Period ${submitData.period_number} (${submitData.start_time} - ${submitData.end_time}) has been created`
                });
            } else if (mode === 'edit' && classTimeId) {
                await classTimeApi.update(classTimeId, submitData);
                toast.success('Class Time Updated', {
                    description: `Period ${submitData.period_number} has been updated successfully`
                });
            }
            onSuccess();
        } catch (err: any) {
            console.error('Class Time Form Error:', err);

            // Handle error from fetchApi shape { message, status, errors }
            // or from Axios shape { response: { data } }
            let errorMessage = 'Failed to save class time';

            const errorData = err.errors || err.response?.data;

            if (errorData && typeof errorData === 'object') {
                // Check nested detail object (DRF format)
                const detail = errorData.detail;
                if (detail && typeof detail === 'object' && detail.non_field_errors) {
                    const nfe = Array.isArray(detail.non_field_errors) ? detail.non_field_errors[0] : String(detail.non_field_errors);
                    errorMessage = nfe.includes('unique set')
                        ? `Period ${formData.period_number} already exists for this college. Please choose a different period number.`
                        : nfe;
                } else if (typeof detail === 'string') {
                    errorMessage = detail;
                } else if (errorData.non_field_errors) {
                    const nfe = Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors[0] : String(errorData.non_field_errors);
                    errorMessage = nfe.includes('unique set')
                        ? `Period ${formData.period_number} already exists for this college. Please choose a different period number.`
                        : nfe;
                } else {
                    // Collect field-level errors as strings
                    const parts = Object.entries(errorData)
                        .filter(([k]) => k !== 'detail' && k !== 'error')
                        .map(([, v]) => Array.isArray(v) ? v.join(', ') : typeof v === 'string' ? v : '')
                        .filter(Boolean);
                    if (parts.length > 0) errorMessage = parts.join('. ');
                }
            } else if (typeof err.message === 'string') {
                errorMessage = err.message;
            }

            setError(errorMessage);
            toast.error('Failed to Save', { description: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Loading class time details...</p>
                </div>
            </div>
        );
    }

    const isViewMode = mode === 'view';

    // Calculate duration for preview
    const calculateDuration = () => {
        if (!formData.start_time || !formData.end_time) return null;
        const start = new Date(`2000-01-01T${formData.start_time}`);
        const end = new Date(`2000-01-01T${formData.end_time}`);
        const diff = (end.getTime() - start.getTime()) / (1000 * 60);
        return diff > 0 ? diff : null;
    };

    const duration = calculateDuration();

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                        <div>
                            <h4 className="text-sm font-semibold text-destructive">Error</h4>
                            <p className="text-sm text-destructive/90 mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            )}



            {/* Period Number */}
            <div className="space-y-2">
                <Label htmlFor="period_number">
                    Period Number {!formData.is_break && <span className="text-destructive">*</span>}
                </Label>
                <Input
                    id="period_number"
                    type="number"
                    min="1"
                    value={formData.period_number}
                    onChange={(e) => setFormData({ ...formData, period_number: e.target.value === '' ? ('' as any) : parseInt(e.target.value) })}
                    placeholder={formData.is_break ? "Optional for breaks" : "e.g., 1, 2, 3..."}
                    disabled={isViewMode}
                    required={!formData.is_break}
                />
                <p className="text-xs text-muted-foreground">
                    Sequential number for this time slot in the daily schedule.
                    {!formData.is_break && existingClassTimes.length > 0 && (() => {
                        const usedNumbers = existingClassTimes
                            .filter(ct => mode === 'edit' ? ct.id !== classTimeId : true)
                            .map(ct => ct.period_number)
                            .sort((a, b) => a - b);
                        const maxUsed = Math.max(...usedNumbers, 0);
                        const availableNumbers = Array.from({ length: maxUsed + 5 }, (_, i) => i + 1)
                            .filter(num => !usedNumbers.includes(num))
                            .slice(0, 10); // Show first 10 available

                        return availableNumbers.length > 0 ? (
                            <span className="block mt-1 text-green-600">
                                Available: {availableNumbers.join(', ')}
                            </span>
                        ) : null;
                    })()}
                </p>
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="start_time">
                        Start Time <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="start_time"
                        type="time"
                        value={formData.start_time}
                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                        disabled={isViewMode}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="end_time">
                        End Time <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="end_time"
                        type="time"
                        value={formData.end_time}
                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                        disabled={isViewMode}
                        min={formData.start_time}
                        required
                    />
                </div>
            </div>

            {/* Duration Preview */}
            {duration && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    <Clock className="h-4 w-4" />
                    <span>
                        Duration: <strong>{duration} minutes</strong>
                        {duration >= 60 && ` (${Math.floor(duration / 60)}h ${duration % 60}m)`}
                    </span>
                </div>
            )}

            {/* Is Break Toggle */}
            <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/50">
                <div className="space-y-0.5">
                    <Label className="text-base">Is This a Break?</Label>
                    <p className="text-xs text-muted-foreground">
                        Mark this slot as a break period (lunch, recess, etc.)
                    </p>
                </div>
                <Switch
                    checked={formData.is_break}
                    onCheckedChange={(c) => setFormData({ ...formData, is_break: c, break_name: c ? formData.break_name : null })}
                    disabled={isViewMode}
                />
            </div>

            {/* Break Name (conditional) */}
            {formData.is_break && (
                <div className="space-y-2 animate-in slide-in-from-top-2">
                    <Label htmlFor="break_name">
                        Break Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="break_name"
                        value={formData.break_name || ''}
                        onChange={(e) => setFormData({ ...formData, break_name: e.target.value })}
                        placeholder="e.g., Lunch Break, Short Break, Recess"
                        disabled={isViewMode}
                        required={formData.is_break}
                    />
                    <p className="text-xs text-muted-foreground">
                        A descriptive name for this break period
                    </p>
                </div>
            )}

            {/* Active Status */}
            <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/50">
                <div className="space-y-0.5">
                    <Label className="text-base">Active Status</Label>
                    <p className="text-xs text-muted-foreground">
                        {formData.is_active ? 'This time slot is active and available for scheduling' : 'This time slot is inactive'}
                    </p>
                </div>
                <Switch
                    checked={formData.is_active}
                    onCheckedChange={(c) => setFormData({ ...formData, is_active: c })}
                    disabled={isViewMode}
                />
            </div>

            {/* View Mode Info */}
            {isViewMode && classTimeId && (
                <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm">
                    <h4 className="font-semibold">Time Slot Details</h4>
                    <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                        <span>Time Slot ID:</span>
                        <span className="font-mono">#{classTimeId}</span>
                        {formData.is_break && (
                            <>
                                <span>Type:</span>
                                <span className="text-orange-600 font-medium">Break Period</span>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            {!isViewMode && (
                <div className="flex gap-3 pt-4 border-t">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1"
                    >
                        {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {isLoading ? 'Saving...' : mode === 'create' ? 'Create Time Slot' : 'Update Time Slot'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                </div>
            )}
        </form>
    );
}
