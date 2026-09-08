import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { prisma } from './lib/prisma';

const app = express();

const PORT = 3001;

// =========================
// Configurações de segurança
// =========================

// Permite requisições apenas do frontend local
app.use(
  cors({
    origin: 'http://localhost:5173',
  })
);

// Adiciona headers de segurança
app.use(helmet());

// Limita o tamanho do JSON recebido
app.use(express.json({ limit: '1mb' }));

// Limita a quantidade de requisições
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Muitas requisições. Tente novamente mais tarde.',
  },
});

app.use('/api/', apiLimiter);

// =========================
// Teste da API
// =========================

app.get('/api/test', (_req, res) => {
  res.json({
    message: 'API funcionando!',
  });
});

// =========================
// Produtos
// =========================

app.get('/api/products', async (_req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        id: 'desc',
      },
    });

    return res.json(
      products.map((product) => ({
        id: product.id,
        name: product.name,
        category: product.category,
        quantity: product.quantity,
        price: Number(product.price),
        image: product.image ?? undefined,
      }))
    );
  } catch (error) {
    console.error('ERRO AO BUSCAR PRODUTOS:', error);

    return res.status(500).json({
      error: 'Não foi possível buscar os produtos.',
    });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        error: 'ID do produto inválido.',
      });
    }

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({
        error: 'Produto não encontrado.',
      });
    }

    return res.json({
      id: product.id,
      name: product.name,
      category: product.category,
      quantity: product.quantity,
      price: Number(product.price),
      image: product.image ?? undefined,
    });
  } catch (error) {
    console.error('ERRO AO BUSCAR PRODUTO:', error);

    return res.status(500).json({
      error: 'Não foi possível buscar o produto.',
    });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, category, quantity, price, image } = req.body;

    if (typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        error: 'Nome do produto é obrigatório.',
      });
    }

    if (typeof category !== 'string' || category.trim().length === 0) {
      return res.status(400).json({
        error: 'Categoria do produto é obrigatória.',
      });
    }

    if (!Number.isInteger(quantity) || quantity < 0) {
      return res.status(400).json({
        error: 'Quantidade inválida.',
      });
    }

    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({
        error: 'Preço inválido.',
      });
    }

    const product = await prisma.$transaction(async (tx) => {
      const createdProduct = await tx.product.create({
        data: {
          name: name.trim(),
          category: category.trim(),
          quantity,
          price,
          image:
            typeof image === 'string' && image.trim().length > 0
              ? image.trim()
              : null,
        },
      });

      await tx.stockMovement.create({
        data: {
          productId: createdProduct.id,
          productName: createdProduct.name,
          type: 'criacao',
          quantity: createdProduct.quantity,
          previousQuantity: 0,
          newQuantity: createdProduct.quantity,
          description: 'Produto criado.',
        },
      });

      return createdProduct;
    });

    return res.status(201).json({
      id: product.id,
      name: product.name,
      category: product.category,
      quantity: product.quantity,
      price: Number(product.price),
      image: product.image ?? undefined,
    });
  } catch (error) {
    console.error('ERRO AO CRIAR PRODUTO:', error);

    return res.status(500).json({
      error: 'Não foi possível criar o produto.',
    });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        error: 'ID do produto inválido.',
      });
    }

    const { name, category, quantity, price, image } = req.body;

    if (typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        error: 'Nome do produto é obrigatório.',
      });
    }

    if (typeof category !== 'string' || category.trim().length === 0) {
      return res.status(400).json({
        error: 'Categoria do produto é obrigatória.',
      });
    }

    if (!Number.isInteger(quantity) || quantity < 0) {
      return res.status(400).json({
        error: 'Quantidade inválida.',
      });
    }

    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({
        error: 'Preço inválido.',
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const existingProduct = await tx.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        return null;
      }

      const updatedProduct = await tx.product.update({
        where: { id },
        data: {
          name: name.trim(),
          category: category.trim(),
          quantity,
          price,
          image:
            typeof image === 'string' && image.trim().length > 0
              ? image.trim()
              : null,
        },
      });

      const quantityDifference =
        updatedProduct.quantity - existingProduct.quantity;

      if (quantityDifference > 0) {
        await tx.stockMovement.create({
          data: {
            productId: updatedProduct.id,
            productName: updatedProduct.name,
            type: 'entrada',
            quantity: quantityDifference,
            previousQuantity: existingProduct.quantity,
            newQuantity: updatedProduct.quantity,
            description: `Entrada de ${quantityDifference} unidade(s)`,
          },
        });
      } else if (quantityDifference < 0) {
        await tx.stockMovement.create({
          data: {
            productId: updatedProduct.id,
            productName: updatedProduct.name,
            type: 'saida',
            quantity: Math.abs(quantityDifference),
            previousQuantity: existingProduct.quantity,
            newQuantity: updatedProduct.quantity,
            description: `Saída de ${Math.abs(quantityDifference)} unidade(s)`,
          },
        });
      } else {
        await tx.stockMovement.create({
          data: {
            productId: updatedProduct.id,
            productName: updatedProduct.name,
            type: 'atualizacao',
            quantity: 0,
            previousQuantity: existingProduct.quantity,
            newQuantity: updatedProduct.quantity,
            description: 'Informações do produto atualizadas.',
          },
        });
      }

      return updatedProduct;
    });

    if (!result) {
      return res.status(404).json({
        error: 'Produto não encontrado.',
      });
    }

    return res.json({
      id: result.id,
      name: result.name,
      category: result.category,
      quantity: result.quantity,
      price: Number(result.price),
      image: result.image ?? undefined,
    });
  } catch (error) {
    console.error('ERRO AO ATUALIZAR PRODUTO:', error);

    return res.status(500).json({
      error: 'Não foi possível atualizar o produto.',
    });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        error: 'ID do produto inválido.',
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id },
      });

      if (!product) {
        return null;
      }

      await tx.stockMovement.create({
        data: {
          productId: product.id,
          productName: product.name,
          type: 'remocao',
          quantity: product.quantity,
          previousQuantity: product.quantity,
          newQuantity: 0,
          description: 'Produto removido.',
        },
      });

      await tx.product.delete({
        where: { id },
      });

      return product;
    });

    if (!result) {
      return res.status(404).json({
        error: 'Produto não encontrado.',
      });
    }

    return res.json({
      message: `"${result.name}" foi removido com sucesso.`,
    });
  } catch (error) {
    console.error('ERRO AO REMOVER PRODUTO:', error);

    return res.status(500).json({
      error: 'Não foi possível remover o produto.',
    });
  }
});

