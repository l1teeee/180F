# Gym Management Demo — Master Architecture & Multi-Agent Execution Plan

> **Purpose:** Single source of truth for planning, building, reviewing, and presenting a polished frontend demo of a boutique fitness studio / gym management and booking platform.
>
> **Primary rule:** This is a **commercial demo**, not the production backend. It must **look and behave like a real SaaS product** while keeping implementation intentionally lightweight.
>
> **Visual reference:** https://dribbble.com/shots/27445228-Fitness-Tracker-Dashboard-UI
>
> **Target brand:** 180 Fitness Studio. Use real brand assets/colors only if they are available locally in the repository or explicitly provided. Otherwise use the design tokens defined in this document and keep branding easy to swap later.

---

# 0. Mandatory Agent Hierarchy

This project must be executed as a controlled multi-agent workflow.

## 0.1 Claude Opus 5 — Lead Architect / Orchestrator

Claude Opus 5 is the **planning and orchestration layer**.

### Opus responsibilities

- Inspect the repository before any implementation.
- Understand current dependencies, configuration, scripts, code, and git state.
- Produce the architecture and technical plan.
- Create and maintain project documentation.
- Define domain contracts and shared types.
- Define routes, component boundaries, state boundaries, and design-system rules.
- Break work into implementation phases.
- Delegate implementation tasks.
- Define file ownership before each implementation phase.
- Review the work produced by Sonnet and Codex.
- Resolve conflicts or architectural disagreements.
- Approve or reject phase completion.
- Maintain the progress and decision logs.
- Perform the final convergence review.

### Opus must NOT

- Be the primary feature developer.
- Build routine React components.
- Write large JSX/TSX implementations.
- Populate repetitive mock datasets.
- Perform ordinary Tailwind styling.
- Implement routine tests.
- Rewrite working Sonnet code simply because Opus prefers another style.
- Allow multiple implementation agents to modify the same files concurrently.

Opus plans, delegates, reviews, and decides.

---

## 0.2 Claude Sonnet 5 + Ultracode — Primary Implementation Engineer

Claude Sonnet 5 is the **main coding agent**.

Use **Ultracode mode when available in the current environment** for substantive implementation phases.

### Sonnet responsibilities

- Next.js implementation.
- React and TypeScript.
- Tailwind CSS.
- shadcn/ui customization.
- Zustand stores.
- Local mock data.
- Forms and validation.
- Recharts.
- FullCalendar.
- Responsive behavior.
- Demo authentication.
- Local interaction state.
- Tests.
- Bug fixes.
- Refactors approved by Opus.
- Accessibility fixes.
- UI polish.
- Performance improvements.

### Sonnet restrictions

Sonnet must not silently change any approved:

- architecture;
- route structure;
- domain interface;
- technology choice;
- state-management strategy;
- design token;
- shared contract.

If a structural change is needed, Sonnet must stop and report it to Opus.

---

## 0.3 OpenAI Codex — Senior Reviewer / QA / Debugging Specialist

Use Codex primarily as an **independent technical reviewer**, not as a second primary developer.

### Preferred model

Use **GPT-6 Astra in Codex when available** for:

- complex code review;
- difficult bugs;
- cross-module reasoning;
- final technical audit;
- TypeScript/state correctness;
- high-impact architecture verification;
- difficult Next.js issues;
- adversarial UX review.

If GPT-6 Astra is unavailable or quota should be conserved, use **GPT-5.6 Sol** for routine review.

### Codex responsibilities

- Independent code review.
- TypeScript correctness.
- State-flow analysis.
- React rendering analysis.
- Next.js correctness.
- Accessibility review.
- Responsive review.
- Test-gap analysis.
- Performance review.
- Hidden edge-case discovery.
- Debugging difficult issues.
- Dependency sanity checks.

### Codex restrictions

Codex must not:

- duplicate Sonnet's implementation;
- rewrite working modules because of stylistic preference;
- change architecture without Opus approval;
- edit files concurrently with Sonnet;
- add technologies outside the approved stack.

Codex may implement a narrowly scoped fix only when Opus explicitly assigns it and file ownership does not overlap with Sonnet.

---

# 1. Core Product Objective

Build a polished **frontend demo** of a boutique fitness studio management and class-booking platform.

The demo should make a gym owner understand:

> "This is what running our studio through a custom digital platform could feel like."

The demo must convincingly demonstrate:

- dashboard and KPIs;
- class schedule;
- class capacity;
- reservations;
- customers;
- instructors;
- memberships;
- attendance indicators;
- simulated reminders;
- simulated WhatsApp confirmations;
- analytics;
- public mobile booking;
- future automation potential.

The demo does **not** require a real production backend.

---

# 2. Strict Demo Scope

## 2.1 Build now

- Frontend application.
- Local/mock data.
- Realistic interactive state.
- Optional Supabase Auth.
- Demo fallback auth.
- Responsive UI.
- Charts.
- Calendar.
- Forms.
- Filters.
- Search.
- Dialogs/sheets.
- Customer-facing booking experience.
- Simulated messaging/automations.
- Automated tests for critical flows.

## 2.2 Do NOT build now

Do not implement any of the following:

- production PostgreSQL database;
- real reservation backend;
- real WhatsApp Cloud API;
- real Instagram API;
- real email sending;
- real payments;
- Wompi;
- Stripe;
- Trigger.dev;
- production queues;
- real notification infrastructure;
- production multi-tenancy;
- accounting;
- invoicing;
- payroll;
- inventory;
- biometric check-in;
- native mobile app;
- customer push notifications;
- CRM integration;
- microservices;
- Redis;
- Kafka;
- RabbitMQ;
- custom backend infrastructure.

Future capabilities may be **shown visually** but must remain simulated.

