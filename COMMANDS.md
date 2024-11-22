# Database Reset Commands

Run these commands in order:

```bash
# 1. Drop the database
dropdb case_management

# 2. Create fresh database
createdb case_management

# 3. Delete migrations folder
rm -rf prisma/migrations

# 4. Create fresh migration
npx prisma migrate dev --name init

# 5. Generate Prisma client
npx prisma generate
```

This will give us a clean slate with the database.
