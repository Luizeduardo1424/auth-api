import { NextFunction, Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginInput, RegisterInput } from './auth.schemas';

export class AuthController {
  constructor(public readonly service: AuthService) {}

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.register(req.body as RegisterInput);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.login(req.body as LoginInput);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}