---

# 3. Approved Technology Stack

The stack is fixed unless Opus documents and approves a change.

## Core

- **Next.js** — App Router.
- **React**.
- **TypeScript** — strict mode.

If an existing repository already uses a compatible stable version, preserve it unless there is a concrete reason to upgrade.

For a greenfield project, use the current stable release.

## Package manager

Prefer:

- **pnpm**

If the repository already uses npm/yarn consistently, do not switch package managers without a reason.

## Styling

- **Tailwind CSS**
- **shadcn/ui**

Important:

- shadcn components are a starting point, not the final appearance.
- Heavily customize them to match the pastel, rounded fitness SaaS aesthetic.
- Do not leave the application looking like default shadcn.

## Icons

- **Lucide React**

Use tree-shakeable imports.

## State

- **Zustand**

Use it for demo interaction state shared between routes/modules.

Do not use Redux.

## Forms

- **React Hook Form**
- **Zod**

## Charts

- **Recharts**

## Calendar

- **FullCalendar**

Load it only where needed if practical.

## Dates

- **date-fns**

## Authentication

- **Supabase Auth**, optional.
- Must include a **Demo Auth fallback** when Supabase ENV variables are not present.

Supabase is for **authentication only** in this demo.

## Testing

- **Vitest**
- **React Testing Library**
- **Playwright**

## Deployment

- **Vercel**

## Explicitly excluded from this demo

Do not add:

- Firebase
- MongoDB
- Prisma
- Express
- NestJS
- Laravel
- Redis
- production DBs
- payment gateways
- messaging APIs
- unnecessary backend services

---

# 4. Mandatory Documentation-First Workflow

Before application feature code is written, Opus must create:

```text
/docs
  00-PROJECT-OVERVIEW.md
  01-TECHNOLOGIES.md
  02-ARCHITECTURE.md
  03-DESIGN-SYSTEM.md
  04-DOMAIN-MODEL.md
  05-MOCK-DATA-STRATEGY.md
  06-ROUTES-AND-SCREENS.md
  07-COMPONENT-ARCHITECTURE.md
  08-STATE-MANAGEMENT.md
  09-DEMO-FLOWS.md
  10-IMPLEMENTATION-PLAN.md
  11-TEST-PLAN.md
  12-AGENT-OWNERSHIP.md
  13-DECISIONS.md
  14-PROGRESS.md
  15-DEMO-SCRIPT.md
```

Also create in project root:

```text
CLAUDE.md
README.md
```

---

# 5. `/docs/01-TECHNOLOGIES.md` — Required Content

This document must be generated before implementation and must explicitly document:

## Core

- Next.js
- React
- TypeScript

Explain why each is appropriate for a fast commercial demo and a future SaaS evolution.

## Styling

- Tailwind CSS
- shadcn/ui

Explain that shadcn provides editable component source and is being used only as a UI foundation.

## Icons

- Lucide React

## State

- Zustand

Explain why global demo state is needed to keep Dashboard, Bookings, Calendar, and Public Booking synchronized without a real backend.

## Forms

- React Hook Form
- Zod

## Charts

- Recharts

## Calendar

- FullCalendar

## Dates

- date-fns

## Authentication

- Supabase Auth
- DemoAuth fallback

Explain:

- Supabase must be hidden behind an auth abstraction.
- Missing environment variables must not break the demo.
- Demo credentials must still work.

## Mock data

- Local deterministic TypeScript datasets.
- Shared source of truth.
- Repository/service abstraction to facilitate future backend replacement.

## Testing

- Vitest
- React Testing Library
- Playwright

## Deployment

- Vercel

## Future production technologies — DOCUMENT ONLY

Create a clearly marked section:

> `FUTURE / OUT OF DEMO SCOPE`

Mention potential future use of:

- Supabase PostgreSQL
- Row Level Security
- Meta WhatsApp Cloud API
- Instagram Messaging API
- Wompi
- Trigger.dev
- Resend

Do not implement them.

---

# 6. Recommended Project Structure

```text
src/
  app/
    (auth)/
    (admin)/
    book/

  components/
    layout/
    dashboard/
    calendar/
    bookings/
    customers/
    classes/
    instructors/
    memberships/
    automations/
    booking/
    shared/
    ui/

  data/
    customers.ts
    bookings.ts
    classes.ts
    instructors.ts
    memberships.ts
    schedule.ts
    automations.ts
    notifications.ts

  domain/
    types/
    selectors/
    constants/

  stores/

  services/
    auth/
    repositories/

  hooks/

  lib/

  styles/

  test/
```

Principles:

- Pages should compose components, not contain huge feature implementations.
- Do not scatter business logic inside JSX.
- Prefer selectors/helpers/stores/services for logic.
- Do not over-engineer abstraction layers.
- Keep replacement of mock data with a future API feasible.

---

# 7. Lightweight Data Abstraction

Mock data must not be hardcoded independently inside pages.

Create lightweight repository/service contracts such as:

- `BookingRepository`
- `CustomerRepository`
- `ClassRepository`
- `InstructorRepository`

Demo implementations can be:

- `MockBookingRepository`
- `MockCustomerRepository`
- `MockClassRepository`
- `MockInstructorRepository`

The architecture should make a future:

- `SupabaseBookingRepository`

possible without rewriting the entire UI.

Do **not** build enterprise-style repository boilerplate. Keep it pragmatic.

---

# 8. Domain Model

Create strict TypeScript models.

## Organization

```text
id
name
logo
timezone
address
phone
email
```

## Customer

```text
id
name
email
phone
avatar
status
membershipId
joinedAt
lastVisit
classesThisMonth
attendanceRate
```

## Instructor

```text
id
name
avatar
specialty
rating
status
weeklySessions
bio
```

