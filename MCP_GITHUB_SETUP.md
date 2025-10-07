# 🔧 Configuração do MCP GitHub

## ✅ Status da Instalação

O servidor MCP do GitHub foi instalado e configurado com sucesso!

### 📦 Pacotes Instalados
- `@modelcontextprotocol/server-github` - Servidor MCP para integração com GitHub

### ⚙️ Configuração Realizada

O arquivo `C:\Users\PC\.cursor\mcp.json` foi atualizado com:

```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp?project_ref=qmjzalbrehakxhvwrdkt",
      "headers": {}
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "C:\\Users\\PC\\Desktop\\KORLAB\\craft-niche-pro"
      ]
    },
    "github": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": ""
      }
    }
  }
}
```

## 🔑 Próximos Passos - Configuração do Token

### 1. Criar Personal Access Token no GitHub

1. Acesse: https://github.com/settings/tokens
2. Clique em "Generate new token" → "Generate new token (classic)"
3. Configure:
   - **Note**: "MCP GitHub Integration"
   - **Expiration**: 90 days (ou conforme preferência)
   - **Scopes**: Selecione os seguintes:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `read:org` (Read org and team membership)
     - ✅ `read:user` (Read user profile data)
     - ✅ `user:email` (Access user email addresses)

### 2. Configurar o Token

Substitua a string vazia em `GITHUB_PERSONAL_ACCESS_TOKEN` pelo token gerado:

```json
"env": {
  "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_seu_token_aqui"
}
```

### 3. Reiniciar o Cursor

Após configurar o token, reinicie o Cursor IDE para que as mudanças tenham efeito.

## 🚀 Funcionalidades Disponíveis

Com o MCP GitHub configurado, você poderá:

- ✅ Listar repositórios
- ✅ Criar issues e pull requests
- ✅ Gerenciar branches
- ✅ Visualizar commits e histórico
- ✅ Interagir com o repositório diretamente via chat
- ✅ Fazer operações Git através do MCP

## 🔒 Segurança

- O token é armazenado localmente no arquivo de configuração
- Mantenha o token seguro e não o compartilhe
- Considere usar tokens com escopo limitado para maior segurança

## 📝 Exemplo de Uso

Após a configuração, você poderá usar comandos como:
- "Liste os últimos commits do repositório"
- "Crie uma nova issue"
- "Mostre o status do repositório"
- "Faça um pull request"

---

**Status**: ✅ Instalação concluída - Aguardando configuração do token
