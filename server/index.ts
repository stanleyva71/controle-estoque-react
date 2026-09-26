import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

import { auth, type AuthenticatedRequest } from './middleware/auth';
import { authorize } from './middleware/authorize';
import { prisma } from './lib/prisma';
import { generateGeminiText } from './lib/gemini';

const app = express();

const PORT = Number(process.env.PORT) || 3001;

// =========================
// Configurações de segurança
// =========================

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://controle-estoque-react-roan.vercel.app',
    ],
  })
);

app.use(helmet());

app.use(
  express.json({
    limit: '1mb',
  })
);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Muitas requisições. Tente novamente mais tarde.',
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Muitas tentativas de autenticação. Tente novamente mais tarde.',
  },
});

app.use('/api/', apiLimiter);

// =========================
// Autenticação
// =========================

app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== 'string' || email.trim().length === 0) {
      return res.status(400).json({
        error: 'E-mail é obrigatório.',
      });
    }

    if (typeof password !== 'string' || password.length === 0) {
      return res.status(400).json({
        error: 'Senha é obrigatória.',
      });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error('JWT_SECRET não foi definida.');

      return res.status(500).json({
        error: 'Configuração de autenticação não encontrada.',
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: email.trim().toLowerCase(),
      },
    });

    if (!user) {
      return res.status(401).json({
        error: 'E-mail ou senha inválidos.',
      });
    }

    if (!user.active) {
      return res.status(403).json({
        error: 'Usuário desativado.',
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      return res.status(401).json({
        error: 'E-mail ou senha inválidos.',
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      secret,
      {
        expiresIn: '8h',
      }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active,
      },
    });
  } catch (error) {
    console.error('ERRO AO REALIZAR LOGIN:', error);

    return res.status(500).json({
      error: 'Não foi possível realizar o login.',
    });
  }
});

// =========================
// Teste da API
// =========================

app.get('/api/test', (_req, res) => {
  return res.json({
    message: 'API funcionando!',
  });
});

// =========================
// Middleware de autenticação
// =========================

app.use('/api', auth);

// =========================
// Alteração de senha
// =========================

app.post(
  '/api/auth/change-password',
  async (req: AuthenticatedRequest, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (
        typeof currentPassword !== 'string' ||
        typeof newPassword !== 'string'
      ) {
        return res.status(400).json({
          error: 'Senha atual e nova senha são obrigatórias.',
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          error: 'A nova senha deve ter pelo menos 6 caracteres.',
        });
      }

      const userId = req.user!.userId;

      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        return res.status(404).json({
          error: 'Usuário não encontrado.',
        });
      }

      if (!user.active) {
        return res.status(403).json({
          error: 'Usuário desativado.',
        });
      }

      const passwordMatches = await bcrypt.compare(
        currentPassword,
        user.passwordHash
      );

      if (!passwordMatches) {
        return res.status(401).json({
          error: 'A senha atual está incorreta.',
        });
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          passwordHash,
        },
      });

      return res.json({
        message: 'Senha alterada com sucesso.',
      });
    } catch (error) {
      console.error('ERRO AO ALTERAR SENHA:', error);

      return res.status(500).json({
        error: 'Não foi possível alterar a senha.',
      });
    }
  }
);

// =========================
// Usuário autenticado
// =========================

app.get(
  '/api/auth/me',
  authorize('ADMIN', 'OPERADOR', 'VISUALIZACAO'),
  (req: AuthenticatedRequest, res) => {
    return res.json({
      user: req.user,
    });
  }
);

// =========================
// Usuários
// =========================

// =========================
// CADASTRAR USUÁRIO
// Somente ADMIN
// =========================

app.post('/api/users', authorize('ADMIN'), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        error: 'Nome deve possuir pelo menos 2 caracteres.',
      });
    }

    if (typeof email !== 'string' || email.trim().length === 0) {
      return res.status(400).json({
        error: 'E-mail é obrigatório.',
      });
    }

    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        error: 'A senha deve possuir pelo menos 6 caracteres.',
      });
    }

    const allowedRoles = ['ADMIN', 'OPERADOR', 'VISUALIZACAO'];

    if (typeof role !== 'string' || !allowedRoles.includes(role)) {
      return res.status(400).json({
        error: 'Perfil de usuário inválido.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'Já existe um usuário com esse e-mail.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: role as UserRole,
      },
    });

    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('ERRO AO CRIAR USUÁRIO:', error);

    return res.status(500).json({
      error: 'Não foi possível criar o usuário.',
    });
  }
});

