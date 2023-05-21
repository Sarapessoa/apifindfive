import express from 'express';
import { auth, login, logout, register, resetSenha } from '../controllers/authController.js';
import { checkToken } from '../utils/checkToken.js';

const router = express.Router();

router.get('/', checkToken, auth);
router.post('/login', login);
router.post('/logout', logout);
router.post('/register', register);
router.post('/reset-senha', resetSenha);

export default router;
