import express from 'express';
import { checkToken } from '../utils/checkToken.js';
import { getUsuario, deleteUsuario, atualizarSenha } from '../controllers/usuarioController.js';

const router = express.Router();

router.get('/:id', checkToken, getUsuario);
router.delete('/:id', deleteUsuario);
router.put('/atualizar-senha', atualizarSenha);

export default router;