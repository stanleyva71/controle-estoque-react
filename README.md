# 📦 Sistema de Controle de Estoque

Aplicação web desenvolvida para gerenciamento de produtos em estoque, permitindo cadastrar, editar, excluir, pesquisar e organizar produtos através de uma interface moderna e responsiva.

Projeto desenvolvido com foco em prática de desenvolvimento Front-end utilizando React, TypeScript e Tailwind CSS.

---

## 🚀 Tecnologias utilizadas

### Front-end
- React
- TypeScript
- Tailwind CSS
- Vite

### Bibliotecas
- Lucide React (ícones)

### Ferramentas
- Git
- GitHub
- NPM
- VS Code

---

## ✨ Funcionalidades

### 📦 Produtos
- Cadastro de produtos
- Edição de produtos
- Exclusão com confirmação
- Adição de imagem dos produtos
- Persistência dos dados utilizando LocalStorage

### 🔎 Busca e organização
- Pesquisa por nome ou categoria
- Filtro por categoria
- Filtro de produtos com estoque baixo
- Ordenação por:
  - Nome
  - Quantidade
  - Preço

### 📊 Dashboard
- Total de produtos cadastrados
- Produtos com estoque baixo
- Quantidade de categorias
- Valor total do estoque

---

## 🖥️ Interface

- Layout responsivo
- Dashboard administrativo
- Sidebar de navegação
- Formulário de cadastro
- Tabela de produtos
- Feedback visual através de mensagens de sucesso e erro

---

## 📂 Estrutura do projeto

```
src
├── components
│   ├── Dashboard.tsx
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── ProductForm.tsx
│   ├── ProductList.tsx
│   ├── Toast.tsx
│   └── DeleteModal.tsx
│
├── types
│   └── Product.ts
│
├── App.tsx
└── main.tsx
```

---

## ▶️ Como executar

Clone o projeto:

```bash
git clone URL_DO_REPOSITORIO
```

Entre na pasta:

```bash
cd nome-do-projeto
```

Instale as dependências:

```bash
npm install
```

Execute:

```bash
npm run dev
```

---

## 🧠 Conceitos aplicados

- Componentização em React
- Hooks (`useState`, `useEffect`, `useRef`)
- Tipagem com TypeScript
- Manipulação de estados
- Renderização dinâmica de listas
- Organização de componentes
- Persistência de dados no navegador

---

## 👨‍💻 Desenvolvedor

**Stanley Vale**

Estudante de Gestão da Tecnologia da Informação buscando oportunidades na área de desenvolvimento de software.

LinkedIn:
www.linkedin.com/in/stanleyvale