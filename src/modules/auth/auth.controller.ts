import { NextFunction, Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginInput, RegisterInput, RefreshTokenInput, LogoutInput } from './auth.schemas';

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

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body as RefreshTokenInput;
      const result = await this.service.refresh(refreshToken);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body as LogoutInput;
      await this.service.logout(refreshToken);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
