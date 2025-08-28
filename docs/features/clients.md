# Feature 6: Clients Module

## 1. Feature Summary

Allows Leaders to store and manage client records, including personal info, contact details, and addresses.  
Clients can be linked to events and services.

---

## 2. Personas

### Leader

- Creates and manages client records.
- Can store multiple addresses for each client.
- Can update or delete client records.
- Can link clients to events.

### Mate

- Can view client details only for events they are assigned to.
- Cannot create, update, or delete client records.

---

## 3. Journey Explanations

- **Leader:** Creates client profile, adds addresses, manages contact info.
- **Mate:** Sees client info when linked to their assigned events.

---

## 4. Journey Validations

- Required fields must be filled: first_name, last_name, birthday, gender, primary_email, primary_phone, at least one address.
- Primary email must be unique within the Leader’s organization.
- At least one primary address must exist.
- Country name must be valid ISO 3166.
- Phone numbers must be in E.164 format (`+966...`).

---

## 5. Dependencies & Constraints

### Dependencies

- **Users Module** (Leader/Mate roles)

### Constraints

- Email uniqueness scoped to Leader’s organization.
- Addresses limited to 5 per client.
- Only Leaders can modify client records.

---

## 6. Open Questions

- Should we allow multiple primary addresses for special cases?
- Should client deletion be soft-delete to preserve event history?
- Should Mates see full client contact info or only limited fields?

## 7. Functional Requirements

### FR1: Create Client

#### FR1: Preconditions

- Leader logged in.

#### FR1: Main Path

1. Fill personal info, required contact details, at least one address → save.

#### FR1: Postconditions

- Client record created.

---

### FR2: Update Client

#### FR2: Preconditions

- Client exists in Leader’s scope.

#### FR2: Main Path

1. Update any details → save.

#### FR2: Postconditions

- Changes saved.

---

### FR3: Delete Client

#### FR3: Preconditions

- Client has no future events.

#### FR3: Main Path

1. Delete client.

#### FR3: Postconditions

- Record removed.

---

### FR4: Add Address

#### FR4: Preconditions

- Client exists.

#### FR4: Main Path

1. Fill address details → mark as primary or not.

#### FR4: Postconditions

- Address linked to client.

---

### FR5: Update/Delete Address

#### FR5: Preconditions

- Address exists.

#### FR5: Main Path

1. Modify fields or delete.

#### FR5: Postconditions

- Changes saved.

---

### FR6: View Client

#### FR6: Preconditions

- Mate assigned to event linked to client.

#### FR6: Main Path

1. View read-only client info.

#### FR6: Postconditions

- Info displayed without edit access.

---

## 8. Non-Functional Requirements

---

## 9. Audit Logging

- Log every action with in `audit_logs`

---

## 10. Data Model

### `clients`

| Field              | Type               | Notes                                  |
| ------------------ | ------------------ | -------------------------------------- |
| id                 | UUID (PK)          |                                        |
| first_name         | string(50)         | Required                               |
| last_name          | string(50)         | Required                               |
| birthday           | date               | Required                               |
| gender             | enum(male, female) | Required                               |
| primary_email      | string(255)        | Required, unique within leader’s scope |
| primary_phone      | string(20)         | Required, E.164 format                 |
| secondary_email    | string(255)        | Optional                               |
| secondary_phone    | string(20)         | Optional                               |
| emergency_email    | string(255)        | Optional                               |
| emergency_phone    | string(20)         | Optional                               |
| nationality        | string(100)        | Optional                               |
| preferred_language | string(10)         | Optional, default = "en"               |
| created_at         | datetime           |                                        |
| updated_at         | datetime           |                                        |

### `client_addresses`

| Field            | Type        | Notes                                                   |
| ---------------- | ----------- | ------------------------------------------------------- |
| id               | UUID (PK)   |                                                         |
| client_id        | UUID (FK)   | References `clients.id`                                 |
| is_primary       | boolean     | Default = false, must have at least one primary address |
| label            | string(50)  | Optional, e.g., "Home", "Office"                        |
| country          | string(100) | Required                                                |
| state            | string(100) | Optional                                                |
| city             | string(100) | Required                                                |
| address_line     | string(255) | Required                                                |
| building_number  | string(20)  | Optional                                                |
| apartment_number | string(20)  | Optional                                                |
| created_at       | datetime    |                                                         |
| updated_at       | datetime    |                                                         |

**Address Constraints:**

- At least one address required at client creation.
- Only one primary address allowed per client.
- Country must be a valid ISO 3166 country name.
- Postal code format validated if country-specific rules exist.

---

## 11. API Endpoints

- `GET /clients`
- `POST /clients`
- `PATCH /clients/:id`
- `DELETE /clients/:id`
- `POST /clients/:id/addresses`
- `PATCH /clients/:id/addresses/:address_id`
- `DELETE /clients/:id/addresses/:address_id`

---
