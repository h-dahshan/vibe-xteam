# Feature 7: Events & Scheduling Module (Timeline/Calendar Views)

> **Important**: This feature must be implemented in a **single page with no routing**.  
> All user actions (mode switching, date changes, filters, popovers, dialogs) happen without page reloads.  
> Changes to filters or view modes update the **URL via query params** (e.g., `?mode=week&mate=1001&start=yyyy-mm-dd`) for deep-linking and back/forward navigation support.

## 1. Feature Summary

This module allows **Leader** to plan, manage, and review scheduled work ("events") for their **Teams** using a dynamic calendar view.  
**Mates** can view their own calendars only (no edit access).
View modes include **Day**, **3-Day**, **Week** and **Month**.

The calendar interface consists of two main parts:

- **Filter Bar** (top): for date navigation and filtering teams/mates (Leader only)
- **Timeline / Calendar View** (main area): shows events and allows interaction with time slots or existing entries.

---

## 2. Personas

### Leader

- Uses the Leader profile.
- Can view all teams and Mates.
- Can create, update, or cancel events.
- Can use all filters, view modes, and slot interactions.

### Mate (Read-Only)

- Uses the Mate profile.
- Can only view **their own schedule**.
- Cannot create, update, or cancel events.
- Cannot see filters or team/mate selectors.

---

## 3. Journey Explanations

### Static Filters Bar

#### Left Side Groups

1.1 **Reload Button** (↻): re-fetch all events, teams & mates.
1.2 **View Mode Select** select: Day / 3-Day / Week / Month starting from today.

2.1 **Back Button** (←): move the window backward by the active interval (Day/ 3-Day / Week / Month).
2.2 **Calendar Picker**: originally shows the represented mode (Day / 3-Day / Week / Month) on a calendar, enabling selecting a day as the start point of the mode.
2.3 **Next Buttin** (→): move the window forward by the active interval (Day/ 3-Day / Week / Month).

3.1 **Today**: button: jump to today as the start point of view mode.

#### Right Side Groups

1 **Teams & Mates Filter** (complex select):

- Left pane: Teams with checkboxes.
- Right pane: Mates with checkboxes.
- If no Team checked, the whole teams/mates will be shown.

2 **'Add' Button** button: opens “Create Event” dialog for selection of mandatory:

- Client
- Services
- Mate
- Time Start
- Time End

### Timeline / Calendar Area

- **Day View Mode**:
  - Columns: one Mate each (sticky header).
  - Rows: 24 hrs split into 30 mins slots.
  - Left gutter: sticky time labels divided in am/pm hours.
  - Hover slot: highlight with slot start time label.
  - Click slot: popover with slot start time heading + Actions Section: Add Event.
  - Hover event: popover with event brief.
  - Click event: open event/mate details dialog.
  - Existing events render as blocks (no overlap), draggable-resize for adjusting event interval (drag step is 30 mins or a slot).
  - Mate click: dropdown popover with navigations to all view modes for this specific Mate + Actions Section: Add Event / Edit Mate's Shift / Add Time-Off / Show Mate Details.

- **3-Day / Week View Modes**:
  - Columns = Days "D" with heading for each (calendar day + day name), click on Day heading navigates to day view mode of that day.
  - Rows = Mates "M" with heading for each Mate, click on Mate dropdown popover with navigations to all view modes for this specific Mate + Actions Section: Add Event / Edit Mate's Shift / Add Time-Off / Show Mate Details.
  - Cell[M, D] lists all M-D events (show max 3 events + scrolling / virtualized).
  - Click cell: popover with day heading + Actions Section: Add Event / navigation to Day view mode for that Mate

- **Month View Mode**:
  - Standard calendar grid.
  - Columns = Weekdays with heading for each (week day).
  - Rows = Weeks.
  - Day-cells show events on that day (show max 3 events + scrollable / virtualized).
  - Click cell ⇒ popover with day heading + Actions Section: Add Event / navigation to Day view mode for that day for all mates

