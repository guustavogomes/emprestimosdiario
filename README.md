# Empréstimo Diário - Sistema de Gestão de Empréstimos

Sistema moderno de gestão de empréstimos diários desenvolvido com Next.js 16, seguindo princípios SOLID e Clean Architecture.

## 🚀 Stack Tecnológica

- **Framework:** Next.js 16 (App Router) + React 19
- **Linguagem:** TypeScript
- **Estilização:** TailwindCSS + shadcn/ui
- **Autenticação:** NextAuth.js
- **Banco de Dados:** Neon PostgreSQL (Serverless)
- **ORM:** Prisma
- **Armazenamento:** Cloudflare R2 (planejado)
- **Hospedagem:** Vercel
- **Ícones:** Lucide React

## 📐 Arquitetura

O projeto segue **Clean Architecture** e **princípios SOLID**:

```
emprestimodiario/
├── app/                          # Next.js App Router
│   ├── api/auth/                 # API de autenticação
│   ├── dashboard/                # Dashboard protegido
│   ├── login/                    # Página de login
│   └── globals.css               # Estilos globais
│
├── components/
│   ├── ui/                       # Componentes base (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── card.tsx
│   └── auth/                     # Componentes de autenticação
│       ├── CPFInput.tsx          # Input formatado de CPF
│       ├── PasswordInput.tsx     # Input de senha com toggle
│       └── LoginForm.tsx         # Formulário de login
│
├── src/
│   ├── core/                     # Clean Architecture Core
│   │   ├── domain/               # Entidades e interfaces
│   │   ├── application/          # Casos de uso
│   │   └── infra/                # Implementações
│   ├── lib/
│   │   ├── prisma.ts             # Cliente Prisma singleton
│   │   └── utils.ts              # Utilitários (cn, etc)
│   └── hooks/
│       └── useCPFMask.ts         # Hook de formatação CPF
│
├── prisma/
│   ├── schema.prisma             # Schema do banco
│   ├── migrations/               # Migrações
│   └── seed.ts                   # Dados iniciais
│
├── public/
│   ├── logo.png                  # Logo da empresa
│   ├── logo-black.png            # Logo versão preta
│   └── favicon.png               # Ícone do site
│
└── middleware.ts                 # Proteção de rotas
```

## 🎯 Princípios SOLID Aplicados

### Single Responsibility Principle (SRP)
- Cada componente tem uma única responsabilidade
- `CPFInput` → apenas formatação e renderização de CPF
- `PasswordInput` → apenas input de senha com toggle
- `LoginForm` → coordena o fluxo de login

### Open/Closed Principle (OCP)
- Componentes abertos para extensão via props
- Fechados para modificação direta
- Uso de variantes (CVA) para diferentes estilos

### Liskov Substitution Principle (LSP)
- Componentes seguem contratos de interfaces
- Substituíveis sem quebrar funcionalidade

### Interface Segregation Principle (ISP)
- Props específicas para cada componente
- Sem dependências desnecessárias

### Dependency Inversion Principle (DIP)
- Dependência de abstrações (NextAuth, Prisma)
- Use cases desacoplados da infraestrutura

## 🔐 Autenticação

Sistema de autenticação baseado em **CPF + Senha**:

- **NextAuth.js** com provider de credenciais
- Sessões JWT
- Proteção de rotas via middleware
- Validação de CPF com formatação automática
- Hash de senhas com bcryptjs

### Fluxo de Autenticação

1. Usuário acessa `/login`
2. Insere CPF (com formatação automática) e senha
3. Validação client-side
4. Chamada para API NextAuth
5. Use case `AuthenticateUser` valida credenciais
6. Token JWT gerado
7. Redirecionamento para `/dashboard`

## 🗄️ Banco de Dados

### Schema Prisma

```prisma
model Usuario {
  id        String   @id @default(uuid())
  nome      String
  email     String?  @unique
  cpf       String   @unique
  senhaHash String
  nivel     String   // "Administrador" | "Operador" | "Cliente"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Dados de Teste

- **CPF:** 00000000000
- **Senha:** admin123
- **Nível:** Administrador

## 🎨 Design System

### Cores (Dark Theme)

- **Primary:** Verde (#22c55e) - Empréstimos aprovados, ações positivas
- **Background:** Slate 950 - Fundo escuro
- **Foreground:** Slate 50 - Texto principal
- **Muted:** Slate 400 - Texto secundário
- **Destructive:** Vermelho - Erros e ações destrutivas

### Componentes UI

Todos os componentes seguem padrões do **shadcn/ui**:

- Acessíveis (ARIA compliant)
- Responsivos
- Suporte a temas
- Variantes configuráveis

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Clonar o repositório (quando disponível)
git clone <repo-url>

# Navegar para a pasta
cd emprestimodiario

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais

# Executar migrações do banco
npx prisma migrate dev

# Criar dados de teste
npx prisma db seed

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

### Build para Produção

```bash
# Gerar build otimizado
npm run build

# Executar build
npm start
```

## 📱 Aplicativo React Native

O backend foi projetado para servir também um **aplicativo React Native** (em desenvolvimento).

### Endpoints API para Mobile

```
POST /api/auth/signin       # Login
POST /api/auth/signout      # Logout
GET  /api/emprestimos       # Listar empréstimos
POST /api/emprestimos       # Solicitar empréstimo
GET  /api/parcelas          # Listar parcelas
POST /api/pagamentos        # Registrar pagamento
```

## 🔧 Variáveis de Ambiente

```env
# Database
DATABASE_URL=postgresql://user:pass@host/db

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<gerar-secret-seguro>

# Cloudflare R2 (futuro)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
```

## 📝 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento (Turbopack)
npm run build        # Build de produção
npm start            # Executar build
npx prisma studio    # Visualizar banco de dados
npx prisma migrate   # Gerenciar migrações
npx prisma db seed   # Popularmock dados
```

## 🧪 Próximos Passos

- [ ] Implementar CRUD de empréstimos
- [ ] Sistema de upload de documentos (R2)
- [ ] Integração com PIX
- [ ] Webhooks de pagamento
- [ ] Dashboard com métricas
- [ ] Sistema de notificações
- [ ] Testes unitários e E2E
- [ ] CI/CD com GitHub Actions
- [ ] Deploy na Vercel

## 🤝 Contribuindo

Este é um projeto privado. Para contribuir:

1. Crie uma branch feature
2. Faça suas alterações seguindo SOLID
3. Adicione testes
4. Submeta um PR

## 📄 Licença

Propriedade de **Empréstimo Diário**. Todos os direitos reservados.

---

**Desenvolvido com 💚 seguindo as melhores práticas de Clean Code e SOLID**
