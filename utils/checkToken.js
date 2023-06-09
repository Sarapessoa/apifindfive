import jwt from 'jsonwebtoken';

export const checkToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];

    if(!token) res.status(401).json({msg: "Acesso Negado!"});

    try {
        const secret = process.env.SECRET;

        jwt.verify(token, secret);

        next()
    }
    catch (erro){
        return res.status(400).json({msg: "Token inválido!"})
    }
}