## ClassType

```text
id
name
description
durationMinutes
defaultCapacity
category
accent
```

## ClassSession

```text
id
classTypeId
instructorId
date
startTime
endTime
capacity
booked
room
status
```

## Booking

```text
id
customerId
sessionId
status
source
createdAt
checkedInAt
```

## MembershipPlan

```text
id
name
monthlyPrice
classLimit
benefits
accent
```

## Automation

```text
id
name
channel
trigger
status
description
```

## Notification

```text
id
type
title
description
createdAt
read
```

## Enums / unions

### BookingStatus

```text
confirmed
pending
cancelled
waitlist
```

### BookingSource

```text
website
whatsapp
instagram
reception
```

### CustomerStatus

```text
active
inactive
paused
```

### InstructorStatus

```text
available
in_class
off_today
```

---

# 9. Mock Data Strategy

The demo should feel populated and realistic.

Target approximately:

- 148 customers.
- 132 active memberships.
- 6 instructors.
- 8 class types.
- 50–80 bookings.
- Two weeks of class sessions.
- 4 membership plans.
- 4 automations.
- 10 notifications.

Do not handwrite 148 unique objects.

Use deterministic generation helpers/seeds.

Important featured records can be manually authored.

## Privacy rule

Do not use real personal data.

Use labels such as:

```text
Customer 01
Customer 02
Customer 03
```

and:

```text
Instructor 01
Instructor 02
...
```

## Single source of truth

All screens must derive metrics from shared data/state.

Example:

`Dashboard -> Today's bookings`

must use the same bookings as:

- `/bookings`
- `/calendar`
- `/classes/[id]`

Never independently hardcode conflicting totals.

---

# 10. Demo Data Story

The mocked data should create a believable business story.

Include:

- full classes;
- almost-full classes;
- classes with availability;
- confirmed bookings;
- pending bookings;
- cancellations;
- waitlist entries;
- website bookings;
- WhatsApp-source bookings;
- Instagram-source bookings;
- reception bookings.

Target overall occupancy:

- approximately 80–87%.

Functional Training should appear among the higher-demand classes.

Weekday and weekend behavior should differ realistically.

---

# 11. Routes

Implement:

```text
/login

/dashboard

/calendar

/bookings

/customers
/customers/[id]

/classes
/classes/[id]

/instructors
/instructors/[id]

/memberships

/automations

/settings

/book
/book/[classId]
```

Also provide:

- not-found behavior;
- reusable error states;
- appropriate loading states.

---

# 12. Visual Direction

The application should feel like a:

> premium boutique fitness SaaS platform

Keywords:

- minimal;
- rounded;
- pastel;
- modern;
- clean;
- friendly;
- premium;
- spacious;
- editorial;
- card-based;
- subtle Bento-grid influence.

Reference language:

- soft purple;
- light yellow;
- neutral white surfaces;
- restrained charts;
- clear hierarchy;
- large rounded cards;
- minimal borders;
- friendly data visualization.

Do not directly clone the reference.

Create an original system inspired by that visual language.

Avoid:

- neon gym aesthetics;
- heavy black backgrounds;
- aggressive bodybuilding style;
- generic Bootstrap admin look;
- heavy gradients;
- glassmorphism everywhere;
- excessive shadows;
- visual clutter.

---

# 13. Design Tokens

## Colors

```text
background          #F7F7F5
surface             #FFFFFF
surface-muted       #F1F1EF

text-primary        #171717
text-secondary      #737373
border              #ECECEA

primary-purple      #7869D4
purple-soft         #DDD8FA
purple-extra-soft   #F0EDFF

pastel-yellow       #F5D889
yellow-soft         #FFF4D3

pastel-green        #BFE5CA
green-soft          #E7F5EB

pastel-pink         #F2C9D3
pastel-blue         #D8E6F6

danger              #EF8F8F
```

Use approximately:

- 70% neutrals;
- 20% pastel;
- 10% strong visual accent.

Do not create a rainbow UI.

## Typography

Preferred:

- Manrope

Fallback:

- Inter
- system sans-serif

Suggested sizes:

```text
Page title      30px / 700
Section title   20px / 650
Card metric     32px / 700
Body            14–15px
Small label     12–13px
```

## Shape

```text
Main cards       24px
Secondary cards  18px
Inputs           12px
Buttons          12–14px
Dialogs          24px
Pills            999px
```

## Shadows

Use subtle borders and minimal shadows.

Example:

```css
box-shadow: 0 4px 18px rgba(0,0,0,0.04);
```

---

# 14. Responsive Layout

Primary desktop target:

- 1440px.

Also support:

- 1366px;
- 1280px;
- tablet;
- mobile.

Desktop sidebar:

- approximately 240px.

Main content padding:

- 28–32px.

Grid gaps:

- 20–24px.

Maximum content width:

- approximately 1500px.

On smaller screens:

- sidebar becomes drawer;
- grids collapse naturally;
- public booking is mobile-first;
- important datasets should use mobile card views when better than horizontal overflow.

---

# 15. App Shell

## Sidebar

Top:

- gym logo placeholder.

Navigation:

- Dashboard
- Calendar
- Bookings
- Customers
- Classes
- Instructors
- Memberships

Secondary:

- Automations
- Settings

Bottom:

```text
Administrator
Admin
Logout
```

Use Lucide icons.

Active item:

- soft purple background;
- strong purple/dark text.

## Top bar

Include:

- global search;
- notifications;
- help;
- profile/avatar.

Search placeholder:

```text
Search customers, classes...
```

Notification unread indicator:

```text
3
```

---

# 16. Login

Create a premium login page.

Desktop:

- split layout;
- one side with an abstract boutique-fitness visual;
- one side with login card.

Fields:

