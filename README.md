# 📦 Sistema de Controle de Estoque

<img width="1920" height="1080" alt="sistema" src="https://github.com/user-attachments/assets/aa547735-69ad-42fe-a3f1-f23aaac7de02" />

Aplicação web full stack desenvolvida para gerenciamento de produtos em estoque, com cadastro, edição, exclusão, pesquisa, filtros, categorias, histórico de movimentações, persistência em banco de dados PostgreSQL e integração com Inteligência Artificial local através do Ollama.

O projeto foi desenvolvido com foco em prática de desenvolvimento **Front-end, Back-end, banco de dados, API REST, integração entre sistemas e Inteligência Artificial local**.

Além do gerenciamento tradicional de estoque, a aplicação possui um assistente inteligente capaz de analisar os produtos cadastrados e responder perguntas utilizando linguagem natural.

---

## 🚀 Tecnologias utilizadas

### Front-end

* React
* TypeScript
* Tailwind CSS
* Vite
* React Markdown

### Back-end

* Node.js
* Express
* TypeScript
* API REST
* CORS
* Helmet
* Express Rate Limit

### Banco de dados

* PostgreSQL
* Prisma ORM
* Prisma Client
* `@prisma/adapter-pg`
* `pg`

### Inteligência Artificial

* Ollama
* Qwen 2.5 3B
* Execução local de modelo de linguagem

### Bibliotecas

* Lucide React
* React Markdown
* jsPDF
* jsPDF AutoTable

### Ferramentas

* Git
* GitHub
* NPM
* VS Code

---

# ✨ Funcionalidades

## 📦 Gerenciamento de produtos

O sistema possui um CRUD completo de produtos integrado ao PostgreSQL.

Funcionalidades:

* Cadastro de produtos
* Edição de produtos
* Exclusão de produtos
* Confirmação antes da exclusão
* Adição de imagem
* Pesquisa por nome
* Filtro por categoria
* Filtro de estoque baixo
* Ordenação por nome
* Ordenação por quantidade
* Ordenação por preço
* Validação dos dados enviados para a API

A persistência dos produtos é realizada através da API REST, utilizando Prisma ORM e PostgreSQL.

---

## 🗂️ Gerenciamento de categorias

O sistema possui um módulo dedicado ao gerenciamento de categorias.

Funcionalidades:

* Cadastro de categorias
* Edição de categorias
* Exclusão de categorias
* Busca de categorias
* Contagem de produtos por categoria
* Identificação de categorias sem produtos
* Validação de categorias duplicadas
* Validação para impedir exclusão de categorias que possuem produtos associados
* Sincronização da categoria dos produtos após alteração do nome da categoria

As categorias são armazenadas no PostgreSQL através do Prisma.

---

## 🔎 Pesquisa, filtros e organização

A aplicação permite organizar os produtos através de diferentes recursos:

* Pesquisa por nome
* Pesquisa por categoria
* Filtro por categoria
* Filtro de produtos com estoque baixo
* Ordenação por nome
* Ordenação por quantidade
* Ordenação por preço

A regra utilizada para identificar estoque baixo é:

```text
Quantidade menor ou igual a 5
```

Essa regra é calculada pelo sistema, garantindo consistência nos dados apresentados.

---

# 📊 Dashboard

O Dashboard apresenta informações resumidas do estoque.

Indicadores disponíveis:

* Total de produtos cadastrados
* Quantidade de produtos com estoque baixo
* Número de categorias
* Valor total dos produtos em estoque

O valor total do estoque é calculado considerando:

```text
Quantidade × preço do produto
```

Exemplo:

```text
10 unidades × R$ 50,00 = R$ 500,00
```

---

# 📜 Histórico de movimentações

O sistema possui um módulo de **Histórico de Movimentações**, responsável por registrar as principais alterações realizadas no estoque.

As movimentações são persistidas no PostgreSQL e registradas automaticamente pela API.

### Tipos de movimentação

* Entrada de estoque
* Saída de estoque
* Criação de produto
* Atualização de produto
* Remoção de produto

### Informações registradas

Cada movimentação possui:

* Produto movimentado
* ID do produto
* Tipo da movimentação
* Quantidade movimentada
* Quantidade anterior
* Nova quantidade
* Descrição da operação
* Data e horário

Exemplo:

```text
Produto: Teclado
Tipo: Saída
Quantidade: 30
Anterior: 60
Novo estoque: 30
```

O histórico permite acompanhar a evolução do estoque e fornece maior rastreabilidade das operações.

---

# 🤖 Inteligência Artificial

O sistema possui integração com **Inteligência Artificial local utilizando Ollama**.

