# Library Management System

## Database Setup Guide (for other systems)

Follow this guide to run the same database setup on another machine.

## Prerequisites

1. MySQL 8.0+ installed and running.
2. Access to a MySQL user with permission to create databases, users, tables, triggers, and procedures (recommended: root).
3. This repository cloned locally.

## SQL File Execution Order

Run files in this exact order:

1. `database/schema.sql`
2. `database/seed.sql`
3. `database/triggers.sql`
4. `database/procedures.sql`
5. `database/queries.sql` (verification only)

## Option A: Run from PowerShell (Windows)

Open PowerShell in the project root and run:

```powershell
Get-Content "database/schema.sql" | mysql -u root -p
Get-Content "database/seed.sql" | mysql -u root -p
Get-Content "database/triggers.sql" | mysql -u root -p
Get-Content "database/procedures.sql" | mysql -u root -p
Get-Content "database/queries.sql" | mysql -u root -p
```

If you already configured login-path (for example `localroot`), use:

```powershell
Get-Content "database/schema.sql" | mysql --login-path=localroot
Get-Content "database/seed.sql" | mysql --login-path=localroot
Get-Content "database/triggers.sql" | mysql --login-path=localroot
Get-Content "database/procedures.sql" | mysql --login-path=localroot
Get-Content "database/queries.sql" | mysql --login-path=localroot
```

## Option B: Run inside MySQL client

```sql
SOURCE D:/projects/library-management-system/database/schema.sql;
SOURCE D:/projects/library-management-system/database/seed.sql;
SOURCE D:/projects/library-management-system/database/triggers.sql;
SOURCE D:/projects/library-management-system/database/procedures.sql;
SOURCE D:/projects/library-management-system/database/queries.sql;
```

## Important Notes

1. `schema.sql` includes database/user setup and table recreation.
2. `triggers.sql` includes trigger creation plus trigger test queries.
3. `procedures.sql` includes procedure creation plus procedure test calls.
4. `queries.sql` is for verification and reporting.

## Quick Post-Run Check

Run these in MySQL:

```sql
USE library_db;
SHOW TABLES;
SHOW TRIGGERS LIKE 'issues';
SHOW PROCEDURE STATUS WHERE Db = 'library_db' AND Name = 'generate_all_fines';
SELECT * FROM fines;
```

If the above commands return data correctly, the database is ready.

