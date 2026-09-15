# 📦 Sistema de Controle de Estoque

Aplicação web **full stack** para gerenciamento de estoque, desenvolvida com React, TypeScript, Node.js, Express, Prisma e PostgreSQL.

O sistema foi construído para praticar e demonstrar, em um único projeto, conceitos de **desenvolvimento Front-end, Back-end, API REST, banco de dados, autenticação, autorização, segurança, integração com Inteligência Artificial e deploy em nuvem**.

🔗 **Aplicação online:**
https://controle-estoque-react-roan.vercel.app/

---

## 📸 Preview

<img width="1871" height="956" alt="Screenshot_1" src="https://github.com/user-attachments/assets/ee5ea1d2-a1b4-40f0-8cc3-ceaa40b949c9" />

---

# 🚀 Sobre o projeto

O sistema permite cadastrar, consultar, editar e excluir produtos, organizar categorias, acompanhar movimentações de estoque e visualizar indicadores através de um dashboard.

Além disso, possui um sistema de **autenticação com JWT e controle de acesso por perfil**, permitindo diferentes níveis de permissão para usuários.

Também existe uma integração com **Google Gemini**, utilizada para análise e consulta dos dados do estoque através de linguagem natural.

O projeto possui arquitetura separada entre:

```text
Frontend
    ↓
API REST
    ↓
Prisma ORM
    ↓
PostgreSQL
```

e:

```text
Frontend
    ↓
API
    ↓
Google Gemini
```

---

# ✨ Principais funcionalidades

## 🔐 Autenticação e autorização

O sistema possui autenticação baseada em **JWT (JSON Web Token)**.

Funcionalidades:

* Login com e-mail e senha
* Senhas protegidas com `bcrypt`
* Token JWT com expiração
* Logout
* Controle de sessão
* Alteração de senha
* Controle de acesso baseado em funções
* Proteção das rotas da API
* Tratamento de sessão expirada ou token inválido

### Perfis disponíveis

| Perfil         | Permissões                                    |
| -------------- | --------------------------------------------- |
| `ADMIN`        | Acesso completo ao sistema                    |
| `OPERADOR`     | Operações de produtos e categorias permitidas |
| `VISUALIZACAO` | Consulta e visualização dos dados             |

O sistema utiliza middleware de autenticação e autorização para controlar o acesso às operações protegidas.

---

# 📦 Gerenciamento de produtos

O sistema possui um CRUD completo de produtos integrado ao PostgreSQL.

### Recursos

* Cadastro de produtos
* Edição de produtos
* Exclusão de produtos
* Confirmação antes da exclusão
* Cadastro de imagem
* Pesquisa por nome
* Pesquisa por categoria
* Filtro por categoria
* Filtro de estoque baixo
* Ordenação por nome
* Ordenação por quantidade
* Ordenação por preço
* Validação dos dados recebidos pela API
* Controle de permissões para operações de alteração

### Estrutura básica

```text
Product
├── id
├── name
├── category
├── quantity
├── price
├── image
├── createdAt
└── updatedAt
```

---

# 🗂️ Gerenciamento de categorias

O sistema possui um módulo próprio para gerenciamento de categorias.

### Recursos

* Cadastro de categorias
* Edição de categorias
* Exclusão de categorias
* Listagem de categorias
* Busca
* Contagem de produtos associados
* Identificação de categorias sem produtos
* Prevenção de categorias duplicadas
* Prevenção de exclusão de categorias utilizadas por produtos
* Atualização automática da categoria dos produtos quando o nome é alterado

---

# 🔎 Pesquisa, filtros e ordenação

A aplicação permite organizar os produtos através de diferentes mecanismos:

* Pesquisa por nome
* Pesquisa por categoria
* Filtro por categoria
* Filtro de estoque baixo
* Ordenação por nome
* Ordenação por quantidade
* Ordenação por preço

### Regra de estoque baixo

O sistema considera estoque baixo quando:

```text
Quantidade <= 5
```

A regra é aplicada diretamente pela aplicação para manter consistência nos indicadores e análises.

---

# 📊 Dashboard

O Dashboard apresenta uma visão geral do estoque.

### Indicadores

* Total de produtos
* Produtos com estoque baixo
* Número de categorias
* Valor total do estoque

### Valor total do estoque

O valor é calculado através de:

```text
Quantidade × Preço
```

Exemplo:

```text
10 × R$ 50,00 = R$ 500,00
```

O Dashboard também apresenta informações relacionadas ao histórico de movimentações e produtos que precisam de atenção.

---

# 📜 Histórico de movimentações

Todas as principais alterações realizadas no estoque podem ser registradas automaticamente pela API.

