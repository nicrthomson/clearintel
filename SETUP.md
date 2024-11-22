# PostgreSQL Setup for macOS

1. Install PostgreSQL:
```bash
brew install postgresql@14
```

2. Start PostgreSQL:
```bash
brew services start postgresql@14
```

3. Create database and user (copy and paste these commands one at a time):
```bash
# Create a superuser for yourself (replace 'nicolas' with your macOS username)
createuser -s nicolas

# Create the database
createdb -U nicolas case_management
```

4. Update .env file with your username:
```
DATABASE_URL="postgresql://nicolas@localhost:5432/case_management?schema=public"
```

5. Install dependencies and generate Prisma client:
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init
```

# Troubleshooting

If you get permission errors:

1. Check PostgreSQL status:
```bash
brew services list
```

2. If needed, restart PostgreSQL:
```bash
brew services restart postgresql@14
```

3. Connect to PostgreSQL and check users:
```bash
# Connect to postgres database
psql postgres

# Inside psql, list users:
\du

# Exit psql:
\q
```

4. If you need to start fresh:
```bash
# Stop PostgreSQL
brew services stop postgresql@14

# Remove PostgreSQL data
rm -rf /opt/homebrew/var/postgresql@14

# Start PostgreSQL (this will create fresh data directory)
brew services start postgresql@14

# Create your user again
createuser -s nicolas

# Create database
createdb -U nicolas case_management
```

Note: Replace 'nicolas' with your actual macOS username in all commands.