app.get('/api/movements', async (_req, res) => {
  try {
    const movements = await prisma.stockMovement.findMany({
      orderBy: {
        date: 'desc',
      },
    });

    return res.json(
      movements.map((movement) => ({
        id: movement.id,
        productId: movement.productId,
        productName: movement.productName,
        type: movement.type,
        quantity: movement.quantity,
        previousQuantity: movement.previousQuantity,
        newQuantity: movement.newQuantity,
        description: movement.description,
        date: movement.date.toISOString(),
      }))
    );
  } catch (error) {
    console.error('ERRO AO BUSCAR HISTÓRICO:', error);

    return res.status(500).json({
      error: 'Não foi possível buscar o histórico.',
    });
  }
});

// =========================
// Categorias
// =========================

app.get("/api/categories", async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return res.json(
      categories.map((category) => ({
        id: category.id,
        name: category.name,
        createdAt: category.createdAt.toISOString(),
      })),
    );
  } catch (error) {
    console.error("ERRO AO BUSCAR CATEGORIAS:", error);

    return res.status(500).json({
      error: "Não foi possível buscar as categorias.",
    });
  }
});

app.post("/api/categories", async (req, res) => {
  try {
    const { name } = req.body;

    if (typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({
        error: "Nome da categoria é obrigatório.",
      });
    }

    const trimmedName = name.trim();

    const existingCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: trimmedName,
          mode: "insensitive",
        },
      },
    });

    if (existingCategory) {
      return res.status(409).json({
        error: "Já existe uma categoria com esse nome.",
      });
    }

    const category = await prisma.category.create({
      data: {
        name: trimmedName,
      },
    });

    return res.status(201).json({
      id: category.id,
      name: category.name,
      createdAt: category.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("ERRO AO CRIAR CATEGORIA:", error);

    return res.status(500).json({
      error: "Não foi possível criar a categoria.",
    });
  }
});

app.put("/api/categories/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        error: "ID da categoria inválido.",
      });
    }

    const { name } = req.body;

    if (typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({
        error: "Nome da categoria é obrigatório.",
      });
    }

    const trimmedName = name.trim();

    const result = await prisma.$transaction(async (tx) => {
      const category = await tx.category.findUnique({
        where: { id },
      });

      if (!category) {
        return null;
      }

      const duplicate = await tx.category.findFirst({
        where: {
          id: {
            not: id,
          },
          name: {
            equals: trimmedName,
            mode: "insensitive",
          },
        },
      });

      if (duplicate) {
        return {
          duplicate: true,
        };
      }

      await tx.category.update({
        where: { id },
        data: {
          name: trimmedName,
        },
      });

      // Mantém os produtos associados à categoria sincronizados
      await tx.product.updateMany({
        where: {
          category: {
            equals: category.name,
            mode: "insensitive",
          },
        },
        data: {
          category: trimmedName,
        },
      });

      const updatedCategory = await tx.category.findUnique({
        where: { id },
      });

      return {
        duplicate: false,
        category: updatedCategory,
      };
    });

    if (!result) {
      return res.status(404).json({
        error: "Categoria não encontrada.",
      });
    }

    if (result.duplicate) {
      return res.status(409).json({
        error: "Já existe uma categoria com esse nome.",
      });
    }

    return res.json({
      id: result.category!.id,
      name: result.category!.name,
      createdAt: result.category!.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("ERRO AO ATUALIZAR CATEGORIA:", error);

    return res.status(500).json({
      error: "Não foi possível atualizar a categoria.",
    });
  }
});

