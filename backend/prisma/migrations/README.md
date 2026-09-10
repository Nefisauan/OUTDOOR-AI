# Database migrations

No application tables are needed in Phase 1. The PostgreSQL connection is verified with SELECT 1 through Prisma. Do not add a placeholder business model.

In Phase 2, create the first schema migration with `npm run db:migrate -- --name user_system` from the backend workspace, review the SQL, and commit the migration directory. Apply reviewed migrations with `npm run db:deploy` from the repository root. Never use `db push` against production.
