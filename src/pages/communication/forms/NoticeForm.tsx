// Notice Form Component
import { useForm, Controller } from 'react-hook-form';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Checkbox } from '../../../components/ui/checkbox';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { ClassSearchableDropdown } from '../../../components/common/ClassSearchableDropdown';
import { SectionSearchableDropdown } from '../../../components/common/SectionSearchableDropdown';
import type { Notice, NoticeCreateInput } from '../../../types/communication.types';

interface NoticeFormProps {
  notice?: Notice;
  onSubmit: (data: NoticeCreateInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const NoticeForm = ({
  notice,
  onSubmit,
  onCancel,
  isLoading = false,
}: NoticeFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<NoticeCreateInput>({
    defaultValues: notice || {
      title: '',
      content: '',
      publish_date: '',
      expiry_date: '',
      attachment: null,
      is_urgent: false,
      is_published: false,
      is_active: true,
      target_audience: 'all',
      class_obj: null,
      section: null,
    },
  });

  const isUrgent = watch('is_urgent');
  const isPublished = watch('is_published');
  const isActive = watch('is_active');
  const targetAudience = watch('target_audience');
  const selectedClass = watch('class_obj');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {notice ? 'Edit Notice' : 'New Notice'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              {...register('title', { required: 'Title is required' })}
              placeholder="Enter notice title"
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">
              Content <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="content"
              {...register('content', { required: 'Content is required' })}
              placeholder="Enter notice content"
              rows={8}
            />
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content.message}</p>
            )}
          </div>

          {/* Publish Date */}
          <div className="space-y-2">
            <Label htmlFor="publish_date">
              Publish Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="publish_date"
              type="date"
              {...register('publish_date', { required: 'Publish date is required' })}
            />
            {errors.publish_date && (
              <p className="text-sm text-red-500">{errors.publish_date.message}</p>
            )}
          </div>

          {/* Expiry Date */}
          <div className="space-y-2">
            <Label htmlFor="expiry_date">
              Expiry Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="expiry_date"
              type="date"
              {...register('expiry_date', { required: 'Expiry date is required' })}
            />
            {errors.expiry_date && (
              <p className="text-sm text-red-500">{errors.expiry_date.message}</p>
            )}
          </div>

          {/* Attachment URL */}
          <div className="space-y-2">
            <Label htmlFor="attachment">Attachment URL (Optional)</Label>
            <Input
              id="attachment"
              {...register('attachment')}
              placeholder="Enter attachment URL if any"
            />
          </div>

          {/* Visibility Settings */}
          <div className="space-y-3 border-t pt-4">
            <Label className="text-base font-semibold">Visibility Settings</Label>
            <p className="text-sm text-muted-foreground">Choose who can see this notice</p>

            <div className="space-y-2">
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <input
                  type="radio"
                  id="visibility-all"
                  value="all"
                  {...register('target_audience')}
                  className="w-4 h-4"
                />
                <label htmlFor="visibility-all" className="flex-1 cursor-pointer">
                  <div className="font-medium">Everyone</div>
                  <div className="text-sm text-muted-foreground">All users can see this notice</div>
                </label>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <input
                  type="radio"
                  id="visibility-students"
                  value="student"
                  {...register('target_audience')}
                  className="w-4 h-4"
                />
                <label htmlFor="visibility-students" className="flex-1 cursor-pointer">
                  <div className="font-medium">Students Only</div>
                  <div className="text-sm text-muted-foreground">Only students can see this notice</div>
                </label>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <input
                  type="radio"
                  id="visibility-teachers"
                  value="teacher"
                  {...register('target_audience')}
                  className="w-4 h-4"
                />
                <label htmlFor="visibility-teachers" className="flex-1 cursor-pointer">
                  <div className="font-medium">Teachers Only</div>
                  <div className="text-sm text-muted-foreground">Only teachers can see this notice</div>
                </label>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <input
                  type="radio"
                  id="visibility-staff"
                  value="staff"
                  {...register('target_audience')}
                  className="w-4 h-4"
                />
                <label htmlFor="visibility-staff" className="flex-1 cursor-pointer">
                  <div className="font-medium">Staff Only</div>
                  <div className="text-sm text-muted-foreground">Only staff members can see this notice</div>
                </label>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <input
                  type="radio"
                  id="visibility-specific"
                  value="specific"
                  {...register('target_audience')}
                  className="w-4 h-4"
                />
                <label htmlFor="visibility-specific" className="flex-1 cursor-pointer">
                  <div className="font-medium">Specific Classes/Sections</div>
                  <div className="text-sm text-muted-foreground">Select specific classes or sections</div>
                </label>
              </div>

              {/* Class and Section selection when 'specific' is chosen */}
              {targetAudience === 'specific' && (
                <div className="ml-7 space-y-4 p-4 border rounded-lg bg-muted/30">
                  <Controller
                    name="class_obj"
                    control={control}
                    rules={{ required: targetAudience === 'specific' ? 'Class is required' : false }}
                    render={({ field }) => (
                      <ClassSearchableDropdown
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                          setValue('section', null);
                        }}
                        required
                        label="Class"
                        placeholder="Search and select class..."
                        error={errors.class_obj?.message}
                      />
                    )}
                  />

                  <Controller
                    name="section"
                    control={control}
                    render={({ field }) => (
                      <SectionSearchableDropdown
                        value={field.value}
                        onChange={field.onChange}
                        classId={selectedClass}
                        label="Section (Optional)"
                        placeholder="Search and select section..."
                        error={errors.section?.message}
                      />
                    )}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_urgent"
                checked={isUrgent}
                onCheckedChange={(checked) => setValue('is_urgent', checked as boolean)}
              />
              <Label htmlFor="is_urgent" className="cursor-pointer">
                Mark as Urgent
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_published"
                checked={isPublished}
                onCheckedChange={(checked) => setValue('is_published', checked as boolean)}
              />
              <Label htmlFor="is_published" className="cursor-pointer">
                Publish Immediately
              </Label>
            </div>

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
            : notice
              ? 'Update Notice'
              : 'Create Notice'}
        </Button>
      </div>
    </form>
  );
};