app.delete("/api/categories/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        error: "ID da categoria inválido.",
      });
    }

    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return res.status(404).json({
        error: "Categoria não encontrada.",
      });
    }

    const productsUsingCategory = await prisma.product.count({
      where: {
        category: {
          equals: category.name,
          mode: "insensitive",
        },
      },
    });

    if (productsUsingCategory > 0) {
      return res.status(409).json({
        error: `Não é possível excluir "${category.name}" porque existem ${productsUsingCategory} produto(s) associados a essa categoria.`,
      });
    }

    await prisma.category.delete({
      where: { id },
    });

    return res.json({
      message: `"${category.name}" foi excluída com sucesso.`,
    });
  } catch (error) {
    console.error("ERRO AO REMOVER CATEGORIA:", error);

    return res.status(500).json({
      error: "Não foi possível remover a categoria.",
    });
  }
});

// =========================
// Análise de estoque com Ollama
// =========================

app.post('/api/analisar-estoque', async (req, res) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products)) {
      return res.status(400).json({
        error: 'Lista de produtos inválida.',
      });
    }

    if (products.length > 100) {
      return res.status(400).json({
        error: 'A análise pode conter no máximo 100 produtos.',
      });
    }

    for (const product of products) {
      if (!product || typeof product !== 'object') {
        return res.status(400).json({
          error: 'Um ou mais produtos possuem formato inválido.',
        });
      }

      if (
        typeof product.name !== 'string' ||
        product.name.trim().length === 0
      ) {
        return res.status(400).json({
          error: 'Todo produto precisa possuir um nome válido.',
        });
      }

      if (typeof product.quantity !== 'number') {
        return res.status(400).json({
          error: `Quantidade inválida para o produto "${product.name}".`,
        });
      }
    }

    // =========================
    // Regras objetivas do estoque
    // =========================

    const lowStockProducts = products.filter(
      (product) => product.quantity <= 5
    );

    const highestStockQuantity =
      products.length > 0
        ? Math.max(...products.map((product) => product.quantity))
        : 0;

    const highestStockProducts = products.filter(
      (product) => product.quantity === highestStockQuantity
    );

    // =========================
    // Prompt para a IA
    // =========================

    const prompt = `
Você é um assistente especializado em gestão de estoque.

IMPORTANTE:
As regras abaixo já foram calculadas pelo sistema. 
Você NÃO deve alterar, reinterpretar ou inventar esses valores.

Regra de estoque baixo:
Um produto só é considerado com estoque baixo quando sua quantidade é MENOR OU IGUAL A 5.

Produtos cadastrados:
${JSON.stringify(products, null, 2)}

Produtos que o sistema identificou como estoque baixo:
${JSON.stringify(lowStockProducts, null, 2)}

Produto(s) com maior quantidade em estoque:
${JSON.stringify(highestStockProducts, null, 2)}

Maior quantidade encontrada:
${highestStockQuantity}

Com base nesses dados, faça uma análise clara e objetiva.

Identifique:
- produtos com estoque baixo;
- produtos que precisam de reposição;
- produto(s) com maior quantidade;
- prioridades;
- recomendações para o gestor.

REGRAS:
- Nunca considere um produto com quantidade maior que 5 como estoque baixo.
- Nunca altere a quantidade dos produtos.
- Nunca invente produtos.
- Quando falar sobre o produto com maior estoque, use os dados fornecidos pelo sistema.
- Responda em português do Brasil.
- Seja objetivo e organize a resposta de forma clara.
`;

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen2.5:3b',
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error('ERRO DO OLLAMA:', errorText);

      return res.status(502).json({
        error: 'Erro ao se comunicar com o Ollama.',
      });
    }

    const data = await response.json();

    return res.json({
      analysis: data.response,
    });
  } catch (error) {
    console.error('ERRO INTERNO DA API:', error);

    return res.status(500).json({
      error: 'Não foi possível analisar o estoque.',
    });
  }
});

// =========================
// Chat com IA sobre o estoque
// =========================

