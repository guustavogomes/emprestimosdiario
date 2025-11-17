# 🚀 Setup Rápido - Mobile App

## 1️⃣ Instalar Dependências

```bash
cd mobile
npm install
```

## 2️⃣ Configurar IP da API

Edite `src/services/api.ts` e altere a BASE_URL:

```typescript
// Para dispositivo físico, use o IP da sua máquina
const BASE_URL = 'http://192.168.1.XXX:3000';

// Para emulador Android
const BASE_URL = 'http://10.0.2.2:3000';

// Para iOS Simulator
const BASE_URL = 'http://localhost:3000';
```

### 🔍 Como descobrir seu IP:

**Windows:**
```bash
ipconfig
# Procure por "IPv4" na sua interface de rede
```

**macOS/Linux:**
```bash
ifconfig | grep "inet "
# ou
ip addr show
```

## 3️⃣ Copiar Logo (Opcional)

```bash
# Windows
copy ..\public\logo.png assets\logo.png

# macOS/Linux
cp ../public/logo.png assets/logo.png
```

Depois descomente as linhas nos arquivos:
- `src/screens/SplashScreen.tsx` (linha 18-19)
- `src/screens/LoginScreen.tsx` (linha 56-57)

## 4️⃣ Garantir que o Backend está Rodando

```bash
# Em outro terminal, na pasta raiz do projeto
npm run dev
# Backend deve estar em http://localhost:3000
```

## 5️⃣ Rodar o App

```bash
npm start
```

Depois escolha uma opção:
- **a** - Abrir no Android
- **i** - Abrir no iOS (somente macOS)
- **w** - Abrir no navegador
- Escaneie o **QR Code** com o app Expo Go no seu celular

## 📱 Instalar Expo Go

- **Android**: https://play.google.com/store/apps/details?id=host.exp.exponent
- **iOS**: https://apps.apple.com/app/expo-go/id982107779

## ✅ Testando o App

1. **Cadastro de Cliente**:
   - Na tela de login, clique em "Cadastre-se aqui"
   - Preencha os dados do cliente
   - Cadastre-se

2. **Login de Funcionário/Admin**:
   - Use CPF e senha de um usuário do sistema
   - Exemplo: CPF do admin criado anteriormente

## 🎨 Funcionalidades Implementadas

- ✅ Design System profissional
- ✅ Componentes reutilizáveis (Button, Input, Card, Text)
- ✅ Máscaras de CPF, telefone e CEP
- ✅ Autenticação com JWT
- ✅ Persistência local com AsyncStorage
- ✅ Toast notifications
- ✅ Navegação Stack + Tabs
- ✅ Auto-cadastro de clientes
- ✅ Validação de formulários

## 🔧 Próximos Passos

1. Criar telas principais (Home, Histórico, Perfil detalhado)
2. Implementar fluxo de empréstimos
3. Adicionar busca de CEP com ViaCEP
4. Implementar upload de documentos
5. Adicionar notificações push
6. Criar tela de configurações

## ❓ Problemas Comuns

### Erro "Network request failed"
- Verifique se o backend está rodando
- Confirme se a BASE_URL está correta
- Se estiver usando dispositivo físico, certifique-se de estar na mesma rede Wi-Fi

### Erro "Unable to resolve module"
```bash
# Limpe o cache do Metro
npm start -- --reset-cache
```

### App não carrega
```bash
# Reinstale as dependências
rm -rf node_modules package-lock.json
npm install
```
