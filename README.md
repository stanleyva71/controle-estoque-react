# 📦 Sistema de Controle de Estoque

<img width="1920" height="1080" alt="sistema" src="https://github.com/user-attachments/assets/aa547735-69ad-42fe-a3f1-f23aaac7de02" />

Aplicação web desenvolvida para gerenciamento de produtos em estoque, permitindo cadastrar, editar, excluir, pesquisar e organizar produtos através de uma interface moderna, responsiva e intuitiva.

O projeto também conta com uma **integração com Inteligência Artificial utilizando Ollama**, permitindo analisar os produtos cadastrados e gerar uma análise do estoque.

Projeto desenvolvido com foco em prática de desenvolvimento **Front-end, integração com API e utilização de Inteligência Artificial local**.

---

## 🚀 Tecnologias utilizadas

### Front-end

* React
* TypeScript
* Tailwind CSS
* Vite

### Back-end

* Node.js
* Express
* API REST

### Inteligência Artificial

* Ollama
* Modelo de linguagem local

### Bibliotecas

* Lucide React

### Ferramentas

* Git
* GitHub
* NPM
* VS Code

---

## ✨ Funcionalidades

### 📦 Produtos

* Cadastro de produtos
* Edição de produtos
* Exclusão de produtos com confirmação
* Adição de imagem dos produtos
* Persistência dos dados utilizando LocalStorage

### 🔎 Busca e organização

* Pesquisa por nome ou categoria
* Filtro por categoria
* Filtro de produtos com estoque baixo
* Ordenação por:

  * Nome
  * Quantidade
  * Preço

### 📊 Dashboard

* Total de produtos cadastrados
* Produtos com estoque baixo
* Quantidade de categorias
* Valor total do estoque

### 🤖 Inteligência Artificial

O sistema possui integração com **Inteligência Artificial utilizando Ollama**, permitindo analisar os dados de estoque e interagir com os produtos cadastrados através de um chat.

<img width="1238" height="548" alt="Screenshot_10" src="https://github.com/user-attachments/assets/468a4da0-1efc-4f20-bc7e-c6de78c02534" />
<img width="1361" height="1013" alt="Untitleda" src="https://github.com/user-attachments/assets/0a7f4ea9-1ea0-443a-82e4-95bc31b458f3" />

A IA é executada **localmente**, utilizando o Ollama como mecanismo para execução do modelo de linguagem, evitando a dependência de APIs externas de IA pagas.

#### 📊 Análise automática de estoque

A aplicação envia os produtos cadastrados para a API Express, que realiza a comunicação com o Ollama e retorna uma análise do estoque.

A análise permite identificar informações como:

* Produtos com estoque baixo
* Produtos que precisam de reposição
* Situação geral do estoque
* Recomendações baseadas nos produtos cadastrados

Fluxo da análise:

```text
React
  ↓
API Express
  ↓
Ollama
  ↓
Modelo de IA
  ↓
Análise do estoque
  ↓
React
```

#### 💬 Chat com Inteligência Artificial

Além da análise automática, o sistema possui um **chat integrado com IA**, permitindo que o usuário faça perguntas relacionadas aos produtos e ao estoque.

O chat utiliza os dados dos produtos cadastrados como contexto para responder às perguntas do usuário.

Exemplos de perguntas:

```text
"Quais produtos estão com estoque baixo?"

"Quais produtos precisam de reposição?"

"Qual produto possui maior estoque?"

"Quantos produtos estão cadastrados?"
```

A comunicação segue o fluxo:

```text
Usuário
  ↓
Chat do React
  ↓
API Express
  ↓
Ollama
  ↓
Modelo de IA
  ↓
Resposta
  ↓
Chat
```

Dessa forma, a IA não funciona apenas como uma análise estática, mas também como uma **interface de consulta aos dados do estoque**, permitindo que o usuário obtenha informações através de linguagem natural.

#### 🧠 IA local

A utilização do **Ollama** permite executar o modelo de linguagem no próprio ambiente do usuário.

Isso proporciona:

* Execução local da IA
* Não dependência de APIs externas pagas
* Maior controle sobre os dados enviados ao modelo
* Possibilidade de utilizar diferentes modelos compatíveis com o Ollama