app.post('/api/chat-estoque', async (req, res) => {
  try {
    const { products, question } = req.body;

    // Verifica se products é um array
    if (!Array.isArray(products)) {
      return res.status(400).json({
        error: 'Lista de produtos inválida.',
      });
    }

    // Limita a quantidade de produtos
    if (products.length > 100) {
      return res.status(400).json({
        error: 'A análise pode conter no máximo 100 produtos.',
      });
    }

    // Verifica a pergunta
    if (typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({
        error: 'A pergunta é obrigatória.',
      });
    }

    // Limita o tamanho da pergunta
    if (question.length > 1000) {
      return res.status(400).json({
        error: 'A pergunta deve ter no máximo 1000 caracteres.',
      });
    }

    // Valida os produtos
    for (const product of products) {
      if (!product || typeof product !== 'object') {
        return res.status(400).json({
          error: 'Um ou mais produtos possuem formato inválido.',
        });
      }

      if (
        typeof product.name !== 'string' ||
        product.name.trim().length === 0
      ) {
        return res.status(400).json({
          error: 'Todo produto precisa possuir um nome válido.',
        });
      }

      if (typeof product.quantity !== 'number') {
        return res.status(400).json({
          error: `Quantidade inválida para o produto "${product.name}".`,
        });
      }

      if (product.price !== undefined && typeof product.price !== 'number') {
        return res.status(400).json({
          error: `Preço inválido para o produto "${product.name}".`,
        });
      }
    }

    // =========================
    // Cálculos objetivos do sistema
    // =========================

    // Estoque baixo = quantidade <= 5
    const lowStockProducts = products.filter(
      (product) => product.quantity <= 5
    );

    // Produto(s) com maior quantidade
    const highestStockQuantity =
      products.length > 0
        ? Math.max(...products.map((product) => product.quantity))
        : 0;

    const highestStockProducts = products.filter(
      (product) => product.quantity === highestStockQuantity
    );

    // Produto(s) com menor quantidade
    const lowestStockQuantity =
      products.length > 0
        ? Math.min(...products.map((product) => product.quantity))
        : 0;

    const lowestStockProducts = products.filter(
      (product) => product.quantity === lowestStockQuantity
    );

    // Valor total do estoque
    const totalStockValue = products.reduce(
      (total, product) => total + product.quantity * (product.price || 0),
      0
    );

    // =========================
    // Prompt
    // =========================

    const prompt = `
Você é um assistente especializado em gestão de estoque.

Sua função é responder perguntas sobre os produtos cadastrados no sistema.

IMPORTANTE:
Os cálculos abaixo foram realizados pelo sistema usando JavaScript.
Você NÃO deve recalcular, alterar, reinterpretar ou inventar esses valores.

=========================
DADOS DOS PRODUTOS
=========================

${JSON.stringify(products, null, 2)}

=========================
DADOS CALCULADOS PELO SISTEMA
=========================

Regra de estoque baixo:
Um produto é considerado com estoque baixo SOMENTE quando a quantidade é menor ou igual a 5.

Produtos com estoque baixo:
${JSON.stringify(lowStockProducts, null, 2)}

Maior quantidade em estoque:
${highestStockQuantity}

Produto(s) com maior quantidade:
${JSON.stringify(highestStockProducts, null, 2)}

Menor quantidade em estoque:
${lowestStockQuantity}

Produto(s) com menor quantidade:
${JSON.stringify(lowestStockProducts, null, 2)}

Valor total do estoque:
${totalStockValue}

=========================
PERGUNTA DO USUÁRIO
=========================

${question.trim()}

=========================
REGRAS DE RESPOSTA
=========================

- Responda em português do Brasil.
- Use somente os dados fornecidos pelo sistema.
- Não invente produtos.
- Não invente quantidades.
- Não altere nenhuma quantidade.
- Nunca considere um produto com quantidade maior que 5 como estoque baixo.
- Quando perguntarem qual produto possui maior estoque, use exatamente os dados calculados pelo sistema.
- Quando perguntarem quais produtos precisam de reposição, considere como prioridade os produtos com estoque baixo.
- Não diga que um produto precisa de reposição apenas porque a quantidade dele é menor que a de outro produto.
- Seja objetivo e claro.
- Quando fizer sentido, use listas.
- Se a pergunta não tiver relação com o estoque, informe educadamente que você pode ajudar apenas com informações relacionadas ao estoque.
`;

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen2.5:3b',
        prompt,
        stream: false,
      }),
    });

    // Verifica a resposta do Ollama
    if (!response.ok) {
      const errorText = await response.text();

      console.error('ERRO DO OLLAMA NO CHAT:', errorText);

      return res.status(502).json({
        error: 'Erro ao se comunicar com o Ollama.',
      });
    }

    const data = await response.json();

    return res.json({
      answer: data.response,
    });
  } catch (error) {
    console.error('ERRO INTERNO DO CHAT:', error);

    return res.status(500).json({
      error: 'Não foi possível processar a pergunta.',
    });
  }
});

// =========================
// Inicialização do servidor
// =========================

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});