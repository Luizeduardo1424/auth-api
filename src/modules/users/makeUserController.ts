import { PostgresUserRepository } from './user.repository.postgres';
import { UserService } from './user.service';
import { UserController } from './user.controller';

export const makeUserController = () => {
  const repository = new PostgresUserRepository();
  const service = new UserService(repository);
  return new UserController(service);
};
