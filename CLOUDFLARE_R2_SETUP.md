# Configuração do Cloudflare R2

Guia completo para configurar o Cloudflare R2 para armazenamento de arquivos.

## 📋 Pré-requisitos

- Conta na Cloudflare
- Domínio configurado na Cloudflare (opcional, mas recomendado)

---

## 🚀 Passo 1: Criar Bucket no R2

1. Acesse o [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. No menu lateral, clique em **R2**
3. Clique em **Create bucket**
4. Configure o bucket:
   - **Bucket name**: `emprestimodiario-files` (ou outro nome de sua preferência)
   - **Location**: Escolha a região mais próxima (sugestão: `WNAM` para América do Norte ou `EEUR` para Europa)
5. Clique em **Create bucket**

---

## 🔑 Passo 2: Criar API Token (Credenciais)

1. No painel do R2, clique em **Manage R2 API Tokens**
2. Clique em **Create API token**
3. Configure o token:
   - **Token name**: `emprestimodiario-api-token`
   - **Permissions**:
     - ✅ Object Read & Write
     - ✅ (Opcional) Object Delete se quiser permitir deleção
   - **TTL**: Leave as "Forever" ou defina um tempo de expiração
   - **Apply to specific buckets only**: Selecione o bucket criado anteriormente
4. Clique em **Create API Token**
5. **IMPORTANTE**: Copie e salve as credenciais que aparecem:
   - `Access Key ID`
   - `Secret Access Key`
   - `Account ID`

   ⚠️ Você só verá o Secret Access Key uma vez!

---

## ⚙️ Passo 3: Configurar Variáveis de Ambiente

Abra o arquivo `.env.local` e atualize com suas credenciais:

```env
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=seu_account_id_aqui
R2_ACCESS_KEY_ID=seu_access_key_id_aqui
R2_SECRET_ACCESS_KEY=seu_secret_access_key_aqui
R2_BUCKET_NAME=emprestimodiario-files
```

### Para deploy na Vercel:

1. Acesse o projeto na Vercel
2. Vá em **Settings** → **Environment Variables**
3. Adicione as 4 variáveis:
   - `R2_ACCOUNT_ID`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `R2_BUCKET_NAME`

---

## 🌐 Passo 4: Configurar Domínio Personalizado (Opcional mas Recomendado)

### Por que usar domínio personalizado?
- URLs mais profissionais
- Melhor controle de cache
- Integração com Cloudflare CDN

### Como configurar:

1. No bucket R2, clique em **Settings**
2. Role até **Public access**
3. Clique em **Connect domain**
4. Escolha um domínio ou subdomínio:
   - Exemplo: `files.emprestimodiario.com.br`
5. Siga as instruções para criar o CNAME no DNS

Depois, atualize a função `getPublicUrl` no arquivo `src/lib/r2.ts`:

```typescript
export function getPublicUrl(key: string): string {
  return `https://files.emprestimodiario.com.br/${key}`;
}
```

---

## 🔒 Passo 5: Configurar CORS (para upload direto do browser)

Se você quiser fazer upload direto do navegador sem passar pelo servidor:

1. No bucket, vá em **Settings**
2. Role até **CORS Policy**
3. Clique em **Edit CORS policy**
4. Adicione a seguinte configuração:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://seu-dominio-vercel.vercel.app",
      "https://seu-dominio-producao.com.br"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag"
    ],
    "MaxAgeSeconds": 3000
  }
]
```

---

## 📤 Como Usar as APIs

### 1. Upload de Arquivo

```typescript
// Frontend
const handleUpload = async (file: File, clienteId?: string) => {
  const formData = new FormData();
  formData.append('file', file);
  if (clienteId) {
    formData.append('clienteId', clienteId);
  }

  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const data = await response.json();
  console.log('Arquivo enviado:', data.key);
};
```

### 2. Listar Arquivos

```typescript
// Listar todos os arquivos
const response = await fetch('/api/files', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const { files } = await response.json();

// Listar arquivos de um cliente específico
const response = await fetch('/api/files?folder=clientes/uuid-do-cliente', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### 3. Obter URL de Download

```typescript
const key = 'clientes/uuid/1234567890-documento.pdf';
const encodedKey = encodeURIComponent(key);

const response = await fetch(`/api/files/${encodedKey}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { url } = await response.json();
// URL válida por 1 hora
window.open(url, '_blank');
```

### 4. Deletar Arquivo

```typescript
const key = 'clientes/uuid/1234567890-documento.pdf';
const encodedKey = encodeURIComponent(key);

const response = await fetch(`/api/files/${encodedKey}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## 📊 Estrutura de Pastas Recomendada

```
emprestimodiario-files/
├── clientes/
│   ├── {clienteId}/
│   │   ├── documentos/
│   │   │   ├── cpf.pdf
│   │   │   ├── comprovante-residencia.pdf
│   │   ├── fotos/
│   │   │   ├── perfil.jpg
│   │   │   ├── selfie-documento.jpg
├── contratos/
│   ├── {emprestimoId}/
│   │   ├── contrato.pdf
│   │   ├── comprovante-pagamento.pdf
├── uploads/
│   ├── outros-arquivos.jpg
```

---

## 💰 Custos do R2

O Cloudflare R2 tem preços muito competitivos:

- **Armazenamento**: $0.015 / GB / mês
- **Operações Classe A** (write): $4.50 / milhão de requisições
- **Operações Classe B** (read): $0.36 / milhão de requisições
- **Sem cobrança de egress** (tráfego de saída é GRÁTIS!)

**Exemplo prático:**
- 10 GB de arquivos
- 100.000 uploads/mês
- 500.000 downloads/mês

**Custo mensal**: ~$0.85 USD 🎉

---

## 🔍 Validações Implementadas

As APIs já incluem validações de segurança:

- ✅ Autenticação JWT obrigatória
- ✅ Limite de tamanho: 10MB por arquivo
- ✅ Tipos permitidos: JPEG, PNG, WebP, PDF
- ✅ Nome de arquivo sanitizado
- ✅ Timestamp único para evitar sobrescrita

---

## 🧪 Testando a Configuração

Após configurar tudo, teste se está funcionando:

```bash
# No terminal do projeto
npm run dev
```

Faça login no sistema e teste o upload de um arquivo através da interface de clientes.

---

## 📝 Próximos Passos

1. ✅ Configurar R2 na Cloudflare
2. ✅ Atualizar variáveis de ambiente
3. ✅ Testar upload localmente
4. 🔲 Adicionar campo de upload no formulário de clientes
5. 🔲 Criar galeria de documentos por cliente
6. 🔲 Implementar visualização de arquivos
7. 🔲 Configurar domínio personalizado (opcional)

---

## 🆘 Problemas Comuns

### Erro: "Invalid credentials"
- Verifique se as credenciais no `.env.local` estão corretas
- Certifique-se de que o token tem as permissões corretas

### Erro: "Access Denied"
- Verifique se o bucket name está correto
- Confirme que o token tem acesso ao bucket específico

### Erro: "CORS policy"
- Configure CORS no bucket conforme Passo 5
- Adicione seu domínio local e de produção

### Erro: "File too large"
- O limite padrão é 10MB
- Para aumentar, edite `app/api/upload/route.ts` linha 30

---

## 📚 Recursos Úteis

- [Documentação oficial do R2](https://developers.cloudflare.com/r2/)
- [Calculadora de custos do R2](https://developers.cloudflare.com/r2/pricing/)
- [AWS SDK para JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)

---

**Dúvidas?** Consulte a documentação ou abra uma issue no repositório.
