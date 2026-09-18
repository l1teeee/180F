# 15 — Demo Presentation Script

Run-of-show for presenting the 180 Fitness Studio demo to a gym owner. Follows the 18-beat sequence in master plan 61. Total target: 10-12 minutes of talking, plus the 60-second pre-flight below (done before the owner sits down, not part of the timed run).

This is a frontend-only demo (master plan 2, architecture 1, architecture 10): no backend, no database, no real WhatsApp, Instagram or payments integration exists anywhere in the running app. Two moments in this script show simulated behavior on purpose (scenes 10 and 14); both are called out to the owner in the same words, so nothing is oversold.

---

## 0. Pre-flight checklist (60 seconds, before the owner arrives)

| # | Action | Detail |
|---|---|---|
| 1 | Start the app | `pnpm dev`, wait for the local server to be ready. |
| 2 | Open the right tab | Navigate to `/login`. Close any other tabs that could steal focus (notifications, email). |
| 3 | Reset the dataset | Open the Demo Mode badge and choose **Reset demo data**, or use the same action at the bottom of Settings. Changes now persist across reloads and tabs (ADR-022), so a reload alone no longer clears a rehearsal - the explicit reset does, and it restores the freshly seeded studio in every open tab at once. |
| 4 | Set browser zoom | `Ctrl/Cmd + 0` — 100%, not the browser's remembered zoom level. |
| 5 | Set window size | Maximize on a display 1440 px wide or larger, or set the browser window to exactly 1440x900. This matches the primary design target (design system 8, master plan 14). Do not present at 1280 or 1366 unless the room's screen forces it. |
| 6 | Stage the mobile switch | Know where DevTools device mode lives (`Ctrl/Cmd + Shift + M`) before you need it live in scene 12. Pre-set a custom viewport width of 390 px — inside the "< 768 px" bracket that design system 8 defines as the mobile-first reference experience for public booking. Do not switch early; do it on camera in scene 12 so the owner sees the app respond. |
| 7 | Know the login | `admin@demo.com` / `demo1234` (master plan 16, 44). Have it memorized or in a note visible only to you. |
| 8 | Point out the disclosure badge once | The "Demo Mode" badge lives in the app shell for the whole session (master plan 45). Mention it exists early so it is not a surprise later — you do not need to explain it in depth until scene 10. |

---

## Summary table

| # | Scene | Duration | Screen |
|---|---|---|---|
| 1 | Sign in | 0:30 | `/login` |
| 2 | Dashboard arrival | 0:20 | `/dashboard` |
| 3 | Read the KPIs | 1:10 | `/dashboard` |
| 4 | Open the calendar | 0:30 | `/calendar` |
| 5 | Week view and capacity | 0:50 | `/calendar` |
| 6 | Create a booking | 1:00 | `/bookings` |
| 7 | Watch every screen agree | 0:40 | `/dashboard`, `/calendar` |
| 8 | Open Customers | 0:25 | `/customers` |
| 9 | One customer's story | 0:50 | `/customers/[id]` |
| 10 | Open Automations (simulated) | 0:30 | `/automations` |
| 11 | The WhatsApp value case | 0:45 | `/automations` |
| 12 | Switch to mobile | 0:20 | any |
| 13 | Public booking opens | 0:30 | `/book` |
| 14 | A customer books herself | 1:10 | `/book` |
| 15 | Booking success (simulated) | 0:30 | `/book` |
| 16 | Back to admin | 0:15 | `/dashboard` |
| 17 | The reservation landed | 0:35 | `/bookings`, `/calendar` |
| 18 | Close with the roadmap | 1:00 | `/dashboard` |
| | **Total** | **~11:50** | |

---

## Scene 1 — Sign in

**Duration:** 30s **Screen:** `/login`

**Click path:**
1. Land on the split-layout login page (master plan 16).
2. Type `admin@demo.com` in Email, `demo1234` in Password.
3. Click **Sign in**.

**Talk track:**
"This is 180 Fitness Studio, running on a login screen like the one your staff would use every morning. I'm signing in as the studio admin."

**Point to land:** this looks and behaves like a real product login, not a prototype.

---

## Scene 2 — Dashboard arrival

**Duration:** 20s **Screen:** `/dashboard`