- Email
- Password
- Remember me

Visual secondary link:

- Forgot password

CTA:

- Sign in

Supporting line:

```text
Manage your classes, customers and bookings from one place.
```

Demo credentials:

```text
admin@demo.com
demo1234
```

Behavior:

- If Supabase env vars exist: use Supabase Auth.
- If they do not: automatically use Demo Auth.
- Redirect successful login to `/dashboard`.

---

# 17. Dashboard

Header:

```text
Good morning
Here's what's happening at your studio today.
```

Do not show a real person's name.

## KPI cards

### Active members

```text
148
+8 this month
```

### Today bookings

Derived from store.

Visual comparison:

```text
+12% vs yesterday
```

### Occupancy

Derived from session/bookings data.

Target around:

```text
87%
```

### Today's classes

Derived.

Example:

```text
6
2 nearly full
```

Each KPI card may have a restrained pastel accent but should remain visually cohesive.

---

# 18. Weekly Bookings Chart

Use Recharts.

Reference pattern:

```text
Mon 18
Tue 24
Wed 21
Thu 32
Fri 38
Sat 42
Sun 25
```

Prefer derived values from mock data when practical.

Use either:

- clean bar chart;
- smooth area chart.

Requirements:

- minimal grid;
- custom tooltip;
- purple primary series;
- readable labels;
- textual context for accessibility.

---

# 19. Class Occupancy

Display:

```text
Functional Training   87%
Cycling               94%
Yoga                  67%
Pilates               72%
HIIT                   83%
```

Prefer derived values.

Use horizontal progress indicators.

---

# 20. Upcoming Classes

Display next four sessions.

Each item:

- time;
- class;
- instructor;
- available/booked spots;
- status;
- avatar;
- small occupancy indicator.

Statuses:

- Available
- Almost full
- Full

---

# 21. Recent Bookings

Modern table/card.

Columns:

- Customer
- Class
- Date
- Time
- Source
- Status

Status pills:

- Confirmed → green
- Pending → yellow
- Cancelled → pink/red
- Waitlist → purple/neutral

Rows must derive from the booking store.

---

# 22. Calendar

Use FullCalendar.

Views:

- Week
- Month
- Day

Default:

- Week.

Assign a consistent pastel category accent by class type.

Clicking an event opens:

`SessionDetailsSheet`

Content:

- class;
- date;
- time;
- instructor;
- room;
- capacity;
- bookings;
- available spots.

Actions:

- View bookings
- Edit class

Edit may remain local/demo only.

---

# 23. Bookings Module

Header:

```text
Bookings
Manage all class reservations.
```

Controls:

- Search
- Status filter
- Date filter
- Source filter
- New booking

Tabs:

```text
All
Confirmed
Pending
Cancelled
Waitlist
```

Table:

- Customer
- Class
- Instructor
- Date
- Time
- Source
- Status

Sources:

- Website
- WhatsApp
- Instagram
- Reception

WhatsApp and Instagram are labels only.

No external API.

---

# 24. New Booking Flow

CTA:

```text
New booking
```

Open dialog or side sheet.

Fields:

- Customer
- Class
- Date
- Time
- Instructor

Show capacity, e.g.:

```text
12 / 15 spots reserved
```

Validate with Zod.

Submit behavior:

- add booking to Zustand;
- update related state;
- show toast:

```text
Booking created successfully
```

The new booking should immediately affect:

- booking list;
- dashboard count;
- relevant class occupancy;
- calendar/session state where applicable.

Data only needs to persist for the browser session.

---

# 25. Customers

Top metrics:

- Total customers
- Active memberships
- New this month
- Inactive

Table:

- Avatar
- Customer
- Membership
- Last visit
- Classes this month
- Status

Include:

- search;
- filters;
- sensible pagination/page size.

---

# 26. Customer Detail

Header:

- avatar;
- `Customer XX`;
- status.

Information:

- email;
- phone;
- member since;
- membership;
- remaining credits.

Stats:

- classes this month;
- attendance rate;
- no-shows;
- favorite class.

Include:

- membership card;
- recent activity timeline.

Example activity:

```text
Attended Functional Training
Reserved Cycling
Cancelled Yoga
Membership renewed
```

---

# 27. Classes

Create 8 class types:

```text
Functional Training
Cycling
Yoga
Pilates
HIIT
Strength
Mobility
Boxing
```

Each card:

- icon;
- name;
- description;
- weekly sessions;
- average occupancy;
- assigned instructors.

Use consistent class-category accent colors.

---

# 28. Class Detail

Display:

- name;
- description;
- duration;
- capacity;
- instructor avatar group;
- weekly schedule.

KPIs:

- Average occupancy
- Bookings this month
- Cancellation rate

Chart:

- bookings by weekday.

---

# 29. Instructors

Create six generic instructors:

```text
Instructor 01
Instructor 02
Instructor 03
Instructor 04
Instructor 05
Instructor 06
```

Display:

- avatar;
- specialty;
- weekly sessions;
- rating;
- status.

Statuses:

- Available
- In class
- Off today

---

# 30. Instructor Detail

Show:

- specialty;
- rating;
- short bio;
- weekly schedule.

Stats:

- classes this month;
- reservations;
- occupancy;
- rating.

Also include:

- recent classes;
- calendar preview.

---

# 31. Memberships

Plans:

## Basic

```text
$29/month
8 classes/month
```

## Unlimited

```text
$49/month
Unlimited classes
```

## Premium

```text
$69/month
Unlimited classes
Priority booking
1 guest pass
```

## Day Pass

```text
$8
Single class
```

No real payments.

Actions:

- Edit plan
- View members

These actions may be local/demo only.

---

# 32. Automations

This page exists to communicate future value.

Do not call any external API.