---

## 4. Journey Validations

- **Same-Page Behavior**: all mode/date/filter changes update content in-place—verify no full reload.
- **URL Sync**: query params correctly reflect state; page load with params must reconstruct view.
- **Filters**: Leader’s team/mate selections apply instantly; Mate sees only their own row/column.
- **Event Conflicts**: UI and backend reject overlapping events with clear error.
- **Resizing/Dragging**: cannot move or resize into occupied or out-of-hours slots.
- **Drill-downs**: clicking headers/cells navigates or pops over as described, within the same page.

---

## 5. Dependencies & Constraints

Dependencies

- Users & Auth module (profiles, sessions)
- Teams module (team/​mates relationships)
- Services module (services metadata)
- DB tables: `shifts`, `time_offs`, `services`, `clients`, `events`, `event_logs`, `audit_logs`

Constraints

- View must render ≤ 100 Mate-columns in Day view without horizontal lag.
- All date calculations in user’s locale, using UTC timezoned timestamps.
- No event overlaps per Mate.
- Calendar/Timeline, Dropdowns, Popovers, and Dialogs accessible (keyboard + screen-reader).

---

## 6. Open Questions (_Future Scope_)

- Recurring events (weekly shifts, repeating appointments)?
- Drag-select multi-slot block to create events?
- Auto-assignment: suggest free Mate based on load balancing?
- Export to iCal / Google Calendar?

---

## 7. Functional Requirements

### FR1: Load/Reload Data

### FR1: Preconditions

- Leader/Mate on scheduling page.

### FR1: Main Path

1. Going to the page for first time.
2. Click “↻” → system re-fetches (`events`, `teams`, `mates`).

### FR1: Alternative Paths

- Network error → show “Reload failed, retry?”

### FR1: Postconditions

- UI reflects fresh data; timestamp “Last updated” shown.

---

### FR2: Change View Mode

### FR2: Preconditions

- Data loaded defaulting to Day view mode.

### FR2: Main Path

1. Leader/Mate select Day/3-Day/Week/Month → UI re-renders calendar/timeline accordingly → `?mode=` updated.

### FR2: Alternative Paths

- Invalid mode → default to Day.

### FR2: Postconditions

- New layout displayed; no reload.

---

### FR3: Jump to Today

### FR3: Preconditions

- Any view mode selected.
- Any date selected.

### FR3: Main Path

1. Click “Today” → interval reset to start at current date → `?day=` updated.

### FR3: Postconditions

- Calendar scrolls to “today” interval in the same view mode.
- Starts a Day/3-Day/Week/Month from Today.

---

### FR4: Navigate Prev/Next Interval

### FR4: Preconditions

- View Mode selected.

### FR4: Main Path

1. Click ← or → → interval shifts by 1×Mode → `?day=` updated.

### FR4: Alternative Paths

- None (always valid).

### FR4: Postconditions

- Calendar updates to new date range.
- Examples
  1. 2 Oct **moves to** 3 Oct
  2. 2/3/4 Oct **moves to** 5/6/7 Oct
  3. 22/23/24/25/26/27/28 Oct **moves to** 29/30 Oct + 1/2/3/4/5 Nov
  4. 2 Oct to 2 Nov **moves to** 2 Nov to 2 Dec

---

### FR5: Pick Start Date via Calendar

### FR5: Preconditions

- Date picker rendering 2 months view

### FR5: Main Path

1. Open picker → click date → interval sets accordingly → `?day=` updated.

### FR5: Alternative Paths

- Invalid date (past beyond retention) → show “Not available.”

### FR5: Postconditions

- Calendar shows chosen interval.

---

### FR6: Filter by Teams & Mates

### FR6: Preconditions

- Leader account with at least 1 Mate, and optionally 1 Team

### FR6: Main Path

1. Toggle checkboxes → UI updates to only show selected → `?teams=` and/or `?mates=` updated.