**Click path:**
1. Sign-in redirects straight to `/dashboard` (master plan 16).
2. Let the skeleton-to-content transition finish (under half a second, master plan 46) without narrating it.

**Talk track:**
"This is what you'd see the moment you open the app in the morning — a snapshot of the studio, right now."

**Point to land:** this is the owner's daily home screen.

---

## Scene 3 — Read the KPIs

**Duration:** 70s **Screen:** `/dashboard`

**Click path:**
1. Point to the four KPI cards in order: Active members, Today's bookings, Occupancy, Today's classes (master plan 17).
2. Point to the weekly bookings chart and read the highlighted bar (design system 6).
3. Point to the class occupancy bars (master plan 19).
4. Point to Upcoming classes and Recent bookings (master plan 20, 21).

**Talk track:**
"148 active members, up 8 this month. Today's bookings compared to yesterday. Occupancy across all classes, around 87 percent, which is healthy for a boutique studio. And today's class count, with a flag for anything nearly full. This week's booking pattern is right here — you can already see which days are busiest. And below, the next few classes coming up and the most recent reservations, so you don't have to go looking for either."

**Point to land:** everything an owner checks every morning is on one screen, and every number ties back to the same underlying bookings — nothing here is a separate, hand-typed figure.

---

## Scene 4 — Open the calendar

**Duration:** 30s **Screen:** `/calendar`

**Click path:**
1. Click **Calendar** in the sidebar (master plan 15).
2. Calendar opens in Week view by default (master plan 22).

**Talk track:**
"From the dashboard, let's look at the week itself."

**Point to land:** the calendar is one click away and opens on the view an owner actually plans around — the week.

---

## Scene 5 — Week view and capacity

**Duration:** 50s **Screen:** `/calendar`

**Click path:**
1. Scroll across a couple of days to show class density.
2. Click one session block to open the session details sheet (master plan 22).
3. Read out class, time, instructor, room, capacity and bookings from the sheet.
4. Close the sheet.

**Talk track:**
"Every class this week, color-coded by type. If I click into one session, I get exactly what's booked, who's teaching it, and how many spots are left — this is the same data your front desk would use to answer 'do you have room in the 6 PM class' without picking up the phone."

**Point to land:** capacity is tracked per session, live, not estimated.

---

## Scene 6 — Create a booking

**Duration:** 60s **Screen:** `/bookings`

**Click path:**
1. Click **Bookings** in the sidebar (master plan 15).
2. Click **New booking** (master plan 23, 24).
3. In the dialog, choose a customer, a class, a date, a time and an instructor.
4. Point at the live capacity line, e.g. "12 / 15 spots reserved" (master plan 24), before submitting.
5. Click submit.
6. Point at the toast: "Booking created successfully."

**Talk track:**
"Now let's do what your staff does dozens of times a day — book someone into a class. Customer, class, date, time, instructor. Notice it shows me the spots already taken before I even confirm, so nobody double-books a full class. Submit — and it's in."

**Point to land:** creating a booking is a few clicks, with capacity protection built in.

---

## Scene 7 — Watch every screen agree

**Duration:** 40s **Screen:** `/dashboard`, `/calendar`

**Click path:**
1. Click **Dashboard**. Point at the Today's bookings KPI and Recent bookings — the new booking is already reflected (master plan 9, architecture 4).
2. Click **Calendar**. Open the same session's details sheet again and point at the updated occupancy count.

**Talk track:**
"Here's the part that matters most: I didn't update three places. I booked once, and the dashboard count, the recent bookings list, and that session's capacity on the calendar all moved together, instantly. In a real studio, this is what keeps the front desk and the schedule from ever disagreeing."

**Point to land:** one booking, one source of truth, every screen in sync — no manual reconciliation.

---

## Scene 8 — Open Customers

**Duration:** 25s **Screen:** `/customers`

**Click path:**
1. Click **Customers** in the sidebar (master plan 15).
2. Point at the top metrics: total customers, active memberships, new this month, inactive (master plan 25).
3. Point at the table columns and the search/filter controls.

**Talk track:**
"This is your member base — who's active, who's new this month, and who's gone quiet. Searchable and filterable, the same way you'd look someone up at the desk."

**Point to land:** the customer list is a working tool, not a static roster.

---

