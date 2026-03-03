/**
 * Notification Setting Form Component
 * Used for creating and editing notification settings
 */

import { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Checkbox } from '../../../components/ui/checkbox';
import { Label } from '../../../components/ui/label';
import { NotificationSetting } from '../../../types/core.types';

interface NotificationSettingFormData {
  college: number;
  sms_enabled: boolean;
  sms_gateway: string;
  sms_api_key?: string;
  sms_sender_id?: string;
  email_enabled: boolean;
  email_gateway: string;
  email_api_key?: string;
  email_from?: string;
  whatsapp_enabled: boolean;
  whatsapp_api_key?: string;
  whatsapp_number?: string;
  attendance_notif: boolean;
  fee_reminder: boolean;
  fee_days: string;
  notif_settings?: string;
  is_active: boolean;
}

interface NotificationSettingFormProps {
  mode: 'create' | 'edit';
  notificationSetting?: NotificationSetting;
  collegeId: number;
  onSuccess: () => void;
  onCancel: () => void;
  onSubmit: (data: NotificationSettingFormData) => Promise<void>;
}

export const NotificationSettingForm = ({
  mode,
  notificationSetting,
  collegeId,
  onSuccess,
  onCancel,
  onSubmit
}: NotificationSettingFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<NotificationSettingFormData>({
    college: collegeId,
    sms_enabled: false,
    sms_gateway: '',
    sms_api_key: '',
    sms_sender_id: '',
    email_enabled: false,
    email_gateway: '',
    email_api_key: '',
    email_from: '',
    whatsapp_enabled: false,
    whatsapp_api_key: '',
    whatsapp_number: '',
    attendance_notif: false,
    fee_reminder: false,
    fee_days: '',
    notif_settings: '',
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && notificationSetting) {
      const notifSettingsValue = notificationSetting.notif_settings
        ? JSON.stringify(notificationSetting.notif_settings)
        : '';
      setFormData({
        college: notificationSetting.college,
        sms_enabled: notificationSetting.sms_enabled,
        sms_gateway: notificationSetting.sms_gateway,
        sms_api_key: notificationSetting.sms_api_key || '',
        sms_sender_id: notificationSetting.sms_sender_id || '',
        email_enabled: notificationSetting.email_enabled,
        email_gateway: notificationSetting.email_gateway,
        email_api_key: notificationSetting.email_api_key || '',
        email_from: notificationSetting.email_from || '',
        whatsapp_enabled: notificationSetting.whatsapp_enabled,
        whatsapp_api_key: notificationSetting.whatsapp_api_key || '',
        whatsapp_number: notificationSetting.whatsapp_number || '',
        attendance_notif: notificationSetting.attendance_notif,
        fee_reminder: notificationSetting.fee_reminder,
        fee_days: notificationSetting.fee_days,
        notif_settings: notifSettingsValue,
        is_active: notificationSetting.is_active,
      });
    }
  }, [mode, notificationSetting]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.sms_enabled) {
      if (!formData.sms_gateway.trim()) newErrors.sms_gateway = 'SMS gateway is required when SMS is enabled';
    }

    if (formData.email_enabled) {
      if (!formData.email_gateway.trim()) newErrors.email_gateway = 'Email gateway is required when Email is enabled';
      if (formData.email_from && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_from)) {
        newErrors.email_from = 'Invalid email format';
      }
    }

    if (formData.whatsapp_enabled) {
      if (!formData.whatsapp_number?.trim()) newErrors.whatsapp_number = 'WhatsApp number is required when WhatsApp is enabled';
    }

    if (formData.fee_reminder && !formData.fee_days.trim()) {
      newErrors.fee_days = 'Fee days is required when fee reminder is enabled';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof NotificationSettingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(formData);
      onSuccess();
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to save notification setting');
      if (err.errors) {
        const backendErrors: Record<string, string> = {};
        Object.entries(err.errors).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            backendErrors[key] = value[0];
          } else {
            backendErrors[key] = String(value);
          }
        });
        setErrors(backendErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* SMS Settings */}
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">
            SMS Configuration
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="sms_enabled"
                checked={formData.sms_enabled}
                onCheckedChange={(checked) => handleChange('sms_enabled', checked)}
                disabled={isSubmitting}
              />
              <Label htmlFor="sms_enabled" className="text-sm font-medium cursor-pointer">
                Enable SMS Notifications
              </Label>
            </div>

            {formData.sms_enabled && (
              <>
                <div>
                  <Label htmlFor="sms_gateway" className="block text-sm font-medium mb-2">
                    SMS Gateway <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="sms_gateway"
                    value={formData.sms_gateway}
                    onChange={(e) => handleChange('sms_gateway', e.target.value)}
                    placeholder="e.g., Twilio, AWS SNS"
                    disabled={isSubmitting}
                    className={errors.sms_gateway ? 'border-destructive' : ''}
                  />
                  {errors.sms_gateway && <p className="text-sm text-destructive mt-1">{errors.sms_gateway}</p>}
                </div>

                <div>
                  <Label htmlFor="sms_api_key" className="block text-sm font-medium mb-2">
                    SMS API Key
                  </Label>
                  <Input
                    id="sms_api_key"
                    type="password"
                    value={formData.sms_api_key}
                    onChange={(e) => handleChange('sms_api_key', e.target.value)}
                    placeholder="Enter API key"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Leave blank to keep existing key</p>
                </div>

                <div>
                  <Label htmlFor="sms_sender_id" className="block text-sm font-medium mb-2">
                    SMS Sender ID
                  </Label>
                  <Input
                    id="sms_sender_id"
                    value={formData.sms_sender_id}
                    onChange={(e) => handleChange('sms_sender_id', e.target.value)}
                    placeholder="Enter sender ID"
                    disabled={isSubmitting}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Email Settings */}
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">
            Email Configuration
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="email_enabled"
                checked={formData.email_enabled}
                onCheckedChange={(checked) => handleChange('email_enabled', checked)}
                disabled={isSubmitting}
              />
              <Label htmlFor="email_enabled" className="text-sm font-medium cursor-pointer">
                Enable Email Notifications
              </Label>
            </div>

            {formData.email_enabled && (
              <>
                <div>
                  <Label htmlFor="email_gateway" className="block text-sm font-medium mb-2">
                    Email Gateway <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email_gateway"
                    value={formData.email_gateway}
                    onChange={(e) => handleChange('email_gateway', e.target.value)}
                    placeholder="e.g., SendGrid, AWS SES"
                    disabled={isSubmitting}
                    className={errors.email_gateway ? 'border-destructive' : ''}
                  />
                  {errors.email_gateway && <p className="text-sm text-destructive mt-1">{errors.email_gateway}</p>}
                </div>

                <div>
                  <Label htmlFor="email_api_key" className="block text-sm font-medium mb-2">
                    Email API Key
                  </Label>
                  <Input
                    id="email_api_key"
                    type="password"
                    value={formData.email_api_key}
                    onChange={(e) => handleChange('email_api_key', e.target.value)}
                    placeholder="Enter API key"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Leave blank to keep existing key</p>
                </div>

                <div>
                  <Label htmlFor="email_from" className="block text-sm font-medium mb-2">
                    From Email Address
                  </Label>
                  <Input
                    id="email_from"
                    type="email"
                    value={formData.email_from}
                    onChange={(e) => handleChange('email_from', e.target.value)}
                    placeholder="noreply@college.edu"
                    disabled={isSubmitting}
                    className={errors.email_from ? 'border-destructive' : ''}
                  />
                  {errors.email_from && <p className="text-sm text-destructive mt-1">{errors.email_from}</p>}
                </div>
              </>
            )}
          </div>
        </div>

        {/* WhatsApp Settings */}
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">
            WhatsApp Configuration
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="whatsapp_enabled"
                checked={formData.whatsapp_enabled}
                onCheckedChange={(checked) => handleChange('whatsapp_enabled', checked)}
                disabled={isSubmitting}
              />
              <Label htmlFor="whatsapp_enabled" className="text-sm font-medium cursor-pointer">
                Enable WhatsApp Notifications
              </Label>
            </div>

            {formData.whatsapp_enabled && (
              <>
                <div>
                  <Label htmlFor="whatsapp_api_key" className="block text-sm font-medium mb-2">
                    WhatsApp API Key
                  </Label>
                  <Input
                    id="whatsapp_api_key"
                    type="password"
                    value={formData.whatsapp_api_key}
                    onChange={(e) => handleChange('whatsapp_api_key', e.target.value)}
                    placeholder="Enter API key"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Leave blank to keep existing key</p>
                </div>

                <div>
                  <Label htmlFor="whatsapp_number" className="block text-sm font-medium mb-2">
                    WhatsApp Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="whatsapp_number"
                    value={formData.whatsapp_number}
                    onChange={(e) => handleChange('whatsapp_number', e.target.value)}
                    placeholder="+1234567890"
                    disabled={isSubmitting}
                    className={errors.whatsapp_number ? 'border-destructive' : ''}
                  />
                  {errors.whatsapp_number && <p className="text-sm text-destructive mt-1">{errors.whatsapp_number}</p>}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Notification Preferences */}
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">
            Notification Preferences
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="attendance_notif"
                checked={formData.attendance_notif}
                onCheckedChange={(checked) => handleChange('attendance_notif', checked)}
                disabled={isSubmitting}
              />
              <Label htmlFor="attendance_notif" className="text-sm font-medium cursor-pointer">
                Attendance Notifications
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="fee_reminder"
                checked={formData.fee_reminder}
                onCheckedChange={(checked) => handleChange('fee_reminder', checked)}
                disabled={isSubmitting}
              />
              <Label htmlFor="fee_reminder" className="text-sm font-medium cursor-pointer">
                Fee Reminders
              </Label>
            </div>

            {formData.fee_reminder && (
              <div>
                <Label htmlFor="fee_days" className="block text-sm font-medium mb-2">
                  Fee Reminder Days <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fee_days"
                  value={formData.fee_days}
                  onChange={(e) => handleChange('fee_days', e.target.value)}
                  placeholder="e.g., 7,15,30"
                  disabled={isSubmitting}
                  className={errors.fee_days ? 'border-destructive' : ''}
                />
                <p className="text-xs text-muted-foreground mt-1">Comma-separated days before due date</p>
                {errors.fee_days && <p className="text-sm text-destructive mt-1">{errors.fee_days}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Additional Settings */}
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">
            Additional Settings
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="notif_settings" className="block text-sm font-medium mb-2">
                Notification Settings (JSON)
              </Label>
              <Textarea
                id="notif_settings"
                value={formData.notif_settings}
                onChange={(e) => handleChange('notif_settings', e.target.value)}
                placeholder='{"key": "value"}'
                disabled={isSubmitting}
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">Optional JSON configuration for advanced settings</p>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleChange('is_active', checked)}
                disabled={isSubmitting}
              />
              <Label htmlFor="is_active" className="text-sm font-medium cursor-pointer">
                Active
              </Label>
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
          {isSubmitting ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Saving...
            </>
          ) : (
            mode === 'create' ? 'Create Setting' : 'Update Setting'
          )}
        </Button>
      </div>
    </form>
  );
};
