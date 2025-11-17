# Script para executar migration do sistema RBAC
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Migration: Sistema RBAC + Auditoria" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANTE: Esta migration vai:" -ForegroundColor Yellow
Write-Host "  - Recriar a tabela de usuarios com novos campos" -ForegroundColor Yellow
Write-Host "  - Criar tabelas: profiles, permissions, audit_logs, emprestimos" -ForegroundColor Yellow
Write-Host "  - Como é ambiente de teste, dados podem ser perdidos" -ForegroundColor Yellow
Write-Host ""
Write-Host "Pressione ENTER para continuar ou CTRL+C para cancelar..." -ForegroundColor Green
Read-Host

Write-Host "`nExecutando migration..." -ForegroundColor Green

# Executa a migration
npx dotenv -e .env.local -- npx prisma migrate dev --name add_rbac_and_audit_system

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Migration executada com sucesso!" -ForegroundColor Green
    Write-Host "`nAgora execute o seed dos perfis:" -ForegroundColor Cyan
    Write-Host "npx dotenv -e .env.local -- npx ts-node prisma/seed-rbac.ts" -ForegroundColor White
} else {
    Write-Host "`n❌ Erro na migration!" -ForegroundColor Red
}

Write-Host "`nPressione ENTER para sair..." -ForegroundColor Gray
Read-Host
