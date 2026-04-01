import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware';
import { loginSchema, logoutSchema, refreshTokenSchema, registerSchema } from './auth.schemas';
import { makeAuthController } from './makeAuthController';
import { authRateLimiter } from '../../middlewares/rateLimiter.middleware';

const router = Router();
const controller = makeAuthController();

router.post(
  '/register',
  authRateLimiter,
  validate(registerSchema),
  controller.register.bind(controller),
);
router.post('/login', authRateLimiter, validate(loginSchema), controller.login.bind(controller));
router.post('/refresh', validate(refreshTokenSchema), controller.refresh.bind(controller));
router.post('/logout', validate(logoutSchema), controller.logout.bind(controller));

export default router;
