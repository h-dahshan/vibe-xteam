# Feature 5: Time Offs Module

## 1. Feature Summary

Allows Leaders to record non-working periods for Mates (vacation, sick leave, breaks beyond normal shifts) so events cannot be scheduled during those times.

---

## 2. Personas

### Leader

- Creates and manages time offs for Mates in their teams.
- Can define full-day or partial-day time offs.
- Can edit or delete time offs.
- Can override time off rules when creating events (optional system config).

### Mate

- Views their own time offs in read-only mode.
- Cannot create, update, or delete time offs.

---

## 3. Journey Explanations

- **Leader:** Blocks Mate availability for planned absences, ensuring events aren’t booked in those times.
- **Mate:** Sees own blocked periods to avoid confusion.
- **Both:** Time offs visually overlay on the events calendar (similar to shifts).

---

## 4. Journey Validations

- End date/time must be after start date/time.
- Time off periods cannot overlap for the same Mate.
- Recurring time offs must be max 1 year in duration.
- Only the Leader of a Mate’s team can edit/delete time offs.
- If overriding time off for an event, require explicit confirmation.

---

## 5. Dependencies & Constraints

### Dependencies

- **Users Module** (Leader/Mate roles)

### Constraints

- Timezone: Asia/Riyadh (UTC+3)
- Partial-day time offs must align to 30-minute slots.
- Max time offs per Mate/year = 30 days.

---

## 6. Open Questions (_Future Scope_)

- Should Mates be able to request time off for Leader approval?
- Should recurring time offs be system-wide for public holidays?
- Should we notify clients if an event is affected by a new time off?

---

## 7. Functional Requirements

### FR1: Create Time Off

#### FR1: Preconditions

- Mate exists and is in Leader’s team.

#### FR1: Main Path

1. Fill date/time range, optional reason → save.

#### FR1: Postconditions

- Time off blocks event creation in that period.

---

### FR2: Create Partial-Day Time Off

#### FR2: Preconditions

- Mate exists.

#### FR2: Main Path

1. Set same `start_date` and `end_date` but with start/end times.

#### FR2: Postconditions

- Only the specified hours are blocked.

---

### FR3: Create Recurring Annual Time Off

#### FR3: Preconditions

- Used for public holidays or yearly leaves.

#### FR3: Main Path

1. Set `is_recurring=true`.

#### FR3: Postconditions

- Time off repeats every year on those dates.

---

### FR4: Edit/Delete Time Off

#### FR4: Preconditions

- Time off exists and belongs to Mate in Leader’s team.

#### FR4: Main Path

1. Update fields or delete.

#### FR4: Postconditions

- Calendar availability updated.

---

### FR5: View Time Offs

#### FR5: Preconditions

- Mate logged in.

#### FR5: Main Path

1. View all personal time offs.

#### FR5: Postconditions

- Accurate schedule shown.

---

## 8. Logging

- Log every action with in `audit_logs`

---

## 10. Data Model

### `time_offs`

| Field        | Type        | Notes                                                         |
| ------------ | ----------- | ------------------------------------------------------------- |
| id           | UUID (PK)   |                                                               |
| mate_id      | UUID (FK)   | References `users.id`                                         |
| start_date   | date        | Required                                                      |
| end_date     | date        | Required                                                      |
| reason       | string(255) | Optional                                                      |
| is_recurring | boolean     | Default false; if true, repeats yearly (e.g., public holiday) |
| created_at   | datetime    |                                                               |
| updated_at   | datetime    |                                                               |

---

## 11. API Endpoints

- `GET /time-offs?mate_ids=...&start=...&end=...`
- `POST /time-offs`
- `PATCH /time-offs/:id`
- `DELETE /time-offs/:id`

---

## 12. Developer Notes: Recurring Time Offs

Recurring time offs are stored as a **pattern** (month/day each year) instead of generating all future years in DB.

- `is_recurring = true`
- `start_date` and `end_date` still stored with year, but system ignores year when applying rule.
- API generates occurrences dynamically for the requested date range.
- One-off time offs take precedence over recurring ones for same date.

---