### FR6: Alternative Paths

- No Team selected → auto-select all Mates.

### FR6: Rules

- Selecting a team = disables mates selections.
- Selecting a mate = disables teams selections.
- Both teams/mates has samll text input for searching.
- Selected teams or mates are separated from deselected ones.
- By default: if nothing is selected, all mates are fetched

### FR6: Postconditions

- Calendar columns/rows reflect filter.

---

### FR7: Open “Add Event” Dialog

### FR7: Preconditions

- Leader profile active.
- Services are loaded.

### FR7: Main Path

1. Click on "Add" in the top bar
2. Opens modal with fields (Client, Service, Mate, Start Time, End Time).

### FR7: Validations

- Required: all fields are required.
- Time: Start/End times must not conflict with selected Mate's shift/time-off/other-events.

### FR7: Postconditions

- New `events` record.
- New `event_logs` entry.
- Revalidates the view mode to reflect new event.

---

### FR8: Event Details + "Edit/Cancel" Event

### FR8: Preconditions

- Leader profile active.
- Event Exists.
- Event details dialog is opened.

### FR8: Main Path

1. Click on an event on the calendar/timeline.
2. Event details are shown + Edit/Cancel icon buttons.
3. Click Edit: opens modal with fields (Client, Service, Mate, Start Time, End Time) prefilled.
4. Click Cancel: cancel the event after confirmation

### FR8: Validations

- Required: all fields are required.
- Time: Start/End times must not conflict with selected Mate's shift/time-off/other-events.

### FR8: Postconditions

- Updates selected `events` record.
- New `event_logs` entry for edit/cancel.
- Revalidates the view mode to reflect new event.

---

### FR9: Drag/Resize Event

### FR9: Preconditions

- Leader profile active.
- Event Exists.

### FR9: Main Path

1. Drag to resize an event on the calendar/timeline in Day view mode.
2. PATCH request with new Start Time and End Times.
3. Resize step is a time slot which is 30 minutes.

### FR9: Validations

- Time: Start/End times must not conflict with selected Mate's shift/time-off/other-events.
- Validation error: revert the drag + "Slot unavailable!" message.

### FR9: Postconditions

- Updates selected `events` record.
- New `event_logs` entry for edit/cancel.
- Revalidates the view mode to reflect new event.

---

### FR10: Day View Mode Slot Interaction

### FR10: Preconditions

- Day view mode active.
- Each event data will be (event start time + client name + services names).
- Filters apply on the view.

### FR10: Main Path

1. Hover → highlight slot which is 30 minutes
2. Click slot → popover → choose “Add Event”

### FR10: Alternative Paths

- Slot outside working hours → “Slot Unavailable!” message

### FR10: Postconditions

- Popover appears with correct time.
- Interactions available.
- "Add Event" opens its dialog with Mate and Start Time preselected.

---

### FR11: 3-Days/Week View Modes Slot Interaction

### FR11: Preconditions

- 3-Days/Week view mode active.
- Shows max 3 events in scrollable/virtualized list in the cell.
- Each list item - an event - data will be (event start time).
- Filters apply on the view.

### FR11: Main Path

1. Hover → highlight
2. Click cell → popover → choose “Add Event”
3. Click cell → popover → choose “Day Mode”
4. If cell has an events → click event → opens event details dialog

### FR11: Alternative Paths

- None

### FR11: Postconditions

- Popover appears with correct day.
- Interactions available.
- "Add Event" opens its dialog with Mate only preselected.
- "Day Mode" shifts the page to day view mode for that Mate only.

---

### FR12: Month View Modes Slot Interaction

### FR12: Preconditions

- Month view mode active.
- Shows max 3 events in scrollable/virtualized list in the cell.
- Each list item - an event - data will be (event start time + Mate name).
- Filters apply on the view.

### FR12: Main Path

1. Hover → highlight
2. Click cell → popover → choose “Add Event”
3. Click cell → popover → choose “Day Mode”
4. If cell has an events → click event → opens event details dialog

