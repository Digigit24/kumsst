// Event Registration Form Component
import { useForm, Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { EventSearchableDropdown } from '../../../components/common/EventSearchableDropdown';
import { UserSearchableDropdown } from '../../../components/common/UserSearchableDropdown';
import type { EventRegistration, EventRegistrationCreateInput } from '../../../types/communication.types';

interface EventRegistrationFormProps {
  registration?: EventRegistration;
  onSubmit: (data: EventRegistrationCreateInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
  defaultEventId?: number;
}

export const EventRegistrationForm = ({
  registration,
  onSubmit,
  onCancel,
  isLoading = false,
  defaultEventId,
}: EventRegistrationFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<EventRegistrationCreateInput>({
    defaultValues: registration || {
      event: defaultEventId || 0,
      user: '',
      registration_date: new Date().toISOString().split('T')[0],
      status: 'pending',
      is_active: true,
    },
  });

  const status = watch('status');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {registration ? 'Edit Registration' : 'New Registration'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Event Selection */}
          {!defaultEventId && (
            <Controller
              name="event"
              control={control}
              rules={{ required: 'Event is required' }}
              render={({ field }) => (
                <EventSearchableDropdown
                  value={field.value}
                  onChange={field.onChange}
                  required
                  label="Event"
                  placeholder="Search and select event..."
                  error={errors.event?.message}
                />
              )}
            />
          )}

          {/* User Selection */}
          <Controller
            name="user"
            control={control}
            rules={{ required: 'User is required' }}
            render={({ field }) => (
              <UserSearchableDropdown
                value={field.value}
                onChange={field.onChange}
                required
                label="User"
                placeholder="Search and select user..."
                error={errors.user?.message}
              />
            )}
          />

          {/* Registration Date */}
          <div className="space-y-2">
            <Label htmlFor="registration_date">Registration Date</Label>
            <Input
              id="registration_date"
              type="date"
              {...register('registration_date')}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={status}
              onValueChange={(value) => setValue('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="attended">Attended</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
              </SelectContent>
            </Select>
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
            : registration
            ? 'Update Registration'
            : 'Register'}
        </Button>
      </div>
    </form>
  );
};
