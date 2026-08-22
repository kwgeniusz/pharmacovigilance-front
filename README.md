# Pharmacovigilance Frontend

Vue 3 application used to locate purchases associated with a medication lot and notify affected customers. The application consumes the Laravel API from the `pharmacovigilance-api` repository.

## Setup instructions

### Requirements

- NVM
- Node.js 24.19.0
- npm 12.0.2
- Pharmacovigilance API running on `http://localhost:8000`

The Node.js version is defined in `.nvmrc`.

```bash
nvm install
nvm use
npm install
cp .env.example .env
npm run dev
```

The application will be available at `http://localhost:5173`.

To start the backend from the parent directory:

```bash
cd ../pharmacovigilance-api
./vendor/bin/sail up -d
./vendor/bin/sail artisan migrate:fresh --seed
```

Local test data:

- Username: `admin`
- Password: `password`
- Medication lot: `951357`
- Mailpit: `http://localhost:8025`

## Main workflow

1. Log in with the administrator account.
2. Search for a medication lot and select a date range.
3. Review the matching orders and customer information.
4. Open an order or customer record when more information is needed.
5. Confirm the alert to send an email to the affected customer.

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
- Axios configuration and endpoint functions are separated under `src/api`.
- The interface uses project CSS and Lucide icons instead of a component framework.
- The alert confirmation uses the native `dialog` element and prevents duplicate submissions.
- The frontend runs with Vite outside Docker. Laravel Sail provides the API, MySQL and Mailpit services.

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

Frontend verification uses static analysis and a production build. Automated tests are maintained in the Laravel API repository.

```bash
npm run lint
npm run type-check
npm run build
```

## Assumptions

- The API is available at `http://localhost:8000`.
- The Vue development server uses `http://localhost:5173`.
- A month is treated as an inclusive rolling 30-day period.
- Alerts are sent to one customer at a time by email.
- Lot `951357` is included in the seeded backend data.
- SMS notifications, bulk alerts, CSV export, roles and alert history are outside the required scope.
