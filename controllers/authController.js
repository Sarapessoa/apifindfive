import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import Usuario from "../models/Usuario.js";
import {validacao} from "../utils/validacao.js";

export const auth = async (req, res) => {
    return res.status(200).json({msg: "Acesso Permitido!"});
}

export const register = async (req, res) => {

    const {nome, email, senha} = req.body;

    try {
        validacao(nome, "Nome é obrigatório");
        validacao(email, "Email é obrigatório");
        validacao(senha, "Senha é obrigatório");
        
    } catch (error) {
        return res.status(422).json({ msg: error.message });
    }
      

    const checkUsuario = await Usuario.findOne({email: email});

    if(checkUsuario) return res.status(422).json({msg: "Email já cadastrado, utilize outro!"})

    const salt = await bcrypt.genSalt(12);
    const senhaHash = await bcrypt.hash(senha, salt);

    const usuario = new Usuario({
        nome: nome,
        email: email,
        senha: senhaHash
    })

    try{
        await usuario.save();
        return res.status(200).json({msg: "Usuário registrado com sucesso!"});
    }
    catch(erro){
        return res.status(500).json({msg: "Erro!"})
    }
}
export const login = async (req, res) => {
    const {email, senha} = req.body;

    validacao(res, email, "Email é obrigatório");
    validacao(res, senha, "Senha é obrigatório");

    const checkUsuario = await Usuario.findOne({email: email});

    if(!checkUsuario) return res.status(404).json({msg: "Email não registrado!"});

    const checkSenha = await bcrypt.compare(senha, checkUsuario.senha);

    if(!checkSenha) return res.status(422).json({msg: "Senha inválida!"})

    try{
        const secret = process.env.SECRET;

        const token = jwt.sign({
            _id: checkUsuario._id

        }, secret, {expiresIn: '3h'})

        res.status(200).json({msg: "Autenticação realizada com sucesso!", token: token})
    }
    catch(erro){
        return res.status(500).json({msg: "Erro!"})
    }
}
export const logout = async (req, res) => {
    // nao sei oq fazer aqui

    return res.status(200).json({msg: "Usuário desligado"})
}
export const resetSenha = async (req, res) => {
    const { email } = req.body;

    validacao(res, email, "O email é obrigatório")

    const usuario = await Usuario.findOne({email: email});

    if(!usuario) return res.status(404).json({ msg: 'Email não registrado!' });

    const secret = process.env.SECRET;
    const emailUser = process.env.EMAIL_USER
    const emailPass = process.env.EMAIL_PASS

    const token = jwt.sign({ email }, secret, { expiresIn: '20m' });

    const url = 'http://127.0.0.1:5500/pages/atualizar-senha.html';

    const resetLink = `${url}?token=${token}`;

    const emailContent = `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8">
                <title>Redefinição de Senha</title>
            </head>
            <body>
                <h1>Olá, ${usuario.nome}</h1>
                <p>Para redefinir sua senha, clique no link a seguir:</p>
                <a href="${resetLink}">Redefinir Senha</a>
            </body>
        </html>
    `

    const transporter = nodemailer.createTransport({
        service: 'Hotmail',
        auth: {
          user: emailUser,
          pass: emailPass
        }
    });

    const mailOptions = {
        from: emailUser,
        to: email,
        subject: 'Redefinição de Senha',
        html: emailContent,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ msg: 'Erro ao enviar o email!' });
        }
        console.log('Email enviado:', info.response);
        res.status(200).json({ msg: 'Email enviado com sucesso!' });
    });   
}