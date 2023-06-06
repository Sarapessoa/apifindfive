import jwt from "jsonwebtoken";
import passport from "passport";
import bcrypt from "bcryptjs";
import axios from "axios";
import nodemailer from "nodemailer";
import Usuario from "../models/Usuario.js";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
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

        try {
            const secret = process.env.SECRET;

            const token = jwt.sign({
                _id: usuario._id
    
            }, secret, {expiresIn: '1h'});

            const res = axios.post('https://find-five-api-n9nm.vercel.app/estatisticas', {}, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });

            const response = axios.post('https://find-five-api-n9nm.vercel.app/tentativas', {}, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
        } catch (error) {
            return res.status(400).json({msg: "Não foi possível fazer o cadastro!"});
        }
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

        return res.status(200).json({msg: "Autenticação realizada com sucesso!", token: token});
    }
    catch(erro){
        return res.status(500).json({msg: "Erro!"});
    }
}
export const resetSenha = async (req, res) => {
    const { email } = req.body;

    validacao(res, email, "O email é obrigatório!");

    const usuario = await Usuario.findOne({email: email});

    if(!usuario) return res.status(404).json({ msg: 'Email não registrado!' });

    const secret = process.env.SECRET;
    const emailUser = process.env.EMAIL_USER
    const emailPass = process.env.EMAIL_PASS

    const token = jwt.sign({ email }, secret, { expiresIn: '20m' });

    const urlSite = process.env.URL_SITE

    const resetLink = `${urlSite}/Find-Five/pages/atualizar-senha.html?token=${token}`;

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
        service: 'hotmail',
        auth: {
          user: emailUser,
          pass: emailPass
        },
        greetingTimeout: 90000
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
        res.status(200).json({ msg: `Link enviado com sucesso para o email ${email}!` });
    });   
}
export const authWithGoogle = () => {
    const keyID = process.env.GOOGLE_ID_CLIENT
    const keySecret = process.env.GOOGLE_SECRET_CLIENT

    passport.use(
      new GoogleStrategy(
        {
          clientID: keyID,
          clientSecret: keySecret,
          scope: ['profile', 'email'],
          callbackURL: '/auth/google/callback'
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            return done(null, profile, accessToken);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
};

// Rota de autenticação com o Google
export const authenticateWithGoogle = passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account'
});

// Rota de callback após a autenticação
export const googleCallback = async (req, res) => {
    passport.authenticate('google', async (err, user, accessToken) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao autenticar com o Google.' });
      }
  
      if (!user) {
        return res.status(401).json({ error: 'Autenticação falhou. Usuário não encontrado.' });
      }
      const response = {
        userId: user.id,
        name: user.displayName,
        email: user.emails[0].value,
      };

      const checkUsuario = await Usuario.findOne({email: response.email});

      if(!checkUsuario){
        registerGoogle(response.name, response.email)
      }

      try{
            const secret = process.env.SECRET;

            const token = jwt.sign({
                _id: checkUsuario._id

            }, secret, {expiresIn: '3h'})
            const redirectURL = `https://yanacm.github.io/Find-Five/pages/logar.html?token=${token}&tokenGoogle=${accessToken}`;
            return res.redirect(redirectURL);
        }
        catch(erro){
            return res.status(500).json({msg: "Erro!"})
        }
    })(req, res);
}

const registerGoogle = async (nome, email) => {
    const salt = await bcrypt.genSalt(12);
    const senhaHash = await bcrypt.hash("", salt);

    const usuario = new Usuario({
        nome: nome,
        email: email,
        senha: senhaHash
    })

    try{
        await usuario.save();
    }
    catch(erro){
        return res.status(500).json({msg: "Erro!"})
    } 
}