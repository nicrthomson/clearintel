# Database Migration Cleanup

## Files to Remove

1. SQLite Connection File:
```bash
rm lib/db/connection.ts
```
This file contains SQLite-specific connection and table creation logic that's now handled by Prisma.

2. Old Database File:
```bash
rm lib/db.ts
```
This file contains old database functions that have been replaced by our new Prisma-based implementation.

3. SQLite Database:
```bash
rm cases.db
```
The actual SQLite database file that's no longer needed since we've migrated to PostgreSQL.

## Before Deletion

1. Ensure PostgreSQL is running:
```bash
brew services list | grep postgresql
```

2. Verify Prisma connection:
```bash
npx prisma studio
```

3. Check that all migrations are up to date:
```bash
npx prisma migrate status
```

## After Deletion

1. Verify the application still works:
```bash
npm run dev
```

2. Test database operations:
- Login/Register
- Create a case
- View cases
- Create notes

## Recovery (if needed)

If you need to restore any files, you can find them in version control.

## Next Steps

After cleanup:
1. Update documentation to reflect PostgreSQL usage
2. Remove SQLite-related dependencies from package.json
3. Update environment setup instructions
