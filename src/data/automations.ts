// Hand-authored - docs/05-MOCK-DATA-STRATEGY.md section 3.5. messageTemplate strings carry
// {{placeholders}} the WhatsApppreview component interpolates at render time (Phase 7);
// these are templates, not rendered instances.
import type { Automation } from '@/domain/types';

export const automations: Automation[] = [
  {
    id: 'auto-01',
    name: 'Booking confirmation',
    channel: 'whatsapp',
    trigger: 'booking_created',
    status: 'active',
    description: 'Sends a confirmation message as soon as a booking is created.',
    messageTemplate:
      'Your reservation is confirmed.\n\n{{className}}\n{{sessionDayLabel}}\n{{sessionTime}}\n\nWe look forward to seeing you.',
  },
  {
    id: 'auto-02',
    name: '24-hour reminder',
    channel: 'whatsapp',
    trigger: 'session_24h_before',
    status: 'active',
    description: 'Reminds the customer 24 hours before their session.',
    messageTemplate: 'Reminder: you have {{className}} tomorrow at {{sessionTime}}.\nSee you at {{studioName}}!',
  },
  {
    id: 'auto-03',
    name: 'Inactive customer reminder',
    channel: 'whatsapp',
    trigger: 'customer_inactive_30d',
    status: 'paused',
    description: 'Reaches out to customers who have not booked in 30 days.',
    messageTemplate:
      "Hi {{customerFirstName}}, we miss you at {{studioName}}!\nIt's been a while — come back for a free trial class this week.",
  },
  {
    id: 'auto-04',
    name: 'Birthday message',
    channel: 'whatsapp',
    trigger: 'customer_birthday',
    status: 'draft',
    description: 'Sends a birthday greeting with a free-class offer.',
    messageTemplate: 'Happy birthday, {{customerFirstName}}! 🎉\nEnjoy a free class on us this month.',
  },
];
