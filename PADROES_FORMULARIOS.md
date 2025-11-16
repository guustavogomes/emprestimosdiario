# Padrões de Formulários e Loading

Este documento descreve os padrões obrigatórios para todos os formulários e navegação no sistema.

## 1. Loading Global

### Navegação Entre Páginas
O sistema possui um loading automático que aparece ao navegar entre páginas.

**Já implementado em:** `app/dashboard/layout.tsx`

```tsx
import { LoadingProvider } from "@/components/providers/LoadingProvider";

// No layout
<LoadingProvider>
  {children}
</LoadingProvider>
```

### Loading em Páginas
Para páginas que carregam dados:

```tsx
import { PageLoading } from "@/components/ui/loading";

if (isLoading) {
  return <PageLoading />;
}
```

### Loading em Botões
Para botões com ações assíncronas:

```tsx
import { ButtonLoading } from "@/components/ui/loading";

<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <ButtonLoading />
      <span className="ml-2">Salvando...</span>
    </>
  ) : (
    "Salvar"
  )}
</Button>
```

## 2. Validação de Formulários

### Campos Obrigatórios
**REGRA:** O botão de salvar deve estar SEMPRE desabilitado até que todos os campos obrigatórios sejam preenchidos.

### Exemplo de Implementação

```tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ButtonLoading } from "@/components/ui/loading";

export function MeuFormulario() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    campoObrigatorio1: "",
    campoObrigatorio2: "",
    campoOpcional: "",
  });

  // Validação de campos obrigatórios
  const isFormValid = React.useMemo(() => {
    return (
      formData.campoObrigatorio1.trim() !== "" &&
      formData.campoObrigatorio2.trim() !== ""
    );
  }, [formData.campoObrigatorio1, formData.campoObrigatorio2]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) return;

    setIsLoading(true);

    try {
      // Sua lógica de save aqui
      await salvarDados(formData);
    } catch (error) {
      console.error("Erro ao salvar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Seus campos aqui */}

      <Button
        type="submit"
        disabled={!isFormValid || isLoading}
        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <ButtonLoading />
            <span className="ml-2">Salvando...</span>
          </>
        ) : (
          "Salvar"
        )}
      </Button>
    </form>
  );
}
```

## 3. Checklist para Novos Formulários

Antes de considerar um formulário pronto, verifique:

- [ ] Campos obrigatórios marcados com asterisco (*)
- [ ] useMemo implementado para validação
- [ ] Botão salvar desabilitado quando `!isFormValid || isLoading`
- [ ] Estado `isLoading` implementado
- [ ] Loading visual no botão durante submit
- [ ] Try/catch implementado no handleSubmit
- [ ] Finally para resetar loading
- [ ] Feedback visual de erro (se aplicável)
- [ ] Feedback de sucesso após salvar

## 4. Componentes de Loading Disponíveis

### Loading (uso geral)
```tsx
import { Loading } from "@/components/ui/loading";

<Loading size="sm" text="Carregando..." />
<Loading size="md" />
<Loading size="lg" fullScreen text="Processando..." />
```

### PageLoading (substituir conteúdo de página)
```tsx
import { PageLoading } from "@/components/ui/loading";

<PageLoading />
```

### ButtonLoading (dentro de botões)
```tsx
import { ButtonLoading } from "@/components/ui/loading";

<Button>
  <ButtonLoading />
  <span className="ml-2">Aguarde...</span>
</Button>
```

## 5. Exemplo Completo

Ver implementação completa em:
- `components/clientes/ClienteFormModal.tsx`
- `components/auth/LoginForm.tsx`

---

**IMPORTANTE:** Estes padrões são OBRIGATÓRIOS para todos os formulários do sistema.
Formulários que não seguirem estes padrões devem ser refatorados.
