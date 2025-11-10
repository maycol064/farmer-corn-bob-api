import { Router } from 'express';
import { AuthController } from '../../../presentation/controllers/AuthController.js';

const ctrl = new AuthController();
export const authRoutes = Router();

authRoutes.post('/register', ctrl.register);
authRoutes.post('/login', ctrl.login);
authRoutes.post('/refresh', ctrl.refresh);
authRoutes.post('/logout', ctrl.logout);
