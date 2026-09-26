import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { prisma } from '../lib/prisma';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    role: string;
  };
}

export async function auth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error('JWT_SECRET não foi definida.');

      return res.status(500).json({
        error: 'Configuração de autenticação não encontrada.',
      });
    }

    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        error: 'Token de autenticação não informado.',
      });
    }

    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({
        error: 'Formato de autenticação inválido.',
      });
    }

    const decoded = jwt.verify(token, secret);

    if (
      typeof decoded !== 'object' ||
      decoded === null ||
      typeof decoded.userId !== 'number' ||
      typeof decoded.role !== 'string'
    ) {
      return res.status(401).json({
        error: 'Token inválido.',
      });
    }

    // Busca o usuário diretamente no banco.
    // Isso permite verificar se a conta continua ativa
    // e também usar o perfil atual do usuário.
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
      select: {
        id: true,
        role: true,
        active: true,
      },
    });

    // Usuário não existe mais.
    if (!user) {
      return res.status(401).json({
        error: 'Usuário não encontrado.',
      });
    }

    // Usuário foi desativado.
    // Retornamos 401 para que o frontend encerre
    // automaticamente a sessão atual.
    if (!user.active) {
      return res.status(401).json({
        error: 'Usuário desativado.',
      });
    }

    // Usa o perfil atual salvo no banco,
    // em vez do role antigo que estava no JWT.
    req.user = {
      userId: user.id,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error('ERRO AO VALIDAR TOKEN:', error);

    return res.status(401).json({
      error: 'Token inválido ou expirado.',
    });
  }
}