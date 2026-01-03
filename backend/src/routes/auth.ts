import express from 'express';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema } from '../schemas';
import { register, login } from '../controllers/authController';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

export default router;