> A funcionalidade de Inteligência Artificial depende do Ollama estar instalado, em execução e configurado com um modelo compatível. As demais funcionalidades do sistema continuam disponíveis mesmo sem a IA.

A aplicação envia os produtos cadastrados para a API, que realiza a comunicação com o Ollama e retorna a análise para o Dashboard.

---

## 🔌 API

O projeto possui uma API desenvolvida em **Node.js + Express** responsável pela comunicação entre o Front-end e o Ollama.

### Endpoints

#### Teste da API

```http
GET /api/test
```

Retorna uma mensagem para verificar se o servidor está funcionando.

Exemplo:

```json
{
  "message": "API funcionando!"
}
```

#### Análise de estoque

```http
POST /api/analisar-estoque
```

Recebe a lista de produtos e envia os dados para o Ollama para geração da análise.

Exemplo de requisição:

```json
{
  "products": [
    {
      "name": "Ração",
      "quantity": 3
    },
    {
      "name": "Brinquedo",
      "quantity": 15
    }
  ]
}
```

---

## 🧠 Inteligência Artificial com Ollama

O projeto utiliza o **Ollama** para executar o modelo de Inteligência Artificial localmente.

Dessa forma, a análise de estoque é realizada através de uma IA executada no próprio ambiente de desenvolvimento, sem depender diretamente de uma API externa de IA paga.

O Ollama atua como o mecanismo responsável por executar o modelo, enquanto a API Express funciona como intermediária entre o Front-end e a IA.

---

## 🖥️ Interface

* Layout responsivo
* Dashboard administrativo
* Sidebar de navegação
* Formulário de cadastro
* Lista de produtos
* Filtros e ordenação
* Feedback visual através de mensagens de sucesso e erro
* Análise de estoque utilizando IA

---

## 📂 Estrutura do projeto

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
│   │   ├── Toast.tsx
│   │   └── DeleteModal.tsx
│   │
│   ├── types/
│   │   └── Product.ts
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── server/
│   └── server.js
│
├── package.json
└── README.md
```

> A estrutura da pasta `server` pode variar de acordo com a organização utilizada no projeto.

---

## ▶️ Como executar

### 1. Clone o projeto

```bash
git clone URL_DO_REPOSITORIO
```

### 2. Entre na pasta

```bash
cd nome-do-projeto
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Execute o Front-end

```bash
npm run dev
```

### 5. Execute o Back-end

Em outro terminal, execute o servidor da API:

```bash
npm run server
```

ou o comando utilizado pelo servidor Express.

A API deve estar disponível em:

```text
http://localhost:3001
http://localhost:5173
```

### 6. Inicie o Ollama

Certifique-se de que o **Ollama esteja instalado e em execução** na máquina.

O modelo utilizado pelo projeto também precisa estar disponível localmente.

---

## ⚠️ Observação sobre a IA

A funcionalidade de análise de estoque depende do **Ollama instalado e em execução localmente**.

Sem o Ollama e o modelo configurado, o restante do sistema continuará funcionando normalmente, porém a funcionalidade de análise por IA não estará disponível.

---

## 🧠 Conceitos aplicados

* Componentização em React
* Hooks (`useState`, `useEffect`, `useRef`)
* Tipagem com TypeScript
* Manipulação de estados
* Renderização dinâmica de listas
* Persistência de dados com LocalStorage
* Consumo de API REST
* Desenvolvimento de API com Express
* Comunicação entre Front-end e Back-end
* Integração com Inteligência Artificial
* Execução de modelos de IA localmente com Ollama
* Organização de componentes e responsabilidades

---

## 🎯 Objetivo do projeto

O projeto foi desenvolvido com o objetivo de aplicar na prática conceitos de desenvolvimento web, desde a construção da interface até a criação de uma API e integração com Inteligência Artificial.

Além do gerenciamento tradicional de estoque, a aplicação busca demonstrar como uma aplicação React pode se comunicar com um back-end e utilizar IA para fornecer informações adicionais ao usuário.

---

## 👨‍💻 Desenvolvedor

**Stanley Vale**

Estudante de Gestão da Tecnologia da Informação, com foco em desenvolvimento de software e interesse em desenvolvimento Front-end, Back-end e integração de sistemas.

**LinkedIn:**
[www.linkedin.com/in/stanleyvale](http://www.linkedin.com/in/stanleyvale)