A IA é executada localmente através do modelo:

```text
qwen2.5:3b
```

Isso permite utilizar recursos de linguagem natural sem depender diretamente de APIs externas de IA pagas.

---

## 🧠 Arquitetura da IA

A comunicação funciona através da seguinte arquitetura:

```text
React
   ↓
Express API
   ↓
Ollama
   ↓
Qwen 2.5 3B
   ↓
Resposta
   ↓
React
```

O Front-end não acessa diretamente o Ollama.

A API Express funciona como intermediária entre a aplicação React e o modelo de Inteligência Artificial.

---

# 📊 Análise automática de estoque

A aplicação possui uma funcionalidade de análise automática do estoque.

Ao solicitar uma análise, o Front-end envia os produtos para a API:

```http
POST /api/analisar-estoque
```

A API realiza os cálculos objetivos do estoque e envia os dados para o Ollama.

A análise pode apresentar:

* Produtos com estoque baixo
* Produtos que precisam de reposição
* Produto com maior quantidade em estoque
* Prioridades
* Recomendações para o gestor

### Regra de estoque baixo

A regra é definida pelo código da aplicação:

```text
Quantidade <= 5
```

A Inteligência Artificial recebe os valores calculados pelo sistema como contexto.

Isso reduz o risco de o modelo interpretar incorretamente regras numéricas.

---

# 💬 Chat com Inteligência Artificial

Além da análise automática, o sistema possui um chat integrado ao estoque.

O usuário pode realizar perguntas em linguagem natural, por exemplo:

```text
Quais produtos estão com estoque baixo?

Quais produtos precisam de reposição?

Qual produto possui maior estoque?

Qual produto possui menor estoque?

Qual é o produto com maior preço?

Qual é o produto com menor preço?

Qual é o valor total do estoque?

Quantos produtos estão cadastrados?
```

A comunicação funciona através do endpoint:

```http
POST /api/chat-estoque
```

Fluxo:

```text
Usuário
   ↓
Chat React
   ↓
API Express
   ↓
Cálculos do sistema
   ↓
Ollama
   ↓
Qwen 2.5 3B
   ↓
Resposta
   ↓
Chat React
```

---

## 🔐 Confiabilidade dos dados da IA

Uma preocupação importante do projeto é evitar que o modelo de linguagem seja responsável por cálculos que podem ser realizados diretamente pelo sistema.

Por isso, informações objetivas são calculadas pelo JavaScript antes de serem enviadas ao modelo.

Exemplos:

* Estoque baixo
* Maior quantidade
* Menor quantidade
* Maior preço
* Menor preço
* Valor total do estoque

A IA é utilizada principalmente para **interpretar, contextualizar e apresentar as informações em linguagem natural**.

Essa abordagem reduz a possibilidade de respostas inconsistentes em informações numéricas.

---

# 💾 Persistência dos dados

Os principais dados da aplicação são armazenados no **PostgreSQL**.

### Dados persistidos no banco

* Produtos
* Categorias
* Movimentações de estoque

O Prisma ORM é utilizado para acessar e manipular os dados.

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

### Persistência da conversa

As mensagens do chat da IA utilizam `localStorage` apenas para manter a conversa temporariamente no navegador.

A conversa:

* permanece ao trocar de aba;
* permanece ao atualizar a página;
* é atualizada a cada nova interação;
* expira após 24 horas sem atividade;
* pode ser apagada manualmente através do botão "Limpar conversa".

O `localStorage` **não é utilizado para armazenar os produtos, categorias ou histórico do estoque**.

---

# 🔌 API REST

A aplicação possui um back-end desenvolvido com Node.js, Express e TypeScript.

## Health check

```http
GET /api/test
```

Exemplo:

```json
{
  "message": "API funcionando!"
}
```

---

## Produtos

### Listar produtos

```http
GET /api/products
```

### Buscar produto

```http
GET /api/products/:id
```

### Criar produto

```http
POST /api/products
```

### Atualizar produto

```http
PUT /api/products/:id
```

### Excluir produto

```http
DELETE /api/products/:id
```

---

## Categorias

### Listar categorias

```http
GET /api/categories
```

### Criar categoria

```http
POST /api/categories
```

### Atualizar categoria

```http
PUT /api/categories/:id
```

### Excluir categoria

```http
DELETE /api/categories/:id
```

---

## Histórico

### Listar movimentações

```http
GET /api/movements
```

---

## Inteligência Artificial

### Análise automática

```http
POST /api/analisar-estoque
```

### Chat

```http
POST /api/chat-estoque
```

---

