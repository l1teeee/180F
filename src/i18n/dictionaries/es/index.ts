// Spanish is the source of truth for the dictionary's shape (CLAUDE.md, docs/13-DECISIONS.md):
// src/i18n/messages.ts derives `Messages` from this object, and en/index.ts is checked against
// it with `satisfies Messages`.
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

export const es = {
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
};

export default es;
