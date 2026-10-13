# Reproduction Steps

1. Clone the linked minimal reproduction and install dependencies:

   ```sh
   bun install
   ```

2. Configure `.env` to use SQLite and set a Payload secret:

   ```dotenv
   DATABASE_URL=file:./payload.db
   PAYLOAD_SECRET=local-development-secret
   ```

3. Seed the database:

   ```sh
   bun run seed
   ```

4. Start the app:

   ```sh
   bun run dev -- --port 3001
   ```

5. Open [http://localhost:3001/admin](http://localhost:3001/admin) and log in with `admin@example.com` / `TestPassword123!`.

6. Leave the tenant filter empty and open **Navigation Content**.

7. Observe repeated redirects to `/admin/collections/navigation-content/<id>` with increasing IDs. Each redirect creates another draft document.
