# Feature 1: Users & Authentication Module (Multi-Profile Support)

## 1. Feature Summary

This module handles user authentication, registration, and profile management.  
A single user can own **multiple profiles** — one as a Business Leader and another as a Mate — under the same master account.  
Switching between profiles allows the user to access different functionalities based on the selected role.

---

## 2. Personas

### Master Account User

- Registers once with a unique email.
- Can create and manage multiple role profiles (Leader / Mate).
- Switches between profiles from the user dashboard.

---

## 3. Journey Explanations

### Registration & Profile Creation

1. User signs up with email and password.
2. User verifies their email.
3. User is prompted to create their first profile (Leader or Mate).
4. User can later add another profile type from the profile management section.

### Login & Profile Switching

1. User logs in with email and password.
2. System displays all profiles linked to the account.
3. User selects which profile to activate for the session.
4. System loads the role-specific dashboard.

---

## 4. Journey Validations

- User can create an account with a unique email.
- User can have up to one Leader profile and one Mate profile per account.
- Switching profiles does not require re-login but does require confirmation.
- Access permissions update dynamically based on the selected profile.

---

## 5. Dependencies & Constraints

### Dependencies

- Authentication & Authorization module.
- Profile management service.
- Role-based access control (RBAC).
- DB tables: `users`, `profiles`, `sessions`, `audit_logs`

### Constraints

- Email must be unique across all accounts.
- Profile roles are fixed after creation (cannot change Leader to Mate).
- Switching profiles must be logged for auditing.

---

## 6. Open Questions (_Future Scope_)

- Should users be able to delete a profile without deleting the whole account?
- Should we allow anonymous registration (social login without email/password)?
- Should profile switching be instant or require logout/login for security?

---

## 7. Functional Requirements

### Registration

#### FR1: Allow users to register with email/password

##### FR1: Preconditions

- Email is not already registered.
- Password meets security policy.

##### FR1: Main Path

1. User visits registration form.
2. Enters email and password.
3. System validates and stores hashed password.
4. Sends verification email.

##### FR1: Alternative Paths

- Email already exists => Account already exists error.
- Password policy not met => Show validation error.

##### FR1: Postconditions

- Account created in `users` table with `status = pending_verification`.

---

#### FR2: Allow email verification before full access

##### FR2: Preconditions

- User has a pending account.
- Valid verification token exists.

##### FR2: Main Path

1. User clicks link in email.
2. System validates token.
3. Updates user `status = active`.

##### FR2: Alternative Paths

- Token expired => “Verification link expired.”
- Token invalid => “Invalid verification link.”

##### FR2: Postconditions

- User can now log in.

---

#### FR3: Allow creation of a first profile after registration

##### FR3: Preconditions

- User is logged in.
- User has no existing profiles.

##### FR3: Main Path

1. User selects role (Leader or Mate).
2. Completes profile details.
3. Profile stored in `profiles` table.

##### FR3: Alternative Paths

- Missing details => Validation error.

##### FR3: Postconditions

- First profile is created and linked to account.

---

### Profile Management

#### FR4: Allow creation of an additional profile (other role)

##### FR4: Preconditions

- User is logged in.
- User does not already have the other role.

##### FR4: Main Path

1. User opens “Add Profile” form.
2. Selects remaining role.
3. Completes profile details.

##### FR4: Alternative Paths

- Already has both roles => “You already have both profiles.”

##### FR4: Postconditions

- Account now has 2 profiles.

---

#### FR5: Allow profile switching from the dashboard

##### FR5: Preconditions

- User is logged in.
- At least 2 profiles exist.

##### FR5: Main Path

1. User selects profile from dashboard.
2. System updates active session role.

##### FR5: Alternative Paths

- Profile not found => “Profile does not exist.”

##### FR5: Postconditions

- Active session role updated.

---

#### FR6: Restrict one Leader and one Mate profile per account

##### FR6: Preconditions

- User has at least one profile.

##### FR6: Main Path

- Validation enforced during profile creation.

##### FR6: Alternative Paths

- Attempt to create duplicate role → “Role already exists.”

##### FR6: Postconditions

- Rule enforced without changing existing profiles.

---

### Auth Management

#### FR7: Login Flow

1. Client sends `email` + `password` to `/auth/login`.
2. Server verifies credentials.
3. Server returns:
   - **Access token (JWT)** in JSON response body.
   - **Refresh token (JWT)** in HTTP-only, Secure, SameSite cookie (e.g., `refreshToken`).
4. Access token expires in 15 minutes. Refresh token expires in 7–30 days.

#### FR8: Access Token Usage

1. Client stores access token in **memory** (not localStorage/sessionStorage).
2. Access token is sent in the `Authorization: Bearer <token>` header for API requests.

#### FR9: Token Refresh Flow

