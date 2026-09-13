import type { NextFunction, Request, Response } from 'express';

import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    role: string;
  };
}

export function auth(
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

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error('ERRO AO VALIDAR TOKEN:', error);

    return res.status(401).json({
      error: 'Token inválido ou expirado.',
    });
  }
}