Cards:

## Booking confirmation

```text
Status: Active
Channel: WhatsApp
Trigger: New booking
```

## 24-hour reminder

```text
Status: Active
Channel: WhatsApp
```

## Inactive customer reminder

```text
Status: Paused
Channel: WhatsApp
```

## Birthday message

```text
Status: Draft
Channel: WhatsApp
```

Toggles should work in local state.

Toast example:

```text
Automation activated
```

---

# 33. WhatsApp Simulation

No WhatsApp API.

Create a visual message preview.

Example:

```text
Booking confirmation

Your reservation is confirmed.

Functional Training

Friday, September 18
6:00 PM

We look forward to seeing you.
```

Status:

```text
Delivered
```

Buttons:

- Send test
- Edit template

`Send test`:

- simulate ~800 ms loading;
- show toast:

```text
Test message sent
```

No real message is transmitted.

---

# 34. Public Booking Experience

This is a **high-priority demo flow**.

Route:

```text
/book
```

Rules:

- no admin sidebar;
- mobile-first;
- highly polished;
- visually branded;
- simple and fast.

Flow:

1. Choose class.
2. Choose date.
3. Choose time.
4. Enter customer information.
5. Confirmation.

---

# 35. Public Booking — Step 1

Class cards:

- Functional Training
- Cycling
- Yoga
- Pilates
- HIIT

Each card:

- icon;
- duration;
- short description;
- available sessions.

---

# 36. Public Booking — Step 2

Horizontal date selector.

Example:

```text
THU 17
FRI 18
SAT 19
SUN 20
MON 21
```

Make the selected state visually clear.

---

# 37. Public Booking — Step 3

Time slots with capacity.

Example:

```text
6:00 AM    12 / 15 spots
9:00 AM    14 / 15 spots
5:00 PM     8 / 15 spots
6:00 PM     FULL
7:00 PM    18 / 20 spots
```

Full sessions must be disabled.

---

# 38. Public Booking — Step 4

Fields:

- Name
- Phone
- Email

Use React Hook Form + Zod.

Allow realistic demo input.

CTA:

```text
Confirm reservation
```

On successful submit:

- update demo booking state if appropriate;
- prevent double submission;
- navigate to success state.

---

# 39. Booking Success

Show:

- large success indicator;
- class;
- date;
- time;
- studio location.

Heading:

```text
Your class is booked!
```

Message:

```text
Your confirmation has been sent by WhatsApp.
```

This statement is explicitly simulated.

Buttons:

- Add to calendar
- View booking
- Book another class

---

# 40. Settings

Sections:

## General

- Studio name
- Email
- Phone
- Address
- Timezone

## Booking

- Cancellation window
- Max reservations per day
- Waitlist enabled
- Advance booking period

## Notifications

- WhatsApp confirmations
- Email confirmations
- Reminder timing

## Branding

- Logo
- Primary color
- Accent color

All settings are local/demo state.

---

# 41. Global Search

Search across:

- Customers
- Classes
- Instructors

Group dropdown results by type.

Example:

```text
Customer 04
Customer

Functional Training
Class

Instructor 02
Instructor
```

Clicking a result navigates to the correct entity.

Keyboard navigation is required.

---

# 42. Notifications

Create notification dropdown.

Examples:

```text
New booking received
2 minutes ago

Functional Training is full
10 minutes ago

Booking cancelled
25 minutes ago
```

Include:

- unread state;
- mark-as-read visual behavior.

---

# 43. Zustand State Architecture

Prefer focused stores, such as:

```text
useBookingStore
useCustomerStore
useSessionStore
useAutomationStore
useNotificationStore
useSettingsStore
```

Do not split stores without reason and do not create a single giant store if it becomes difficult to maintain.

Useful selectors/helpers:

```text
getTodayBookings()
getUpcomingSessions()
getBookingsByClass()
getBookingsBySession()
getBookingsByCustomer()
getClassOccupancy()
getActiveMembers()
getAlmostFullSessions()
getRecentBookings()
getClassPopularity()
```

Prevent unnecessary re-renders.

---

# 44. Demo Authentication

Create an abstraction such as:

```text
AuthProvider
DemoAuthProvider
SupabaseAuthProvider
```

Behavior:

## If these exist

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

use Supabase Auth.

## If not

automatically use Demo Auth.

Demo credentials:

```text
admin@demo.com
demo1234
```

Protect admin routes sufficiently for a demo.

Do not pretend this is production-grade authorization.

---

# 45. Demo Mode Indicator

Display a discreet:

```text
Demo Mode
```

badge.

Tooltip:

```text
Some data and functionality in this environment are simulated.
```

It should be visible but not visually intrusive.

---

# 46. Loading States

Even with local data, use short simulated loading where useful.

Target:

- approximately 250–450 ms.

Use skeletons for:

- dashboard cards;
- tables;
- charts;
- selected heavy views.

Do not intentionally make navigation feel slow.

---

# 47. Empty States

Provide polished empty states.

Example:

```text
No bookings found

Try changing your filters or create a new booking.

[Create booking]
```

---

# 48. Error States

Create reusable error UI.

Example:

```text
Something went wrong

[Try again]
```

Use appropriate Next.js error boundaries where useful.

---

# 49. Accessibility

Accessibility is part of completion criteria.

Required:

- semantic HTML;
- keyboard navigation;
- visible focus states;
- labels for fields;
- correct dialog focus management;
- ARIA only where useful;
- adequate contrast;
- accessible dropdowns;
- accessible tooltips;
- meaningful text around charts;
- no interaction that depends exclusively on color.

---

# 50. Motion

Use subtle transitions:

- 150–250 ms.

Allowed:

- fade;
- small translate;
- light hover elevation;
- progress transitions.

