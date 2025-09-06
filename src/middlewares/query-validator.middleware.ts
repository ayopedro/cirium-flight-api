import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Request, Response, NextFunction } from 'express';

export function queryValidationMiddleware(type: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const errors = await validate(plainToInstance(type, req.query));

    if (errors.length > 0) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors
          .map((err) => Object.values(err.constraints || {}))
          .flat(),
      });
    }

    next();
  };
}
