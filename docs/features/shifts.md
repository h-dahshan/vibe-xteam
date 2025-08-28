# Feature 4: Shifts Module

## 1. Feature Summary

Allows Leaders to define the working hours of each Mate so that events are only scheduled during those times. Supports recurring and one-off shifts.

---

## 2. Personas

### Leader

- Creates and manages shifts for Mates.
- Can define recurring weekly schedules or single-day shifts.
- Can edit or delete shifts.
- Can override shift rules when needed (optional system config).

### Mate

- Views their own shifts in read-only mode.
- Cannot create, update, or delete shifts.

---

## 3. Journey Explanations

- **Leader:** Manages all Mates’ shifts to reflect true availability for events.
- **Mate:** Views shifts so they know their expected working times.
- **Both:** See shifts visually on the events calendar (overlay).

---

## 4. Journey Validations

- End time must be after start time.
- Break times must be inside shift times.
- No overlapping shifts for the same Mate on the same date/day.
- Recurring shifts + one-off shifts on same date → one-off takes priority.
- Only Leader of Mate’s team can edit shifts.

---

## 5. Dependencies & Constraints

### Dependencies

- **Users Module** (Leader/Mate roles)

### Constraints

- Timezone: Asia/Riyadh (UTC+3).
- Time slots fixed at 30 min intervals.
- Max shifts per Mate/day = 3.

---

## 6. Open Questions (_Future Scope_)

- Should Leaders be able to set shifts months in advance or only recurring patterns?
- Should break durations have a minimum/maximum?
- Should Mates be notified when shifts are updated?

---

## 7. Functional Requirements

### FR1: Create Shift

#### FR1: Preconditions

- Mate exists and is part of Leader’s team.

#### FR1: Main Path

1. Fill day/time or date/time → save shift.

#### FR1: Postconditions

- Shift appears in Mate’s calendar availability.

---

### FR2: Create Recurring Shift

#### FR2: Preconditions

- Mate exists and is part of Leader’s team.

#### FR2: Main Path

1. Set `is_recurring=true` and choose `day_of_week` → save shift.

#### FR2: Postconditions

- Shift repeats every week on that day.

---

### FR3: Add Break to Shift

#### FR3: Preconditions

- Shift exists.

#### FR3: Main Path

1. Specify `break_start` and `break_end` → save.

#### FR3: Postconditions

- Break time blocked in availability.

---

### FR4: Edit/Delete Shift

#### FR4: Preconditions

- Shift exists.

#### FR4: Main Path

1. Update fields or delete shift.

#### FR4: Postconditions

- Availability updates.

---

### FR5: View Shifts _(Mate)_

**Preconditions:** Mate logged in.  
**Main Path:** See assigned shifts in read-only mode.  
**Postconditions:** Accurate schedule shown.

---

## 8. Logging

- Log every action with in `audit_logs`

---

## 10. Data Model

### `shifts`

| Field        | Type      | Notes                                          |
| ------------ | --------- | ---------------------------------------------- |
| id           | UUID (PK) |                                                |
| mate_id      | UUID (FK) | References `users.id`                          |
| day_of_week  | tinyint   | 0=Sunday ... 6=Saturday; null if one-off shift |
| start_time   | time      | HH:MM format                                   |
| end_time     | time      | HH:MM format                                   |
| is_recurring | boolean   | True = weekly repeat                           |
| shift_date   | date      | Only used if non-recurring                     |
| created_at   | datetime  |                                                |
| updated_at   | datetime  |                                                |

### `shift_breaks`

| Field       | Type      | Notes                  |
| ----------- | --------- | ---------------------- |
| id          | UUID (PK) |                        |
| shift_id    | UUID (FK) | References `shifts.id` |
| break_start | time      |                        |
| break_end   | time      |                        |

---

## 11. API Endpoints

- `GET /shifts?mate_ids=...&start=...&end=...`
- `POST /shifts`
- `PATCH /shifts/:id`
- `DELETE /shifts/:id`
- `POST /shifts/:id/breaks`
- `DELETE /shifts/:id/breaks/:break_id`

---

## 12. Developer Notes: Recurring Shifts

Recurring shifts are not stored as separate dated records.  
Instead, they are saved as **weekly patterns** in the `shifts` table with:

- `is_recurring = true`
- `day_of_week` = integer (0=Sunday ... 6=Saturday)
- `start_time` and `end_time` set
- `shift_date` = NULL **will be needed for one-off type, in which no recurring happens**

### API Handling

When a calendar or availability view is requested:

1. **Fetch one-off shifts**  
   `shift_date` between requested start and end dates.

2. **Fetch recurring shifts**  
   `is_recurring = true` for Mates in scope.

3. **Generate occurrences dynamically**  
   For each date in range:
   - If `date.getDay()` matches `day_of_week` of a recurring shift, add it to results.
   - If a one-off shift exists for that Mate/date, it **overrides** the recurring shift.
