# Meu Quadro To Do ⚡

Um sistema pessoal de gerenciamento de tarefas **Meu Quadro To Do** (estilo Kanban), projetado para ser leve, direto ao ponto, rodar **100% localhost** e com um visual minimalista e moderno em **Preto e Branco**.

---

## ✨ Principais Funcionalidades

- 🗂️ **Gestão de Múltiplos Projetos**: Crie, selecione, renomeie e exclua projetos na barra lateral.
- 📋 **Quadro Kanban com 4 Colunas Padrão**:
  - 📝 *Para fazer*
  - ⚡ *Fazendo*
  - ✅ *Completo*
  - ❌ *Não deu certo*
  - *(Você pode adicionar, renomear ou excluir colunas quando quiser)*
- 🔄 **Arrastar e Soltar (Drag and Drop)**: Mova tarefas entre colunas com resposta instantânea e sincronização em tempo real no banco.
- 📝 **Edição Completa de Tarefas**: Modal dedicado para detalhar títulos e notas longas (com atalho `Ctrl + Enter` para salvar).
- 🔍 **Busca Instantânea**: Filtro de cards em tempo real na barra superior.
- 🐘 **Banco de Dados PostgreSQL**: Estrutura relacional sólida, com script de inicialização automática e integridade em cascata.
- ⚡ **Zero Bloatware**: Sem necessidade de login, sem assinaturas, sem consumo excessivo de memória. Roda local na sua máquina.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, `@hello-pangea/dnd`
- **Backend**: Node.js, Express, PostgreSQL (`pg`)
- **Design**: Estética monocromática minimalista (Dark Mode Obsidian)

---

## 🚀 Como Instalar e Rodar

### 1. Pré-requisitos
- [Node.js](https://nodejs.org/) (v18 ou superior)
- [PostgreSQL](https://www.postgresql.org/) rodando na sua máquina (porta padrão `5432`)

---

### 2. Configurar o Banco de Dados

1. Acesse a pasta `server/` e verifique as credenciais no arquivo `.env` (ou crie a partir do `.env.example`):
   ```env
   PORT=3001
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=sua_senha_aqui
   DB_NAME=clickup_todo
   ```

2. Execute o comando de inicialização do banco:
   ```bash
   npm run db:init
   ```
   > 💡 *Esse script cria automaticamente o banco de dados `clickup_todo`, as tabelas necessárias e os dados iniciais.*
   
   *(Caso prefira rodar manualmente pelo pgAdmin ou DBeaver, há também o script SQL pronto em [`server/src/schema.sql`](server/src/schema.sql)).*

---

### 3. Instalar Dependências

Na raiz do projeto, instale os pacotes do frontend e backend de uma só vez:
```bash
npm run install:all
```

---

### 4. Iniciar a Aplicação

#### No Windows (1 Clique):
Dê um duplo clique no arquivo:
```cmd
start.bat
```

#### Via Terminal:
```bash
npm run dev
```

Abra seu navegador em: **[http://localhost:5173](http://localhost:5173)**

---

## 🧪 Testes Automatizados

O sistema conta com uma suíte de testes de integração ponta a ponta:
```bash
npm test
```

---

## 📂 Estrutura de Pastas

```
├── client/                 # Interface React + Vite + Tailwind
│   ├── src/
│   │   ├── components/     # Sidebar, KanbanBoard, Column, CardItem, CardModal
│   │   ├── services/       # Cliente HTTP (API)
│   │   └── App.jsx         # Estado global e lógica de drag-and-drop
├── server/                 # Servidor Express + PostgreSQL
│   ├── src/
│   │   ├── db.js           # Pool PostgreSQL e auto-migration
│   │   ├── init-db.js      # Script de inicialização do banco
│   │   ├── schema.sql      # Schema SQL puro
│   │   ├── routes.js       # Endpoints REST (CRUD e movimentação)
│   │   └── index.js        # Entry point do servidor
│   └── .env                # Variáveis de ambiente
├── scripts/
│   ├── start-dev.js        # Inicialização simultânea
│   └── test-system.js      # Suíte de testes automatizados
└── start.bat               # Executável rápido para Windows
```

---

## 📄 Licença

Este projeto é de código aberto e livre para uso pessoal ou modificação.
