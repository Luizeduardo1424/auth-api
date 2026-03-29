import { NextFunction, Request, Response } from 'express';
import { ChangePasswordInput, UpdateUserInput } from './user.schemas';
import { UserService } from './user.service';
import { AppError } from '../../shared/errors/AppError';

export class UserController {
  constructor(private readonly service: UserService) {}

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.sub;
      if (!userId) throw new AppError('Unauthorized', 401);
      const user = await this.service.getMe(userId);
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  }

  async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.sub;
      if (!userId) throw new AppError('Unauthorized', 401);
      const user = await this.service.updateMe(userId, req.body as UpdateUserInput);
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  }

  async deleteMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.sub;
      if (!userId) throw new AppError('Unauthorized', 401);
      await this.service.deleteMe(userId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.sub;
      if (!userId) throw new AppError('Unauthorized', 401);
      await this.service.changePassword(userId, req.body as ChangePasswordInput);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