// =========================
// EDITAR USUÁRIO
// Somente ADMIN
// =========================

app.put('/api/users/:id', authorize('ADMIN'), async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        error: 'ID do usuário inválido.',
      });
    }

    const { name, email, password, role } = req.body;

    if (typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        error: 'Nome deve possuir pelo menos 2 caracteres.',
      });
    }

    if (typeof email !== 'string' || email.trim().length === 0) {
      return res.status(400).json({
        error: 'E-mail é obrigatório.',
      });
    }

    const allowedRoles = ['ADMIN', 'OPERADOR', 'VISUALIZACAO'];

    if (typeof role !== 'string' || !allowedRoles.includes(role)) {
      return res.status(400).json({
        error: 'Perfil de usuário inválido.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        error: 'Usuário não encontrado.',
      });
    }

    const duplicateEmail = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        NOT: {
          id,
        },
      },
    });

    if (duplicateEmail) {
      return res.status(409).json({
        error: 'Já existe outro usuário com esse e-mail.',
      });
    }

    const data: {
      name: string;
      email: string;
      role: UserRole;
      passwordHash?: string;
    } = {
      name: name.trim(),
      email: normalizedEmail,
      role: role as UserRole,
    };

    if (typeof password === 'string' && password.length > 0) {
      if (password.length < 6) {
        return res.status(400).json({
          error: 'A nova senha deve possuir pelo menos 6 caracteres.',
        });
      }

      data.passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: {
        id,
      },
      data,
    });

    return res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      active: updatedUser.active,
      createdAt: updatedUser.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('ERRO AO ATUALIZAR USUÁRIO:', error);

    return res.status(500).json({
      error: 'Não foi possível atualizar o usuário.',
    });
  }
});

// =========================
// DESATIVAR / REATIVAR USUÁRIO
// Somente ADMIN
// =========================

app.patch(
  '/api/users/:id/status',
  authorize('ADMIN'),
  async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id)) {
        return res.status(400).json({
          error: 'ID do usuário inválido.',
        });
      }

      const { active } = req.body;

      if (typeof active !== 'boolean') {
        return res.status(400).json({
          error: 'O status do usuário é inválido.',
        });
      }

      if (id === req.user?.userId) {
        return res.status(400).json({
          error: 'Você não pode alterar o status do próprio usuário.',
        });
      }

      const user = await prisma.user.findUnique({
        where: {
          id,
        },
      });

      if (!user) {
        return res.status(404).json({
          error: 'Usuário não encontrado.',
        });
      }

      const updatedUser = await prisma.user.update({
        where: {
          id,
        },
        data: {
          active,
        },
      });

      return res.json({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        active: updatedUser.active,
        message: `"${updatedUser.name}" foi ${
          updatedUser.active ? 'reativado' : 'desativado'
        } com sucesso.`,
      });
    } catch (error) {
      console.error('ERRO AO ALTERAR STATUS DO USUÁRIO:', error);

      return res.status(500).json({
        error: 'Não foi possível alterar o status do usuário.',
      });
    }
  }
);

// =========================
// LISTAR USUÁRIOS
// Somente ADMIN
// =========================

app.get('/api/users', authorize('ADMIN'), async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        id: 'desc',
      },
    });

    return res.json(
      users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active,
        createdAt: user.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error('ERRO AO BUSCAR USUÁRIOS:', error);

    return res.status(500).json({
      error: 'Não foi possível buscar os usuários.',
    });
  }
});

// =========================
// Produtos
// =========================

// =========================
// CONSULTAR
// Todos os perfis
// =========================

app.get(
  '/api/products',
  authorize('ADMIN', 'OPERADOR', 'VISUALIZACAO'),
  async (_req, res) => {
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
  }
);

// =========================
// CONSULTAR PRODUTO
// Todos os perfis
// =========================

app.get(
  '/api/products/:id',
  authorize('ADMIN', 'OPERADOR', 'VISUALIZACAO'),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id)) {
        return res.status(400).json({
          error: 'ID do produto inválido.',
        });
      }

      const product = await prisma.product.findUnique({
        where: {
          id,
        },
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
  }
);