## Scene 9 — One customer's story

**Duration:** 50s **Screen:** `/customers/[id]`

**Click path:**
1. Click any customer row to open the profile (master plan 26).
2. Point at membership, remaining credits, and the stats: classes this month, attendance rate, no-shows, favorite class.
3. Point at the activity timeline (attended / reserved / cancelled / membership renewed).

**Talk track:**
"Click into any member and you get their whole relationship with the studio — their plan, how often they actually show up, what they tend to book, and a timeline of everything that's happened with them recently. This is the view your instructors and front desk would use to actually know their members, not just their names."

**Point to land:** this turns raw bookings into a real member relationship view.

---

## Scene 10 — Open Automations (simulated)

**Duration:** 30s **Screen:** `/automations`

**Click path:**
1. Click **Automations** in the sidebar (master plan 15).
2. Point at the four cards: Booking confirmation, 24-hour reminder, Inactive customer reminder, Birthday message, and their statuses — Active, Active, Paused, Draft (master plan 32).

**Talk track (say this exact line before touching anything on this screen):**

> "Everything here is simulated — no real WhatsApp message is sent."

Then continue: "What I'm showing you is what this looks like once it's turned on."

**Point to land:** the owner sees the automation concept clearly, and is told upfront it is not live, before being sold on the value.

---

## Scene 11 — The WhatsApp value case

**Duration:** 45s **Screen:** `/automations`

**Click path:**
1. Click into the Booking confirmation card's WhatsApp preview (master plan 33).
2. Point at the message mockup: confirmation text, class, date, time.
3. Click **Send test**. Point at the ~800 ms loading state, then the toast "Test message sent" (master plan 33).
4. Optionally toggle the Inactive customer reminder from Paused to Active and point at the toast "Automation activated" (master plan 32).

**Talk track:**
"This is the exact message a member would get the second they book, and this one the day before class. Watch — 'Send test' shows you what it looks like arriving. Again, nothing is actually sent over WhatsApp today. But this is the automation layer we'd wire up to a real WhatsApp Business account, and it's the single biggest no-show reducer studios like yours see."

**Point to land:** the automation is designed and demonstrable today; connecting it to a live channel is a scoped next step, not a redesign.

---

## Scene 12 — Switch to mobile

**Duration:** 20s **Screen:** any

**Click path:**
1. Open DevTools device mode (`Ctrl/Cmd + Shift + M`), select the pre-staged 390 px viewport (see pre-flight, item 6).
2. Navigate to `/book`.

**Talk track:**
"Now let's flip this around and look at it the way your members actually would — on their phone."

**Point to land:** the transition itself is the demonstration — the same product, instantly at phone width.

---

## Scene 13 — Public booking opens

**Duration:** 30s **Screen:** `/book`

**Click path:**
1. Point at the class cards: Functional Training, Cycling, Yoga, Pilates, HIIT, each with icon, duration and available sessions (master plan 34, 35).
2. Note there is no sidebar and no admin chrome — this is the public-facing page (master plan 34, architecture 6).

**Talk track:**
"No login, no admin menu — this is the page you'd put a QR code or a link to on Instagram. A prospect picks a class and books in under a minute."

**Point to land:** this is the front door for new customers, designed mobile-first, not a shrunken admin screen.

---

## Scene 14 — A customer books herself

**Duration:** 70s **Screen:** `/book`

**Click path:**
1. Tap a class card (master plan 35).
2. Tap a date in the horizontal date selector (master plan 36).
3. Tap a time slot; point out that a full slot is visibly disabled (master plan 37).
4. Fill in Name, Phone, Email (master plan 38).
5. Tap **Confirm reservation**.

**Talk track:**
"Class, date, time — and notice this slot here is full and can't be tapped, so nobody overbooks themselves. Name, phone, email, confirm. That's the entire flow a new member goes through to land in your calendar."

**Point to land:** the booking flow is fast enough that a prospect finishes it, on their phone, without help.

---

## Scene 15 — Booking success (simulated)

**Duration:** 30s **Screen:** `/book`

**Click path:**
1. Land on the success screen: "Your class is booked!" with class, date, time and studio location (master plan 39).
2. Point at the confirmation message text.

**Talk track (say this exact line, unchanged from scene 10, before reading the on-screen message):**

