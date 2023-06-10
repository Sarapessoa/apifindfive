import express from 'express';
import { checkToken } from '../utils/checkToken.js';
import { getUsuario, deleteUsuario, atualizarSenha, atualizarUsuario } from '../controllers/usuarioController.js';

const router = express.Router();

router.get('/:id', checkToken, getUsuario);
router.delete('/:id', deleteUsuario);
router.put('/:id', atualizarUsuario);
router.put('/atualizar-senha', atualizarSenha);

export default router;