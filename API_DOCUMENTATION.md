# Documentação das APIs - Empréstimo Diário

Sistema RESTful com autenticação JWT pronto para Web e Mobile (React Native).

## Autenticação

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "cpf": "00000000000",
  "senha": "admin123"
}
```

**Resposta de Sucesso (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "nome": "Admin",
    "email": "admin@example.com",
    "cpf": "00000000000",
    "nivel": "Administrador"
  }
}
```

**Resposta de Erro (401):**
```json
{
  "error": "CPF ou senha incorretos"
}
```

### Obter Dados do Usuário Logado
```http
GET /api/auth/me
Authorization: Bearer {token}
```

**Resposta (200):**
```json
{
  "id": "uuid",
  "nome": "Admin",
  "email": "admin@example.com",
  "cpf": "00000000000",
  "nivel": "Administrador"
}
```

## Clientes

**TODAS as rotas de clientes requerem autenticação via JWT.**

### Listar Clientes
```http
GET /api/clientes
Authorization: Bearer {token}

# Com filtros (opcional)
GET /api/clientes?etiqueta=green
GET /api/clientes?search=João
```

**Resposta (200):**
```json
[
  {
    "id": "uuid",
    "nome": "João Silva",
    "telefone": "(11) 98765-4321",
    "cpf": "12345678900",
    "dataNascimento": "1990-01-01T00:00:00.000Z",
    "cep": "01310-100",
    "endereco": "Avenida Paulista",
    "numero": "1000",
    "bairro": "Bela Vista",
    "cidade": "São Paulo",
    "chavePix": "12345678900",
    "nomeEmergencia1": "Maria Silva",
    "telefoneEmergencia1": "(11) 98765-4322",
    "nomeEmergencia2": null,
    "telefoneEmergencia2": null,
    "etiqueta": "green",
    "ativo": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### Criar Cliente
```http
POST /api/clientes
Authorization: Bearer {token}
Content-Type: application/json

{
  "nome": "João Silva",          // OBRIGATÓRIO
  "telefone": "(11) 98765-4321", // OBRIGATÓRIO
  "cpf": "12345678900",          // OBRIGATÓRIO
  "dataNascimento": "1990-01-01",
  "cep": "01310-100",
  "endereco": "Avenida Paulista",
  "numero": "1000",
  "bairro": "Bela Vista",
  "cidade": "São Paulo",
  "chavePix": "12345678900",
  "nomeEmergencia1": "Maria Silva",
  "telefoneEmergencia1": "(11) 98765-4322",
  "nomeEmergencia2": "José Silva",
  "telefoneEmergencia2": "(11) 98765-4323",
  "etiqueta": "green"
}
```

**Resposta (201):**
```json
{
  "id": "uuid",
  "nome": "João Silva",
  ...
}
```

**Erros:**
- `400` - Campos obrigatórios faltando ou CPF já cadastrado
- `401` - Token inválido ou não fornecido

### Buscar Cliente por ID
```http
GET /api/clientes/{id}
Authorization: Bearer {token}
```

**Resposta (200):** Objeto do cliente
**Erro (404):** Cliente não encontrado

### Atualizar Cliente
```http
PUT /api/clientes/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "nome": "João Silva Santos",
  "telefone": "(11) 98765-4321",
  ...
}
```

**Resposta (200):** Cliente atualizado

### Deletar Cliente
```http
DELETE /api/clientes/{id}
Authorization: Bearer {token}
```

**Resposta (200):**
```json
{
  "message": "Cliente deletado com sucesso"
}
```

**NOTA:** Este é um soft delete. O cliente é marcado como `ativo: false`.

## Arquivos (Cloudflare R2)

**TODAS as rotas de arquivos requerem autenticação via JWT.**

### Upload de Arquivo
```http
POST /api/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