Avoid:

- large parallax;
- excessive springs;
- decorative motion that delays interaction;
- animated clutter.

---

# 51. Reusable Components

Potential components:

```text
AppSidebar
TopBar
PageHeader
StatCard
SectionCard
StatusBadge
AvatarGroup
DataTable
SearchInput
FilterBar
EmptyState
ErrorState
LoadingSkeleton
SessionCard
ClassCard
InstructorCard
MembershipCard
BookingDialog
SessionDetailsSheet
ConfirmDialog
DemoBadge
```

Do not abstract solely for abstraction's sake.

Create components when:

- there is clear semantic ownership;
- the pattern repeats;
- reuse improves consistency.

---

# 52. Code Quality

TypeScript:

- `strict: true`.

Avoid:

- `any` unless technically unavoidable and documented.

No:

- console errors;
- React warnings;
- hydration errors;
- unhandled promises;
- duplicate keys;
- broken routes;
- dead navigation.

Do not silence ESLint rules to force a green build.

Fix root causes.

---

# 53. Performance

Targets:

- fast local startup;
- reasonable client bundle;
- no giant unnecessary dependencies;
- minimal unnecessary re-renders;
- lazy-load heavy modules where useful;
- import only needed Lucide icons;
- avoid loading FullCalendar globally.

Do not prematurely optimize tiny details at the cost of readability.

---

# 54. Test Strategy

Do not chase 100% coverage.

Test behavior that matters to the demo.

## Unit / component

Test:

- status badge;
- selectors;
- booking creation;
- booking cancellation;
- capacity calculations;
- form validation;
- search logic.

## Playwright critical flows

### Flow 1

```text
Demo login
→ Dashboard
```

### Flow 2

```text
Dashboard
→ New Booking
→ Create
→ Booking appears
```

### Flow 3

```text
Calendar
→ Open class
→ Inspect capacity
```

### Flow 4

```text
Customers
→ Customer detail
```

### Flow 5

```text
Public booking
→ select class
→ select date
→ select time
→ enter customer
→ confirm
→ success
```

### Flow 6

Public booking on mobile viewport.

### Flow 7

Navigation smoke test for primary admin routes.

---

# 55. Phase-Based Multi-Agent Workflow

No phase should start without Opus confirming the preceding phase.

---

## Phase 0 — Repository Inspection

**Owner:** Opus

Inspect:

- git status;
- branch;
- package.json;
- package manager;
- lockfile;
- existing Next.js version;
- TypeScript;
- Tailwind;
- current routes;
- current component library;
- lint/test scripts;
- existing assets;
- existing work that must be preserved.

Write findings to:

```text
/docs/00-PROJECT-OVERVIEW.md
```

Do not overwrite useful work.

---

## Phase 1 — Architecture & Documentation

**Owner:** Opus

Create all planning docs.

No feature implementation.

Validate:

- stack compatibility;
- route architecture;
- domain model;
- state model;
- design system;
- mock data strategy;
- test strategy;
- file ownership strategy.

At the end of Phase 1, present the implementation plan before delegating Phase 2.

---

## Phase 2 — Foundation

**Primary implementer:** Sonnet 5 + Ultracode

Tasks:

- dependencies;
- global styles;
- design tokens;
- font;
- shadcn foundation;
- app shell;
- sidebar;
- top bar;
- domain types;
- local data architecture;
- Zustand foundation;
- repository mocks;
- auth abstraction;
- Demo Mode badge;
- shared components.

### Review

Codex GPT-6 Astra reviews Phase 2.

Codex is read-only unless Opus assigns a correction.

Sonnet implements approved fixes.

Opus accepts/rejects the phase.

---

## Phase 3 — Dashboard

**Primary implementer:** Sonnet

Build:

- header;
- KPIs;
- charts;
- occupancy;
- upcoming classes;
- recent bookings;
- skeletons;
- responsive behavior.

### Codex review

Focus on:

- derived data correctness;
- chart correctness;
- state consistency;
- responsive behavior;
- TypeScript;
- accessibility.

Sonnet fixes approved findings.

Opus accepts.

---

## Phase 4 — Calendar & Bookings

**Primary implementer:** Sonnet

Build:

- FullCalendar;
- session details;
- bookings table;
- filters;
- status handling;
- new booking;
- booking state mutations.

### Codex review

Focus on:

- capacity consistency;
- state synchronization;
- filters;
- date behavior;
- duplicate booking behavior;
- rendering issues.

Sonnet fixes.

Opus accepts.

---

## Phase 5 — Customers

**Primary implementer:** Sonnet

Build:

- customer listing;
- KPI cards;
- search;
- filters;
- customer detail;
- activity timeline;
- membership information.

Codex reviews.

Sonnet fixes.

Opus accepts.

---

## Phase 6 — Classes & Instructors

**Primary implementer:** Sonnet

Build:

- classes;
- class detail;
- instructors;
- instructor detail;
- charts/schedule previews.

Codex reviews architecture, responsiveness, and data consistency.

Sonnet fixes.

Opus accepts.

---

## Phase 7 — Memberships & Automations

**Primary implementer:** Sonnet

Build:

- membership plans;
- local plan interactions;
- automation cards;
- toggles;
- WhatsApp simulation;
- fake test send.

Codex explicitly verifies:

- no real external integrations exist;
- simulation is clearly contained.

Sonnet fixes.

Opus accepts.

---

## Phase 8 — Public Booking Experience

**Priority:** HIGH

**Primary implementer:** Sonnet

Build:

- mobile-first `/book`;
- class selection;
- date selection;
- time-slot selection;
- customer form;
- confirmation;
- state synchronization where useful.

### Codex GPT-6 Astra adversarial review

Specifically test:

