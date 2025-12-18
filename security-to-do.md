# Security Scan Findings - Action Items

## 🔴 CRITICAL (2 items)

### 1. Fix Insecure Direct Object Reference (IDOR) in User Management
**File:** `src/modules/user/user.controller.ts:20`
- **Issue:** User management endpoints (`/users/:id` for GET, PATCH, DELETE) lack authorization checks
- **Risk:** Authenticated users can access/modify/delete any user's account by changing the ID parameter
- **Action:** 
  - Implement authorization checks ensuring `id` in URL matches `req.user.id` for `findOne`, `update`, and `remove`
  - Add RBAC for administrative actions like `findAll` or modifying other users
  - Restrict access to authorized administrators only

### 2. Remove Hardcoded JWT Secret Fallback
**File:** `src/config/configuration.ts:18`
- **Issue:** Hardcoded fallback secret ('your-super-secret-jwt-key-change-in-production' or 'fallback-secret') visible in code
- **Risk:** Attackers could forge valid JWTs and bypass authentication
- **Action:**
  - Ensure `JWT_SECRET` environment variable is always set with a strong, unique, randomly generated secret
  - Remove hardcoded fallback secret from code
  - Make application fail to start if `JWT_SECRET` is missing (throw error instead of using default)

---

## 🟠 HIGH (5 items)

### 3. Fix Overly Permissive CORS with Credentials
**File:** `src/main.ts:20`
- **Issue:** CORS allows `origin: '*'` while `credentials: true` is enabled
- **Risk:** Potential CSRF attacks or data leakage if using HttpOnly cookies
- **Action:**
  - Restrict `origin` to specific authorized domains (e.g., `process.env.FRONTEND_URL`)
  - Avoid using `*` when `credentials: true` is enabled
  - Use array of allowed origins if multiple are needed

### 4. Sanitize Client-Side XSS via InnerHTML
**File:** `public/app.js:84`
- **Issue:** `createStockCard` and `displayNews` functions insert API data directly into DOM using `innerHTML` without sanitization
- **Risk:** Stored XSS vulnerability if backend API is compromised
- **Action:**
  - Use DOMPurify or similar library to sanitize data before inserting into DOM
  - Use `textContent` or `innerText` when only plain text is expected
  - Create DOM elements programmatically and set properties securely

### 5. Implement Proper JWT Refresh Token Mechanism
**File:** `src/modules/auth/auth.controller.ts:58`
- **Issue:** `/auth/refresh` endpoint uses access token to generate new access token, defeating refresh token purpose
- **Risk:** Stolen access tokens can be reused indefinitely
- **Action:**
  - Issue both short-lived access token and long-lived refresh token on login
  - Store refresh tokens securely (HttpOnly cookie or database)
  - `/auth/refresh` should accept and validate refresh token (not access token)
  - Implement refresh token rotation
  - Invalidate refresh tokens after use or on logout

### 6. Review Password Pattern Match (False Positive Check)
**File:** `src/config/configuration.ts:15`
- **Issue:** Pattern matcher flagged `password: process.env.REDIS_PASSWORD` as potential password
- **Action:** Verify this is a false positive (environment variable reference, not hardcoded password)
- **Note:** If this is correctly using environment variables, no action needed

### 7. Review Exec Usage in News Service
**File:** `src/modules/news/news.service.ts:283`
- **Issue:** Use of `exec()` for regex pattern matching
- **Action:** Verify this is safe (regex `exec()` is different from `child_process.exec()`)
- **Note:** If this is `RegExp.prototype.exec()`, this is a false positive and safe

---

## 🟡 MEDIUM (4 items)

### 8. Implement Server-Side JWT Invalidation on Logout
**File:** `src/modules/auth/auth.controller.ts:77`
- **Issue:** `/auth/logout` only removes token from client-side, doesn't invalidate on server
- **Risk:** Stolen JWTs remain valid until expiration even after logout
- **Action:**
  - Maintain blacklist/revocation list of invalidated JWTs (e.g., in Redis)
  - Add JWT's JTI to blacklist on logout
  - Check blacklist during JWT validation in `JwtStrategy`
  - Ensure blacklist entries expire with JWTs

### 9. Protect User Creation Endpoint
**File:** `src/modules/user/user.controller.ts:13`
- **Issue:** `/users` POST endpoint is unauthenticated, allowing anyone to create accounts
- **Risk:** Resource exhaustion or abuse if password field added later
- **Action:**
  - If for self-registration: implement rate limiting
  - If for admin use: add authentication and RBAC guards
  - Restrict to authorized personnel only

### 10. Remove or Protect Debug Configuration Endpoint
**File:** `src/modules/auth/auth.controller.ts:24`
- **Issue:** `/auth/config` exposes configuration details including `GOOGLE_CALLBACK_URL` and `FRONTEND_URL`
- **Risk:** Could reveal internal network structures or sensitive information
- **Action:**
  - Remove endpoint or protect with strong authentication/authorization
  - Restrict to specific IP addresses or internal networks if absolutely necessary
  - Never expose configuration via public API endpoints

### 11. Remove Sensitive Data from Debug Script
**File:** `debug-oauth.js:46`
- **Issue:** Script prints truncated version of `GOOGLE_CLIENT_SECRET` to console
- **Risk:** Could aid attackers in brute-forcing or guessing full secret
- **Action:**
  - Never print sensitive secrets, even partially
  - For diagnostics, indicate only 'Set' or 'Not Set' without revealing value
  - Example: `console.log(\`✅ ${varName}: Set\`);`

---

## 🔵 LOW (3 items)

### 12. Protect or Disable Swagger Documentation in Production
**File:** `src/main.ts:52`
- **Issue:** Swagger API documentation at `/api/docs` is accessible without authentication
- **Risk:** Provides attackers with detailed API structure and potential vulnerabilities
- **Action:**
  - Conditionally enable Swagger based on `NODE_ENV` (only in development/staging)
  - Implement authentication/authorization for `/api/docs` endpoint
  - Restrict access to authorized administrators only
  - Or deploy documentation to separate, protected environment

### 13. Update Outdated Google+ API Configuration Instructions
**File:** `debug-oauth.js:55`
- **Issue:** Script references deprecated Google+ API (shut down in 2019)
- **Risk:** Confusion, enabling unnecessary APIs, outdated configuration
- **Action:**
  - Update diagnostic script and documentation
  - Reflect current Google OAuth configuration requirements
  - List only necessary and active Google APIs (e.g., Google People API or Google Identity Platform)

### 14. Replace In-Memory User Storage with Database
**File:** `src/modules/user/user.service.ts:7`
- **Issue:** UserService uses in-memory array for user data storage
- **Risk:** Complete data loss on application restart, not viable for production
- **Action:**
  - Replace with persistent database (PostgreSQL, MongoDB, MySQL)
  - Implement proper database connection management
  - Use ORM/ODM (TypeORM, Mongoose) for reliable data storage
  - Ensure proper data modeling and integration

---

## Summary
- **Critical:** 2 items
- **High:** 5 items (2 may be false positives to verify)
- **Medium:** 4 items
- **Low:** 3 items
- **Total:** 14 items

## Notes
- Items #6 and #7 may be false positives - verify before taking action
- Prioritize Critical and High items for immediate attention
- Medium and Low items can be addressed in subsequent sprints