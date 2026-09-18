// English's shape is checked against Spanish (the source of truth, es/index.ts) with `satisfies
// Messages` below: TypeScript rejects a missing, extra or misspelled key here at compile time.
import type { Messages } from '../../messages';
import { auth } from './auth';
import { automations } from './automations';
import { bookings } from './bookings';
import { calendar } from './calendar';
import { classes } from './classes';
import { common } from './common';
import { customers } from './customers';
import { dashboard } from './dashboard';
import { instructors } from './instructors';
import { layout } from './layout';
import { memberships } from './memberships';
import { publicBooking } from './publicBooking';
import { settings } from './settings';

export const en = {
  auth,
  automations,
  bookings,
  calendar,
  classes,
  common,
  customers,
  dashboard,
  instructors,
  layout,
  memberships,
  publicBooking,
  settings,
} satisfies Messages;

export default en;
