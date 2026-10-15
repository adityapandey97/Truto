import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { authRateLimiter } from '../middleware/rate-limit.js';
import { registerSchema, loginSchema, updateProfileSchema } from '../validators/auth.validator.js';

const router = Router();

router.post('/register', authRateLimiter, validate({ body: registerSchema }), AuthController.register);
router.post('/login', authRateLimiter, validate({ body: loginSchema }), AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/me', authenticate, AuthController.getMe);
router.patch('/profile', authenticate, validate({ body: updateProfileSchema }), AuthController.updateProfile);

export default router;