// =========================
// CRIAR
// ADMIN e OPERADOR
// =========================

app.post(
  '/api/products',
  authorize('ADMIN', 'OPERADOR'),
  async (req: AuthenticatedRequest, res) => {
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

      if (typeof price !== 'number' || !Number.isFinite(price) || price < 0) {
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
            userId: req.user!.userId,
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
  }
);

// =========================
// EDITAR
// ADMIN e OPERADOR
// =========================

app.put(
  '/api/products/:id',
  authorize('ADMIN', 'OPERADOR'),
  async (req: AuthenticatedRequest, res) => {
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

      if (typeof price !== 'number' || !Number.isFinite(price) || price < 0) {
        return res.status(400).json({
          error: 'Preço inválido.',
        });
      }

      const result = await prisma.$transaction(async (tx) => {
        const existingProduct = await tx.product.findUnique({
          where: {
            id,
          },
        });

        if (!existingProduct) {
          return null;
        }

        const updatedProduct = await tx.product.update({
          where: {
            id,
          },
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
              userId: req.user!.userId,
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
              description: `Saída de ${Math.abs(
                quantityDifference
              )} unidade(s)`,
              userId: req.user!.userId,
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
              userId: req.user!.userId,
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
  }
);

// =========================
// EXCLUIR PRODUTO
// Somente ADMIN
// =========================

app.delete(
  '/api/products/:id',
  authorize('ADMIN'),
  async (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id)) {
        return res.status(400).json({
          error: 'ID do produto inválido.',
        });
      }

      const result = await prisma.$transaction(async (tx) => {
        const product = await tx.product.findUnique({
          where: {
            id,
          },
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
            userId: req.user!.userId,
          },
        });

        await tx.product.delete({
          where: {
            id,
          },
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
  }
);

// =========================
// Histórico
// =========================

// =========================
// CONSULTAR
// Todos os perfis
// =========================

app.get(
  '/api/movements',
  authorize('ADMIN', 'OPERADOR', 'VISUALIZACAO'),
  async (_req, res) => {
    try {
      const movements = await prisma.stockMovement.findMany({
        orderBy: {
          date: 'desc',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
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
          user: movement.user
            ? {
                id: movement.user.id,
                name: movement.user.name,
                email: movement.user.email,
              }
            : null,
          date: movement.date.toISOString(),
        }))
      );
    } catch (error) {
      console.error('ERRO AO BUSCAR HISTÓRICO:', error);

      return res.status(500).json({
        error: 'Não foi possível buscar o histórico.',
      });
    }
  }
);

// =========================
// Categorias
// =========================

// =========================
// CONSULTAR
// Todos os perfis
// =========================

app.get(
  '/api/categories',
  authorize('ADMIN', 'OPERADOR', 'VISUALIZACAO'),
  async (_req, res) => {
    try {
      const categories = await prisma.category.findMany({
        orderBy: {
          name: 'asc',
        },
      });

      return res.json(
        categories.map((category) => ({
          id: category.id,
          name: category.name,
          createdAt: category.createdAt.toISOString(),
        }))
      );
    } catch (error) {
      console.error('ERRO AO BUSCAR CATEGORIAS:', error);

      return res.status(500).json({
        error: 'Não foi possível buscar as categorias.',
      });
    }
  }
);

// =========================
// CRIAR
// ADMIN e OPERADOR
// =========================

app.post(
  '/api/categories',
  authorize('ADMIN', 'OPERADOR'),
  async (req, res) => {
    try {
      const { name } = req.body;

      if (typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({
          error: 'Nome da categoria é obrigatório.',
        });
      }

      const trimmedName = name.trim();

      const existingCategory = await prisma.category.findFirst({
        where: {
          name: {
            equals: trimmedName,
            mode: 'insensitive',
          },
        },
      });

      if (existingCategory) {
        return res.status(409).json({
          error: 'Já existe uma categoria com esse nome.',
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
      console.error('ERRO AO CRIAR CATEGORIA:', error);

      return res.status(500).json({
        error: 'Não foi possível criar a categoria.',
      });
    }
  }
);

// =========================
// EDITAR
// ADMIN e OPERADOR
// =========================

app.put(
  '/api/categories/:id',
  authorize('ADMIN', 'OPERADOR'),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id)) {
        return res.status(400).json({
          error: 'ID da categoria inválido.',
        });
      }

      const { name } = req.body;

      if (typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({
          error: 'Nome da categoria é obrigatório.',
        });
      }

      const trimmedName = name.trim();

      const result = await prisma.$transaction(async (tx) => {
        const category = await tx.category.findUnique({
          where: {
            id,
          },
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
              mode: 'insensitive',
            },
          },
        });

        if (duplicate) {
          return {
            duplicate: true,
            category: null,
          };
        }

        await tx.category.update({
          where: {
            id,
          },
          data: {
            name: trimmedName,
          },
        });

        await tx.product.updateMany({
          where: {
            category: {
              equals: category.name,
              mode: 'insensitive',
            },
          },
          data: {
            category: trimmedName,
          },
        });

        const updatedCategory = await tx.category.findUnique({
          where: {
            id,
          },
        });

        return {
          duplicate: false,
          category: updatedCategory,
        };
      });

      if (!result) {
        return res.status(404).json({
          error: 'Categoria não encontrada.',
        });
      }

      if (result.duplicate) {
        return res.status(409).json({
          error: 'Já existe uma categoria com esse nome.',
        });
      }

      return res.json({
        id: result.category!.id,
        name: result.category!.name,
        createdAt: result.category!.createdAt.toISOString(),
      });
    } catch (error) {
      console.error('ERRO AO ATUALIZAR CATEGORIA:', error);

      return res.status(500).json({
        error: 'Não foi possível atualizar a categoria.',
      });
    }
  }
);

// =========================
// EXCLUIR
// Somente ADMIN
// =========================

app.delete('/api/categories/:id', authorize('ADMIN'), async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        error: 'ID da categoria inválido.',
      });
    }

    const category = await prisma.category.findUnique({
      where: {
        id,
      },
    });

    if (!category) {
      return res.status(404).json({
        error: 'Categoria não encontrada.',
      });
    }

    const productsUsingCategory = await prisma.product.count({
      where: {
        category: {
          equals: category.name,
          mode: 'insensitive',
        },
      },
    });

    if (productsUsingCategory > 0) {
      return res.status(409).json({
        error: `Não é possível excluir "${category.name}" porque existem ${productsUsingCategory} produto(s) associados a essa categoria.`,
      });
    }

    await prisma.category.delete({
      where: {
        id,
      },
    });

    return res.json({
      message: `"${category.name}" foi excluída com sucesso.`,
    });
  } catch (error) {
    console.error('ERRO AO REMOVER CATEGORIA:', error);

    return res.status(500).json({
      error: 'Não foi possível remover a categoria.',
    });
  }
});