### Tipos de movimentação

```text
criacao
entrada
saida
atualizacao
remocao
```

### Dados registrados

Cada movimentação pode armazenar:

* ID da movimentação
* ID do produto
* Nome do produto
* Tipo da operação
* Quantidade movimentada
* Quantidade anterior
* Nova quantidade
* Descrição
* Data e horário
* Usuário responsável pela operação

### Exemplo

```text
Produto: Teclado
Tipo: saida
Quantidade: 30
Anterior: 60
Novo estoque: 30
```

Além do controle operacional, o histórico melhora a **rastreabilidade das alterações realizadas no sistema**.

---

# 👥 Usuários

Usuários com perfil `ADMIN` possuem acesso ao gerenciamento de usuários.

### Recursos

* Listar usuários
* Criar usuários
* Editar usuários
* Alterar perfil
* Alterar senha
* Desativar usuários
* Impedir exclusão do próprio usuário

Os dados dos usuários são armazenados no PostgreSQL.

As senhas não são armazenadas em texto puro: o sistema utiliza `bcrypt` para gerar os hashes das senhas.

---

# 🤖 Inteligência Artificial

O sistema possui integração com **Google Gemini** para interpretar e responder perguntas relacionadas ao estoque.

A IA é utilizada como uma camada de interpretação sobre os dados estruturados do sistema.

## Arquitetura

```text
Usuário
   ↓
React
   ↓
Express API
   ↓
Google Gemini
   ↓
Resposta
   ↓
React
```

O Front-end não acessa diretamente a API do Gemini.

A comunicação é realizada pelo Back-end.

---

# 📊 Análise automática de estoque

O sistema possui uma funcionalidade de análise automática.

Endpoint utilizado:

```http
POST /api/analisar-estoque
```

A API consulta os produtos diretamente no banco e calcula os indicadores objetivos antes de enviar o contexto ao Gemini.

### Indicadores considerados

* Produtos com estoque baixo
* Produtos com estoque zerado
* Maior quantidade em estoque
* Menor quantidade em estoque
* Maior preço
* Menor preço
* Quantidade total
* Valor total do estoque
* Resumo por categoria

A regra utilizada para estoque baixo é:

```text
Quantidade <= 5
```

A IA recebe os dados calculados pelo sistema e é responsável principalmente por **interpretar e apresentar as informações em linguagem natural**.

Isso reduz a necessidade de utilizar um modelo de linguagem para realizar cálculos básicos que podem ser executados diretamente pela aplicação.

---

# 💬 Chat com Inteligência Artificial

Além da análise automática, o sistema possui um chat relacionado aos dados do estoque.

Endpoint:

```http
POST /api/chat-estoque
```

### Exemplos de perguntas

```text
Quais produtos estão com estoque baixo?

Quais produtos precisam de reposição?

Qual produto possui maior estoque?

Qual produto possui menor estoque?

Qual é o produto com maior preço?

Qual é o produto com menor preço?

Qual é o valor total do estoque?
```

O sistema também identifica algumas perguntas diretamente pelo Back-end e retorna respostas determinísticas sem depender do modelo de linguagem.

Isso aumenta a consistência das respostas para informações numéricas.

---

# 💾 Persistência de dados

Os dados principais da aplicação são armazenados em:

**PostgreSQL**

O acesso ao banco é realizado através do:

**Prisma ORM**

### Dados persistidos

* Usuários
* Produtos
* Categorias
* Movimentações de estoque

Arquitetura:

```text
React
   ↓
Express
   ↓
Prisma
   ↓
PostgreSQL
```

O `localStorage` é utilizado apenas para informações locais do navegador, como a sessão do usuário e a persistência temporária da conversa da IA.

---

# 🔌 API REST

O Back-end foi desenvolvido utilizando Node.js, Express e TypeScript.

## Health Check

```http
GET /api/test
```

Resposta:

```json
{
  "message": "API funcionando!"
}
```

---

# 🛡️ Segurança

O projeto possui algumas medidas de proteção no Back-end.

## JWT

As rotas protegidas utilizam:

```text
Authorization: Bearer <token>
```

Os tokens possuem tempo de expiração configurado no servidor.

## Bcrypt

As senhas dos usuários são armazenadas através de hashes gerados com `bcrypt`.

## Helmet

O middleware `Helmet` é utilizado para adicionar headers de segurança HTTP.

## CORS

O Back-end utiliza CORS para controlar quais origens podem acessar a API.

Durante o desenvolvimento:

```text
http://localhost:5173
```

Em produção:

```text
https://controle-estoque-react-roan.vercel.app
```

