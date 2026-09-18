// Shared strings any screen may import - the one namespace every other namespace's owner is
// still free to reuse rather than duplicate (e.g. "Cancel" on a dialog).
export const common = {
  save: 'Save',
  saveChanges: 'Save changes',
  cancel: 'Cancel',
  loading: 'Loading...',
  // Interpolation/plurals are plain functions, not a key-path template language - this keeps
  // call sites readable (`m.common.bookingCount(3)`) and keeps English's own plural rules in
  // this file rather than in a shared template engine.
  bookingCount: (n: number): string => (n === 1 ? '1 booking' : `${n} bookings`),

  close: 'Close',
  confirm: 'Confirm',
  reset: 'Reset',
  tryAgain: 'Try again',
  somethingWentWrong: 'Something went wrong',
  searchPlaceholder: 'Search customers, classes...',
  previousPage: 'Previous page',
  nextPage: 'Next page',
  pageOf: (page: number, total: number): string => `Page ${page} of ${total}`,

  bookingSourceLabel: {
    website: 'Website',
    whatsapp: 'WhatsApp',
    instagram: 'Instagram',
    reception: 'Reception',
  },
};
