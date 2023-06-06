import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Usuario from "../models/Usuario.js";
import {validacao} from "../utils/validacao.js";

export const getUsuario = async (req, res) => {

    const id = req.params.id;

    const usuario = await Usuario.findById(id, '-senha');

    if(!usuario) return res.status(404).json({msg: "Usuario não encontrado"});

    res.status(200).json({usuario});
}

export const deleteUsuario = async (req, res) => {
    const id = req.params.id;

    try {
        const usuario = await Usuario.findByIdAndDelete(id);

        if(!usuario) return res.status(404).json({msg: "Usuário não registrado"});

        return res.status(200).json({msg: "Usuário deletado com sucesso!"});
        
    } catch (error) {
        return res.status(500).json({ msg: 'Erro' });
    }  
}

export const atualizarSenha = async (req, res) => {
    const {senha, confirmSenha} = req.body;

    validacao(res, senha, "A senha é obrigatória");
    validacao(res, confirmSenha, "A senha de confirmação é obrigatória");

    const authorizationHeader = req.headers['authorization'];
    const token = authorizationHeader && authorizationHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ msg: 'Acesso não autorizado!' });
    }

    try{
        const secret = process.env.SECRET;
        const { email } = jwt.verify(token, secret);

        const usuario = await Usuario.findOne({email});

        if(!usuario) return res.status(422).json({ msg: 'Email não registrado!'});
    
        const salt = await bcrypt.genSalt(12);
        const senhaHash = await bcrypt.hash(senha, salt);

        usuario.senha = senhaHash;

        await usuario.save();

        return res.status(200).json({msg: "Senha Alterada com Sucesso!"});
    }
    catch(erro){
        return res.status(500).json({msg: "Link Inválido!"})
    }
}