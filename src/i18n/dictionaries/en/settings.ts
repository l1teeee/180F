// Owned by: settings screens (General, Booking, Notifications, Branding, Reset demo data).
// English copy here is moved verbatim from the components that existed before i18n (see
// es/settings.ts for the Spanish source of truth this file is checked against, and its comment
// for the Zod-validation approach these sections share).
export const settings = {
  languageLabel: 'Language',

  pageTitle: 'Settings',
  pageSubtitle: 'Studio profile, booking policy and branding.',
  loadErrorFallback: "We couldn't load your studio settings.",

  general: {
    title: 'General',
    studioNameLabel: 'Studio name',
    emailLabel: 'Email',
    phoneLabel: 'Phone',
    timezoneLabel: 'Timezone',
    timezonePlaceholder: 'Select a timezone',
    addressLabel: 'Address',
    saveButton: 'Save changes',
    savedToast: 'General settings saved.',
    timezoneOptions: {
      'America/Bogota': 'Bogota (GMT-5)',
      'America/New_York': 'New York (GMT-5/-4)',
      'America/Chicago': 'Chicago (GMT-6/-5)',
      'America/Denver': 'Denver (GMT-7/-6)',
      'America/Los_Angeles': 'Los Angeles (GMT-8/-7)',
      'America/Mexico_City': 'Mexico City (GMT-6)',
      'Europe/Madrid': 'Madrid (GMT+1/+2)',
      'Europe/London': 'London (GMT+0/+1)',
      UTC: 'UTC',
    } as Record<string, string>,
    errors: {
      studioNameRequired: 'Enter the studio name',
      emailInvalid: 'Enter a valid email address',
      phoneRequired: 'Enter a phone number',
      addressRequired: 'Enter an address',
      timezoneRequired: 'Select a timezone',
    },
  },

  booking: {
    title: 'Booking',
    cancellationWindowLabel: 'Cancellation window (hours)',
    maxReservationsLabel: 'Max reservations per day',
    advanceBookingLabel: 'Advance booking period (days)',
    waitlistLabel: 'Waitlist enabled',
    waitlistDescription: 'Let customers join a full class and get promoted when a spot opens.',
    saveButton: 'Save changes',
    savedToast: 'Booking settings saved.',
    errors: {
      cancellationWindowInvalid: 'Must be a whole number, 0 or greater',
      maxReservationsInvalid: 'Must be a whole number, at least 1',
      advanceBookingInvalid: 'Must be a whole number, at least 1',
    },
  },

  notifications: {
    title: 'Notifications',
    whatsappLabel: 'WhatsApp confirmations',
    whatsappDescription: 'Send a simulated WhatsApp message when a booking is confirmed.',
    emailLabel: 'Email confirmations',
    emailDescription: 'Send a confirmation email when a booking is made.',
    reminderTimingLabel: 'Reminder timing',
    reminderTimingPlaceholder: 'Select a reminder time',
    reminderHoursOption: (n: number): string => (n === 1 ? '1 hour before' : `${n} hours before`),
    saveButton: 'Save changes',
    savedToast: 'Notification settings saved.',
  },

  branding: {
    title: 'Branding',
    logoLabel: 'Logo URL',
    logoPlaceholder: 'https://...',
    logoHelperText: 'Leave blank to use the default studio initial.',
    primaryColorLabel: 'Primary color',
    accentColorLabel: 'Accent color',
    livePreviewBadge: 'Live preview',
    livePreviewDescription: 'This is how your brand colors pair together.',
    saveButton: 'Save changes',
    savedToast: 'Branding settings saved.',
    errors: {
      primaryColorInvalid: 'Must be a hex colour like #7869D4',
      accentColorInvalid: 'Must be a hex colour like #7869D4',
    },
  },

  resetDemo: {
    title: 'Demo data',
    label: 'Reset demo data',
    description:
      "Discards every booking, edit and message made in this session and reseeds today's demo from scratch. Use this before a fresh run-through.",
    button: 'Reset demo data',
    confirmTitle: 'Reset demo data?',
    confirmDescription:
      "This cannot be undone. Every booking, edit and message made in this session will be discarded and today's demo will reseed from scratch.",
    confirmButton: 'Reset',
    successToast: 'Demo data has been reset.',
  },
};
