import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { makeUserController } from './makeUserController';
import { changePasswordSchema, updateUserSchema } from './user.schemas';

const router = Router();
const controller = makeUserController();

router.use(authenticate);

router.get('/me', controller.getMe.bind(controller));
router.patch('/me', validate(updateUserSchema), controller.updateMe.bind(controller));
router.delete('/me', controller.deleteMe.bind(controller));
router.post(
  '/me/password',
  validate(changePasswordSchema),
  controller.changePassword.bind(controller),
);

export default router;
