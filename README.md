# Meu Quadro To Do ⚡

Um sistema pessoal de gerenciamento de tarefas no estilo **Kanban**, desenvolvido para ser leve, direto ao ponto e executado **100% localmente**.

O projeto possui uma interface minimalista em preto e branco e utiliza **React no frontend, Node.js/Express no backend e PostgreSQL como banco de dados**.

---

## ✨ Funcionalidades

* 🗂️ **Múltiplos projetos** — Crie, selecione, renomeie e exclua projetos.
* 📋 **Quadro Kanban** — Organização das tarefas em colunas personalizáveis.
* 🔄 **Drag and Drop** — Mova tarefas entre colunas de forma intuitiva.
* 📝 **Edição de tarefas** — Títulos e descrições detalhadas através de um modal dedicado.
* 🔍 **Busca instantânea** — Filtre tarefas em tempo real.
* 🐘 **PostgreSQL** — Banco de dados relacional com inicialização automatizada.
* ⚡ **100% Localhost** — Sem login, assinaturas ou dependência de serviços externos.
* 🧪 **Testes automatizados** — Suíte de testes de integração para validar as principais operações do sistema.

---

## 🛠️ Tecnologias

### Frontend

* React 18
* Vite
* Tailwind CSS
* Lucide Icons
* `@hello-pangea/dnd`

### Backend

* Node.js
* Express
* PostgreSQL
* `pg`

### Arquitetura

```text
React + Vite
     ↓
REST API
     ↓
Node.js + Express
     ↓
PostgreSQL
```

---

## 🚀 Como instalar e executar

### 1. Pré-requisitos

Antes de começar, certifique-se de ter instalado:

* [Node.js](https://nodejs.org/) v18 ou superior
* [PostgreSQL](https://www.postgresql.org/) com a porta padrão `5432`

---

### 2. Clone o projeto

```bash
git clone https://github.com/EnzoConverso/MeuQuadroToDo.git
cd MeuQuadroToDo
```

---

### 3. Configure o banco de dados

Entre na pasta `server` e crie um arquivo `.env` baseado no `.env.example`.

Exemplo:

```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
DB_NAME=clickup_todo
```

Depois, na raiz do projeto, execute:

```bash
npm run db:init
```

Esse comando inicializa o banco de dados e cria as tabelas necessárias.

Caso prefira configurar o banco manualmente, o schema SQL está disponível em:

`server/src/schema.sql`

---

### 4. Instale as dependências

Na raiz do projeto:

```bash
npm run install:all
```

---

### 5. Execute a aplicação

#### Windows — inicialização rápida

Execute:

```text
start.bat
```

#### Via terminal

```bash
npm run dev
```

Depois acesse:

**http://localhost:5173**

---

## 🧪 Testes

O projeto possui uma suíte de testes automatizados para validar as principais funcionalidades da API e integração com o banco de dados.

Execute:

```bash
npm test
```

---

## 📂 Estrutura do projeto

```text
MeuQuadroToDo/
│
├── client/                     # Frontend React + Vite
│   ├── src/
│   │   ├── components/         # Componentes da interface
│   │   ├── services/           # Comunicação com a API
│   │   └── App.jsx             # Aplicação principal
│   └── package.json
│
├── server/                     # Backend Node.js + Express
│   ├── src/
│   │   ├── db.js               # Conexão com PostgreSQL
│   │   ├── init-db.js          # Inicialização do banco
│   │   ├── schema.sql          # Estrutura do banco
│   │   ├── routes.js            # Endpoints REST
│   │   └── index.js             # Entry point
│   ├── .env.example
│   └── package.json
│
├── scripts/
│   ├── start-dev.js             # Inicialização da aplicação
│   └── test-system.js           # Testes automatizados
│
├── .gitignore
├── package.json
├── README.md
└── start.bat
```

---

## 🔐 Observação sobre segurança

Este projeto foi desenvolvido para execução **localmente (localhost)**.

O backend não possui autenticação de usuários e utiliza configurações de CORS adequadas para um ambiente de desenvolvimento local. Caso o projeto seja adaptado para produção ou disponibilizado publicamente como serviço, recomenda-se implementar autenticação, autorização, validação adicional de entradas e uma política de CORS restritiva.

As credenciais do banco de dados devem ser configuradas através de variáveis de ambiente e **não devem ser adicionadas ao repositório**.

---

## 📄 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).