## Rate Limit

A API utiliza `express-rate-limit` para limitar requisições.

Também existe uma limitação específica para tentativas de autenticação.

## Validação

A API realiza validações antes de executar operações no banco.

Entre os dados validados estão:

* Nome
* E-mail
* Senha
* Perfil de usuário
* Categoria
* Quantidade
* Preço
* IDs
* Perguntas enviadas para a IA

---

# 🗄️ Banco de dados

O projeto utiliza:

```text
PostgreSQL
Prisma ORM
Prisma Client
@prisma/adapter-pg
pg
```

### Principais Models

```text
User
Product
Category
StockMovement
```

### User

```text
id
name
email
passwordHash
role
createdAt
updatedAt
```

### Product

```text
id
name
category
quantity
price
image
createdAt
updatedAt
```

### Category

```text
id
name
createdAt
```

### StockMovement

```text
id
productId
productName
type
quantity
previousQuantity
newQuantity
description
date
userId
```

---

# ☁️ Deploy

A aplicação utiliza uma arquitetura distribuída em serviços separados.

```text
┌────────────────────────────┐
│          Vercel            │
│       React + Vite         │
└─────────────┬──────────────┘
              │
              │ HTTPS
              ▼
┌────────────────────────────┐
│          Render            │
│      Express + Node.js     │
└─────────────┬──────────────┘
              │
              │ PostgreSQL
              ▼
┌────────────────────────────┐
│         Supabase           │
│        PostgreSQL          │
└────────────────────────────┘
```

### Front-end

Hospedado na:

**Vercel**

```text
https://controle-estoque-react-roan.vercel.app/
```

### Back-end

Hospedado na:

**Render**

```text
https://controle-estoque-react-7wka.onrender.com
```

### Banco de dados

Hospedado no:

**Supabase**

O Front-end utiliza uma variável de ambiente para descobrir a URL da API:

```env
VITE_API_URL=http://localhost:3001/api
```

Em produção:

```env
VITE_API_URL=https://controle-estoque-react-7wka.onrender.com/api
```

---

# ⚙️ Variáveis de ambiente

O projeto utiliza diferentes variáveis dependendo do ambiente.

## Front-end

```env
VITE_API_URL=http://localhost:3001/api
```

## Back-end

```env
DATABASE_URL="..."
JWT_SECRET="..."
GEMINI_API_KEY="..."
```

---

# 🧰 Tecnologias utilizadas

## Front-end

* React
* TypeScript
* Vite
* Tailwind CSS
* React Markdown

## Back-end

* Node.js
* Express
* TypeScript
* API REST
* CORS
* Helmet
* Express Rate Limit
* JWT
* Bcrypt

## Banco de dados

* PostgreSQL
* Prisma ORM
* Prisma Client
* `@prisma/adapter-pg`
* `pg`

## Inteligência Artificial

* Google Gemini
* Google GenAI SDK

## Bibliotecas

* Lucide React
* Recharts
* React Markdown
* jsPDF
* jsPDF AutoTable

## Ferramentas

* Git
* GitHub
* NPM
* VS Code
* Vercel
* Render
* Supabase

---

# 📂 Estrutura do projeto

```text
controle-estoque-react/
│
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── ProductForm.tsx
│   │   ├── ProductList.tsx
│   │   ├── Categories.tsx
│   │   ├── Toast.tsx
│   │   └── DeleteModal.tsx
│   │
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Products.tsx
│   │   ├── StockHistory.tsx
│   │   ├── Users.tsx
│   │   └── Settings.tsx
│   │
│   ├── utils/
│   │   └── auth.ts
│   │
│   ├── types/
│   │   ├── Product.ts
│   │   ├── Category.ts
│   │   └── StockMovement.ts
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── server/
│   ├── index.ts
│   ├── routes/
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── authorize.ts
│   └── lib/
│       ├── prisma.ts
│       └── gemini.ts
│
├── .env.example
├── .gitignore
├── package.json
├── prisma.config.ts
├── tsconfig.json
└── vite.config.ts
```

---

# ▶️ Executando localmente

## 1. Clone o repositório

```bash
git clone URL_DO_REPOSITORIO
```

## 2. Entre na pasta

```bash
cd controle-estoque-react
```

## 3. Instale as dependências

```bash
npm install
```