# 🛡️ Segurança da API

O back-end possui algumas medidas básicas de segurança e proteção:

### CORS

O acesso da API é restringido ao Front-end local durante o desenvolvimento:

```text
http://localhost:5173
```

### Helmet

O middleware Helmet é utilizado para adicionar headers de segurança HTTP.

### Rate Limit

As rotas da API possuem limitação de requisições através do `express-rate-limit`.

Configuração atual:

```text
Janela: 15 minutos
Limite: 100 requisições
```

### Validação de dados

Os endpoints validam os dados recebidos antes de realizar operações no banco.

São validados, entre outros:

* Nome
* Categoria
* Quantidade
* Preço
* ID do produto
* ID da categoria
* Pergunta enviada para a IA
* Quantidade máxima de produtos enviados para análise

---

# 🗄️ Banco de dados

O projeto utiliza PostgreSQL com Prisma ORM.

### Models principais

```text
Product
Category
StockMovement
```

### Product

Armazena os produtos cadastrados.

Principais campos:

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

Armazena as categorias dos produtos.

Campos:

```text
id
name
createdAt
```

### StockMovement

Armazena o histórico das alterações realizadas no estoque.

Campos principais:

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
```

---

# 🖥️ Interface

A aplicação possui uma interface administrativa responsiva desenvolvida com React e Tailwind CSS.

Principais elementos:

* Dashboard
* Sidebar de navegação
* Gerenciamento de produtos
* Gerenciamento de categorias
* Histórico de movimentações
* Assistente inteligente
* Formulários
* Modais de confirmação
* Toasts de sucesso e erro
* Filtros
* Ordenação
* Indicadores de estoque
* Markdown nas respostas da IA

---

# 📱 Responsividade

A interface foi desenvolvida considerando diferentes tamanhos de tela.

O layout utiliza:

* Grid responsivo
* Flexbox
* Tailwind CSS
* Breakpoints responsivos

Permitindo utilizar o sistema em:

* Desktop
* Notebook
* Tablet
* Dispositivos móveis

---

# 📂 Estrutura do projeto

```text
controle-estoque/
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
│   │   ├── Products.tsx
│   │   └── StockHistory.tsx
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
│   └── index.ts
│
├── package.json
├── prisma.config.ts
└── README.md
```

> A estrutura pode ser alterada conforme novas funcionalidades forem adicionadas ao projeto.

---

# 🧩 Arquitetura da aplicação

A aplicação segue uma arquitetura separando Front-end, Back-end, banco de dados e Inteligência Artificial.

```text
                    ┌─────────────────┐
                    │     React       │
                    │  TypeScript     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │     Express     │
                    │     API REST    │
                    └───────┬─┬───────┘
                            │ │
                 ┌──────────┘ └───────────┐
                 ▼                        ▼
        ┌─────────────────┐      ┌─────────────────┐
        │     Prisma      │      │     Ollama      │
        │      ORM        │      │   Qwen 2.5 3B  │
        └────────┬────────┘      └─────────────────┘
                 │
                 ▼
        ┌─────────────────┐
        │   PostgreSQL    │
        └─────────────────┘
