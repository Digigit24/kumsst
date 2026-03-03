/**
 * InlineCreateClassroom Component
 * Allows creating a new Classroom without leaving the current form
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { InlineCreateModal } from './InlineCreateModal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { classroomApi } from '@/services/academic.service';
import type { ClassroomCreateInput } from '@/types/academic.types';

interface InlineCreateClassroomProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (classroomId: number) => void;
  collegeId?: number;
}

export function InlineCreateClassroom({
  open,
  onOpenChange,
  onSuccess,
  collegeId,
}: InlineCreateClassroomProps) {
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } =
    useForm<ClassroomCreateInput>({
      defaultValues: {
        college: collegeId || 1,
        room_type: 'Lecture Hall',
        capacity: 60,
        has_projector: false,
        has_ac: false,
        has_computer: false,
        is_active: true,
      },
    });

  const selectedRoomType = watch('room_type');
  const hasProjector = watch('has_projector');
  const hasAC = watch('has_ac');
  const hasComputer = watch('has_computer');

  const onSubmit = async (data: ClassroomCreateInput) => {
    try {
      setIsLoading(true);
      const newClassroom = await classroomApi.create(data);
      toast.success('Classroom created successfully');
      reset();
      onSuccess(newClassroom.id);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Create classroom error:', error);
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to create classroom');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
  };

  return (
    <InlineCreateModal
      open={open}
      onOpenChange={onOpenChange}
      title="Create New Classroom"
      description="Add a new classroom to the system"
      onSubmit={handleSubmit(onSubmit)}
      onCancel={handleCancel}
      isLoading={isLoading}
      size="lg"
    >
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Code */}
          <div className="space-y-2">
            <Label htmlFor="code">
              Room Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="code"
              {...register('code', { required: 'Room code is required' })}
              placeholder="e.g., LH-101"
            />
            {errors.code && (
              <p className="text-sm text-destructive">{errors.code.message}</p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Room Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register('name', { required: 'Room name is required' })}
              placeholder="e.g., Lecture Hall 101"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Room Type */}
          <div className="space-y-2">
            <Label htmlFor="room_type">
              Room Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedRoomType}
              onValueChange={(value) => setValue('room_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Lecture Hall">Lecture Hall</SelectItem>
                <SelectItem value="Lab">Lab</SelectItem>
                <SelectItem value="Classroom">Classroom</SelectItem>
                <SelectItem value="Seminar Room">Seminar Room</SelectItem>
                <SelectItem value="Tutorial Room">Tutorial Room</SelectItem>
                <SelectItem value="Auditorium">Auditorium</SelectItem>
              </SelectContent>
            </Select>
            {errors.room_type && (
              <p className="text-sm text-destructive">{errors.room_type.message}</p>
            )}
          </div>

          {/* Capacity */}
          <div className="space-y-2">
            <Label htmlFor="capacity">
              Capacity <span className="text-destructive">*</span>
            </Label>
            <Input
              id="capacity"
              type="number"
              min="1"
              {...register('capacity', {
                required: 'Capacity is required',
                valueAsNumber: true,
              })}
              placeholder="60"
            />
            {errors.capacity && (
              <p className="text-sm text-destructive">{errors.capacity.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Building */}
          <div className="space-y-2">
            <Label htmlFor="building">Building</Label>
            <Input
              id="building"
              {...register('building')}
              placeholder="e.g., Main Building"
            />
          </div>

          {/* Floor */}
          <div className="space-y-2">
            <Label htmlFor="floor">Floor</Label>
            <Input
              id="floor"
              {...register('floor')}
              placeholder="e.g., Ground Floor, 1st Floor"
            />
          </div>
        </div>

        {/* Amenities */}
        <div className="space-y-3">
          <Label>Amenities</Label>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="has_projector" className="text-sm font-medium">
                Projector
              </Label>
              <p className="text-xs text-muted-foreground">
                Room has a projector/display
              </p>
            </div>
            <Switch
              id="has_projector"
              checked={hasProjector}
              onCheckedChange={(checked) => setValue('has_projector', checked)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="has_ac" className="text-sm font-medium">
                Air Conditioning
              </Label>
              <p className="text-xs text-muted-foreground">
                Room has air conditioning
              </p>
            </div>
            <Switch
              id="has_ac"
              checked={hasAC}
              onCheckedChange={(checked) => setValue('has_ac', checked)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="has_computer" className="text-sm font-medium">
                Computer/AV Equipment
              </Label>
              <p className="text-xs text-muted-foreground">
                Room has computer or AV equipment
              </p>
            </div>
            <Switch
              id="has_computer"
              checked={hasComputer}
              onCheckedChange={(checked) => setValue('has_computer', checked)}
            />
          </div>
        </div>
      </div>
    </InlineCreateModal>
  );
}
