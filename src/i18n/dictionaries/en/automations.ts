// Owned by: automations screens (src/components/automations/**, src/app/(admin)/automations/page.tsx).
// English copy here is moved verbatim from the components/data that existed before i18n (see
// es/automations.ts for the Spanish source of truth this file is checked against).
export const automations = {
  pageTitle: 'Automations',
  pageSubtitle: 'Simulated WhatsApp messaging triggers.',
  loadErrorFallback: "We couldn't load your automations.",

  previewingButton: 'Previewing this message',
  previewButton: 'Preview message',

  activateAria: 'Activate',
  deactivateAria: 'Deactivate',

  fields: {
    channel: 'Channel',
    trigger: 'Trigger',
  },

  channelLabel: {
    whatsapp: 'WhatsApp',
    email: 'Email',
    sms: 'SMS',
  },
  triggerLabel: {
    booking_created: 'New booking',
    session_24h_before: '24 hours before session',
    customer_inactive_30d: 'Inactive 30+ days',
    customer_birthday: "Customer's birthday",
  },
  statusLabel: {
    active: 'Active',
    paused: 'Paused',
    draft: 'Draft',
  },

  nameById: {
    'auto-01': 'Booking confirmation',
    'auto-02': '24-hour reminder',
    'auto-03': 'Inactive customer reminder',
    'auto-04': 'Birthday message',
  } as Record<string, string>,
  descriptionById: {
    'auto-01': 'Sends a confirmation message as soon as a booking is created.',
    'auto-02': 'Reminds the customer 24 hours before their session.',
    'auto-03': 'Reaches out to customers who have not booked in 30 days.',
    'auto-04': 'Sends a birthday greeting with a free-class offer.',
  } as Record<string, string>,

  messageTemplateById: {
    'auto-01': (className: string, sessionDayLabel: string, sessionTime: string): string =>
      `Your reservation is confirmed.\n\n${className}\n${sessionDayLabel}\n${sessionTime}\n\nWe look forward to seeing you.`,
    'auto-02': (className: string, sessionTime: string, studioName: string): string =>
      `Reminder: you have ${className} tomorrow at ${sessionTime}.\nSee you at ${studioName}!`,
    'auto-03': (customerFirstName: string, studioName: string): string =>
      `Hi ${customerFirstName}, we miss you at ${studioName}!\nIt's been a while — come back for a free trial class this week.`,
    'auto-04': (customerFirstName: string): string =>
      `Happy birthday, ${customerFirstName}! 🎉\nEnjoy a free class on us this month.`,
  } as Record<string, (...args: string[]) => string>,

  samplePreview: {
    className: 'Functional Training',
  },

  preview: {
    heading: 'Message preview',
    simulatedBadge: 'Simulated',
    messageTemplateLabel: 'Message template',
    chatSubtitle: 'Simulated WhatsApp chat',
    deliveredLabel: 'Delivered',
    editTemplateButton: 'Edit template',
    sendTestButton: 'Send test',
    sendTestSuccessToast: 'Test message sent',
    editTemplateToast: "Editing templates isn't available in this demo.",
  },
};
