# around-backend

REST API for **Around**, a ride-sharing app: drivers publish trips, passengers book seats, and drivers approve or reject the bookings.

Built with Node.js, Express 5, TypeScript, TypeORM and PostgreSQL. Request bodies are validated with Zod, and authentication uses JWT.

## Getting started

### Requirements

- Node.js 20+
- PostgreSQL 15+ (developed on 17)

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a PostgreSQL user and database for the app.
3. Copy `.env.example` to `.env` and fill in the values:

   | Variable | Description |
   |---|---|
   | `PORT` | Port the API listens on |
   | `DB_HOST`, `DB_PORT` | PostgreSQL host and port |
   | `DB_USER`, `DB_PASS` | PostgreSQL user and password |
   | `DB_NAME` | Database name |
   | `JWT_SECRET` | Secret used to sign auth tokens. Use a long random string. |

4. Create the database schema:
   ```bash
   npm run migration:run
   ```
5. Start the dev server (restarts on changes):
   ```bash
   npm run dev
   ```

The API is now available at `http://localhost:<PORT>/api`. Check it with `GET /api/health`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server with nodemon and ts-node |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled app from `dist/` |
| `npm test` | Run the tests once |
| `npm run test:watch` | Run the tests and re-run them on changes |
| `npm run migration:generate -- src/migrations/<Name>` | Generate a migration from entity changes |
| `npm run migration:create -- src/migrations/<Name>` | Create an empty migration to write by hand |
| `npm run migration:run` | Apply pending migrations |
| `npm run migration:revert` | Revert the last applied migration |
| `npm run migration:show` | List migrations and whether they are applied |

## Database migrations

The schema is managed with TypeORM migrations; `synchronize` is off. To change the schema:

1. Change the entity.
2. Generate a migration: `npm run migration:generate -- src/migrations/AddPhoneToUsers`
3. **Read the generated file before running it.** Some changes, such as changing a column type, are generated as drop and re-create, which loses the column's data. Rewrite those by hand.
4. Apply it: `npm run migration:run`
5. Commit the migration together with the entity change.

Migrations do not run on app start. After pulling new migrations, run `npm run migration:run`.

Never rename or edit a migration that has already been applied anywhere. Add a new migration instead.

## Project structure

```
src/
├── config/          # DataSource configuration
├── exceptions/      # Custom error classes (mapped to HTTP status codes)
├── middlewares/     # Auth guard, request validation, error handler
├── migrations/      # TypeORM migrations
├── modules/
│   ├── user/        # Each module: entity, dto, mapper, repository, service, controller
│   ├── trip/
│   └── booking/
├── container.ts     # Wires repositories, services and controllers together
├── app.ts           # Express app and routes
└── server.ts        # Entry point
tests/               # Unit tests, mirroring src/
```

Each request goes controller → service → repository. Business rules live in the services; repositories only talk to the database.

## API

All endpoints are under `/api`. Endpoints marked 🔒 require an `Authorization: Bearer <token>` header. Get a token from register or login; it is valid for 1 hour.

### Users

| Method | Path | Description |
|---|---|---|
| `POST` | `/users` | Register. Returns a token and the user. |
| `POST` | `/users/login` | Log in. Returns a token and the user. |
| `GET` | `/users/me` 🔒 | Get your own profile, including your email |
| `GET` | `/users/:id` 🔒 | Get a user's public profile (no email) |
| `PUT` | `/users/:id` 🔒 | Update your own profile |
| `DELETE` | `/users/:id` 🔒 | Delete your own account (soft delete) |

### Trips

| Method | Path | Description |
|---|---|---|
| `GET` | `/trips` 🔒 | Search upcoming trips. Optional query: `startLocation`, `endLocation`, `date`, `seats` |
| `POST` | `/trips` 🔒 | Create a trip. You are the driver. |
| `PUT` | `/trips/:id` 🔒 | Update your trip |
| `DELETE` | `/trips/:id` 🔒 | Delete your trip. Its pending and approved bookings become rejected. |

### Bookings

| Method | Path | Description |
|---|---|---|
| `POST` | `/bookings` 🔒 | Book seats on a trip. The booking starts as `pending`. |
| `GET` | `/bookings/me` 🔒 | List your bookings as a passenger |
| `GET` | `/bookings/trip/:tripId` 🔒 | List bookings for your trip (driver only) |
| `PATCH` | `/bookings/:id/status` 🔒 | Change a booking's status |

Booking status rules:

- The **driver** can set `approved` or `rejected`. Approving takes seats from the trip; rejecting an approved booking gives them back.
- The **passenger** can only set `cancelled`. Cancelling an approved booking gives the seats back.
- A `rejected` or `cancelled` booking cannot change again.

### Errors

Errors return a JSON body with a machine-readable code and a message:

```json
{ "code": "CONFLICT_ERROR", "error": "Not enough available seats to approve this booking." }
```

| Status | Code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR`, `INVALID_JSON` | Invalid request body, params or query |
| 401 | `UNAUTHORIZED` | Missing or invalid token |
| 403 | `FORBIDDEN` | Not allowed to do this |
| 404 | `NOT_FOUND` | Resource does not exist |
| 409 | `CONFLICT_ERROR` | Duplicate email or username, not enough seats, invalid status change |
| 500 | `INTERNAL_SERVER_ERROR` | Unexpected error |

## Tests

Unit tests use [Vitest](https://vitest.dev/) and live in `tests/`, mirroring `src/`. Services are tested with mocked repositories, so the tests do not need a database.

```bash
npm test
```
