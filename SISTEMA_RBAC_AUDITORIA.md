# Sistema de Permissões (RBAC) e Auditoria

Documentação completa do sistema de controle de acesso baseado em perfis (Role-Based Access Control) e rastreabilidade (Audit Log).

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Tipos de Usuário](#tipos-de-usuário)
4. [Perfis e Permissões](#perfis-e-permissões)
5. [Sistema de Auditoria](#sistema-de-auditoria)
6. [Como Usar](#como-usar)
7. [Exemplos](#exemplos)
8. [Instalação e Configuração](#instalação-e-configuração)

---

## 🎯 Visão Geral

O sistema implementa:

- **RBAC (Role-Based Access Control)**: Controle de acesso baseado em perfis
- **Granularidade de Permissões**: Controle fino por recurso e ação (read, create, update, delete)
- **Auditoria Completa**: Rastreamento de todas as ações do sistema
- **Soft Delete**: Dados nunca são apagados permanentemente
- **Múltiplos Tipos de Usuário**: Administradores, Gerentes, Analistas, Cobrança e Clientes

---

## 🏗️ Arquitetura

### Modelos do Banco de Dados

```
Usuario
  ├── tipo (ADMIN, MANAGER, ANALYST, COLLECTOR, CLIENT)
  ├── profile (Perfil de permissões)
  └── cliente (Se for tipo CLIENT)

Profile
  └── permissions[] (Lista de permissões)

Permission
  ├── resource (clientes, emprestimos, etc)
  └── action (read, create, update, delete)

AuditLog
  ├── user (Quem fez)
  ├── action (O que fez)
  ├── resource (Onde fez)
  └── metadata (Detalhes)
```

### Fluxo de Autorização

```
1. Usuário faz requisição com JWT
2. Middleware extrai userId do token
3. Sistema verifica tipo do usuário:
   - ADMIN → Acesso total ✅
   - Outros → Consulta perfil e permissões
4. Verifica se tem permissão para resource:action
5. Se autorizado → Registra no Audit Log
6. Retorna resultado
```

---

## 👤 Tipos de Usuário

### 1. ADMIN (Administrador)
- **Acesso**: Total ao sistema (web + app)
- **Permissões**: Todas
- **Características**: Bypass de verificação de permissões

### 2. MANAGER (Gerente)
- **Acesso**: Gestão, relatórios e aprovações
- **Permissões**:
  - Clientes: read, update
  - Empréstimos: read, update
  - Relatórios: read, update
  - Dashboard: read

### 3. ANALYST (Analista de Crédito)
- **Acesso**: Análise e aprovação de empréstimos
- **Permissões**:
  - Empréstimos: read, update
  - Clientes: read
  - Dashboard: read

### 4. COLLECTOR (Cobrança)
- **Acesso**: Visualização para cobrança
- **Permissões**:
  - Empréstimos: read
  - Clientes: read
  - Dashboard: read

### 5. CLIENT (Cliente do App)
- **Acesso**: Apenas seus próprios dados via app mobile
- **Permissões**: Limitadas ao próprio cadastro e empréstimos

---

## 🔐 Perfis e Permissões

### Estrutura de Permissões

Formato: `resource:action`

**Recursos (Resources):**
- `clientes` - Cadastro de clientes
- `emprestimos` - Empréstimos
- `usuarios` - Usuários do sistema
- `relatorios` - Relatórios gerenciais
- `configuracoes` - Configurações do sistema
- `perfis` - Gestão de perfis
- `auditoria` - Logs de auditoria
- `dashboard` - Painel principal

**Ações (Actions):**
- `read` - Ler/visualizar
- `create` - Criar novo
- `update` - Atualizar existente
- `delete` - Deletar (soft delete)

### Matriz de Permissões

| Perfil | Clientes | Empréstimos | Usuários | Relatórios | Config | Auditoria |
|--------|----------|-------------|----------|------------|--------|-----------|
| **Admin** | CRUD | CRUD | CRUD | CRUD | CRUD | CRUD |
| **Gerente** | RU | RU | R | RU | R | R |
| **Analista** | R | RU | - | - | - | - |
| **Cobrança** | R | R | - | - | - | - |
| **Cliente** | R* | R* | - | - | - | - |

*Apenas seus próprios dados

---

## 📝 Sistema de Auditoria

### O que é Rastreado

Todas as ações são registradas:

- ✅ CREATE - Criação de registros
- ✅ UPDATE - Atualização de dados
- ✅ DELETE - Deleção (soft delete)
- ✅ READ - Leituras importantes
- ✅ LOGIN - Autenticação
- ✅ LOGOUT - Saída do sistema
- ✅ UPLOAD - Upload de arquivos
- ✅ DOWNLOAD - Download de arquivos

### Informações Capturadas

```typescript
{
  userId: "uuid",           // Quem fez
  action: "CREATE",         // O que fez
  resource: "clientes",     // Onde fez
  resourceId: "uuid",       // ID do registro
  descricao: "...",         // Descrição legível
  metadata: {...},          // Dados extras (before/after, etc)
  ipAddress: "192.168.1.1", // IP do usuário
  userAgent: "...",         // Navegador/app
  createdAt: "..."          // Quando fez
}
```

### Soft Delete

Todos os registros incluem:

```typescript
{
  ativo: true,              // false quando deletado
  deletedAt: null,          // Data da deleção
  deletedBy: null,          // Quem deletou
  createdBy: "userId",      // Quem criou
  updatedBy: "userId"       // Quem atualizou por último
}
```

---

## 💻 Como Usar

### 1. Proteger Rota com Permissão

```typescript
// app/api/clientes/route.ts
import { requirePermission } from "@/lib/permissionMiddleware";
import { logCreate } from "@/lib/auditLog";

export async function POST(request: NextRequest) {
  // Verifica permissão
  const auth = await requirePermission(request, "clientes", "create");
  if (auth instanceof NextResponse) return auth;

  // Cria o cliente
  const cliente = await prisma.cliente.create({
    data: {
      ...body,
      createdBy: auth.user.userId,
    },
  });

  // Registra no audit log
  await logCreate(
    auth.user.userId,
    "clientes",
    cliente.id,
    { nome: cliente.nome },
    request
  );

  return NextResponse.json(cliente);
}
```

### 2. Verificar Permissão Manualmente

```typescript
import { hasPermission } from "@/lib/permissions";

const canEdit = await hasPermission(userId, "clientes", "update");

if (canEdit) {
  // Permite edição
}
```

### 3. Registrar Ação de Auditoria

```typescript
import { logUpdate, logDelete } from "@/lib/auditLog";

// Ao atualizar
await logUpdate(userId, "emprestimos", emprestimoId, {
  before: { status: "PENDENTE" },
  after: { status: "APROVADO" }
}, request);

// Ao deletar
await logDelete(userId, "clientes", clienteId, {
  nome: cliente.nome
}, request);
```

### 4. Consultar Audit Logs

```typescript
import { getAuditLogs } from "@/lib/auditLog";

const { logs, total } = await getAuditLogs({
  userId: "uuid",           // Filtrar por usuário
  resource: "clientes",     // Filtrar por recurso
  action: "DELETE",         // Filtrar por ação
  startDate: new Date("2025-01-01"),
  endDate: new Date("2025-01-31"),
  limit: 50,
  offset: 0
});
```

---

## 📚 Exemplos

### Exemplo 1: Criar Cliente com Auditoria

```typescript
import { requirePermission } from "@/lib/permissionMiddleware";
import { logCreate } from "@/lib/auditLog";

export async function POST(request: NextRequest) {
  // 1. Verifica permissão
  const auth = await requirePermission(request, "clientes", "create");
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();

  // 2. Valida dados
  if (!body.nome || !body.cpf || !body.telefone) {
    return NextResponse.json(
      { error: "Campos obrigatórios faltando" },
      { status: 400 }
    );
  }

  // 3. Cria o cliente
  const cliente = await prisma.cliente.create({
    data: {
      ...body,
      createdBy: auth.user.userId, // Rastreabilidade
      ativo: true,
    },
  });

  // 4. Registra no audit log
  await logCreate(
    auth.user.userId,
    "clientes",
    cliente.id,
    { nome: cliente.nome, cpf: cliente.cpf },
    request
  );

  return NextResponse.json(cliente, { status: 201 });
}
```

### Exemplo 2: Atualizar com Rastreabilidade

```typescript
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verifica permissão
  const auth = await requirePermission(request, "clientes", "update");
  if (auth instanceof NextResponse) return auth;

  const id = params.id;
  const body = await request.json();

  // Busca estado anterior
  const clienteAntes = await prisma.cliente.findUnique({
    where: { id },
  });

  if (!clienteAntes) {
    return NextResponse.json(
      { error: "Cliente não encontrado" },
      { status: 404 }
    );
  }

  // Atualiza
  const clienteDepois = await prisma.cliente.update({
    where: { id },
    data: {
      ...body,
      updatedBy: auth.user.userId,
    },
  });

  // Registra mudanças
  await logUpdate(
    auth.user.userId,
    "clientes",
    id,
    {
      before: clienteAntes,
      after: clienteDepois,
      changes: Object.keys(body),
    },
    request
  );

  return NextResponse.json(clienteDepois);
}
```

### Exemplo 3: Soft Delete

```typescript
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verifica permissão
  const auth = await requirePermission(request, "clientes", "delete");
  if (auth instanceof NextResponse) return auth;

  const id = params.id;

  const cliente = await prisma.cliente.findUnique({
    where: { id },
  });

  if (!cliente) {
    return NextResponse.json(
      { error: "Cliente não encontrado" },
      { status: 404 }
    );
  }

  // Soft delete
  await prisma.cliente.update({
    where: { id },
    data: {
      ativo: false,
      deletedAt: new Date(),
      deletedBy: auth.user.userId,
    },
  });

  // Registra deleção
  await logDelete(
    auth.user.userId,
    "clientes",
    id,
    { nome: cliente.nome },
    request
  );

  return NextResponse.json({ message: "Cliente deletado com sucesso" });
}
```

---

## ⚙️ Instalação e Configuração

### 1. Executar Migration

```bash
npx dotenv -e .env.local -- npx prisma migrate dev --name add_rbac_and_audit_system
```

### 2. Executar Seed de Perfis

```bash
npx dotenv -e .env.local -- npx ts-node prisma/seed-rbac.ts
```

### 3. Criar Usuário Admin

```bash
npx dotenv -e .env.local -- npx ts-node scripts/create-admin.ts
```

### 4. Atualizar Usuários Existentes

Todos os usuários existentes precisam ter:
- Um `tipo` definido (ADMIN, MANAGER, etc)
- Um `profileId` associado (exceto ADMIN)

---

## 🔍 Consultando Dados

### Listar apenas registros ativos

```typescript
const clientes = await prisma.cliente.findMany({
  where: { ativo: true },
});
```

### Incluir deletados

```typescript
const todosClientes = await prisma.cliente.findMany({
  // Sem filtro de ativo
});
```

### Ver quem criou/atualizou

```typescript
const cliente = await prisma.cliente.findUnique({
  where: { id },
  select: {
    id: true,
    nome: true,
    createdBy: true,
    updatedBy: true,
    deletedBy: true,
  },
});

// Buscar dados do criador
const criador = await prisma.usuario.findUnique({
  where: { id: cliente.createdBy },
});
```

---

## 🎨 Interface de Gestão de Perfis

Em breve será criada uma interface web para:

- ✅ Criar novos perfis customizados
- ✅ Atribuir permissões aos perfis
- ✅ Visualizar audit logs
- ✅ Gerar relatórios de acessos
- ✅ Gerenciar usuários e seus perfis

---

## 📊 Relatórios Disponíveis

1. **Ações por Usuário**: Quem fez mais ações
2. **Ações por Recurso**: Recursos mais acessados
3. **Ações por Período**: Atividade ao longo do tempo
4. **Tentativas de Acesso Negado**: Segurança
5. **Logins e Logouts**: Auditoria de sessões

---

## 🔒 Segurança

- **JWT com expiração**: Tokens expiram em 7 dias
- **Verificação em cada requisição**: Middleware valida permissões
- **Audit log imutável**: Não pode ser editado/deletado
- **Soft delete**: Histórico preservado
- **IP e User Agent**: Rastreamento completo

---

## 📝 Próximos Passos

1. ✅ Schema RBAC criado
2. ✅ Middleware de permissões
3. ✅ Sistema de audit log
4. ✅ Seeds de perfis padrão
5. 🔲 Interface web de gestão
6. 🔲 APIs de gerenciamento de perfis
7. 🔲 Relatórios de auditoria
8. 🔲 Dashboard de segurança

---

**Versão**: 1.0.0
**Última atualização**: 2025-01-16