1. Client calls `/auth/refresh`.
2. Refresh token (from HTTP-only cookie) is automatically sent with the request.
3. Server validates refresh token:
   - If valid → issues new access token.
   - Optionally rotates refresh token and updates cookie.
4. Server returns new access token in JSON.

#### FR10: Logout Flow

1. Client calls `/auth/logout`.
2. Server deletes refresh token record from DB.
3. Server sends `Set-Cookie` to clear refresh token from browser.

#### 11. Failure Handling

- If refresh token is missing or invalid → `401 Unauthorized` → client redirects to login.
- If access token is expired but refresh token is valid → automatic token refresh.

---

## 8. Non-Functional Requirements

- NFR-1: Support OAuth (Google, Apple) login in future versions.
- NFR-2: Maintain <200ms response time for profile switching.
- NFR-3: Ensure 99.9% uptime for authentication endpoints.
- NFR-4: Store passwords securely using bcrypt or Argon2.
- NFR-5: Security Notes
  - Refresh token is stored **only** in HTTP-only cookie to prevent JavaScript access (protects against XSS).
  - CSRF protection is required for `/auth/refresh` (e.g., using CSRF tokens or SameSite cookies).
  - Access token is stored in memory to reduce risk of CSRF.
  - Token rotation is implemented for refresh tokens to reduce replay attack risk.

## 9. Audit Logging

- Log every action in `audit_logs`.
- `users` & `profiles`: USER_CREATED, USER_UPDATED, USER_DELETED, PROFILE_CREATED, PROFILE_UPDATED, PROFILE_DELETED, PROFILE_SWITCHED
- `auth`: USER_LOGGED_IN, USER_LOGGED_OUT, PASSWORD_RESET_REQUESTED, PASSWORD_RESET_COMPLETED, EMAIL_VERIFICATION_SENT, EMAIL_VERIFIED, PHONE_VERIFICATION_SENT, PHONE_VERIFIED

---

## 2. Data Model

### `users`

| Field             | Type                              | Purpose                         |
| ----------------- | --------------------------------- | ------------------------------- |
| id                | UUID (PK)                         | Unique identifier               |
| email             | string(255)                       | Unique login credential         |
| password_hash     | string(255)                       | Hashed password (BCrypt/Argon2) |
| is_email_verified | boolean                           | Email verification status       |
| phone             | string(20)                        | Optional, can be used for MFA   |
| is_phone_verified | boolean                           | Phone verification status       |
| status            | enum(ACTIVE, INACTIVE, SUSPENDED) | Account status                  |
| last_login_at     | datetime                          | Last login time                 |
| created_at        | datetime                          |                                 |
| updated_at        | datetime                          |                                 |
| is_deleted        | boolean                           |                                 |

### `profiles`

| Field        | Type               | Purpose                |
| ------------ | ------------------ | ---------------------- |
| id           | UUID (PK)          |                        |
| user_id      | UUID (FK)          | References users.id    |
| profile_type | enum(LEADER, MATE) | Defines persona        |
| display_name | string(100)        | Name shown to others   |
| avatar_url   | string(255)        | Profile image          |
| bio          | text               | Short description      |
| timezone     | string(50)         | Default for scheduling |
| language     | string(10)         | Default UI language    |
| created_at   | datetime           |                        |
| updated_at   | datetime           |                        |
| is_deleted   | boolean            |                        |

### `sessions`

| Field         | Type        | Notes                                  |
| ------------- | ----------- | -------------------------------------- |
| id            | UUID (PK)   |                                        |
| user_id       | UUID (FK)   | References `users.id`                  |
| refresh_token | string(255) | Hashed refresh token (never store raw) |
| user_agent    | string(255) | Optional, for device tracking          |
| ip_address    | string(50)  | Optional, for security monitoring      |
| expires_at    | datetime    | Expiry date/time                       |
| created_at    | datetime    |                                        |
| updated_at    | datetime    |                                        |

### `audit_logs` indexing `user_id` and `created_at`

| Field       | Type        | Notes                                                             |
| ----------- | ----------- | ----------------------------------------------------------------- |
| id          | UUID (PK)   |                                                                   |
| user_id     | UUID (FK)   | References `users.id` — who performed the action                  |
| profile_id  | UUID (FK)   | The active profile used when performing the action (Leader/Mate). |
| action      | string(50)  | Constant/Slug describing the action                               |
| entity_type | string(50)  | Table or module name, e.g. `"teams"`, `"services"`                |
| entity_id   | UUID        | ID of the entity affected                                         |
| metadata    | JSON        | Optional — stores extra context (before/after values)             |
| ip_address  | string      |                                                                   |
| user_agent  | string(255) | User agent string from the client.                                |
| created_at  | datetime    | Timestamp of action                                               |

---

## 11. API Endpoints

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

- `GET /profiles`
- `POST /profiles`
- `PATCH /profiles/:id`
- `DELETE /profiles/:id`
- `POST /profiles/switch`

---
