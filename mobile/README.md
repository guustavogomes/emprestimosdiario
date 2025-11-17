# Empréstimo Diário - Mobile

Aplicativo React Native com Expo para o sistema de Empréstimo Diário.

## 🚀 Tecnologias

- **React Native** 0.74.0
- **Expo** ~51.0.0
- **TypeScript**
- **React Navigation** (Stack + Bottom Tabs)
- **Axios** para requisições HTTP
- **AsyncStorage** para persistência local
- **React Native Toast Message** para notificações

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Backend rodando (Next.js) em `http://localhost:3000`
- Expo CLI instalado globalmente: `npm install -g expo-cli`

## 🔧 Instalação

1. Entre na pasta do mobile:
```bash
cd mobile
```

2. Instale as dependências:
```bash
npm install
```

3. Configure a URL da API:

Edite o arquivo `src/services/api.ts` e altere a `BASE_URL`:

- **Para emulador Android**: use `http://10.0.2.2:3000`
- **Para iOS Simulator**: use `http://localhost:3000`
- **Para dispositivo físico**: use o IP da sua máquina na rede local (ex: `http://192.168.1.10:3000`)

```typescript
const BASE_URL = 'http://SEU_IP:3000';
```

## 📱 Executando o App

### Desenvolvimento

```bash
# Iniciar o servidor Expo
npm start

# Rodar no Android
npm run android

# Rodar no iOS (apenas macOS)
npm run ios

# Rodar no navegador
npm run web
```

### Testando no dispositivo físico

1. Instale o app **Expo Go** no seu celular:
   - [Android - Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS - App Store](https://apps.apple.com/app/expo-go/id982107779)

2. Execute `npm start`

3. Escaneie o QR Code com o app Expo Go

## 🎨 Estrutura do Projeto

```
mobile/
├── assets/              # Imagens e assets estáticos
├── src/
│   ├── components/      # Componentes reutilizáveis
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── Text.tsx
│   ├── contexts/        # Contexts do React
│   │   └── AuthContext.tsx
│   ├── routes/          # Navegação
│   │   ├── auth.routes.tsx
│   │   ├── app.routes.tsx
│   │   └── index.tsx
│   ├── screens/         # Telas do app
│   │   ├── SplashScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   └── RegisterScreen.tsx
│   ├── services/        # Serviços de API
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   └── clientService.ts
│   ├── theme/           # Design System
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── index.ts
│   └── utils/           # Utilitários
│       └── masks.ts
├── App.tsx              # Componente raiz
├── app.json             # Configurações do Expo
├── package.json
└── tsconfig.json
```

## 🎨 Design System

O app segue um Design System profissional com:

- **Cores**: Paleta verde esmeralda (#059669) como cor primária
- **Tipografia**: Hierarquia clara com tamanhos de 12px a 36px
- **Espaçamento**: Sistema em múltiplos de 4px
- **Componentes**: Button, Input, Card, Text reutilizáveis

## 🔐 Autenticação

O app possui duas formas de acesso:

1. **Login de Funcionários/Admin**: CPF + Senha
2. **Cadastro de Clientes**: Auto-cadastro com aprovação posterior

Os dados são persistidos localmente usando AsyncStorage e sincronizados com o backend.

## 📝 TODO

- [ ] Copiar logo do web (`public/logo.png`) para `mobile/assets/logo.png`
- [ ] Criar telas principais do app (Home, Histórico, Perfil)
- [ ] Implementar fluxo de empréstimos
- [ ] Adicionar validações de formulário
- [ ] Implementar pull-to-refresh
- [ ] Adicionar animações e transições
- [ ] Testes unitários

## 🐛 Troubleshooting

### Erro de conexão com a API

Certifique-se de que:
1. O backend está rodando em `http://localhost:3000`
2. A `BASE_URL` em `src/services/api.ts` está correta para seu ambiente
3. Seu dispositivo/emulador está na mesma rede que o backend

### Erro ao instalar dependências

```bash
# Limpe o cache e reinstale
rm -rf node_modules package-lock.json
npm install
```

## 📄 Licença

Este projeto é privado e pertence à empresa.
