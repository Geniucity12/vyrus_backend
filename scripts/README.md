# Backend Migration Notes

- The backend now uses Postgres via Prisma ORM.
- Run `pnpm add prisma @prisma/client` in the backend folder.
- Set your `DATABASE_URL` in `.env`.
- Run `npx prisma migrate dev --name init` to create the database tables.
- The User model is managed by Prisma (see `prisma/schema.prisma`).
- All user and wallet logic is now Postgres-based.
