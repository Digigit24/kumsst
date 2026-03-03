// Notice Visibility Form Component
import { useForm, Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Checkbox } from '../../../components/ui/checkbox';
import { NoticeSearchableDropdown } from '../../../components/common/NoticeSearchableDropdown';
import { ClassSearchableDropdown } from '../../../components/common/ClassSearchableDropdown';
import { SectionSearchableDropdown } from '../../../components/common/SectionSearchableDropdown';
import type { NoticeVisibility, NoticeVisibilityCreateInput } from '../../../types/communication.types';

interface NoticeVisibilityFormProps {
  noticeVisibility?: NoticeVisibility;
  onSubmit: (data: NoticeVisibilityCreateInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const NoticeVisibilityForm = ({
  noticeVisibility,
  onSubmit,
  onCancel,
  isLoading = false,
}: NoticeVisibilityFormProps) => {
  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<NoticeVisibilityCreateInput>({
    defaultValues: noticeVisibility || {
      notice: 0,
      target_type: '',
      class_obj: null,
      section: null,
      is_active: true,
    },
  });

  const targetType = watch('target_type');
  const isActive = watch('is_active');
  const selectedClass = watch('class_obj');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {noticeVisibility ? 'Edit Notice Visibility' : 'New Notice Visibility'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Notice - Searchable Dropdown */}
          <Controller
            name="notice"
            control={control}
            rules={{ required: 'Notice is required' }}
            render={({ field }) => (
              <NoticeSearchableDropdown
                value={field.value}
                onChange={field.onChange}
                required
                label="Notice"
                placeholder="Search and select notice..."
                error={errors.notice?.message}
              />
            )}
          />

          {/* Target Type */}
          <div className="space-y-2">
            <Label htmlFor="target_type">
              Target Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={targetType}
              onValueChange={(value) => setValue('target_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select target type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All (Everyone)</SelectItem>
                <SelectItem value="class">Specific Class</SelectItem>
                <SelectItem value="section">Specific Section</SelectItem>
              </SelectContent>
            </Select>
            {errors.target_type && (
              <p className="text-sm text-red-500">{errors.target_type.message}</p>
            )}
          </div>

          {/* Class - Searchable Dropdown (only if target_type is class or section) */}
          {(targetType === 'class' || targetType === 'section') && (
            <Controller
              name="class_obj"
              control={control}
              rules={{
                required: targetType === 'class' || targetType === 'section'
                  ? 'Class is required for this target type'
                  : false
              }}
              render={({ field }) => (
                <ClassSearchableDropdown
                  value={field.value}
                  onChange={field.onChange}
                  required={targetType === 'class' || targetType === 'section'}
                  label="Class"
                  placeholder="Search and select class..."
                  error={errors.class_obj?.message}
                />
              )}
            />
          )}

          {/* Section - Searchable Dropdown (only if target_type is section) */}
          {targetType === 'section' && (
            <Controller
              name="section"
              control={control}
              rules={{
                required: targetType === 'section' ? 'Section is required for this target type' : false
              }}
              render={({ field }) => (
                <SectionSearchableDropdown
                  value={field.value}
                  onChange={field.onChange}
                  classId={selectedClass}
                  required={targetType === 'section'}
                  label="Section"
                  placeholder="Search and select section..."
                  error={errors.section?.message}
                />
              )}
            />
          )}

          {/* Active Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={isActive}
              onCheckedChange={(checked) => setValue('is_active', checked as boolean)}
            />
            <Label htmlFor="is_active" className="cursor-pointer">
              Active
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? 'Saving...'
            : noticeVisibility
            ? 'Update Visibility'
            : 'Create Visibility'}
        </Button>
      </div>
    </form>
  );
};