## 4. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/NOME_DO_BANCO"
JWT_SECRET="sua-chave-secreta"
GEMINI_API_KEY="sua-chave-do-gemini"
VITE_API_URL="http://localhost:3001/api"
```

## 5. Sincronize o banco

```bash
npx prisma generate
```

Depois:

```bash
npx prisma migrate dev
```

ou, para sincronizar diretamente o schema:

```bash
npx prisma db push
```

## 6. Inicie o Front-end

```bash
npm run dev
```

Aplicação:

```text
http://localhost:5173
```

## 7. Inicie o Back-end

Em outro terminal:

```bash
npm run server
```

API:

```text
http://localhost:3001
```

---

# 🧪 Testando a API

Com o servidor rodando:

```bash
curl http://localhost:3001/api/test
```

Resposta esperada:

```json
{
  "message": "API funcionando!"
}
```

---

# 📜 Scripts disponíveis

### Desenvolvimento

```bash
npm run dev
```

Executa o Front-end em modo de desenvolvimento.

### Back-end

```bash
npm run server
```

Executa o servidor Express.

### Build

```bash
npm run build
```

Gera a versão de produção do Front-end.

### Lint

```bash
npm run lint
```

Executa o ESLint.

### Preview

```bash
npm run preview
```

Executa uma prévia do build de produção do Front-end.

---

# 🧠 Conceitos aplicados

Este projeto reúne diversos conceitos importantes de desenvolvimento de software.

### Front-end

* Componentização
* React Hooks
* Estado e propriedades
* Formulários controlados
* TypeScript
* Renderização condicional
* Renderização dinâmica
* Design responsivo
* Tailwind CSS
* Consumo de API REST

### Back-end

* Node.js
* Express
* API REST
* Middlewares
* Autenticação
* Autorização
* JWT
* Bcrypt
* CORS
* Helmet
* Rate limiting
* Validação de dados
* Tratamento de erros

### Banco de dados

* PostgreSQL
* Modelagem relacional
* Prisma ORM
* Prisma Client
* Migrations
* Transações
* Persistência de dados

### Inteligência Artificial

* Integração com LLM
* Google Gemini
* Engenharia de prompts
* Contexto baseado em dados estruturados
* Respostas determinísticas para cálculos
* Uso de IA para linguagem natural

### DevOps / Deploy

* Git
* GitHub
* Variáveis de ambiente
* Deploy do Front-end
* Deploy do Back-end
* Banco de dados em nuvem
* Integração entre serviços

---

# 🌐 Arquitetura em produção

```text
                  INTERNET
                      │
                      ▼
          ┌─────────────────────┐
          │       Vercel        │
          │   React + Vite      │
          └──────────┬──────────┘
                     │
                     │ HTTPS
                     ▼
          ┌─────────────────────┐
          │       Render        │
          │ Node + Express      │
          │      REST API       │
          └───────┬───────┬─────┘
                  │       │
                  │       │ HTTPS
                  │       ▼
                  │  ┌───────────────┐
                  │  │ Google Gemini │
                  │  └───────────────┘
                  │
                  ▼
          ┌─────────────────────┐
          │      Supabase       │
          │     PostgreSQL      │
          └─────────────────────┘
```

Essa arquitetura separa as responsabilidades da aplicação e permite que o Front-end, Back-end e banco de dados sejam mantidos de forma independente.

---

# 🎯 Objetivo do projeto

O principal objetivo deste projeto é demonstrar a capacidade de desenvolver uma aplicação completa, indo além da construção de uma interface.

O projeto envolve:

```text
Interface
   ↓
React
   ↓
API REST
   ↓
Express
   ↓
Autenticação
   ↓
Prisma
   ↓
PostgreSQL
```

Além disso, existe uma camada de Inteligência Artificial:

```text
Dados do sistema
      ↓
Cálculos objetivos
      ↓
Google Gemini
      ↓
Interpretação em linguagem natural
```

Dessa forma, o projeto demonstra conhecimentos em **Front-end, Back-end, banco de dados, autenticação, segurança, APIs, cloud e Inteligência Artificial** dentro de uma aplicação única.

---

# 👨‍💻 Desenvolvedor

## Stanley Vale

Estudante de Gestão da Tecnologia da Informação com foco em desenvolvimento de software e interesse em Front-end, Back-end, APIs, bancos de dados e Inteligência Artificial.

### Tecnologias em prática

* React
* TypeScript
* JavaScript
* HTML5
* CSS3
* Tailwind CSS
* Bootstrap
* Node.js
* Express
* PostgreSQL
* Prisma
* Git
* GitHub
* Google Gemini

### Links

**LinkedIn:**
https://www.linkedin.com/in/stanleyvale

**GitHub:**
https://github.com/stanleyva71

---

# 📌 Status

**Em desenvolvimento contínuo.**

O projeto já possui Front-end, Back-end, banco de dados, autenticação, controle de permissões, histórico de movimentações, integração com IA e deploy em nuvem.