```

---

# 🛠️ Configuração do ambiente

## Requisitos

Antes de executar o projeto, é necessário ter instalado:

* Node.js
* NPM
* PostgreSQL
* Ollama
* Git

---

# ▶️ Como executar

## 1. Clone o projeto

```bash
git clone URL_DO_REPOSITORIO
```

## 2. Entre na pasta

```bash
cd controle-estoque
```

## 3. Instale as dependências

```bash
npm install
```

---

# 🗄️ Configuração do banco de dados

Crie um banco PostgreSQL e configure a variável de ambiente:

```env
DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/NOME_DO_BANCO"
```

Depois execute:

```bash
npx prisma migrate dev
```

Gere o Prisma Client:

```bash
npx prisma generate
```

---

# 🤖 Configuração do Ollama

Instale o Ollama e certifique-se de que ele esteja em execução.

Baixe o modelo utilizado pelo projeto:

```bash
ollama pull qwen2.5:3b
```

Execute o modelo:

```bash
ollama run qwen2.5:3b
```

A API do Ollama normalmente estará disponível em:

```text
http://localhost:11434
```

---

# ▶️ Executando o projeto

## Front-end

Em um terminal:

```bash
npm run dev
```

A aplicação estará disponível em:

```text
http://localhost:5173
```

## Back-end

Em outro terminal:

```bash
npm run server
```

A API estará disponível em:

```text
http://localhost:3001
```

---

# 🧪 Verificando a API

Depois de iniciar o servidor, execute:

```bash
curl http://localhost:3001/api/test
```

Resultado esperado:

```json
{
  "message": "API funcionando!"
}
```

Também é possível verificar os produtos:

```bash
curl http://localhost:3001/api/products
```

Categorias:

```bash
curl http://localhost:3001/api/categories
```

Histórico:

```bash
curl http://localhost:3001/api/movements
```

---

# 📜 Scripts disponíveis

```bash
npm run dev
```

Executa o Front-end em modo de desenvolvimento.

```bash
npm run server
```

Executa o servidor Express.

```bash
npm run build
```

Realiza a compilação de produção do projeto.

```bash
npm run lint
```

Executa a verificação de código utilizando ESLint.

---

# ✅ Validação do projeto

Durante o desenvolvimento, o projeto utiliza:

```bash
npm run lint
```

para verificar problemas relacionados ao código.

A compilação de produção pode ser validada com:

```bash
npm run build
```

---

# 🧠 Conceitos aplicados

O projeto utiliza diversos conceitos de desenvolvimento web e engenharia de software:

### Front-end

* Componentização em React
* Hooks
* Estado e propriedades
* Renderização condicional
* Renderização dinâmica de listas
* Formulários controlados
* Tipagem com TypeScript
* React Markdown
* Design responsivo
* Tailwind CSS

### Back-end

* Node.js
* Express
* API REST
* Middlewares
* CORS
* Helmet
* Rate limiting
* Validação de requisições
* Tratamento de erros
* Comunicação com banco de dados
* Integração com API de IA

### Banco de dados

* PostgreSQL
* Prisma ORM
* Migrations
* Prisma Client
* Modelagem de dados
* Persistência de dados
* Transações

### Inteligência Artificial

* Integração com LLM
* Ollama
* Execução local de modelos
* Engenharia de prompts
* Contexto baseado em dados do sistema
* Validação de dados antes do processamento pela IA
* Uso de IA para linguagem natural sobre dados estruturados

### Desenvolvimento

* Git
* GitHub
* NPM
* VS Code
* Organização de responsabilidades
* Separação entre Front-end e Back-end

---

# 🎯 Objetivo do projeto

O projeto foi desenvolvido com o objetivo de aplicar na prática conceitos de desenvolvimento de software através da construção de uma aplicação completa de gerenciamento de estoque.

A aplicação envolve diferentes camadas de desenvolvimento:

```text
Interface
   ↓
Front-end
   ↓
API REST
   ↓
Back-end
   ↓
ORM
   ↓
Banco de dados
```

Além disso, o projeto demonstra a integração de uma aplicação tradicional com Inteligência Artificial local:

```text
Sistema
   ↓
Dados estruturados
   ↓
Processamento
   ↓
Ollama
   ↓
Modelo de linguagem
   ↓
Linguagem natural
```

O objetivo é demonstrar não apenas a criação de interfaces, mas também a capacidade de desenvolver e integrar diferentes tecnologias em uma aplicação funcional.

---

# 🚧 Possíveis evoluções

Algumas funcionalidades que podem ser adicionadas futuramente:

* Sistema de autenticação
* Login e controle de usuários
* Diferentes níveis de acesso
* Controle de permissões
* Histórico associado ao usuário responsável pela operação
* Dashboard com gráficos
* Relatórios avançados
* Exportação de relatórios
* Notificações de estoque baixo
* Controle de fornecedores
* Controle de entradas e saídas por usuário
* Deploy do Front-end
* Deploy da API
* Banco de dados em ambiente de produção
* Variáveis de ambiente para diferentes ambientes
* Docker
* Testes automatizados
* Paginação de produtos e movimentações

---

# 👨‍💻 Desenvolvedor

## Stanley Vale

Estudante de Gestão da Tecnologia da Informação, com foco em desenvolvimento de software e interesse em desenvolvimento Front-end, Back-end, integração de APIs, banco de dados e Inteligência Artificial.

### Tecnologias em estudo/prática

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
* Ollama
* Inteligência Artificial

### Links

**LinkedIn:**
[linkedin.com/in/stanleyvale](https://www.linkedin.com/in/stanleyvale)

**GitHub:**
[github.com/stanleyva71](https://github.com/stanleyva71)

---

# 📌 Observação

A funcionalidade de Inteligência Artificial depende do Ollama estar instalado e em execução na máquina, além do modelo `qwen2.5:3b` estar disponível.

Sem o Ollama, as funcionalidades de gerenciamento de produtos, categorias e histórico continuam disponíveis normalmente, desde que o PostgreSQL e a API estejam funcionando.

---