- selecting full class;
- invalid email;
- missing required phone;
- no selected class;
- no selected time;
- duplicate submit;
- back navigation;
- mobile viewport;
- inconsistent capacity;
- successful booking count update;
- repeated booking flow.

Sonnet fixes.

Opus accepts.

---

## Phase 9 — Authentication & Settings

**Primary implementer:** Sonnet

Build:

- optional Supabase Auth;
- Demo Auth fallback;
- route protection;
- settings local state;
- safe fallback when env variables are absent.

### Codex review

Focus on:

- demo auth correctness;
- graceful fallback;
- accidental exposure of secrets;
- no production security claims.

Sonnet fixes.

Opus accepts.

---

## Phase 10 — Tests

**Primary implementer:** Sonnet

Add:

- Vitest;
- React Testing Library;
- Playwright critical flows.

Codex identifies missing high-value cases.

Sonnet fills approved gaps.

---

## Phase 11 — Polish

**Primary implementer:** Sonnet

Review:

- spacing;
- typography;
- visual consistency;
- tablet;
- mobile;
- animations;
- empty states;
- loading states;
- error states;
- accessibility;
- performance.

Codex GPT-6 Astra performs final technical review.

---

## Phase 12 — Final Convergence

**Owner:** Opus

Opus reviews:

- requirements;
- architecture;
- demo story;
- routes;
- docs;
- test results;
- Codex findings;
- unresolved issues;
- visual consistency.

Opus should not rewrite the application.

If work remains, delegate it.

Completion is allowed only after the acceptance criteria are actually verified.

---

# 56. File Ownership Rule

Before every phase, Opus must update:

```text
/docs/12-AGENT-OWNERSHIP.md
```

Example:

```md
## Phase 3

### Sonnet — WRITE
- src/app/dashboard/**
- src/components/dashboard/**
- src/domain/selectors/dashboard.ts

### Codex — READ ONLY
- entire repository

### Opus
- docs/**
- review only for implementation code
```

Never permit Sonnet and Codex to write overlapping files concurrently.

---

# 57. Agent Handoff Template

Every delegated task must use this format:

```md
# TASK

## Goal

## Context

## Files allowed to modify

## Files read-only

## Dependencies / contracts

## Design requirements

## Acceptance criteria

## Required verification

## Commands to run

## Expected handoff output
```

Example:

```md
# TASK
Implement Dashboard KPI System

## Goal
Create dashboard KPI cards derived from shared mock state.

## Files allowed
- src/app/dashboard/**
- src/components/dashboard/**
- src/domain/selectors/dashboard.ts

## Files read-only
- src/domain/types/**
- src/data/**

## Acceptance criteria
- metrics derive from shared datasets
- responsive 4/2/1 grid
- loading skeleton
- no duplicated metric constants
- no TypeScript errors

## Verify
pnpm typecheck
pnpm lint
pnpm test
```

---

# 58. Codex Review Format

Whenever Codex performs a review, require:

```md
# Review summary

## Critical

## High

## Medium

## Low

## Positive observations

## Recommended fixes

## Verification commands
```

Every finding should include:

- file;
- line/component;
- issue;
- impact;
- recommended correction.

Codex should avoid stylistic churn.

Only recommend changes that materially improve:

- correctness;
- maintainability;
- UX;
- accessibility;
- performance;
- consistency;
- test reliability.

---

# 59. Progress Tracking

After each phase update:

```text
/docs/14-PROGRESS.md
```

Use:

```md
# Current phase

# Completed

# In progress

# Pending

# Known issues

# Decisions made

# Latest verification results

# Current file ownership

# Next agent

# Next exact action
```

This document is the recovery point after:

- context compaction;
- app restart;
- agent switch;
- interrupted work session.

---

# 60. Decision Log

Maintain:

```text
/docs/13-DECISIONS.md
```

Use an ADR-like format:

```md
## Decision

### Context

### Alternatives considered

### Chosen solution

### Reason

### Consequences
```

Do not reopen settled architectural choices without new evidence.

---

# 61. Demo Presentation Script

Create:

```text
/docs/15-DEMO-SCRIPT.md
```

Recommended presentation:

1. Login.
2. Dashboard.
3. Explain active members, bookings, occupancy, today's classes.
4. Calendar.
5. Show weekly schedule and class capacity.
6. Create a new booking.
7. Show immediate synchronization.
8. Open Customers.
9. Show customer profile/activity/membership.
10. Open Automations.
11. Explain future WhatsApp value.
12. Switch to mobile viewport.
13. Open public booking.
14. Complete customer booking.
15. Show success.
16. Return to admin.
17. Show reservation reflected.
18. Close with future roadmap:
   - real WhatsApp;
   - payments;
   - loyalty;
   - multi-location;
   - production backend.

---

# 62. README Requirements

Create a polished root `README.md`.

Include:

- project purpose;
- demo scope;
- screenshots section placeholder;
- tech stack;
- demo credentials;
- local setup;
- environment variables;
- commands;
- architecture overview;
- mock data explanation;
- testing;
- Vercel deployment notes;
- future production migration.

Commands should reflect the real package.json.

