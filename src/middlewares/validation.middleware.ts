import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Request, Response, NextFunction } from 'express';

export function validationMiddleware(type: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dto = plainToInstance(type, req.body);
    const errors = await validate(dto);

    if (errors.length) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors
          .map((err) => Object.values(err.constraints || {}))
          .flat(),
      });
    }

    req.body = dto; // replace body with validated DTO
    next();
  };
}