### FR12: Alternative Paths

- None

### FR12: Postconditions

- Popover appears with correct day.
- Interactions available.
- "Add Event" opens its dialog with no preselections.
- "Day Mode" shifts the page to day view mode for all Mates as per filters.

---

### FR13: Mate Interactions

### FR13: Preconditions

- One of Day/3-Days/Week view modes active.
- Mate rendered with name / photo (has a fallback photo)
- Click mate shows popover dropdown with 4 view modes and Actions section

### FR13: Main Path

1. Hover → highlight
2. Click Mate → popover dropdown → choose Day, 3-Days, Week, Month view modes
3. Click Mate → popover dropdown → choose action “Add Event”
4. Click Mate → popover dropdown → choose action “Edit Mate's Shift”
5. Click Mate → popover dropdown → choose action “Add Time Off”
6. Click Mate → popover dropdown → choose action “Show Mate's Details”

### FR13: Alternative Paths

- None

### FR13: Postconditions

- Popover appears with correct day.
- Interactions available.
- Day, 3-Days, Week or Month is selcted, goes to the view mode for this Mate only.
- "Add Event" opens its dialog with Mate preselected.
- "Edit Mate's Shift" opens "Edit Shift" dialog for that Mate.
- "Add Time Off" opens "Time Off" edit dialog for that Mate.
- "Edit Mate's Shift" opens "Mate Details" dialog for that Mate.

---

## 8. Non-Functional Requirements

- **Performance**:
  - Day view render ≤ 200 ms for ≤ 50 Mates.
  - 3-Day/Week render ≤ 300 ms for ≤ 200 cells.
- **Scalability**: Back-end supports ≥ 1,000 concurrent event fetches.
- **Reliability**: 99.9% uptime for scheduling APIs.
- **Accessibility**: WCAG 2.1 AA compliance for all popovers & dialogs.

---

## 9. Audit Logging

- CRUD and drag/resize on `event_logs` table logged.

## 10. Data Model

### `events`

| Field      | Type                                 | Notes                          |
| ---------- | ------------------------------------ | ------------------------------ |
| id         | UUID (PK)                            |                                |
| leader_id  | UUID (FK)                            | References `users.id` (Leader) |
| mate_id    | UUID (FK)                            | References `users.id` (Mate)   |
| service_id | UUID (FK)                            | References `services.id`       |
| client_id  | UUID (FK)                            | References `clients.id`        |
| start_time | datetime                             | Required                       |
| end_time   | datetime                             | Required                       |
| notes      | text                                 | Optional                       |
| status     | enum(scheduled, completed, canceled) | Default: scheduled             |

### `event_logs` indexing `event_id`, `created_at`, and `user_id`

| Field      | Type       | Notes                                                               |
| ---------- | ---------- | ------------------------------------------------------------------- |
| id         | UUID (PK)  |                                                                     |
| event_id   | UUID (FK)  | References `events.id` — which event is affected                    |
| user_id    | UUID (FK)  | References `users.id` — who performed the action                    |
| action     | string(50) | Constant/slug describing the event change                           |
| metadata   | JSON       | Optional — stores extra context (e.g., changed fields, time deltas) |
| created_at | datetime   | Timestamp of action                                                 |

---

## 11. API Endpoints

- `GET /events?start=…&end=…&teams=…&mates=…`
- `POST /events`
- `PATCH /events/:id`
- `DELETE /events/:id`
- `GET /teams`
- `GET /mates`
- `GET /services`
- `GET /clients`
- `GET /shifts`
- `GET /timeoffs`

---

## 12. Developer Notes

- All interactions below occur within the same page, no routing.
- Use query params at the most for filters, view modes, etc.
- Modals appear on top of the timeline; the URL must preserve the state for modals, we will move between timeline/calendar and modals for date and slot picking withing the event addition journey
- Popovers appear on top of the timeline

---
