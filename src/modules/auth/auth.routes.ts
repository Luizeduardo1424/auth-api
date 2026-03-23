import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware';
import { loginSchema, registerSchema } from './auth.schemas';
import { makeAuthController } from './makeAuthController';

const router = Router();

const controller = makeAuthController();

router.post('/register', validate(registerSchema), controller.register.bind(controller));
router.post('/login', validate(loginSchema), controller.login.bind(controller));

export default router;