FormData:
- file: arquivo (obrigatório)
- folder: pasta de destino (opcional)
- clienteId: ID do cliente (opcional, cria pasta clientes/{id})
```

**Validações:**
- Tamanho máximo: 10MB
- Tipos permitidos: JPEG, PNG, WebP, PDF

**Resposta (200):**
```json
{
  "success": true,
  "key": "clientes/uuid/1234567890-documento.pdf",
  "fileName": "1234567890-documento.pdf",
  "folder": "clientes/uuid",
  "size": 1024567,
  "contentType": "application/pdf",
  "uploadedAt": "2025-01-16T10:30:00.000Z"
}
```

**Erros:**
- `400` - Arquivo não fornecido, muito grande ou tipo não permitido
- `401` - Token inválido
- `500` - Erro no upload

### Listar Arquivos
```http
GET /api/files
Authorization: Bearer {token}

# Com filtro de pasta
GET /api/files?folder=clientes/uuid
```

**Resposta (200):**
```json
{
  "success": true,
  "files": [
    {
      "key": "clientes/uuid/1234567890-documento.pdf",
      "size": 1024567,
      "lastModified": "2025-01-16T10:30:00.000Z"
    }
  ],
  "total": 1
}
```

### Obter URL de Download
```http
GET /api/files/{encodedKey}
Authorization: Bearer {token}
```

**NOTA:** A key deve ser URL encoded. Ex: `clientes/uuid/doc.pdf` → `clientes%2Fuuid%2Fdoc.pdf`

**Resposta (200):**
```json
{
  "success": true,
  "url": "https://signed-url.r2.cloudflarestorage.com/...",
  "key": "clientes/uuid/1234567890-documento.pdf",
  "expiresIn": 3600
}
```

**NOTA:** A URL de download expira em 1 hora (3600 segundos).

### Deletar Arquivo
```http
DELETE /api/files/{encodedKey}
Authorization: Bearer {token}
```

**Resposta (200):**
```json
{
  "success": true,
  "message": "Arquivo deletado com sucesso",
  "key": "clientes/uuid/1234567890-documento.pdf"
}
```

### Exemplo React Native - Upload de Foto

```typescript
// Fazer upload de foto da câmera/galeria
async uploadClientePhoto(clienteId: string, imageUri: string) {
  const token = await AsyncStorage.getItem('token');

  // Criar FormData
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'foto.jpg',
  } as any);
  formData.append('clienteId', clienteId);

  const response = await fetch(`${API_URL}/api/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  return response.json();
}

// Obter URL para visualizar foto
async getClientePhotoUrl(key: string) {
  const token = await AsyncStorage.getItem('token');
  const encodedKey = encodeURIComponent(key);

  const response = await fetch(`${API_URL}/api/files/${encodedKey}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const { url } = await response.json();
  return url;
}
```

## Autenticação JWT

### Como usar:

1. **Fazer Login:**
   ```javascript
   const response = await fetch('/api/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ cpf: '00000000000', senha: 'admin123' })
   });
   const { token, user } = await response.json();
   ```

2. **Armazenar Token:**
   ```javascript
   // Web
   localStorage.setItem('token', token);

   // React Native
   await AsyncStorage.setItem('token', token);
   ```

3. **Usar Token nas Requisições:**
   ```javascript
   const response = await fetch('/api/clientes', {
     headers: {
       'Authorization': `Bearer ${token}`
     }
   });
   ```

## Códigos de Status HTTP

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Erro de validação
- `401` - Não autenticado ou token inválido
- `404` - Recurso não encontrado
- `500` - Erro interno do servidor

## React Native - Exemplo de Uso

```typescript
// services/api.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://api.emprestimodiario.com';

class ApiService {
  async login(cpf: string, senha: string) {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cpf, senha })
    });

    const data = await response.json();
    await AsyncStorage.setItem('token', data.token);
    return data;
  }

  async getClientes() {
    const token = await AsyncStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/clientes`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  }

  async createCliente(data: any) {
    const token = await AsyncStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/clientes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }
}

export default new ApiService();
```

## Segurança

- Tokens JWT expiram em 7 dias
- Senhas são hasheadas com bcrypt (10 rounds)
- Todas as rotas de API (exceto /api/auth/login) requerem autenticação
- Soft delete para clientes (dados nunca são apagados permanentemente)

---

**Última atualização:** $(date)
**Versão da API:** 1.0.0