> "Everything here is simulated — no real WhatsApp message is sent."

Then: "The screen tells her a confirmation went out by WhatsApp — that line is written the way it will work once we connect a real WhatsApp number, but today it's a demonstration, not a delivery."

**Point to land:** the promise on screen is honestly labeled as a preview of the real experience, not a claim about what just happened.

---

## Scene 16 — Back to admin

**Duration:** 15s **Screen:** `/dashboard`

**Click path:**
1. Close device mode, back to the 1440 px view.
2. Navigate to `/dashboard`.

**Talk track:**
"Let's go back to the studio's side and see where that reservation actually landed."

**Point to land:** simple transition, sets up the payoff in scene 17.

---

## Scene 17 — The reservation landed

**Duration:** 35s **Screen:** `/bookings`, `/calendar`

**Click path:**
1. Click **Bookings**. Point at the new row from the public booking, with Source = Website (master plan 23).
2. Click **Calendar**, open the same session, point at the updated spot count.

**Talk track:**
"There she is — booked from the public page, source tagged 'Website' so you always know where a reservation came from, and the class capacity updated the same way it did earlier when we booked from the admin side. Public booking and the front desk write to the exact same schedule."

**Point to land:** the public flow and the admin flow are one system, not two things that need to be reconciled.

---

## Scene 18 — Close with the roadmap

**Duration:** 60s **Screen:** `/dashboard`

**Click path:**
1. Stay on `/dashboard`, no further clicks needed.

**Talk track:**
"That's the demo end to end: your day at a glance, your week, booking from both sides of the counter, your members, and what an automated WhatsApp layer looks like. Everything you saw today runs in the browser, on a realistic but fully simulated dataset — no real backend behind it yet, by design, so we could move fast and get your reaction to the actual experience first. Here's what turning this into your real system looks like as next steps, not promises we're making today: connecting a real WhatsApp Business number for confirmations and reminders, adding payments for memberships and drop-ins, a loyalty or credits layer, support for more than one location, and a production backend to replace the demo data with your real member list. None of that is a redesign — it's building on exactly what you just used."

**Point to land:** the owner leaves knowing precisely what exists today, what's simulated, and that going live is an additive next phase, not a rebuild.

---

## Objections annex

Short, direct answers for common owner questions. Say the plain-language answer first; the detail is there if pressed.

| Question | Answer |
|---|---|
| Is this real data? | No. It's a deterministically generated mock dataset — about 148 customers, 6 instructors, 8 class types and two weeks of class sessions — built so the numbers stay consistent and repeatable, not pulled from any real gym. Customers are labeled "Customer 01," "Customer 02," and so on; no real member data was used (mock data strategy, master plan 9). |
| Can it send WhatsApp today? | No. The automations page and the booking confirmation are both visual simulations — no message leaves the app, no external API is called anywhere in this demo (master plan 32, 33, architecture 10). Real delivery is on the roadmap (scene 18). |
| Where does the data live? | Entirely in your browser's memory while the app is open. There is no server and no database behind this demo (architecture 1, 10). Reloading the page regenerates a fresh, consistent dataset from scratch — that's also why we reset it before every run. |
| Can we change the branding? | Yes. Colors, the logo placeholder and studio details are meant to be swapped — the settings page has a Branding section for logo and colors (master plan 40), and every color in the app comes from one shared set of design tokens, so restyling it for your studio is a configuration change, not a rebuild (design system 1). |
| What would it take to go live? | The architecture was built with this in mind: all data access already goes through a single, swappable layer, so plugging in a real backend, real auth and a real WhatsApp integration is a contained, additive project rather than a rewrite (architecture 5, decisions ADR-009, ADR-010). The roadmap in scene 18 is the shape of that project. |

---

## Presenting the phone and the admin side by side

The strongest version of beats 12 to 17 uses two browser tabs or two windows: the public booking flow at `/book` in a narrow window sized like a phone, and the admin dashboard in a wide one. Demo state syncs between tabs within a moment (ADR-022), so when the booking is confirmed on the phone, the admin's Today's bookings figure and the bookings table update without a reload. Say so while it happens: "Nothing was refreshed. The studio's screen just knew."

Rehearse it once before the meeting, then reset the demo data so the client sees a clean studio.
