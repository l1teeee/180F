'use client';

// docs/06-ROUTES-AND-SCREENS.md section 3.13, "Notifications". Validated by the one schema the
// domain layer publishes for this screen (domain/schemas/studio-settings.ts).
import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { notificationsSettingsSchema } from '@/domain/schemas';
import type { StudioSettings } from '@/domain/types';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { SectionCard } from '@/components/shared/section-card';

type NotificationsValues = StudioSettings['notifications'];

interface NotificationsSectionProps {
  notifications: NotificationsValues;
  onSave: (changes: NotificationsValues) => void;
}

const REMINDER_HOUR_OPTIONS = [1, 2, 6, 12, 24, 48] as const;

export function NotificationsSection({ notifications, onSave }: NotificationsSectionProps) {
  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm<NotificationsValues>({
    resolver: zodResolver(notificationsSettingsSchema),
    defaultValues: notifications,
  });

  useEffect(() => {
    reset(notifications);
  }, [notifications, reset]);

  function onSubmit(values: NotificationsValues) {
    onSave(values);
    toast.success('Notification settings saved.');
  }

  return (
    <SectionCard title="Notifications">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4 rounded-field border border-border p-3">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="notif-whatsapp" className="text-sm font-medium text-ink">
                WhatsApp confirmations
              </Label>
              <p className="text-sm text-text-secondary">
                Send a simulated WhatsApp message when a booking is confirmed.
              </p>
            </div>
            <Controller
              control={control}
              name="whatsappConfirmations"
              render={({ field }) => (
                <Switch
                  id="notif-whatsapp"
                  name="whatsappConfirmations"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-field border border-border p-3">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="notif-email" className="text-sm font-medium text-ink">
                Email confirmations
              </Label>
              <p className="text-sm text-text-secondary">Send a confirmation email when a booking is made.</p>
            </div>
            <Controller
              control={control}
              name="emailConfirmations"
              render={({ field }) => (
                <Switch
                  id="notif-email"
                  name="emailConfirmations"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
        </div>

        <Field className="max-w-xs">
          <FieldLabel htmlFor="notif-reminder">Reminder timing</FieldLabel>
          <Controller
            control={control}
            name="reminderHoursBefore"
            render={({ field }) => (
              <Select
                name="reminderHoursBefore"
                value={String(field.value)}
                onValueChange={(value) => field.onChange(Number(value))}
              >
                <SelectTrigger id="notif-reminder" className="w-full">
                  <SelectValue placeholder="Select a reminder time" />
                </SelectTrigger>
                <SelectContent>
                  {REMINDER_HOUR_OPTIONS.map((hours) => (
                    <SelectItem key={hours} value={String(hours)}>
                      {hours} {hours === 1 ? 'hour' : 'hours'} before
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            Save changes
          </Button>
        </div>
      </form>
    </SectionCard>
  );
}
