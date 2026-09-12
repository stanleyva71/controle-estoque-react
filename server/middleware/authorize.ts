import type { Response, NextFunction } from 'express';

import type { AuthenticatedRequest } from './auth';

export function authorize(...allowedRoles: string[]) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Usuário não autenticado.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Você não tem permissão para realizar esta ação.',
      });
    }

    next();
  };
}