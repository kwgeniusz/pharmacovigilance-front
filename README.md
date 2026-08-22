# Pharmacovigilance Frontend

Vue 3 application used to locate purchases associated with a medication lot and notify affected customers. The application consumes the Laravel API from the `pharmacovigilance-api` repository.

## Setup instructions

### Requirements

- Node.js 24.15 or newer (the recommended version is defined in `.nvmrc`)
- npm
- Pharmacovigilance API running on `http://localhost:8000`

### Install and run

```bash
npm ci
cp .env.example .env
npm run dev
```

The application will be available at `http://localhost:5173`.

The API is a separate project and must be started independently. Its installation,
database, seed data, and local services are documented in the API repository.

## Main workflow

1. Log in as administrator to test every feature, including CSV export.
2. Search for a medication lot and select a date range.
3. Review the matching orders and customer information.
4. Open an order or customer record when more information is needed.
5. Confirm the alert to send an email to the affected customer.
6. As an administrator, export all orders matching the active filters to CSV.

Search parameters are stored in the URL, so filters and pagination are preserved when navigating between results and detail pages.

## Application routes

| Route | Access | Description |
| --- | --- | --- |
| `/pharmacovigilance/login` | Public | Login screen. |
| `/pharmacovigilance/orders` | Authenticated | Medication lot search and order results. |
| `/pharmacovigilance/orders/:orderId` | Authenticated | Order details. |
| `/pharmacovigilance/customers/:customerId` | Authenticated | Customer details and order history. |

Any unknown route displays the `404` page.

## API integration

The API URL is configured in `.env`:

```dotenv
VITE_API_URL=http://localhost:8000
```

Authentication uses Laravel Sanctum with session cookies. Axios is configured with credentials and XSRF support. Before login, the application requests `/sanctum/csrf-cookie`; authenticated requests then use the Laravel session cookie.

The HTTP client also handles these responses:

- `401`: clears the local session and redirects to login.
- `419`: obtains a new CSRF cookie and retries the request once.
- `422`: exposes Laravel validation errors to the corresponding form.

The order search sends `lot_number`, `start_date`, `end_date`, and `page`. Paginated responses use Laravel's `data`, `links`, and `meta` fields.

The authenticated user has an `administrator` or `operator` role. Only administrators see the CSV export action. The API returns `403` if an operator calls the export endpoint. The downloaded file uses the active filters and includes all matching orders.

## Project structure

```text
src/
├── api/          # Axios client and API functions
├── assets/       # Global styles
├── components/   # Shared interface components
├── router/       # Routes and authentication guards
├── stores/       # Authentication state
├── types/        # API response types
└── views/        # Application screens
```

## Design decisions

- Vue 3, TypeScript and the Composition API are used throughout the application.
- Vue Router controls public and authenticated routes.
- Pinia stores only authentication state. Search state remains in the route query.
- Role information is stored with the authenticated user and controls administrator-only actions.
- Axios configuration and endpoint functions are separated under `src/api`.
- The interface uses project CSS and Lucide icons instead of a component framework.
- The alert confirmation uses the native `dialog` element and prevents duplicate submissions.
- The frontend runs locally with Vite and consumes the API configured in `.env`.

## Available scripts

```bash
npm run dev
npm run format
npm run lint
npm run type-check
npm run build
npm run preview
```

## Quality checks

Run lint, type checking, and the production build before submitting.

```bash
npm run lint
npm run type-check
npm run build
```