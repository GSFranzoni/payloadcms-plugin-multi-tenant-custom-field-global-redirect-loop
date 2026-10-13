# Multi-tenant global redirect loop

## Setup

Use Bun from the project root:

```sh
bun install
```

Set the local SQLite database and a Payload secret in `.env`:

```dotenv
DATABASE_URL=file:./payload.db
PAYLOAD_SECRET=local-development-secret
```

Seed the admin user and tenant data:

```sh
bun run seed
```

## Reproduce in the Admin UI

1. Start the app on port 3001:

   ```sh
   bun run dev -- --port 3001
   ```

2. Open [http://localhost:3001/admin](http://localhost:3001/admin).
3. Sign in with `admin@example.com` and `TestPassword123!`.
4. Leave the tenant filter empty and open **Navigation Content**.
5. Observe the repeated redirects to the collection's edit URLs.

## Run the browser check

```sh
bun run test:e2e
```

The check expects the collection edit page to load after the initial redirect. It fails on affected plugin versions when the route continues redirecting.
