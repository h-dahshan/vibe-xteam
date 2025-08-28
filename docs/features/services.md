# Feature 3: Services Module (Leaders Only)

## 1. Feature Summary

Defines the available services that can be assigned to events.  
Services are abstract from events and stored separately.  
Each service belongs to a **Leader** and has a fixed **Type/Subtype** and a Leader-defined **Category**.

---

## 2. Personas

### System Administrator

- Creates and manages the master list of **Service Types & Subtypes**.
- Can add, edit, or delete types/subtypes.
- No involvement in leader day-to-day management.

### Leader

- Can create, update, or delete **Service Categories** and **Services**.
- Can only choose subtypes from the system-provided list which imply the main type.

### Mate

- No access to service management.
- Can view service details for events they are assigned to.

---

## 3. Journey Explanations

- **Leader:** Creates categories first → creates services → assigns to events.
- **Admin:** Manages fixed types/subtypes → Leaders pick from them.
- **Mate:** Sees services only as part of their event details (read-only).

---

## 4. Journey Validations

- Leaders cannot create a service without at least one category.
- Leaders cannot modify types/subtypes.
- Services must belong to a category and a subtype.
- Deleting a service that’s linked to upcoming events is blocked.
- Price and duration validations enforced at creation/update.

---

## 5. Dependencies & Constraints

### Dependencies

- Depends on **Users module** (Leader/Mate roles).
- Depends on **Events module** for service assignment.

### Constraints

- Types/Subtypes are global and Admin-managed — must be seeded in DB.
- Categories are Leader-specific.
- Duration slots fixed at 30 mins increments.

---

## 6. Open Questions

- Should Leaders be able to **archive** services instead of deleting?
- Should `duration_slots` be restricted to specific values (1–16 = up to 8h)?
- Should we allow Leaders to clone services to save setup time?
- Should categories be sharable between Leaders under same organization?

---

## 7. Functional Requirements

### FR1: View Service Types & Subtypes

#### FR1: Preconditions

- User is a Leader or Admin

#### FR1: Main Path

1. Fetch full list from API.
2. Display grouped by Type → Subtypes.

#### FR1: Postconditions

Data is read-only for Leaders

---

### FR2: Manage Categories (Leader)

#### FR2: Preconditions

- Leader is logged in

#### FR2: Main Path

1. Leader can **create**, **edit**, or **delete** categories.
2. Must provide: name, color.

#### FR2: Validations

- Name must be unique per Leader.
- Color must be valid HEX format.

#### FR2: Postconditions

Category saved to `service_categories`

---

### FR3: Create a Service

#### FR3: Preconditions

- Leader is logged in, at least 1 category exists.

#### FR3: Main Path

1. Click “Add Service” → fill form: subtype, category, name, description, price type, price, duration.
2. Submit to API.

#### FR3: Validations

- Price required unless `price_type=free`.
- Duration must be ≥ 1 slot.

#### FR3: Postconditions

- Service saved to `services`.

---

### FR4: Update Service

#### FR4: Preconditions

- Service exists and belongs to Leader.

#### FR4: Main Path

1. Click “Edit” → update allowed fields (subtype cannot change).

#### FR4: Postconditions

- Changes saved in DB.

---

### FR5: Delete Service

#### FR5: Preconditions

- Service exists and is unused in upcoming events.

#### FR5: Main Path

1. Click “Delete” → confirm.

#### FR5: Alt Path

- If linked to future events, error “Cannot delete a service assigned to upcoming events.”

#### FR5: Postconditions

- Service removed.

---

## 8. Non-Functional Requirements

- API must validate Leader ownership on all CRUD.
- Read-only caching allowed for types/subtypes (low change frequency).
- All lists paginated & searchable for large datasets.

---

## 9. Audit Logging

- `audit_logs` for category & service CRUD.

---

## 10. Data Model

### `service_types`

| Field       | Type        | Notes                       |
| ----------- | ----------- | --------------------------- |
| id          | UUID (PK)   |                             |
| name        | string(100) | Required, unique per system |
| description | text        | Optional                    |

### `service_subtypes`

| Field       | Type        | Notes                         |
| ----------- | ----------- | ----------------------------- |
| id          | UUID (PK)   |                               |
| type_id     | UUID (FK)   | References `service_types.id` |
| name        | string(100) | Required, unique per type     |
| description | text        | Optional                      |

### `service_categories`

| Field       | Type        | Notes                          |
| ----------- | ----------- | ------------------------------ |
| id          | UUID (PK)   |                                |
| leader_id   | UUID (FK)   | References `users.id` (Leader) |
| name        | string(100) | Required                       |
| description | text        | Optional                       |
| color       | string(7)   | HEX color code, required       |

### `services`

| Field          | Type                    | Notes                              |
| -------------- | ----------------------- | ---------------------------------- |
| id             | UUID (PK)               |                                    |
| leader_id      | UUID (FK)               | References `users.id` (Leader)     |
| subtype_id     | UUID (FK)               | References `service_subtypes.id`   |
| category_id    | UUID (FK)               | References `service_categories.id` |
| name           | string(100)             | Required                           |
| description    | text                    | Optional                           |
| price_type     | enum(fixed, from, free) | Required                           |
| price          | decimal(10,2)           | Required if `price_type` ≠ free    |
| duration_slots | int                     | Required, 1 slot = 30 mins         |
| is_active      | boolean                 | Default = true                     |

---

## 11. API Endpoints (Initial)

- `GET /service-types`
- `GET /service-subtypes?type_id=`
- `GET /service-categories`
- `POST /service-categories`
- `PATCH /service-categories/:id`
- `DELETE /service-categories/:id`
- `GET /services`
- `POST /services`
- `PATCH /services/:id`
- `DELETE /services/:id`

---
