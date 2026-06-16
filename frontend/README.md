# Velora Frontend

React + Vite + JSX + Tailwind CSS frontend integrated with the Velora Django backend using RTK Query.

## Run frontend

```bash
npm install
npm run dev
```

## Run backend first

Start Django on:

```text
http://127.0.0.1:8000
```

The Vite dev server proxies `/api` and `/media` to Django, so local development does not need Axios or a separate CORS setup.

For production or a different backend URL, create `.env` in the frontend root:

```env
VITE_API_BASE_URL=https://your-backend-domain.com
```

## Integration notes

- API integration uses RTK Query only.
- Axios is not used.
- Auth uses backend HttpOnly cookies returned by login.
- Signup uses backend fields: `username`, `email`, `password`, `image`, `role`.
- OTP verify uses backend fields: `email`, `otp`.
- OTP is not shown or hardcoded in frontend. Backend sends/stores/verifies OTP.
- Dashboard data comes from `/api/dashboard/dashboard/`.
- Users, profiles, products, product designs, invoices, invoice items, and payments are connected to backend endpoints.
- Roles, permissions, role-permissions, and activity logs are not shown in the frontend sidebar because they are admin-panel/internal modules.
- Backend permissions remain enforced by the backend. If a user does not have permission, the frontend shows the backend error response.

## Important backend note

The backend logout endpoint currently expects a `refresh` token in the request body, while login stores refresh token in an HttpOnly cookie. The frontend calls the logout endpoint and clears local auth state. For full server-side token blacklist logout, backend should read `refresh_token` from cookies or return a non-HttpOnly refresh token intentionally.

## Latest role dropdown fix

The signup Role field does not call `GET /api/accounts/register/` because the backend register view is create-only for frontend use and raises a queryset assertion on GET. The frontend now loads roles using backend-driven sources in this order: `OPTIONS /api/accounts/register/`, `/api/schema/?format=json`, `/api/roles_permissions/roles/` when authenticated/allowed, then the backend's seeded role names from the `load_roles` command as the final fallback. The submitted role value remains the exact backend `Role.name` string required by `UserSerializer`.