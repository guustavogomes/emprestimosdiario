@echo off
echo Y | npx dotenv -e .env.local -- npx prisma migrate dev --name add_rbac_and_audit_system --skip-seed
