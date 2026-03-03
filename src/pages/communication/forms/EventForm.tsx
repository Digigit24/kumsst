// Event Form Component
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { Switch } from '../../../components/ui/switch';
import type { Event, EventCreateInput } from '../../../types/communication.types';

interface EventFormProps {
  event?: Event;
  onSubmit: (data: EventCreateInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const EventForm = ({
  event,
  onSubmit,
  onCancel,
  isLoading = false,
}: EventFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<EventCreateInput>({
    defaultValues: event || {
      title: '',
      description: '',
      event_date: '',
      start_time: '',
      end_time: '',
      venue: '',
      organizer: '',
      max_participants: 100,
      registration_required: false,
      registration_deadline: '',
      image: '',
      is_active: true,
    },
  });

  const registrationRequired = watch('registration_required');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Event Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              {...register('title', { required: 'Event title is required' })}
              placeholder="Enter event title"
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              {...register('description', { required: 'Description is required' })}
              placeholder="Enter event description"
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Organizer */}
          <div className="space-y-2">
            <Label htmlFor="organizer">
              Organizer <span className="text-red-500">*</span>
            </Label>
            <Input
              id="organizer"
              {...register('organizer', { required: 'Organizer is required' })}
              placeholder="Enter organizer name"
            />
            {errors.organizer && (
              <p className="text-sm text-red-500">{errors.organizer.message}</p>
            )}
          </div>

          {/* Venue */}
          <div className="space-y-2">
            <Label htmlFor="venue">
              Venue <span className="text-red-500">*</span>
            </Label>
            <Input
              id="venue"
              {...register('venue', { required: 'Venue is required' })}
              placeholder="Enter event venue"
            />
            {errors.venue && (
              <p className="text-sm text-red-500">{errors.venue.message}</p>
            )}
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="image">Event Image URL</Label>
            <Input
              id="image"
              {...register('image')}
              placeholder="https://example.com/event-image.jpg"
            />
          </div>
        </CardContent>
      </Card>

      {/* Date & Time */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Event Date */}
          <div className="space-y-2">
            <Label htmlFor="event_date">
              Event Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="event_date"
              type="date"
              {...register('event_date', { required: 'Event date is required' })}
            />
            {errors.event_date && (
              <p className="text-sm text-red-500">{errors.event_date.message}</p>
            )}
          </div>

          {/* Start & End Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">
                Start Time <span className="text-red-500">*</span>
              </Label>
              <Input
                id="start_time"
                type="time"
                {...register('start_time', { required: 'Start time is required' })}
              />
              {errors.start_time && (
                <p className="text-sm text-red-500">{errors.start_time.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time">
                End Time <span className="text-red-500">*</span>
              </Label>
              <Input
                id="end_time"
                type="time"
                {...register('end_time', { required: 'End time is required' })}
              />
              {errors.end_time && (
                <p className="text-sm text-red-500">{errors.end_time.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registration Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Registration Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Max Participants */}
          <div className="space-y-2">
            <Label htmlFor="max_participants">
              Maximum Participants <span className="text-red-500">*</span>
            </Label>
            <Input
              id="max_participants"
              type="number"
              {...register('max_participants', {
                required: 'Max participants is required',
                min: { value: 1, message: 'Must be at least 1' },
              })}
              placeholder="100"
            />
            {errors.max_participants && (
              <p className="text-sm text-red-500">{errors.max_participants.message}</p>
            )}
          </div>

          {/* Registration Required */}
          <div className="flex items-center space-x-2">
            <Switch
              id="registration_required"
              checked={registrationRequired}
              onCheckedChange={(checked) => setValue('registration_required', checked)}
            />
            <Label htmlFor="registration_required" className="cursor-pointer">
              Registration Required
            </Label>
          </div>

          {/* Registration Deadline */}
          {registrationRequired && (
            <div className="space-y-2">
              <Label htmlFor="registration_deadline">
                Registration Deadline
              </Label>
              <Input
                id="registration_deadline"
                type="date"
                {...register('registration_deadline')}
              />
            </div>
          )}
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
          {isLoading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
        </Button>
      </div>
    </form>
  );
};