Expected commands where applicable:

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
```

Environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Document clearly:

> If Supabase variables are not configured, the application automatically uses Demo Auth.

---

# 63. CLAUDE.md Requirements

Create root:

```text
CLAUDE.md
```

It must be concise enough for agents to re-read frequently.

Include:

- project purpose;
- current phase;
- current stack;
- architecture invariants;
- design-system invariants;
- route list;
- domain source of truth;
- mock-data rules;
- agent roles;
- file ownership rules;
- test commands;
- current known issues;
- pointers to key docs.

It should direct agents to:

```text
/docs/10-IMPLEMENTATION-PLAN.md
/docs/13-DECISIONS.md
/docs/14-PROGRESS.md
```

before resuming interrupted work.

---

# 64. Git Strategy

Use logical commits.

Suggested messages:

```text
chore: initialize demo architecture
docs: add architecture and implementation plan
feat: add application shell
feat: add dashboard experience
feat: add calendar and booking management
feat: add customer management
feat: add classes and instructors
feat: add membership and automation demos
feat: add public booking flow
feat: add demo authentication
test: add critical flow coverage
fix: address technical review findings
style: finalize responsive visual polish
docs: complete demo documentation
```

Avoid giant unrelated commits.

Before significant changes:

- inspect git status;
- preserve uncommitted user work;
- do not reset or discard changes without explicit approval.

---

# 65. Final Acceptance Checklist

The demo is not complete until all applicable items have been verified.

## Authentication

- [ ] Demo login works.
- [ ] Supabase is optional.
- [ ] Missing Supabase configuration does not break the app.
- [ ] Admin routes have demo-level guarding.

## Dashboard

- [ ] Dashboard is visually polished.
- [ ] KPI data derives from shared state.
- [ ] Weekly chart renders correctly.
- [ ] Occupancy is coherent.
- [ ] Upcoming classes are coherent.
- [ ] Recent bookings are coherent.

## Calendar / bookings

- [ ] Calendar works.
- [ ] Week/month/day views work.
- [ ] Session detail opens.
- [ ] Booking filters work.
- [ ] New booking works.
- [ ] State updates after booking.
- [ ] Capacity stays coherent.

## Customers

- [ ] Customer list works.
- [ ] Search/filter works.
- [ ] Customer detail works.
- [ ] Activity is visually coherent.

## Classes / instructors

- [ ] Classes page works.
- [ ] Class detail works.
- [ ] Instructors page works.
- [ ] Instructor detail works.

## Memberships / automations

- [ ] Memberships render.
- [ ] Automations are clearly simulated.
- [ ] Automation toggles work locally.
- [ ] WhatsApp preview is simulated.
- [ ] No external message is sent.

## Public booking

- [ ] `/book` works.
- [ ] Mobile design is polished.
- [ ] Class selection works.
- [ ] Date selection works.
- [ ] Time selection works.
- [ ] Full session is disabled.
- [ ] Form validation works.
- [ ] Duplicate submit is controlled.
- [ ] Success state works.
- [ ] Booking state updates where expected.

## Global UX

- [ ] Search works.
- [ ] Notifications work.
- [ ] Settings work locally.
- [ ] Empty states exist.
- [ ] Loading states exist.
- [ ] Error states exist.
- [ ] Demo Mode indicator exists.
- [ ] Responsive review completed.
- [ ] Accessibility review completed.

## Engineering quality

- [ ] TypeScript passes.
- [ ] Lint passes.
- [ ] Production build passes.
- [ ] Unit/component tests pass.
- [ ] Playwright critical flows pass.
- [ ] No blocking console errors.
- [ ] No React hydration warnings.
- [ ] Codex final review completed.
- [ ] Approved findings resolved or explicitly documented.
- [ ] Opus final convergence review completed.
- [ ] README complete.
- [ ] Required `/docs` complete.

---

# 66. Non-Negotiable Orchestration Rules

1. **Inspect first.**
2. **Plan before coding.**
3. Opus does not become the routine implementation agent.
4. Sonnet + Ultracode is the primary implementation path.
5. Codex is primarily an independent reviewer/debugger.
6. Never allow overlapping write ownership.
7. Do not add unapproved technology.
8. Do not create production backend infrastructure.
9. Do not call real WhatsApp/Instagram/payment APIs.
10. Keep mock data internally consistent.
11. Update progress after each phase.
12. Record architectural changes.
13. Do not fake test results.
14. Do not claim a feature works without verification.
15. Do not declare completion with known critical/high issues.
16. Preserve existing useful repository work.
17. If the environment lacks an optional integration, degrade gracefully.
18. Prioritize the commercial demo narrative over technical novelty.
19. Avoid feature creep.
20. When architecture is uncertain, Opus resolves it before implementation resumes.

---

# 67. First Action — Mandatory

When this document is first loaded, **do not begin implementing UI immediately**.

Claude Opus 5 must first:

1. Read this document in full.
2. Inspect the repository.
3. Inspect git status.
4. Inspect package.json and lockfile.
5. Identify existing versions/dependencies.
6. Identify conflicts with this plan.
7. Preserve existing useful work.
8. Create the required `/docs` structure.
9. Create `CLAUDE.md`.
10. Produce the architecture plan.
11. Produce the implementation phases.
12. Define Phase 2 file ownership.
13. Update `/docs/14-PROGRESS.md`.
14. Present a concise architecture summary.
15. Only then delegate Phase 2 implementation to Claude Sonnet 5 + Ultracode.

Codex must not be invoked to implement the initial foundation before Opus has completed the architecture.

---

# 68. Initial Opus Output Format

After repository inspection and documentation planning, Opus should report:

```md
# Repository assessment

# Existing stack

# Conflicts / risks

# Architecture decisions

# Documents created

# Phase plan

# Phase 2 ownership

# Sonnet delegation

# Codex review gate

# Verification required before Phase 3
```

Do not provide a generic explanation and stop.

The expected outcome is an actionable plan followed by controlled delegation.

---

# 69. End Goal

The final result must feel like:

> a credible, premium SaaS product demo that can be opened in front of a real gym owner and used interactively without needing a production backend.

It must **not** feel like:

- a wireframe;
- a student assignment;
- a generic CRUD admin;
- an unfinished template;
- a collection of disconnected screens.

The product story, visual system, mock data, interactions, and engineering must all support the same commercial demo narrative.