// =========================
// Análise automática de estoque
// =========================

// TODOS OS PERFIS

app.post(
  '/api/analisar-estoque',
  authorize('ADMIN', 'OPERADOR', 'VISUALIZACAO'),
  async (_req, res) => {
    try {
      const products = await prisma.product.findMany({
        orderBy: {
          id: 'asc',
        },
      });

      if (products.length > 100) {
        return res.status(400).json({
          error: 'A análise pode conter no máximo 100 produtos.',
        });
      }

      const productData = products.map((product) => ({
        id: product.id,
        name: product.name,
        category: product.category,
        quantity: product.quantity,
        price: Number(product.price),
      }));

      // =========================
      // Indicadores
      // =========================

      const lowStockProducts = productData.filter(
        (product) => product.quantity <= 5
      );

      const zeroStockProducts = productData.filter(
        (product) => product.quantity === 0
      );

      const totalProducts = productData.length;

      const totalQuantity = productData.reduce(
        (total, product) => total + product.quantity,
        0
      );

      const totalStockValue = productData.reduce(
        (total, product) => total + product.quantity * product.price,
        0
      );

      const highestStockQuantity =
        productData.length > 0
          ? Math.max(...productData.map((product) => product.quantity))
          : 0;

      const highestStockProducts = productData.filter(
        (product) => product.quantity === highestStockQuantity
      );

      const lowestStockQuantity =
        productData.length > 0
          ? Math.min(...productData.map((product) => product.quantity))
          : 0;

      const lowestStockProducts = productData.filter(
        (product) => product.quantity === lowestStockQuantity
      );

      const highestPrice =
        productData.length > 0
          ? Math.max(...productData.map((product) => product.price))
          : 0;

      const highestPriceProducts = productData.filter(
        (product) => product.price === highestPrice
      );

      const lowestPrice =
        productData.length > 0
          ? Math.min(...productData.map((product) => product.price))
          : 0;

      const lowestPriceProducts = productData.filter(
        (product) => product.price === lowestPrice
      );

      // =========================
      // Resumo por categoria
      // =========================

      const categoryMap = new Map<
        string,
        {
          category: string;
          products: number;
          quantity: number;
        }
      >();

      for (const product of productData) {
        const existing = categoryMap.get(product.category);

        if (existing) {
          existing.products += 1;
          existing.quantity += product.quantity;
        } else {
          categoryMap.set(product.category, {
            category: product.category,
            products: 1,
            quantity: product.quantity,
          });
        }
      }

      const categorySummary = Array.from(categoryMap.values());

      // =========================
      // Resumo oficial
      // =========================

      const systemSummary = {
        totalProducts,
        totalQuantity,
        totalStockValue: `R$ ${totalStockValue.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,

        lowStockCount: lowStockProducts.length,
        lowStockProducts,

        zeroStockCount: zeroStockProducts.length,
        zeroStockProducts,

        highestStockQuantity,
        highestStockProducts,

        lowestStockQuantity,
        lowestStockProducts,

        highestPrice,
        highestPriceProducts,

        lowestPrice,
        lowestPriceProducts,

        categorySummary,
      };

      // =========================
      // Prompt do Gemini
      // =========================

      const prompt = `
Você é um assistente especializado em gestão de estoque.

Sua tarefa é elaborar um RELATÓRIO GERENCIAL COMPLETO sobre o estoque atual.

Os dados fornecidos abaixo foram calculados diretamente pelo sistema e são OFICIAIS.

Utilize os dados fornecidos para produzir um relatório claro, profissional e fácil de ler.

Não faça novos cálculos.

Não altere nenhum número.

Não invente informações.

Não invente vendas, demanda, previsão, fornecedores, custos, problemas ou informações que não estejam nos dados.

==================================================
DADOS OFICIAIS DO SISTEMA
==================================================

${JSON.stringify(systemSummary, null, 2)}

==================================================
REGRAS DOS DADOS
==================================================

- Estoque baixo significa quantidade menor ou igual a 5 unidades.
- Quantidade 0 também é considerada estoque baixo.
- Quantidade maior que 5 não deve ser considerada estoque baixo.
- Não diga que um produto é caro ou barato apenas porque possui maior ou menor preço.
- Não diga que uma quantidade alta significa excesso de estoque.
- Não diga que uma quantidade baixa significa falta de estoque, exceto quando estiver dentro da regra oficial de estoque baixo.
- Não diga que um produto é suficiente ou insuficiente para a demanda.
- Não invente necessidade de compra.
- Não recomende uma quantidade específica de reposição.
- Não diga que uma reposição é urgente sem dados que comprovem isso.
- Use exatamente os nomes dos produtos e categorias fornecidos pelo sistema.
- Não misture produtos de categorias diferentes.
- Não omita informações importantes fornecidas nos dados.

==================================================
FORMATAÇÃO OBRIGATÓRIA
==================================================

IMPORTANTE:

O relatório NÃO deve usar Markdown.

NÃO use:
- # 
- ## 
- ###
- *
- **
- crases
- tabelas Markdown
- títulos com símbolos de Markdown
- listas usando asterisco

Use somente texto simples.

Organize o relatório usando títulos numerados e subtítulos em texto normal.

Use este estilo:

ANÁLISE AUTOMÁTICA DO ESTOQUE

1. VISÃO GERAL DO ESTOQUE

2. SITUAÇÃO DOS PRODUTOS

Produtos com estoque baixo
• Produto: Nome do produto
  Quantidade: 2 unidades
  Categoria: Hardware

Produtos com estoque zerado
• Nenhum produto com estoque zerado.

3. DESTAQUES DE QUANTIDADE

Maior quantidade em estoque
• Produto: Nome do produto
  Quantidade: 22 unidades
  Categoria: Periféricos

4. ANÁLISE DE PREÇOS

Maior preço
• Produto: Nome do produto
  Preço: R$ 50.000,00
  Categoria: Hardware

5. DISTRIBUIÇÃO POR CATEGORIA

• Periféricos
  Produtos cadastrados: 5
  Unidades em estoque: 68

6. PONTOS DE ATENÇÃO

• Acompanhar os produtos classificados com estoque baixo.
• Acompanhar produtos com estoque zerado.
• Observar a distribuição do estoque entre as categorias.

7. SUGESTÕES PARA O GESTOR

• Acompanhar periodicamente os produtos com estoque baixo.
• Revisar os cadastros dos produtos.
• Acompanhar o histórico de movimentações.
• Monitorar a distribuição do estoque por categoria.
• Acompanhar o valor total registrado no estoque.

8. CONCLUSÃO

Escreva uma conclusão curta e objetiva.


==================================================
CONTEÚDO DO RELATÓRIO
==================================================

1. VISÃO GERAL DO ESTOQUE

Apresente:

• Total de produtos cadastrados.
• Quantidade total de unidades em estoque.
• Valor total estimado do estoque.
• Quantidade de produtos com estoque baixo.
• Quantidade de produtos com estoque zerado.

Faça uma breve explicação desses indicadores.

2. SITUAÇÃO DOS PRODUTOS

Produtos com estoque baixo:

Liste TODOS os produtos com quantidade menor ou igual a 5.

Para cada produto informe:

• Nome.
• Quantidade.
• Categoria.

Produtos com estoque zerado:

Liste TODOS os produtos com quantidade igual a 0.

Para cada produto informe:

• Nome.
• Quantidade.
• Categoria.

Se não existirem produtos nessa situação, informe claramente.

3. DESTAQUES DE QUANTIDADE

Informe:

Maior quantidade em estoque

Liste TODOS os produtos com a maior quantidade.

Menor quantidade em estoque

Liste TODOS os produtos com a menor quantidade.

Para cada produto informe nome, quantidade e categoria.

4. ANÁLISE DE PREÇOS

Informe:

Maior preço

Liste TODOS os produtos com o maior preço.

Menor preço

Liste TODOS os produtos com o menor preço.

Para cada produto informe nome, preço e categoria.

Não diga que os produtos são caros ou baratos.

5. DISTRIBUIÇÃO POR CATEGORIA

Apresente TODAS as categorias existentes.

Para cada categoria informe:

• Nome.
• Quantidade de produtos cadastrados.
• Quantidade total de unidades em estoque.

Faça uma observação objetiva sobre a distribuição.

6. PONTOS DE ATENÇÃO

Destaque somente pontos que possam ser observados diretamente pelos dados.

Dê prioridade para:

• Produtos com estoque baixo.
• Produtos com estoque zerado.
• Diferenças de quantidade entre os produtos.
• Distribuição por categoria.
• Valor total do estoque.

Não invente problemas.

7. SUGESTÕES PARA O GESTOR

Apresente de 3 a 5 sugestões práticas relacionadas aos dados encontrados.

As sugestões devem ser gerais e úteis para acompanhamento e organização do estoque.

Não invente problemas.

Não recomende quantidade específica de compra.

8. CONCLUSÃO

Faça uma conclusão curta resumindo a situação atual do estoque.

==================================================
REGRAS DE VALORES MONETÁRIOS
==================================================

Todos os valores monetários devem seguir o padrão brasileiro.

Sempre use:

R$ 173.502,00
R$ 50.000,00
R$ 102,00

Nunca use:

R$ 173.502
R$ 50000
173.502

Sempre utilize duas casas decimais.

Use ponto para milhares e vírgula para centavos.

==================================================
REGRAS FINAIS
==================================================

- Responda em português do Brasil.
- Não use Markdown.
- Não use #.
- Não use ##.
- Não use ###.
- Não use **.
- Não use asteriscos para listas.
- Não use crases.
- Não mostre JSON.
- Não mencione que você é uma IA.
- Não explique como os cálculos foram feitos.
- Não repita informações desnecessariamente.
- Seja claro, profissional e objetivo.
`;

      let analysis: string;

      try {
        analysis = await generateGeminiText(prompt);
      } catch (error) {
        console.error('ERRO DO GEMINI NA ANÁLISE:', error);

        return res.status(502).json({
          error:
            error instanceof Error
              ? `Erro ao se comunicar com o Gemini: ${error.message}`
              : 'Erro ao se comunicar com o Gemini.',
        });
      }

      return res.json({
        analysis,
        stats: {
          totalProducts,
          totalQuantity,
          totalStockValue,
          lowStockCount: lowStockProducts.length,
          lowStockProducts,
          zeroStockCount: zeroStockProducts.length,
          zeroStockProducts,
          highestStockQuantity,
          highestStockProducts,
          lowestStockQuantity,
          lowestStockProducts,
          highestPrice,
          highestPriceProducts,
          lowestPrice,
          lowestPriceProducts,
          categorySummary,
        },
      });
    } catch (error) {
      console.error('ERRO INTERNO DA API:', error);

      return res.status(500).json({
        error: 'Não foi possível analisar o estoque.',
      });
    }
  }
);

// =========================
// Chat com IA
// =========================

// TODOS OS PERFIS

app.post(
  '/api/chat-estoque',
  authorize('ADMIN', 'OPERADOR', 'VISUALIZACAO'),
  async (req, res) => {
    try {
      const { products, question } = req.body;

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

      if (typeof question !== 'string' || question.trim().length === 0) {
        return res.status(400).json({
          error: 'A pergunta é obrigatória.',
        });
      }

      if (question.length > 1000) {
        return res.status(400).json({
          error: 'A pergunta deve ter no máximo 1000 caracteres.',
        });
      }

      // =========================
      // Validação
      // =========================

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

        if (
          typeof product.quantity !== 'number' ||
          !Number.isFinite(product.quantity)
        ) {
          return res.status(400).json({
            error: `Quantidade inválida para o produto "${product.name}".`,
          });
        }

        if (
          product.price !== undefined &&
          (typeof product.price !== 'number' || !Number.isFinite(product.price))
        ) {
          return res.status(400).json({
            error: `Preço inválido para o produto "${product.name}".`,
          });
        }
      }

      // =========================
      // Indicadores
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

      const lowestStockQuantity =
        products.length > 0
          ? Math.min(...products.map((product) => product.quantity))
          : 0;

      const lowestStockProducts = products.filter(
        (product) => product.quantity === lowestStockQuantity
      );

      const totalQuantity = products.reduce(
        (total, product) => total + product.quantity,
        0
      );

      const totalStockValue = products.reduce(
        (total, product) => total + product.quantity * (product.price || 0),
        0
      );

      const highestPrice =
        products.length > 0
          ? Math.max(...products.map((product) => product.price || 0))
          : 0;

      const lowestPrice =
        products.length > 0
          ? Math.min(...products.map((product) => product.price || 0))
          : 0;

      const highestPriceProducts = products.filter(
        (product) => (product.price || 0) === highestPrice
      );

      const lowestPriceProducts = products.filter(
        (product) => (product.price || 0) === lowestPrice
      );

      // =========================
      // Normalização da pergunta
      // =========================

      const normalizedQuestion = question
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      // =========================
      // Identificação da pergunta
      // =========================

      const asksLowStock =
        normalizedQuestion.includes('estoque baixo') ||
        normalizedQuestion.includes('pouco estoque') ||
        normalizedQuestion.includes('estoque zerado') ||
        normalizedQuestion.includes('produtos precisam de reposicao') ||
        normalizedQuestion.includes('qual produto esta com estoque baixo') ||
        normalizedQuestion.includes('quais produtos estao com estoque baixo');

      const asksHighestStock =
        normalizedQuestion.includes('maior estoque') ||
        normalizedQuestion.includes('maior quantidade') ||
        normalizedQuestion.includes('produto com mais estoque') ||
        normalizedQuestion.includes('produto com maior estoque');

      const asksLowestStock =
        normalizedQuestion.includes('menor estoque') ||
        normalizedQuestion.includes('menor quantidade') ||
        normalizedQuestion.includes('produto com menos estoque') ||
        normalizedQuestion.includes('produto com menor estoque');

      const asksTotalValue =
        normalizedQuestion.includes('valor total') ||
        normalizedQuestion.includes('valor do estoque') ||
        normalizedQuestion.includes('quanto vale o estoque');

      const asksHighestPrice =
        normalizedQuestion.includes('maior preco') ||
        normalizedQuestion.includes('produto mais caro');

      const asksLowestPrice =
        normalizedQuestion.includes('menor preco') ||
        normalizedQuestion.includes('produto mais barato');

      // =========================
      // Respostas determinísticas
      // =========================

      if (asksLowStock) {
        if (lowStockProducts.length === 0) {
          return res.json({
            answer:
              'Não há produtos com estoque baixo. Pela regra do sistema, estoque baixo é uma quantidade menor ou igual a 5 unidades.',
          });
        }

        const lines = lowStockProducts.map(
          (product) => `- ${product.name}: ${product.quantity} unidade(s)`
        );

        return res.json({
          answer: 'Os produtos com estoque baixo são:\n\n' + lines.join('\n'),
        });
      }

      if (asksHighestStock) {
        const lines = highestStockProducts.map(
          (product) => `- ${product.name}: ${product.quantity} unidade(s)`
        );

        return res.json({
          answer:
            'O(s) produto(s) com maior quantidade em estoque é/são:\n\n' +
            lines.join('\n'),
        });
      }

      if (asksLowestStock) {
        const lines = lowestStockProducts.map(
          (product) => `- ${product.name}: ${product.quantity} unidade(s)`
        );

        return res.json({
          answer:
            'O(s) produto(s) com menor quantidade em estoque é/são:\n\n' +
            lines.join('\n'),
        });
      }

      if (asksTotalValue) {
        return res.json({
          answer: `O valor total estimado do estoque é de R$ ${totalStockValue.toFixed(
            2
          )}.`,
        });
      }

      if (asksHighestPrice) {
        const lines = highestPriceProducts.map(
          (product) =>
            `- ${product.name}: R$ ${(product.price || 0).toFixed(2)}`
        );

        return res.json({
          answer:
            'O(s) produto(s) com maior preço é/são:\n\n' + lines.join('\n'),
        });
      }

      if (asksLowestPrice) {
        const lines = lowestPriceProducts.map(
          (product) =>
            `- ${product.name}: R$ ${(product.price || 0).toFixed(2)}`
        );

        return res.json({
          answer:
            'O(s) produto(s) com menor preço é/são:\n\n' + lines.join('\n'),
        });
      }

      // =========================
      // Chat aberto com Gemini
      // =========================

      const prompt = `
Você é um assistente especializado em gestão de estoque.

Responda à pergunta do usuário usando exclusivamente os dados fornecidos.

=========================
DADOS DOS PRODUTOS
=========================

${JSON.stringify(products, null, 2)}

=========================
DADOS CALCULADOS PELO SISTEMA
=========================

Regra de estoque baixo:

Quantidade menor ou igual a 5.

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

Quantidade total de unidades:

${totalQuantity}

Valor total do estoque:

R$ ${totalStockValue.toFixed(2)}

Maior preço:

R$ ${highestPrice.toFixed(2)}

Produto(s) com maior preço:

${JSON.stringify(highestPriceProducts, null, 2)}

Menor preço:

R$ ${lowestPrice.toFixed(2)}

Produto(s) com menor preço:

${JSON.stringify(lowestPriceProducts, null, 2)}

=========================
PERGUNTA DO USUÁRIO
=========================

${question.trim()}

=========================
REGRAS
=========================

- Responda em português do Brasil.
- Use somente os dados fornecidos.
- Não invente produtos.
- Não invente quantidades.
- Não invente preços.
- Não altere os valores calculados.
- Estoque baixo significa quantidade menor ou igual a 5.
- Quantidade 0 também é estoque baixo.
- Não invente demanda.
- Não invente previsão de vendas.
- Não considere uma quantidade maior que 5 como estoque baixo.
- Não transforme uma quantidade alta em excesso automaticamente.
- Não mostre JSON.
- Responda diretamente à pergunta.
- Seja claro, natural e objetivo.
`;

      try {
        const answer = await generateGeminiText(prompt);

        return res.json({
          answer,
        });
      } catch (error) {
        console.error('ERRO DO GEMINI NO CHAT:', error);

        return res.status(502).json({
          error:
            error instanceof Error
              ? `Erro ao se comunicar com o Gemini: ${error.message}`
              : 'Erro ao se comunicar com o Gemini.',
        });
      }
    } catch (error) {
      console.error('ERRO INTERNO DO CHAT:', error);

      return res.status(500).json({
        error: 'Não foi possível processar a pergunta.',
      });
    }
  }
);

// =========================
// Inicialização do servidor
// =========================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
