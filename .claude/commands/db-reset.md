# Reset Database

Reset the SQLite database to a clean state.

## What it does
- Runs `npm run db:reset`
- Drops and recreates the SQLite database
- Runs all migrations from scratch
- Creates a fresh database schema

## Usage
```
/db-reset
```

## When to Use
- After major schema changes
- When database is in an inconsistent state
- To clear test data and start fresh
- Before testing migrations

## Database Location
- Development: `prisma/dev.db`
- The database file is git-ignored and local only

## After Reset
- All data is deleted permanently
- Schema is recreated from migrations
- Prisma client is regenerated
- App is ready for fresh data

## Migrations
The reset process runs all migrations in order:
1. Check migrations in `prisma/migrations/`
2. Apply each migration sequentially
3. Update migration history

## Notes
- This is safe to run - it only affects local development database
- Never run on production databases
- Always backup data before resetting if needed
