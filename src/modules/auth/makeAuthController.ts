import { AuthController } from './auth.controller';
import { PostgresAuthRepository } from './auth.repository.postgres';
import { AuthService } from './auth.service';

export function makeAuthController() {
  const repository = new PostgresAuthRepository();
  const service = new AuthService(repository);
  return new AuthController(service);
}
